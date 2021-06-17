import {BaseCraftingUtil} from './base-crafting.util';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Auction} from '../../auction/models/auction.model';
import {Item} from '../../../models/item/item';

class StartPrice {
  constructor(public price: number, public index: number) {
  }
}

export class PessimisticCraftingUtil extends BaseCraftingUtil {
  startPriceMap: Map<number, StartPrice> = new Map();

  /**
   *
   * @param threshold Price threshold to trigger not using the cheapest auction
   * @param checkPercent The percent of the total quantity of an item available to check
   * @param map
   * @param variations
   * @param items
   * @param faction The current faction
   * @param useIntermediateCrafting
   * @param useInventory
   */
  constructor(
    public map: Map<string, AuctionItem>,
    public variations: Map<number, AuctionItem[]>,
    public items: Map<number, Item>,
    public faction: number,
    useIntermediateCrafting: boolean = false,
    public useInventory: boolean = false,
    private threshold: number = 1.05,
    private checkPercent: number = 0.1
  ) {
    super(map, variations, items, faction, useIntermediateCrafting, useInventory);
  }

  getPrice(id: number, quantity: number): number {
    let cost = 0;
    const auctionItem: AuctionItem = this.map.get('' + id);
    if (auctionItem && auctionItem.buyout > 0) {
      const auctions = auctionItem.auctions;
      let foundCount = 0, usedForCraftCount = 0;
      let startPrice: StartPrice = this.startPriceMap.get(id);

      if (!startPrice) {
        startPrice = this.setStartPrice(auctionItem, auctions, id, startPrice);
      }

      for (let i = startPrice && startPrice.index || 0; i < auctions.length && foundCount <= quantity; i++) {
        const auc = auctions[i],
          unitPrice = auc ? auc.buyout / auc.quantity : 0;

        foundCount += auc.quantity;

        if (foundCount > quantity) {
          cost += unitPrice * (quantity - usedForCraftCount);
        } else {
          cost += unitPrice * auc.quantity;
          usedForCraftCount += auc.quantity;
        }
      }
    }
    return cost;
  }

  private setStartPrice(auctionItem: AuctionItem, auctions: Auction[], id: number, startPrice: StartPrice) {
    if (!auctions || !auctions[0]) {
      startPrice = new StartPrice(0, 0);
      this.startPriceMap.set(id, startPrice);
      return startPrice;
    }
    const quantityToCheck = Math.round(auctionItem.quantityTotal * this.checkPercent),
      priceHigherThan = (auctions[0].buyout / auctions[0].quantity) * this.threshold;
    let checkedQuantity = 0;
    for (let i = 0; i <= auctions.length && checkedQuantity <= quantityToCheck; i++) {
      const auc = auctionItem.auctions[i],
        unitPrice = auc.buyout / auc.quantity;
      checkedQuantity += auc.quantity;
      if (unitPrice > priceHigherThan && (auc.quantity > 1 || quantityToCheck === 1)) {
        startPrice = new StartPrice(unitPrice, i);
        this.startPriceMap.set(id, startPrice);
        return startPrice;
      }
    }
    return startPrice;
  }
}
