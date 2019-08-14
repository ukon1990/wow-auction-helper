import {AuctionItem} from '../../auction/models/auction-item.model';
import {ItemResetBreakpoint} from './item-reset-breakpoint.model';
import {SharedService} from '../../../services/shared.service';
import {Item} from '../../../models/item/item';

export class ItemReset {
  public id: number;
  public name: string;
  public icon: string;
  public itemCount = 0;
  public auctionCount = 0;
  public breakPoints: ItemResetBreakpoint = [];

  constructor(private auctionItem: AuctionItem) {
    this.id = auctionItem.itemID;
    this.name = auctionItem.name;
    this.setIcon();
    this.setBreakPoints();
  }

  private setIcon() {
    const item: Item = SharedService.items[this.id];
    if (item) {
      this.icon = item.icon;
    }
  }

  private setBreakPoints() {
    //
  }
}
