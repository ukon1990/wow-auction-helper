import {Rule} from "@shared/models/dashboard/rule.model";

export interface ItemRule {
  itemId: number;
  bonusIds?: number[];
  petSpeciesId?: number;
  rules: Rule[];
}