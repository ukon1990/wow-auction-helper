import {StatsBase} from './stats-base.model';

export interface Stats {
  months: Stat[];
  days: Stat[];
}

export interface Stat extends StatsBase {

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
