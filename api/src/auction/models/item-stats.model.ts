import {StatsBase} from './stats-base.model';

interface Stat {
  price: {
    trend: number;
    avg: number;
  };
  quantity: {
    trend: number;
    avg: number;
  };
  uptime: number;
}

export interface ItemStats extends StatsBase {
  lastObservedInPeriod: number;
  past24: Stat;
  past30: Stat;
}
