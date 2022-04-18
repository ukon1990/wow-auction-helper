import {Rule} from "@shared/models";

export interface ItemRule {
  itemId: number;
  bonusIds?: number[];
  petSpeciesId?: number;
  rules: Rule[];
}