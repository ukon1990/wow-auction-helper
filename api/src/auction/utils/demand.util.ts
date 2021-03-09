import {Auction} from '../../models/auction/auction';
import {Demand, DemandDiff} from '../models/demand.model';
import {AuctionStatsUtil} from './auction-stats.util';

export class DemandUtil {
  private map: Map<string, DemandDiff> = new Map();

  constructor(private previous: Auction[], private current: Auction[], private timestamp: number) {
  }

  calculate(): Demand[] {
    const demand: Demand[] = [];
    this.previous.forEach(auction => {
      const diff: DemandDiff = this.getDemandDiffObject(auction);
      diff.previousAuctions.set(auction.item, auction);
    });
    this.current.forEach(auction => {
      const diff: DemandDiff = this.getDemandDiffObject(auction);
      diff.currentAuctions.set(auction.item, auction);
      this.setNewAuctions(diff, auction);
    });

    this.map.forEach(entry => {
      demand.push(this.getEstDemand(entry));
    });
    return demand;
  }

  private getDemandDiffObject(auction: Auction): DemandDiff {
    const id: string = AuctionStatsUtil.getId(
      auction.item,
      auction.bonusLists.map(b => b.bonusListId).join(','),
      auction.petSpeciesId);
    if (!this.map.has(id)) {
      const newObject = new DemandDiff(auction);
      this.map.set(id, newObject);
    }
    return this.map.get(id);
  }

  private getEstDemand(entry: DemandDiff) {

    return undefined;
  }

  private setNewAuctions(diff: DemandDiff, auction: Auction) {
    if (!diff.previousAuctions.has(auction.auc)) {
      diff.new++;
    }
  }
}
