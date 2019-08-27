import {Auction} from '../models/auction.model';
import {Pet} from '../../pet/models/pet';
import {AuctionItem} from '../models/auction-item.model';
import {Recipe} from '../../crafting/models/recipe';
import {Item} from '../../../models/item/item';
import {TSM} from '../models/tsm.model';
import {SharedService} from '../../../services/shared.service';

class ProcessedAuctionData {
  pets: { map: object, list: Pet[] } = {map: {}, list: []};
  auctions: { map: object, list: AuctionItem[] } = {map: {}, list: []};
  recipes: { map: object, list: Recipe[] } = {map: {}, list: []};
  // userAuctions: { map: object, list: Recipe[] } = {map: {}, list: []};
}

export class AuctionProcessorUtil {
  static process(
    auctions: Auction[], items: Map<number, Item>,
    pets: Map<number, Pet>, tsm: Map<number, TSM>): ProcessedAuctionData {
    const processed = new ProcessedAuctionData();
    auctions.forEach((auction =>
      this.handleAuction(auction, processed, items, pets, tsm)));

    return processed;
  }

  private static handleAuction(
    auction: Auction, processed: ProcessedAuctionData, items: Map<number, Item>,
    pets: Map<number, Pet>, tsm: Map<number, TSM>) {
    const id = this.getId(auction), isPet = !!auction.petSpeciesId;
    let auctionItem: AuctionItem = processed.auctions.map[id];
    if (!auctionItem) {
      processed.auctions.map[id] = new AuctionItem(auction, tsm.get(auction.item));
      auctionItem = processed.auctions.map[id];
      processed.auctions.list.push(auctionItem);
    }

    auctionItem.auctions.push(auction);
    this.handlePet(processed, auctionItem, pets, auction);
  }

  private static handlePet({pets}: ProcessedAuctionData, {petSpeciesId}: AuctionItem, petMap: Map<number, Pet>, auction: Auction) {
    if (petSpeciesId) {
      const pet: Pet = petMap[petSpeciesId];
      if (!pet) {
        return;
      }
      if (!pet.auctions) {
        pet.auctions = [];
      }

      if (!pets.map[petSpeciesId]) {
        pets.map[petSpeciesId] = pet;
        pets.list.push(pet);
      }

      pet.auctions.push(auction);
    }
  }

  private static getId(auction: Auction) {
    if (!auction.petSpeciesId) {
      return auction.item;
    }
    return `${auction.item}-${auction.petSpeciesId}-${auction.petLevel}-${auction.petQualityId}`;
  }
}
