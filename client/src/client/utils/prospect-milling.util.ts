import {Item, Remains, RemainsSource, RemainsSourceTarget} from '@shared/models';
import {defaultProspecting} from './default-prospecting.util';
import {defaultMilling} from './default-milling.util';
import {AuctionItem} from '../modules/auction/models/auction-item.model';
import {AuctionsService} from '../services/auctions.service';

export const millingRecipeMap = {
  34540: 1, 34541: 1, 34542: 1, 34543: 1, 34544: 1, 34545: 1, 35802: 1,
  35803: 1, 35804: 1, 35805: 1, 35806: 1, 35807: 1, 35825: 1, 36654: 1, 38965: 1, 38966: 1, 38967: 1,
  38968: 1, 38969: 1, 38970: 1, 38971: 1, 40699: 1, 42880: 1, 42881: 1, 42882: 1, 42883: 1, 42884: 1, 42885: 1,
};
export const prospectingRecipeMap = {
  36135: 1,  36136: 1,  36668: 1,  39002: 1,  39003: 1,  39004: 1,  40840: 1,
  42933: 1,  42934: 1,  42935: 1,  42936: 1,  42937: 1,  42938: 1,
};

export class ProspectingAndMillingUtil {
  private static auctionService: AuctionsService;
  public static prospecting: Remains[] = [];
  public static prospectingSourceMap = new Map<number, Remains>();
  public static prospectingSourceTargetsMap = new Map<number, RemainsSourceTarget[]>();
  public static mills: Remains[] = [];
  public static millsSourceMap = new Map<number, Remains>();
  public static millsSourceTargetsMap = new Map<number, RemainsSourceTarget[]>();

  public static TYPES = {
    MILLING: 'MILLING',
    PROSPECTING: 'PROSPECTING'
  };

  static init(auctionService: AuctionsService) {
    this.auctionService = auctionService;
  }

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

  public static calculateCost(map?: Map<string, AuctionItem>): void {
    try {
      ProspectingAndMillingUtil.setIndividualCost(
        ProspectingAndMillingUtil.mills, map);
    } catch (error) {

    }
    try {
      ProspectingAndMillingUtil.setIndividualCost(
        ProspectingAndMillingUtil.prospecting, map);
    } catch (error) {

    }
  }

  private static setIndividualCost(list: Remains[], map: Map<string, AuctionItem>): void {
    list.forEach((remains: Remains) => {
      let tmpValue = 0;
      remains.sources.forEach(source => {
        source.cost = ProspectingAndMillingUtil.getAuctionItem(source.id, map).buyout;
        source.value = source.cost * source.dropChance;
        tmpValue += source.value;
      });

      remains.buyout = ProspectingAndMillingUtil.getAuctionItem(remains.id, map).buyout;
      remains.yield = (tmpValue - remains.buyout) * 0.95;
    });
    ProspectingAndMillingUtil.save();
  }

  public static getAuctionItem(id: number, map: Map<string, AuctionItem>): AuctionItem {
    return this.auctionService.getById(id, map) || new AuctionItem();
  }

  public static save(): void {
    localStorage[ProspectingAndMillingUtil.TYPES.PROSPECTING] =
      JSON.stringify(ProspectingAndMillingUtil.prospecting);

    localStorage[ProspectingAndMillingUtil.TYPES.MILLING] =
      JSON.stringify(ProspectingAndMillingUtil.mills);
  }

  public static export(type: string): string {
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
    this.restoreProspecting();

    this.restoreMilling();
  }

  private static restoreMilling() {
    if (localStorage[ProspectingAndMillingUtil.TYPES.MILLING]) {
      const list: Remains[] = [];
      const map = new Map<number, Remains>();
      [
        ...JSON.parse(localStorage[ProspectingAndMillingUtil.TYPES.MILLING]),
        ...defaultMilling
      ].forEach(remains => {
        if (!map.has(remains.id)) {
          map.set(remains.id, remains);
          // this.millsSourceMap.set(remains.id, {});
          this.millsSourceMap.set(remains.id, remains);
          list.push(remains);
          remains.sources.forEach(source => {
            if (!this.prospectingSourceTargetsMap.has(source.id)) {
              this.prospectingSourceTargetsMap.set(source.id, []);
            }
            this.prospectingSourceTargetsMap.get(source.id).push({
              target: source,
              origin: remains,
            });
          });
        }
      });
      ProspectingAndMillingUtil.mills = list.sort((a, b) => b.id - a.id);
    } else {
      ProspectingAndMillingUtil.mills = defaultMilling;
    }
  }

  private static restoreProspecting() {
    if (localStorage[ProspectingAndMillingUtil.TYPES.PROSPECTING]) {
      const list: Remains[] = [];
      const map = new Map<number, Remains>();
      ProspectingAndMillingUtil.prospecting.forEach(remains => map.set(remains.id, remains));
      [
        ...JSON.parse(localStorage[ProspectingAndMillingUtil.TYPES.PROSPECTING]),
        ...defaultProspecting
      ].forEach((remains: Remains) => {
        if (!map.has(remains.id)) {
          map.set(remains.id, remains);
          this.prospectingSourceMap.set(remains.id, remains);
          list.push(remains);
          remains.sources.forEach(source => {
            if (!this.prospectingSourceTargetsMap.has(source.id)) {
              this.prospectingSourceTargetsMap.set(source.id, []);
            }
            this.prospectingSourceTargetsMap.get(source.id).push({
              target: source,
              origin: remains,
            });
          });
        }
      });
      ProspectingAndMillingUtil.prospecting = list.sort((a, b) => b.id - a.id);
    } else {
      ProspectingAndMillingUtil.prospecting = defaultProspecting;
    }
  }
}