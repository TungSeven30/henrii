import milestoneDefinitions from "../../../data/milestones.json";

export type MilestoneCategory = "motor" | "language" | "social" | "cognitive";

export type MilestoneDefinition = {
  key: string;
  category: MilestoneCategory;
  name_en: string;
  name_vi: string;
  description_en: string;
  description_vi: string;
  typical_age_min_months: number;
  typical_age_max_months: number;
  source: string;
};

export const defaultMilestoneDefinitions = milestoneDefinitions as MilestoneDefinition[];
