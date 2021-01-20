export interface Stat {
  price: {
    trend: number;
    avg: number;
  };
  quantity: {
    trend: number;
    avg: number;
  };
  totalEntries: number;
}

export interface ItemStats {
  itemId: number;
  petSpeciesId?: number;
  bonusIds?: string | number[];
  past12Hours?: Stat;
  past24Hours?: Stat;
  past7Days?: Stat;
  past14Days?: Stat;
  past30Days?: Stat;
  past60Days?: Stat;
  past90Days?: Stat;
  past180Days?: Stat;
}
