import {Rule} from "../../models";

export interface ItemRule {
  itemId: number;
  bonusIds?: number[];
  petSpeciesId?: number;
  rules: Rule[];
}