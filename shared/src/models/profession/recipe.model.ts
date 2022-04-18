import {APIReagent, ModifiedSlot} from "../../models";

export class APIRecipe {
  id: number;
  spellId?: number;
  icon?: string;
  name: string;
  description?: string;
  rank?: number;
  craftedItemId: number;
  hordeCraftedItemId?: number;
  allianceCraftedItemId?: number;
  minCount?: number;
  maxCount?: number;
  procRate?: number;
  professionId?: number;
  skillTierId?: number;
  reagents: APIReagent[];
  modifiedSlots?: ModifiedSlot[];
  bonusIds?: number[];

  timestamp?: number;
}