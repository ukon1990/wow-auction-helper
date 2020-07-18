import {DashboardV2} from '../models/dashboard-v2.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Recipe} from '../../crafting/models/recipe';

export class DashboardCalculateUtil {
  static calculate(board: DashboardV2, items: AuctionItem[], knownRecipeItemMap: Map<number, Recipe>): DashboardV2 {

    return board;
  }
}
