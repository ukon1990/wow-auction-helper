export interface Reagent {
  id: number;
  quantity: number;
  isOptional: boolean;
}

export interface Recipe {
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
}
