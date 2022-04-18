import {Recipe} from './recipe';
import {APIReagent} from '@shared/models';

export interface ReagentSource {
  id?: number;
  npcId?: number;
  quantity: number;
  price: number;
  sumPrice: number;
  list?: any[];
}
export class ReagentSources {
  override: ReagentSource;
  tradeVendor: ReagentSource;
  vendor: ReagentSource;
  ah: ReagentSource;
  farm: ReagentSource;
  intermediate: ReagentSource;
  inventory: ReagentSource;
}

export class Reagent extends APIReagent {
  name: string;
  dropped: boolean;
  intermediateEligible?: boolean;
  recipe?: Recipe;
  avgPrice?: number;
  sumPrice?: number;
  intermediateCount = 0;

  sources?: ReagentSources;

  constructor(private itemId?: number, private quantityNeeded?: number) {
    super();
    this.id = itemId;
    this.quantity = quantityNeeded;
  }
}
