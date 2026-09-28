/** Shared client-side types for the business catalog + detail pages. */
import type { Swot } from '@/components/shared/business-swot';

export type BusinessType = 'HOME' | 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type GrowthPotential = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  businessCount: number;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface RequiredSkill {
  businessId: string;
  skillId: string;
  weight: number;
  skill: Skill;
}

/** A card in the catalog listing (GET /businesses). */
export interface BusinessListItem {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  description: string;
  difficulty: Difficulty;
  businessType: BusinessType;
  minInvestment: number;
  maxInvestment: number;
  expectedProfit: string;
  estimatedTime: string;
  growthPotential: GrowthPotential;
  coverImage?: string | null;
  category?: Category | null;
  requiredSkills: RequiredSkill[];
}

export interface InvestmentItem {
  item: string;
  amount: number;
}

export interface ChecklistItem {
  label: string;
  done?: boolean;
}

export interface RoadmapStep {
  id: string;
  order: number;
  title: string;
  description?: string | null;
  resourceUrl?: string | null;
}

export interface Roadmap {
  id: string;
  title: string;
  description?: string | null;
  steps: RoadmapStep[];
}

/** Full detail (GET /businesses/:slug). */
export interface BusinessDetail extends BusinessListItem {
  targetCustomers: string;
  toolsRequired: string[];
  marketDemand?: string | null;
  swot?: Swot | null;
  investmentBreakdown?: InvestmentItem[] | null;
  licenses: string[];
  registrations: string[];
  marketingStrategy?: string | null;
  riskFactors: string[];
  revenueModel?: string | null;
  businessCanvas?: Record<string, unknown> | null;
  checklist?: ChecklistItem[] | null;
  roadmap?: Roadmap | null;
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  HOME: 'Home-based',
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  HYBRID: 'Hybrid',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export const GROWTH_LABELS: Record<GrowthPotential, string> = {
  LOW: 'Low growth',
  MEDIUM: 'Medium growth',
  HIGH: 'High growth',
};
