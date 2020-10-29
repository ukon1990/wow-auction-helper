export interface ItemPriceEntry {
  id?: string;
  quantity: number;
  // ahId: number;
  itemId: number;
  petSpeciesId: number;
  bonusIds: string;
  min: number;
  timestamp: number;
}
