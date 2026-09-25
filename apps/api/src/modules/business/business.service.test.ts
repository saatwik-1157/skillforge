/**
 * Unit tests for the business recommendation engine.
 *
 * The scoring is exercised through `businessService.recommend`, with the
 * repository mocked so no database is required. We assert the three core
 * contracts of the recommender:
 *   1. Higher skill overlap yields a higher matchScore.
 *   2. Better budget fit yields a higher matchScore.
 *   3. Results are sorted by descending matchScore and capped at 12.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock the repository BEFORE importing the service under test ------------
vi.mock('./business.repository', () => ({
  businessRepository: {
    listPublishedForScoring: vi.fn(),
    findUserAssessment: vi.fn(),
  },
}));

import { businessService } from './business.service';
import { businessRepository } from './business.repository';

const mockRepo = vi.mocked(businessRepository);

/** Build a scored-business fixture with sensible defaults. */
function makeBusiness(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: overrides.id ?? 'biz-1',
    title: overrides.title ?? 'Test Business',
    slug: overrides.slug ?? 'test-business',
    tagline: null,
    description: 'desc',
    categoryId: null,
    category: null,
    difficulty: 'BEGINNER',
    businessType: overrides.businessType ?? 'HOME',
    minInvestment: overrides.minInvestment ?? 10000,
    maxInvestment: overrides.maxInvestment ?? 40000,
    expectedProfit: '₹',
    estimatedTime: '2 weeks',
    growthPotential: overrides.growthPotential ?? 'MEDIUM',
    targetCustomers: 'everyone',
    toolsRequired: [],
    coverImage: null,
    status: 'PUBLISHED',
    marketDemand: null,
    swot: null,
    investmentBreakdown: null,
    licenses: [],
    registrations: [],
    marketingStrategy: null,
    riskFactors: [],
    revenueModel: null,
    businessCanvas: null,
    checklist: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    requiredSkills: overrides.requiredSkills ?? [],
    ...overrides,
  };
}

/** A required-skill join row (skillId + weight + eager skill). */
function reqSkill(skillId: string, weight = 1) {
  return { businessId: 'biz', skillId, weight, skill: { id: skillId, name: skillId, slug: skillId, icon: null, createdAt: new Date() } };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('businessService.recommend — skill overlap', () => {
  it('scores a business the user has more skill overlap with higher', async () => {
    const highOverlap = makeBusiness({
      id: 'high',
      slug: 'high',
      requiredSkills: [reqSkill('cooking', 5), reqSkill('baking', 5)],
    });
    const lowOverlap = makeBusiness({
      id: 'low',
      slug: 'low',
      requiredSkills: [reqSkill('cooking', 5), reqSkill('programming', 5)],
    });

    mockRepo.listPublishedForScoring.mockResolvedValue([lowOverlap, highOverlap] as never);

    // User has both cooking and baking -> full overlap on `high`, half on `low`.
    const results = await businessService.recommend(
      { skillIds: ['cooking', 'baking'], interests: [] } as never,
    );

    const high = results.find((r) => r.id === 'high')!;
    const low = results.find((r) => r.id === 'low')!;
    expect(high.matchScore).toBeGreaterThan(low.matchScore);
  });
});

describe('businessService.recommend — budget fit', () => {
  it('scores a business whose budget band the user comfortably covers higher', async () => {
    // Two identical businesses except investment band; user budget is 40000.
    const affordable = makeBusiness({
      id: 'affordable',
      slug: 'affordable',
      minInvestment: 10000,
      maxInvestment: 30000, // budget 40000 fully covers -> full budget points
      requiredSkills: [reqSkill('cooking', 5)],
    });
    const stretched = makeBusiness({
      id: 'stretched',
      slug: 'stretched',
      minInvestment: 35000,
      maxInvestment: 200000, // budget 40000 barely covers min -> low budget points
      requiredSkills: [reqSkill('cooking', 5)],
    });

    mockRepo.listPublishedForScoring.mockResolvedValue([stretched, affordable] as never);

    const results = await businessService.recommend(
      { skillIds: ['cooking'], budget: 40000, interests: [] } as never,
    );

    const aff = results.find((r) => r.id === 'affordable')!;
    const str = results.find((r) => r.id === 'stretched')!;
    expect(aff.matchScore).toBeGreaterThan(str.matchScore);
  });

  it('scores a business the budget cannot cover lower than one it can', async () => {
    const tooExpensive = makeBusiness({
      id: 'expensive',
      slug: 'expensive',
      minInvestment: 100000, // budget below min -> 0 budget points
      maxInvestment: 200000,
      requiredSkills: [reqSkill('cooking', 5)],
    });
    const withinBudget = makeBusiness({
      id: 'cheap',
      slug: 'cheap',
      minInvestment: 5000,
      maxInvestment: 20000,
      requiredSkills: [reqSkill('cooking', 5)],
    });

    mockRepo.listPublishedForScoring.mockResolvedValue([tooExpensive, withinBudget] as never);

    const results = await businessService.recommend(
      { skillIds: ['cooking'], budget: 25000, interests: [] } as never,
    );

    const cheap = results.find((r) => r.id === 'cheap')!;
    const expensive = results.find((r) => r.id === 'expensive')!;
    expect(cheap.matchScore).toBeGreaterThan(expensive.matchScore);
  });
});

describe('businessService.recommend — sorting and capping', () => {
  it('returns results sorted by descending matchScore', async () => {
    const businesses = Array.from({ length: 5 }, (_, i) =>
      makeBusiness({
        id: `biz-${i}`,
        slug: `biz-${i}`,
        // Increasing skill overlap so scores differ.
        requiredSkills: [reqSkill('cooking', i === 0 ? 0.0001 : 1), reqSkill(`extra-${i}`, 5 - i)],
      }),
    );

    mockRepo.listPublishedForScoring.mockResolvedValue(businesses as never);

    const results = await businessService.recommend(
      { skillIds: ['cooking'], interests: [] } as never,
    );

    const scores = results.map((r) => r.matchScore);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });

  it('caps the number of results at 12', async () => {
    const businesses = Array.from({ length: 30 }, (_, i) =>
      makeBusiness({
        id: `biz-${i}`,
        slug: `biz-${i}`,
        requiredSkills: [reqSkill('cooking', 1)],
      }),
    );

    mockRepo.listPublishedForScoring.mockResolvedValue(businesses as never);

    const results = await businessService.recommend(
      { skillIds: ['cooking'], interests: [] } as never,
    );

    expect(results).toHaveLength(12);
  });
});

describe('businessService.recommend — assessment derivation', () => {
  it('falls back to the saved assessment when the body is empty and a user is authenticated', async () => {
    mockRepo.findUserAssessment.mockResolvedValue({
      budget: 40000,
      preferredType: 'HOME',
      skillIds: ['cooking'],
      interestIds: [],
    } as never);
    mockRepo.listPublishedForScoring.mockResolvedValue([
      makeBusiness({ id: 'biz-1', slug: 'biz-1', requiredSkills: [reqSkill('cooking', 5)] }),
    ] as never);

    await businessService.recommend(
      { skillIds: [], interests: [] } as never,
      'user-123',
    );

    expect(mockRepo.findUserAssessment).toHaveBeenCalledWith('user-123');
  });
});
