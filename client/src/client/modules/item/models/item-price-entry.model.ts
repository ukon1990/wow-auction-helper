export interface ItemPriceEntry {
  id?: string;
  quantity: number;
  ahId: number;
  itemId: number;
  petSpeciesId: number;
  bonusIds: number[];
  min: number;
  timestamp: number;
}
