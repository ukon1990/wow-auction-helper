export interface ItemPriceEntryResponse {
  daily: ItemDailyPriceEntry[];
  hourly: ItemPriceEntry[];
}

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

export interface ItemDailyPriceEntry {
  id?: string;
  // ahId: number;
  itemId: number;
  petSpeciesId: number;
  bonusIds: string;
  minHour?: number;
  min: number;
  minQuantity: number;
  avg: number;
  avgQuantity: number;
  max: number;
  maxQuantity: number;
  timestamp: number;
}
