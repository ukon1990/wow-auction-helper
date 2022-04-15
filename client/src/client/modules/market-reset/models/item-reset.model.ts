import {AuctionItem} from '../../auction/models/auction-item.model';
import {ItemResetBreakpoint} from './item-reset-breakpoint.model';
import {SharedService} from '../../../services/shared.service';
import {Item} from '@shared/models';
import {Auction} from '../../auction/models/auction.model';
import {CraftingUtil} from '../../crafting/utils/crafting.util';

export class ItemReset {
  public id: number;
  public name: string;
  public icon: string;
  public itemCount = 0;
  public auctionCount = 0;
  public breakPoints: ItemResetBreakpoint[] = [];

  constructor(private auctionItem: AuctionItem, public breakPointThreshold: number = 1.1) {
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
    let totalValue = 0;
    let itemCount = 0;
    let auctionCount = 0;
    const auctions = this.auctionItem.auctions
      .filter(ai => ai.buyout > 0);
    auctions.forEach((auction: Auction, index: number) => {
      const previousBreakPoint: ItemResetBreakpoint = this.breakPoints[this.breakPoints.length - 1];
      const previousTotalValue = totalValue;
      totalValue += auction.buyout;
      itemCount += auction.quantity;
      auctionCount++;
      this.processAuction(
        previousTotalValue, totalValue, itemCount, auction,
        previousBreakPoint, index, auctionCount, auctions);
    });
  }

  private processAuction(
    previousTotalValue: number,
    totalValue: number, itemCount: number, auction: Auction,
    previousBreakPoint: ItemResetBreakpoint, index: number,
    auctionCount: number, auctions: Auction[]) {
    const avgBuyout = totalValue / itemCount;
    const newBuyout = auction.buyout / auction.quantity;
    const potentialValue = newBuyout * itemCount * CraftingUtil.ahCutModifier;
    const potentialProfitPercent = potentialValue / totalValue;

    if (this.isGreaterThanPreviousBreakpoint(previousBreakPoint, avgBuyout) ||
      this.isPercentBreakPointMatch(previousBreakPoint, potentialProfitPercent)) {
      this.breakPoints.push(new ItemResetBreakpoint(
        this.breakPoints.length + 1,
        potentialProfitPercent,
        potentialValue - totalValue,
        avgBuyout,
        newBuyout,
        previousTotalValue,
        potentialValue,
        itemCount,
        auctionCount,
        this.auctionItem,
        auctions.slice(0, index)
      ));
    }
  }

  private isPercentBreakPointMatch(previousBreakPoint: ItemResetBreakpoint, potentialProfitPercent) {
    return !previousBreakPoint && potentialProfitPercent >= this.breakPointThreshold;
  }

  private isGreaterThanPreviousBreakpoint(previousBreakPoint: ItemResetBreakpoint, avgBuyout) {
    return previousBreakPoint && avgBuyout / previousBreakPoint.avgBuyout > this.breakPointThreshold;
  }
}