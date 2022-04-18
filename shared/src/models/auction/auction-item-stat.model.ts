import {Auction, Modifiers} from '../../models';

class Bonus {
  bonusListId: number;
}

export interface AuctionItemStatDays {
  ahId: number;
  itemId: number;
  petSpeciesId: string;
  bonusIds: string;
  date: string;
}

export class AuctionItemStat {
  itemId: number;
  petSpeciesId = -1;
  date: string;
  quantity00?: number;
  quantity01?: number;
  quantity02?: number;
  quantity03?: number;
  quantity04?: number;
  quantity05?: number;
  quantity06?: number;
  quantity07?: number;
  quantity08?: number;
  quantity09?: number;
  quantity10?: number;
  quantity11?: number;
  quantity12?: number;
  quantity13?: number;
  quantity14?: number;
  quantity15?: number;
  quantity16?: number;
  quantity17?: number;
  quantity18?: number;
  quantity19?: number;
  quantity20?: number;
  quantity21?: number;
  quantity22?: number;
  quantity23?: number;
  price00?: number;
  price01?: number;
  price02?: number;
  price03?: number;
  price04?: number;
  price05?: number;
  price06?: number;
  price07?: number;
  price08?: number;
  price09?: number;
  price10?: number;
  price11?: number;
  price12?: number;
  price13?: number;
  price14?: number;
  price15?: number;
  price16?: number;
  price17?: number;
  price18?: number;
  price19?: number;
  price20?: number;
  price21?: number;
  price22?: number;
  price23?: number;

  constructor(public ahId: number, public bonusIds: string, auction: Auction, timestamp: number, hour: string, public ahTypeId: number) {
    const date = new Date(timestamp),
      dateString = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
    this.itemId = auction.item;
    this.date = dateString;
    this[`quantity${hour}`] = auction.quantity;
    this[`price${hour}`] = auction.buyout / auction.quantity;
    if (auction.petSpeciesId) {
      this.petSpeciesId = auction.petSpeciesId;
    }
  }

  static getId(id: number, speciesId?: number, bonusIds?: number[], modifiers?: Modifiers[]): string {
    return`${id}-${speciesId || '-1'}-${this.bonusIdRaw(bonusIds)}-${this.modifiersId(modifiers)}`;
  }

  static bonusId(ids: Bonus[], alwaysHaveAValue = true): string {
    if (!ids) {
      return alwaysHaveAValue ? '-1' : '';
    }
    return this.bonusIdRaw(ids.map(id => id.bonusListId), alwaysHaveAValue);
  }

  static bonusIdRaw(ids: number[], alwaysHaveAValue = true): string {

    if (typeof ids === 'string') {
      return ids;
    }

    if (!ids) {
      return alwaysHaveAValue ? '-1' : '';
    }
    return ids.sort((a, b) => a - b)
      .join(',');
  }

  static modifiersId(modifiers: Modifiers[]): string {
    if (!modifiers) {
      return '-1';
    }
    return modifiers.map(mod => `${mod.type}=${mod.value}`).join(',');
  }
}