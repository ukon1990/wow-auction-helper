import {SharedService} from '../../../services/shared.service';

export class WatchlistItem {
  itemID: number;
  name: string;
  compareTo: string;
  target?: number;
  targetType: string;
  criteria: string;
  minCraftingProfit: number;
  value = 0;

  constructor(itemID?: any) {
    itemID = parseInt(itemID, 10);
    if (itemID && SharedService.items[itemID]) {
      const wl = SharedService.user.watchlist;
      this.itemID = itemID;
      this.name = SharedService.items[itemID].name;
      this.compareTo = wl.COMPARABLE_VARIABLES.BUYOUT;
      this.targetType = wl.TARGET_TYPES.GOLD;
      this.criteria = wl.CRITERIA.BELOW;
      this.minCraftingProfit = 0;
    }
  }
}
