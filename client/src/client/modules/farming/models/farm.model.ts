import {Item} from '../../../models/item/item';

export class Farm {
  id: number;
  location: string;
  character: {
    realm: string;
    name: string;
  };
  goldLooted: number;
  timeSpent: number; // minutes
  totalGoldEarned: number;
  loot: Item[];
}
