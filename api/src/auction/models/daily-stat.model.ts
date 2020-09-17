export interface Stats {
  months: Stat[];
  days: Stat[];
}

export interface Stat {
  itemId: number;
  petSpeciesId: number;
  bonusIds: string;

  price: {
    trend: number;
    min: number;
    max: number;
  };
  quantity: {
    trend: number;
    min: number;
    max: number;
  };
}
