import { Injectable } from '@angular/core';
import { User } from '../models/user/user';
import { AuctionItem } from '../models/auction/auction-item';
import { Recipe } from '../models/crafting/recipe';
import { Item } from '../models/item/item';
import { TSM } from '../models/auction/tsm';
import { Auction } from '../models/auction/auction';
import { Realm } from '../models/realm';
import { Dashboard } from '../models/dashboard';

@Injectable()
export class SharedService {
  public static user: User;

  public static auctionItemsMap: Map<number, AuctionItem> = new Map<number, AuctionItem>();
  public static auctionItems: Array<AuctionItem> = new Array<AuctionItem>();
  public static auctions: Array<Auction> = new Array<Auction>();
  public static tsm: Map<number, TSM> = new Map<number, TSM>();
  public static recipes: Array<Recipe> = new Array<Recipe>();
  public static items: Map<number, Item> = new Map<number, Item>();
  public static realms: Map<string, Realm> = new Map<string, Realm>();
  public static selectedItemId = 124120;

  public static dashboards: Array<Dashboard> = new Array<Dashboard>();

  public static downloading = {
    auctions: false,
    tsmAuctions: false,
    items: false,
    pets: false,
    recipes: false,
    characterData: false
  };

  public static isDownloading(): boolean {
    return SharedService.downloading.auctions ||
      SharedService.downloading.tsmAuctions ||
      SharedService.downloading.items ||
      SharedService.downloading.pets ||
      SharedService.downloading.recipes ||
      SharedService.downloading.characterData;
  }
}
