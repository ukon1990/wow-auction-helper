import {SharedService} from '../../../services/shared.service';
import {Item} from '../../../models/item/item';
import {WoWHeadCurrencyFor, WoWHeadDroppedBy, WoWHeadSoldBy} from '../../../models/item/wowhead';
import {Report} from '../../../utils/report.util';

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

  private static processItem(item: Item) {
    if (!item.itemSource) {
      return;
    }

    if (item.itemSource.droppedBy) {
      item.itemSource.droppedBy
        .forEach((d: WoWHeadDroppedBy) => {
          this.handleNewMobEntry(d);
          this.handleNewItemDrop(d, item);
        });
    }

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
    }

    if (item.itemSource.soldBy) {
      item.itemSource.soldBy
        .forEach((d: WoWHeadSoldBy) => {
          this.handleNewVendor(d);
          this.addItemToVendor(d, item);
        });
    }
  }

  private static addItemToVendor(d: WoWHeadSoldBy, item: Item) {
    this.sourceMap.soldBy.map[d.id].sells.push({
      id: item.id,
      name: item.name,
      stock: d.stock,
      cost: d.cost,
      currency: d.currency
    });
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
        sells: []
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
}
