export interface SkillTier {
  id: number;
  name: string;
  min: number;
  max: number;
}

export interface ProfessionAPIResponse {
  professions: Profession[];
  timestamp: Date;
}

export interface Profession {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: string;
  skillTiers: SkillTier[];

  timestamp?: Date;
}
