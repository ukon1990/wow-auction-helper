import {Pet} from './pet';
import {CollectedPet} from '../../character/models/character.model';
import {AuctionItem} from '../../auction/models/auction-item.model';

export class PetTableData {
  public itemID = 82800;
  public petSpeciesId: number;
  public name: string;
  public icon: string;
  public petLevel: number;
  public petQualityId: number;
  public userStock: number;
  public ahStock: number;
  public minBuyout: number;
  public avgBuyout: number;
  public maxBuyout: number;
  public totalBuyout: number;

  constructor(private collectedPet: CollectedPet, public auctions: AuctionItem[]) {
    this.petSpeciesId = collectedPet.stats.speciesId;
    this.name = collectedPet.creatureName;
    this.icon = collectedPet.icon;
    this.petLevel = collectedPet.stats.level;
    this.petQualityId = collectedPet.qualityId;
    this.userStock = collectedPet.count;
    this.ahStock = this.getStock(auctions);

    this.setBuyout(auctions);
    this.totalBuyout = this.minBuyout * this.userStock;
  }

  private setBuyout(auctions: AuctionItem[]) {
    if (!auctions) {
      return;
    }
    let sum = 0;
    auctions.forEach(item => {
      const buyout = item.buyout;
      if (!this.minBuyout || this.minBuyout > buyout) {
        this.minBuyout = buyout;
      }

      if (!this.maxBuyout || this.maxBuyout < buyout) {
        this.maxBuyout = buyout;
      }

      sum += buyout;
    });

    this.avgBuyout = sum / auctions.length;
  }

  private getStock(auctions: AuctionItem[]) {
    return auctions ? auctions.length : 0;
  }
}
