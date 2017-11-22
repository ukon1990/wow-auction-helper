import { lists } from './globals';
import Crafting from './crafting';
import { Notification } from './notification';
import { Router } from '@angular/router';
import { AuctionService } from '../services/auctions.service';
import { ItemService } from '../services/item.service';
import { GoldPipe } from '../pipes/gold.pipe';
import Pets from './pets';
import { CharacterService } from 'app/services/character.service';
import { db } from 'app/utils/database';

export default class Auction {
  private static url: string;
  private static lastModified: number;
  private static updateAvailable: boolean;

  public static checkForUpdates(auctionService: AuctionService): Promise<any> {
    console.log('Checking for auction updates');
    return auctionService.getLastUpdated().then(r => {
      this.lastModified = r['lastModified'];
      this.url = r['url'].replace('\\', '');

      if (parseInt(localStorage['timestamp_auctions'], 10) !== r['lastModified']) {
        this.updateAvailable = true;
      } else {
        this.updateAvailable = false;
      }
      console.log(`Update available: ${this.updateAvailable}`);
    });
  }

  public static download(auctionService: AuctionService, router: Router, forceUpdate?: boolean): Promise<any> {
    lists.isDownloading = true;
    console.log('Downloading auctions');
    if (forceUpdate || !this.updateAvailable) {
      return db.table('auctions').toArray().then(
        result => {
          if (result.length > 0) {
            this.buildAuctionArray(result, router);
          } else {
            localStorage.setItem('timestamp_auctions', '0');
            return this.downloadFromAPI(auctionService, router);
          }
        });
    }

    return this.downloadFromAPI(auctionService, router);
  }

  public static downloadTSM(auctionService: AuctionService): Promise<any> {
    return auctionService.getTSMData()
      .then(r => {
        r.forEach(i => {
          lists.tsm[i.Id] = i;
        });
      })
      .catch(e =>
        console.error('Could not download TSM data', e));
  }

  private static downloadFromAPI(auctionService: AuctionService, router: Router): Promise<any> {
    return auctionService.getAuctions(this.url, this.lastModified)
      .then(a => {
        this.buildAuctionArray(a.auctions, router);
      }).catch(error => {
        lists.isDownloading = false;
        console.log('Could not download auctions at this time', error);
      });
  }

