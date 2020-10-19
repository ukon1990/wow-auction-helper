export class Reagent {
  id: number;
  quantity: number;
  isOptional: boolean;
}

interface ModifiedSlot {
  id: number;
  sortOrder: number;
}

export class Recipe {
  id: number;
  icon: string;
  name: string;
  description: string;
  rank: number;
  craftedItemId: number;
  hordeCraftedItemId: number;
  allianceCraftedItemId: number;
  minCount: number;
  maxCount: number;
  procRate: number;
  professionId: number;
  skillTierId: number;
  reagents: Reagent[];
  modifiedSlots: ModifiedSlot[];

  timestamp: number;
}

export interface RecipeAPIResponse {
  timestamp: number;
  recipes: Recipe[];
}
