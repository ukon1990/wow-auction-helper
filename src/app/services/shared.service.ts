import { Injectable } from '@angular/core';
import { User } from '../models/user/user';
import { AuctionItem } from '../models/auction/auction-item';
import { Recipe } from '../models/crafting/recipe';
import { Item } from '../models/item/item';
import { TSM } from '../models/auction/tsm';

@Injectable()
export class SharedService {
  public static user: User;
  public static auctionItems: Map<number, AuctionItem> = new Map<number, AuctionItem>();
  public static tsm: Map<number, TSM> = new Map<number, TSM>();
  public static recipes: Array<Recipe> = new Array<Recipe>();
  public static items: Map<number, Item> = new Map<number, Item>();
  public static downloading = {
    auctions: false,
    tsmAuctions: false,
    items: false,
    pets: false,
    recipes: false,
    characterData: false
  };
}
