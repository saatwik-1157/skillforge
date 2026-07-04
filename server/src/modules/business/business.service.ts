/**
 * Business service — catalog querying, category listing, detail lookup, and the
 * recommendation engine. Contains all business rules; never touches req/res.
 */
import type { Prisma } from '@prisma/client';
import { businessRepository } from './business.repository';
import { ApiError } from '../../utils/ApiError';
import { parsePagination } from '../../utils/pagination';
import type { ListBusinessQuery, RecommendDto } from './business.schema';

// --- Recommendation scoring weights (see scoring notes in `recommend`) -------
const MAX_SKILL_POINTS = 60;
const MAX_BUDGET_POINTS = 25;
const NEUTRAL_BUDGET_POINTS = 12;
const TYPE_MATCH_POINTS = 10;
const NEUTRAL_TYPE_POINTS = 5;
const RECOMMENDATION_LIMIT = 12;

/** A business row with its category + weighted required skills eager-loaded. */
type ScoredBusiness = Prisma.BusinessGetPayload<{
  include: {
    category: true;
    requiredSkills: { include: { skill: true } };
  };
}>;

export const businessService = {
  /** Paginated catalog of published businesses with search + filters. */
  async list(query: ListBusinessQuery) {
    const { page, limit, skip } = parsePagination(query);

    const where: Prisma.BusinessWhereInput = { status: 'PUBLISHED' };

    // Free-text search across title + description.
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.categorySlug) where.category = { slug: query.categorySlug };
    if (query.businessType) where.businessType = query.businessType;
    if (query.difficulty) where.difficulty = query.difficulty;

    // Budget filters map onto the investment band: a business is affordable when
    // its minimum investment sits within the requested [minBudget, maxBudget].
    if (query.minBudget !== undefined) where.minInvestment = { gte: query.minBudget };
    if (query.maxBudget !== undefined) {
      where.minInvestment = { ...(where.minInvestment as object), lte: query.maxBudget };
    }

    const { items, total } = await businessRepository.listPublished(where, skip, limit);
    return { items, page, limit, total };
  },

  /** Categories annotated with their published-business counts. */
  async listCategories() {
    const categories = await businessRepository.listCategoriesWithCounts();
    return categories.map(({ _count, ...cat }) => ({
      ...cat,
      businessCount: _count.businesses,
    }));
  },

  /** Full detail page for a business, 404 if missing/unpublished. */
  async getBySlug(slug: string) {
    const business = await businessRepository.findPublishedBySlug(slug);
    if (!business) throw ApiError.notFound('Business idea not found');
    return business;
  },

  /**
   * Recommendation engine.
   *
   * Scores every published business against the user's profile and returns the
   * top {@link RECOMMENDATION_LIMIT} by matchScore (0-100). When the caller is
   * authenticated and sends an empty body, skillIds/budget/type are derived from
   * their saved assessment.
   *
   * Scoring (max 100):
   *   - skillOverlap (up to 60): weighted fraction of the business's required
   *     skills the user possesses. Each required skill contributes its
   *     BusinessSkill.weight; the covered weight over total weight scales the 60.
   *   - budgetFit (up to 25): if a budget is provided and covers minInvestment,
   *     award partial-to-full points scaled by how much of the min→max band the
   *     budget covers (full when it comfortably covers maxInvestment). No budget
   *     -> neutral 12. Budget below minInvestment -> 0.
   *   - typeFit: +10 when businessType matches, 0 when it differs, neutral 5
   *     when no type is provided.
   *   - growthPotential: HIGH +5, MEDIUM +3, LOW +1.
   */
  async recommend(dto: RecommendDto, userId?: string) {
    let skillIds = dto.skillIds;
    let budget = dto.budget;
    let businessType = dto.businessType;

    // Derive inputs from the saved assessment when authenticated and body empty.
    const bodyEmpty =
      skillIds.length === 0 &&
      budget === undefined &&
      businessType === undefined &&
      dto.interests.length === 0;

    if (bodyEmpty && userId) {
      const assessment = await businessRepository.findUserAssessment(userId);
      if (assessment) {
        skillIds = assessment.skillIds;
        budget = assessment.budget;
        businessType = assessment.preferredType;
      }
    }

    const userSkillSet = new Set(skillIds);
    const businesses = await businessRepository.listPublishedForScoring();

    const scored = businesses.map((business) => {
      const { score, matchedSkills } = scoreBusiness(business, {
        userSkillSet,
        budget,
        businessType,
      });
      const { requiredSkills, ...rest } = business;
      void requiredSkills;
      return { ...rest, matchScore: score, matchedSkills };
    });

    // Sort by descending match score and take the top N.
    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, RECOMMENDATION_LIMIT);
  },
};

/** Pure scoring function for a single business given the user's inputs. */
function scoreBusiness(
  business: ScoredBusiness,
  input: { userSkillSet: Set<string>; budget?: number; businessType?: string },
): { score: number; matchedSkills: string[] } {
  const { userSkillSet, budget, businessType } = input;

  // --- skillOverlap (up to 60 pts) -----------------------------------------
  // Weighted by BusinessSkill.weight: covered weight / total weight.
  const required = business.requiredSkills;
  const totalWeight = required.reduce((sum, rs) => sum + rs.weight, 0);
  const matched = required.filter((rs) => userSkillSet.has(rs.skillId));
  const coveredWeight = matched.reduce((sum, rs) => sum + rs.weight, 0);
  const skillPoints = totalWeight > 0 ? (coveredWeight / totalWeight) * MAX_SKILL_POINTS : 0;
  const matchedSkills = matched.map((rs) => rs.skill.name);

  // --- budgetFit (up to 25 pts, neutral 12 when absent) --------------------
  let budgetPoints: number;
  if (budget === undefined) {
    budgetPoints = NEUTRAL_BUDGET_POINTS;
  } else if (budget < business.minInvestment) {
    // Cannot even cover the entry cost.
    budgetPoints = 0;
  } else {
    const band = business.maxInvestment - business.minInvestment;
    if (band <= 0) {
      // No spread — covering the min means fully comfortable.
      budgetPoints = MAX_BUDGET_POINTS;
    } else {
      // Scale from partial (covers only min) to full (covers max or beyond).
      const coverage = Math.min(1, (budget - business.minInvestment) / band);
      budgetPoints = MAX_BUDGET_POINTS * coverage;
    }
  }

  // --- typeFit (+10 match, 0 mismatch, neutral 5 when absent) --------------
  let typePoints: number;
  if (!businessType) {
    typePoints = NEUTRAL_TYPE_POINTS;
  } else {
    typePoints = business.businessType === businessType ? TYPE_MATCH_POINTS : 0;
  }

  // --- growthPotential bonus ------------------------------------------------
  const growthPoints =
    business.growthPotential === 'HIGH' ? 5 : business.growthPotential === 'MEDIUM' ? 3 : 1;

  const raw = skillPoints + budgetPoints + typePoints + growthPoints;
  // Clamp to 0-100 and round for a clean client-facing score.
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  return { score, matchedSkills };
}
