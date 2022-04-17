import {Auction} from '@shared/models';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {GoldPipe} from '../../util/pipes/gold.pipe';

export class ItemResetBreakpoint {
  private pipe = new GoldPipe();

  public itemID: number;
  public tsmShoppingString: string;
  public sellTime: number;
  public newVsCurrentBuyoutPercent: number;
  public breakEvenQuantity = 0;

  constructor(
    public id: number,
    public potentialProfitPercent: number,
    public potentialProfit: number,
    public avgBuyout: number,
    public newBuyout: number,
    public sumBuyout: number,
    public potentialValue: number,
    public itemCount: number,
    public auctionCount: number,
    public auctionItem: AuctionItem,
    public auctions: Auction[]) {
    this.setPotentialSellTime();
    this.setShoppingString();

    this.newVsCurrentBuyoutPercent = newBuyout / this.auctionItem.buyout;
    this.breakEvenQuantity = Math.ceil(this.sumBuyout / newBuyout);
    this.itemID = this.auctionItem.itemID;
  }

  private setPotentialSellTime() {
    this.sellTime = this.itemCount /
      this.auctionItem.regionSaleRate /
      this.auctionItem.avgDailySold;
  }

  setShoppingString(): void {
    this.tsmShoppingString = `${
      this.auctionItem.name
    }/exact/${
      this.pipe.transform(1)
    }/${
      this.pipe.transform(this.newBuyout - 1).replace(',', '')
    }`;
  }
}