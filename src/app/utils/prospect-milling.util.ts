import { Remains, RemainsSource } from '../models/item/remains.model';
import { Item } from '../models/item/item';
import { SharedService } from '../services/shared.service';
import { AuctionItem } from '../../../server/src/models/auction/auction-item';
import { defaultProspecting } from './default-prospecting.util';
import { defaultMilling } from './default-milling.util';

export class ProspectingAndMillingUtil {
  public static prospecting: Remains[] = [];
  public static mills: Remains[] = [];

  public static TYPES = {
    MILLING: 'MILLING',
    PROSPECTING: 'PROSPECTING'
  };
/*
  // TODO: remove
  public static pigments: Remains[] = [];
  public static gems: Remains[] = [];
  // Flipping the bird
  public static pigmentSource: Remains[] = [];
  public static pigmentSourceMap = new Map<number, Remains>();
  public static gemSource: Remains[] = [];
  public static gemSourceMap = new Map<number, Remains>();

  public static readonly NEEDED_PER = 5;*/


  public static addRemains(type: string, item: Item): void {
    switch (type) {
      case ProspectingAndMillingUtil.TYPES.MILLING:
      ProspectingAndMillingUtil.mills.push(new Remains(item));
        break;
      case ProspectingAndMillingUtil.TYPES.PROSPECTING:
        ProspectingAndMillingUtil.prospecting.push(new Remains(item));
        break;
    }

    ProspectingAndMillingUtil.save();
  }

  public static addTargetItem(remains: Remains, item: Item, count: number, outOf: number): void {
    remains.sources.push(new RemainsSource(item, count, outOf));

    ProspectingAndMillingUtil.save();
  }

  public static calculateCost(): void {
    ProspectingAndMillingUtil.setIndividualCost(
      ProspectingAndMillingUtil.mills);
    ProspectingAndMillingUtil.setIndividualCost(
      ProspectingAndMillingUtil.prospecting);
  }

  private static setIndividualCost(list: Remains[]): void {
    list.forEach((remains: Remains) => {
      let tmpValue = 0;
      remains.sources.forEach(source => {
        source.cost = ProspectingAndMillingUtil.getAuctionItem(source.id).buyout;
        source.value = source.cost * source.dropChance;
        tmpValue += source.value;
      });

      remains.buyout = ProspectingAndMillingUtil.getAuctionItem(remains.id).buyout;
      remains.yield = (tmpValue - remains.buyout) * 0.95;
    });
    ProspectingAndMillingUtil.save();
  }

  public static getAuctionItem(id: number): AuctionItem {
    return SharedService.auctionItemsMap[id] ?
      SharedService.auctionItemsMap[id] : new AuctionItem();
  }

  public static save(): void {
    localStorage[ProspectingAndMillingUtil.TYPES.PROSPECTING] =
      JSON.stringify(ProspectingAndMillingUtil.prospecting);

    localStorage[ProspectingAndMillingUtil.TYPES.MILLING] =
      JSON.stringify(ProspectingAndMillingUtil.mills);
  }

  public static export (type: string): string {
    switch (type) {
      case ProspectingAndMillingUtil.TYPES.MILLING:
        return JSON.stringify(ProspectingAndMillingUtil.mills);
      case ProspectingAndMillingUtil.TYPES.PROSPECTING:
      return JSON.stringify(ProspectingAndMillingUtil.prospecting);
    }
  }

  public static import(type: string, data: string): void {
    //
  }

