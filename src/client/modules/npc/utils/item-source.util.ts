import {SharedService} from '../../../services/shared.service';
import {Item} from '../../../models/item/item';
import {WoWHeadCurrencyFor, WoWHeadDroppedBy, WoWHeadSoldBy} from '../../../models/item/wowhead';
import {Report} from '../../../utils/report.util';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Vendor} from '../models/vendor.model';

export class ItemSourceUtil {
  static sourceMap = {
    droppedBy: {list: [], map: []},
    currencyFor: {list: [], map: []},
    soldBy: {list: [], map: []}
  };

  static processSources(): void {
    SharedService.itemsUnmapped
      .forEach((item: Item) =>
        this.processItem(item));
    Report.debug('ItemSourceUtil.processSources', this.sourceMap);
  }
/*
  static getVendors(): Vendor[] {

    SharedService.itemsUnmapped
      .forEach((item: Item) =>
        this.processSoldByForItem(item));
  };*/

  private static processItem(item: Item) {
    if (!item.itemSource) {
      return;
    }

    this.processDroppedByForItem(item);
    /*
        if (item.itemSource.currencyFor) {
          item.itemSource.currencyFor
            .forEach((d: WoWHeadCurrencyFor) => {
              if (!this.sourceMap.currencyFor.map[d.id]) {
                this.sourceMap.currencyFor.map[d.id] = {
                  id: d.id,
                  name: d.name,
                  source: d.source,
                  sourcemore: d.sourcemore,
                  cost: d.cost,
                  currency: d.currency,
                  d
                };
                this.sourceMap.currencyFor.list
                  .push(
                    this.sourceMap.currencyFor.map[d.id]);
              }
            });
        }*/

    this.processSoldByForItem(item);
  }

  private static processDroppedByForItem(item: Item) {
    if (item.itemSource.droppedBy) {
      item.itemSource.droppedBy
        .forEach((d: WoWHeadDroppedBy) => {
          this.handleNewMobEntry(d);
          this.handleNewItemDrop(d, item);
        });
    }
  }

  private static processSoldByForItem(item: Item) {
    if (item.itemSource.soldBy) {
      item.itemSource.soldBy
        .forEach((d: WoWHeadSoldBy) => {
          if (!d.location) {
            return;
          }
          this.handleCurrency(d);
          this.handleNewVendor(d);
          this.addItemToVendor(d, item);
        });
    }
  }

  private static handleCurrency(d: WoWHeadSoldBy) {
    if (d.currency) {
      const ai: AuctionItem = SharedService.auctionItemsMap[d.currency];
      d.cost = ai ? d.cost * ai.buyout : d.cost;
    }
  }

  private static addItemToVendor(d: WoWHeadSoldBy, item: Item) {
    const npc = this.sourceMap.soldBy.map[d.id];
    const itemValue = this.getAuctionBuyout(d, item);
    npc.items.push({
      id: item.id,
      name: item.name,
      stock: d.stock,
      cost: d.cost,
      profit: itemValue,
      currency: d.currency
    });
    npc.itemCount++;
    if (itemValue > 0 && this.doesHaveAPIValue(item.id)) {
      npc.potentialValue += itemValue;
    }
  }

  private static getAuctionBuyout(d: WoWHeadSoldBy, item: Item) {
    return SharedService.auctionItemsMap[item.id] ?
      SharedService.auctionItemsMap[item.id].buyout - d.cost : 0;
  }

  private static handleNewVendor(d: WoWHeadSoldBy) {
    if (!this.sourceMap.soldBy.map[d.id]) {
      this.sourceMap.soldBy.map[d.id] = {
        id: d.id,
        name: d.name,
        location: d.location,
        tag: d.tag,
        react: d.react,
        type: d.type,
        cost: d.cost,
        items: [],
        itemCount: 0,
        potentialValue: 0
      };
      this.sourceMap.soldBy.list
        .push(
          this.sourceMap.soldBy.map[d.id]);
    }
  }

  private static handleNewItemDrop(d: WoWHeadDroppedBy, item: Item) {
    this.sourceMap.droppedBy.map[d.id].drops.push({
      id: item.id,
      name: item.name,
      count: d.count,
      outof: d.outof,
      dropChance: d.dropChance,
      pctstack: d.pctstack
    });
  }

  private static handleNewMobEntry(d: WoWHeadDroppedBy) {
    if (!this.sourceMap.droppedBy.map[d.id]) {
      this.sourceMap.droppedBy.map[d.id] = {
        id: d.id,
        name: d.name,
        location: d.location,
        react: d.react,
        drops: []
      };
      this.sourceMap.droppedBy.list
        .push(
          this.sourceMap.droppedBy.map[d.id]);
    }
  }

  private static doesHaveAPIValue(id: number) {
    return SharedService.user.apiToUse === 'none' ||
      (SharedService.auctionItemsMap[id] as AuctionItem).avgDailySold > 5;
  }
}
