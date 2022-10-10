import {AuctionItem} from '../../auction/models/auction-item.model';

/**
 * Defining a guess value at how long time it will take to sell
 * an item based on sold per day and estimated sale rate from TSM
 * @param auctionItem
 * @param quantity
 */
export const getEstimatedSellTime = (auctionItem: AuctionItem, quantity: number): number => {
  const salePct = auctionItem.stats ?
    auctionItem.stats.tsm.salePct : 0;
  const avgDailySold = auctionItem.stats ?
    auctionItem.stats.tsm.soldPerDay : 0;

  return quantity / salePct / avgDailySold;
};