  public static restore(): void {
    if (localStorage[ProspectingAndMillingUtil.TYPES.PROSPECTING]) {
      ProspectingAndMillingUtil.prospecting =
        JSON.parse(localStorage[ProspectingAndMillingUtil.TYPES.PROSPECTING]);
    } else {
      ProspectingAndMillingUtil.prospecting = defaultProspecting;
    }

    if (localStorage[ProspectingAndMillingUtil.TYPES.MILLING]) {
      ProspectingAndMillingUtil.mills =
        JSON.parse(localStorage[ProspectingAndMillingUtil.TYPES.MILLING]);
    } else {
      ProspectingAndMillingUtil.mills = defaultMilling;
    }
  }
/*
  public static isSourceMilling(item: Item): void {
    if (item.itemSource && item.itemSource.milledFrom && item.itemSource.milledFrom.length > 0) {
      const target = new Remains(item);
      ProspectingAndMillingUtil.pigments.push(target);
      item.itemSource.milledFrom.forEach(t => {
        target.sources.push(
          new RemainsSource(SharedService.items[t.id], t.count, t.outof));
      });
    }

    if (item.itemSource && item.itemSource.prospectedFrom && item.itemSource.prospectedFrom.length > 0) {
      const target = new Remains(item);
      ProspectingAndMillingUtil.gems.push(target);
      item.itemSource.prospectedFrom.forEach(t => {
        target.sources.push(
          new RemainsSource(SharedService.items[t.id], t.count, t.outof));
      });
    }
  }

  public static combineSources(array: Remains[], map: Map<number, Remains>, toArray: Remains[]): void {
    toArray.length = 0;
    map.clear();

    array.forEach(remains => {
      remains.sources.forEach(source => {
        if (!map[source.id]) {
          map[source.id] = new Remains(SharedService.items[source.id]);
          map[source.id].yield = 0;
          map[source.id].buyout = ProspectingAndMillingUtil.getAHValue(source.id);
          toArray.push(map[source.id]);
        }
        if (source.dropChance > 0) {
          const targetItem = new RemainsSource(SharedService.items[source.id], source.count, map[source.id]);
          targetItem.id = remains.id;
          targetItem.name = remains.name;
          targetItem.dropChance = source.dropChance;
          targetItem.cost = (ProspectingAndMillingUtil.getAHValue(remains.id) / ProspectingAndMillingUtil.NEEDED_PER) * source.dropChance;
          targetItem.roi = targetItem.cost - ProspectingAndMillingUtil.getAHValue(remains.id);
          map[source.id].yield += targetItem.roi;
          (map[source.id] as Remains).sources.push(targetItem);
          map[source.id].outOf = source['outOf'];
          delete targetItem['outOf'];
        }
      });
    });
  }

  public static setCosts(): void {
    ProspectingAndMillingUtil.setCost(ProspectingAndMillingUtil.pigments);
    ProspectingAndMillingUtil.combineSources(
      ProspectingAndMillingUtil.pigments, ProspectingAndMillingUtil.pigmentSourceMap, ProspectingAndMillingUtil.pigmentSource);
    ProspectingAndMillingUtil.setCost(ProspectingAndMillingUtil.gems);
    ProspectingAndMillingUtil.combineSources(
      ProspectingAndMillingUtil.gems, ProspectingAndMillingUtil.gemSourceMap, ProspectingAndMillingUtil.gemSource);

    ProspectingAndMillingUtil.mills = ProspectingAndMillingUtil.pigmentSource;
    ProspectingAndMillingUtil.prospecting = ProspectingAndMillingUtil.gemSource;
    ProspectingAndMillingUtil.save();
  }

  private static setCost(array: Remains[]): void {
    array.forEach((item: Remains) => {
      const i = SharedService.auctionItemsMap[item.id];
      item.buyout = i ? i.buyout : 0;
      item.sources.forEach((source: RemainsSource) => {
        const is: AuctionItem = SharedService.auctionItemsMap[source.id];
        source.cost = is ? (is.buyout * ProspectingAndMillingUtil.NEEDED_PER) / source.dropChance : 0;
        source.roi = item.buyout - source.cost;
      });
    });

    array.sort((a, b) =>
      SharedService.items[b.id].expansionId - SharedService.items[a.id].expansionId);
  }

  public static getAHValue(id: number): number {
    return SharedService.auctionItemsMap[id] ? SharedService.auctionItemsMap[id].buyout : 0;
  }*/
}
