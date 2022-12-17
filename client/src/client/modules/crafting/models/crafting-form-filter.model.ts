export interface CraftingFormFilterModel {
  searchQuery: string;
  onlyKnownRecipes: boolean;
  professionId: number;
  rank: number;
  profit: number;
  demand: number;
  personalSaleRate: number;
  minSold: number;
  itemClass: number;
  itemSubClass: number;
  expansion: number;
}