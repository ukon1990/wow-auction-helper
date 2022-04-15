import {Report} from '../../../utils/report.util';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {SharedService} from '../../../services/shared.service';
import {Pet} from '../../pet/models/pet';
import {Item} from '@shared/models';
import {AuctionItemStat} from '../../../../../../api/src/auction/models/auction-item-stat.model';
import {Recipe} from '../../crafting/models/recipe';

interface ItemSelection {
  auctionItem: AuctionItem;
  item: Item;
  pet: Pet;
}

export class ItemDetailsUtil {
  static getSelection(item: any, auctions: Map<string, AuctionItem>, variations: Map<number, AuctionItem[]>): ItemSelection {

    if (item instanceof Recipe || item.craftedItemId) {
      Report.debug('selected recipe');
      return this.handleRecipe(item, variations);
    } else if (item.auctions && typeof item.item === 'number') {
      Report.debug('selected auctions');
      return this.handleAuctionItem(item);
    } else if (item.id && item.bonusIds) {
      Report.debug('selected id + bonusIds');
      const id = item.id + AuctionItemStat.bonusIdRaw(item.bonusIds, false);
      const auctionItem: AuctionItem = auctions.get(id) || auctions.get(item.id + '');
      if (auctionItem) {
        return this.handleAuctionItem(auctionItem);
      }
    } else if (item.itemID) {
      Report.debug('selected itemID', item.itemID, auctions.get('' + item.itemID));
      return this.handleItemWithItemID(item, auctions);
    } else if (item.id) {
      Report.debug('selected id');
      return this.handleItemWithId(item, auctions);
    } else if (item.speciesId) {
      Report.debug('selected speciesId');
      return this.handlePet(item, auctions);
    }
    return undefined;
  }

  private static handleAuctionItem(item: any): ItemSelection {
    return {
      auctionItem: item,
      item: SharedService.items[item.itemID],
      pet: SharedService.pets[item.petSpeciesId],
    };
  }

  private static handleItemWithItemID(item: any, auctions: Map<string, AuctionItem>) {
    return {
      auctionItem: auctions.get('' + item.itemID),
      item: SharedService.items[item.itemID],
      pet: SharedService.pets[item.petSpeciesId],
    };
  }

  private static handleItemWithId(item: any, auctions: Map<string, AuctionItem>): ItemSelection {
    return {
      auctionItem: auctions.get('' + item.id),
      item: SharedService.items[item.id],
      pet: SharedService.pets[item.petSpeciesId],
    };
  }

  private static handlePet(item: any, auctions: Map<string, AuctionItem>): ItemSelection {
    const pet: Pet = SharedService.pets[item.speciesId];
    let auctionItem: AuctionItem;
    auctions.forEach(ai => {
      if (ai.petSpeciesId === pet.speciesId) {
        auctionItem = ai;
        return;
      }
    });

    return {
      pet,
      auctionItem,
      item: SharedService.items[auctionItem ? auctionItem.itemID : undefined],
    };
  }

  private static handleRecipe(recipe: Recipe, variations: Map<number, AuctionItem[]>): ItemSelection {
    const variationMatch = variations.get(recipe.craftedItemId);
    let auctionItem: AuctionItem = variationMatch ? variationMatch[0] : undefined;
    if (recipe.bonusIds && recipe.bonusIds.length) {
      variations.get(recipe.craftedItemId).forEach((variation) => {
        variation.bonusIds.forEach(id => {
          if (recipe.bonusIds.filter(bId => bId === id).length) {
            auctionItem = variation;
          }
        });
      });
    }
    return {
      auctionItem: auctionItem,
      item: SharedService.items[recipe.craftedItemId],
      pet: undefined,
    };
  }
}