  public static buildAuctionArray(arr: any[], router: Router) {
    let undercuttedAuctions = 0;
    const list = [], itemsBelowVendor = { quantity: 0, totalValue: 0 };

    lists.myAuctions = [];
    for (const o of arr) {
      if (o['buyout'] === 0) {
        continue;
      }

      // TODO: this.numberOfAuctions++;
      if (lists.items[o.item] === undefined) {
        lists.items[o.item] = { 'id': o.item, 'name': 'Loading', 'icon': '' };
        o['name'] = 'Loading';
        // TODO: this.getItem(o.item);
      } else {
        o['name'] = lists.items[o.item].name;
      }
      try {
        if (o.petSpeciesId !== undefined) {
          if (lists.pets[o.petSpeciesId] === null || lists.pets[o.petSpeciesId] === undefined) {
            // TODO: getPet(o.petSpeciesId, this.itemService);
          }
          o['name'] = this.getItemName(o);
        }
      } catch (e) { console.log(e); }

      if (CharacterService.user.apiToUse === 'wowuction' && lists.wowuction[o.item] !== undefined) {
        o['estDemand'] = Math.round(lists.wowuction[o.item]['estDemand'] * 100) || 0;
        o['avgDailySold'] = parseFloat(lists.wowuction[o.item]['avgDailySold']) || 0;
        o['avgDailyPosted'] = parseFloat(lists.wowuction[o.item]['avgDailyPosted']) || 0;
        o['mktPrice'] = lists.wowuction[o.item]['mktPrice'] || 0;

      } else if (CharacterService.user.apiToUse === 'tsm' && lists.tsm[o.item] !== undefined) {
        try {
          o['estDemand'] = Math.round(lists.tsm[o.item]['RegionSaleRate'] * 100) || 0;
          o['avgDailySold'] = parseFloat(lists.tsm[o.item]['RegionAvgDailySold']) || 0;
          o['avgDailyPosted'] = Math.round(
            (parseFloat(lists.tsm[o.item]['RegionAvgDailySold']) / parseFloat(lists.tsm[o.item]['RegionSaleRate'])) * 100) / 100 || 0;
          o['mktPrice'] = lists.tsm[o.item]['MarketValue'] || 0;
          o['regionSaleAvg'] = lists.tsm[o.item].RegionSaleAvg;
          o['vendorSell'] = lists.tsm[o.item].VendorSell;
        } catch (err) {
          console.log(err);
        }

      } else {
        o['estDemand'] = 0;
        o['avgDailySold'] = 0;
        o['avgDailyPosted'] = 0;
        o['mktPrice'] = 0;
      }

      if (list[o.item] !== undefined) {

        list[o.item]['auctions'].push({
          item: o.item, name: o.name, petSpeciesId: o.petSpeciesId,
          owner: o.owner, ownerRealm: o.ownerRealm,
          buyout: o.buyout, quantity: o.quantity,
          bid: o.bid, timeLeft: o.timeLeft
        });
        list[o.item]['quantity_total'] += o['quantity'];

        if (list[o.item]['buyout'] > o['buyout'] / o['quantity']) {

          list[o.item]['buyout'] = o['buyout'] / o['quantity'];
          list[o.item]['bid'] = o['bid'] / o['quantity'];
          list[o.item]['owner'] = o['owner'];
        } else if (list[o.item]['buyout'] / list[o.item]['auctions'][list[o.item]['auc']] ===
          o['buyout'] / o['quantity'] &&
          list[o.item]['owner'] !== o['owner']) {
          list[o.item]['owner'] += ', ' + o['owner'];
        }
      } else {
        o['quantity_total'] = o['quantity'];
        list[o.item] = o;
        list[o.item]['auctions'] = [];
        list[o.item]['auctions'].push({
          item: o.item, name: o.name, petSpeciesId: o.petSpeciesId,
          owner: o.owner, ownerRealm: o.ownerRealm,
          buyout: o.buyout, quantity: o.quantity,
          bid: o.bid, timeLeft: o.timeLeft
        });
      }

      // Storing a users auctions in a list
      if (CharacterService.user.character !== undefined) {
        if (o.owner === CharacterService.user.character) {
          if (lists.myAuctions === undefined) {
            lists.myAuctions = [];
          }
          lists.myAuctions.push(o);
        }
      }
      // Gathering data for auctions below vendor price
      if (CharacterService.user.notifications.isBelowVendorSell && lists.items[o.item] !== undefined && o.buyout < lists.items[o.item].sellPrice) {
        itemsBelowVendor.quantity++;
        itemsBelowVendor.totalValue += (lists.items[o.item].sellPrice - o.buyout) * o.quantity;
      }
      // TODO: this.addToContextList(o);
    }
    if (CharacterService.user.notifications.isBelowVendorSell && itemsBelowVendor.quantity > 0) {
      Notification.send(
        `${itemsBelowVendor.quantity} items have been found below vendor sell!`,
        `Potential profit: ${new GoldPipe().transform(itemsBelowVendor.totalValue)}`, router, 'auctions');
    }

    if (CharacterService.user.notifications.isUndercutted && CharacterService.user.character !== undefined) {
      // Notifying the user if they have been undercutted or not
      lists.myAuctions.forEach(a => {
        if (lists.auctions[a.item] !== undefined && lists.auctions[a.item].owner !== CharacterService.user.character) {
          undercuttedAuctions++;
          console.log(`${lists.auctions[a.item].owner} !== ${CharacterService.user.character}`);
        }

      });
      if (undercuttedAuctions > 0) {
        Notification.send(
          'You have been undercutted!',
          `${undercuttedAuctions} of your ${lists.myAuctions.length} auctions have been undercutted.`, router, 'my-auctions');
      }
    }

    lists.auctions = list;
    Crafting.getCraftingCosts(router);
    lists.isDownloading = false;
  }

  private static getItemName(auction): string {
    const itemID = auction.item;
    if (auction.petSpeciesId !== undefined) {
      auction['name'] = Pets.getPet(auction.petSpeciesId).name + ' @' + auction.petLevel;
      return auction['name'];
    } else {
      if (lists.items[itemID] !== undefined) {
        return lists.items[itemID]['name'];
      }
    }
    return 'no item data';
  }


  /**
   * Checks if an item is @ AH or not.
   * @param  {string}  itemID
   * @return {boolean}        Availability
   */
  public static isAtAH(itemID: string): boolean {
    return lists.auctions[itemID] !== undefined ? true : false;
  }

  /**
   * Gets thre auction item for an item
   * @param  {string} itemID
   * @return {object}
   */
  public static getAuctionItem(itemID: string) {
    if (lists.auctions[itemID] === undefined) {
      return { 'quantity_total': 0 };
    }
    return lists.auctions[itemID];
  }

  /**
   * Finds the minimum price for an item
   * @param  {string} itemID
   * @return {number}
   */
  public static getMinPrice(itemID: string): number {
    try {
      if (lists.customPrices[itemID]) {
        return lists.customPrices[itemID];
      }
      return lists.auctions[itemID].buyout;
    } catch (e) {
      if (CharacterService.user.apiToUse === 'wowuction' && lists.wowuction[itemID] !== undefined) {
        return lists.wowuction[itemID]['mktPrice'];
      } else if (CharacterService.user.apiToUse === 'tsm' && lists.tsm[itemID] !== undefined) {
        return lists.tsm[itemID].MarketValue;
      }
      return 0;
    }
  }
}
