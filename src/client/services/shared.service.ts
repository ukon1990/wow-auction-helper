import { Injectable, EventEmitter } from '@angular/core';
import { User } from '../models/user/user';
import { AuctionItem } from '../modules/auction/models/auction-item.model';
import { Recipe } from '../modules/crafting/models/recipe';
import { Item } from '../models/item/item';
import { TSM } from '../modules/auction/models/tsm.model';
import { Auction } from '../modules/auction/models/auction.model';
import { Realm } from '../models/realm';
import { Dashboard } from '../modules/dashboard/models/dashboard.model';
import { Pet } from '../modules/pet/models/pet';
import { AuctionResponse } from '../modules/auction/models/auctions-response.model';
import { TradeVendor, TradeVendorItemValue } from '../models/item/trade-vendor';
import { UserAuctions } from '../modules/auction/models/user-auctions.model';
import { CustomPrice } from '../modules/crafting/models/custom-price';
import { Seller, ItemClassGroup } from '../models/seller';
import { AuctionPet } from '../modules/auction/models/auction-pet.model';
import { Notification } from '../models/user/notification';
import { CustomProc } from '../modules/crafting/models/custom-proc';
import { WoWUction } from '../modules/auction/models/wowuction.model';
import { Zone } from '../models/zone.model';
import { DefaultDashboardSettings } from '../modules/dashboard/models/default-dashboard-settings.model';
import {TSMCSV} from '../utils/tsm-lua.util';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class SharedService {
  public static user: User;
  public static locales = [
    {locale: 'en_GB', name: 'English (GB)'},
    {locale: 'en_US', name: 'English (US)'},
    {locale: 'de_DE', name: 'Deutsche'},
    {locale: 'es_ES', name: 'Español (España)'},
    {locale: 'es_MX', name: 'Español (Méjico)'},
    {locale: 'fr_FR', name: 'Français'},
    {locale: 'it_IT', name: 'Italiano'},
    {locale: 'pt_PT', name: 'Português (Portugal)'},
    {locale: 'pt_BR', name: 'Português (Brasil)'},
    {locale: 'ru_RU', name: 'русский'},
    {locale: 'ko_KR', name: 'Korean'},
    {locale: 'zh_TW', name: 'Chinese'}
  ];

  public static events = {
    detailPanelOpen: new EventEmitter<boolean>(),
    auctionUpdate: new EventEmitter<boolean>(),
    items: new EventEmitter<boolean>(),
    recipes: new EventEmitter<boolean>(),
    pets: new EventEmitter<boolean>(),
    realms: new EventEmitter<boolean>(),
    shopingCart: new EventEmitter<Recipe>()
  };
  public static preScrollPosition = 0;

  public static defaultDashboardSettingsListMap = new Map<string, DefaultDashboardSettings>();

  public static customPricesMap: Map<number, CustomPrice> = new Map<number, CustomPrice>();
  public static customProcsMap: Map<number, CustomProc> = new Map<number, CustomProc>();
  public static auctionResponse: AuctionResponse = {
    lastModified: parseInt(localStorage['timestamp_auctions'], 10), url: undefined};

  public static userAuctions: UserAuctions = new UserAuctions();
  public static sellersByItemClassesMap = new Map<number, ItemClassGroup>();
  public static sellersByItemClass = new Array<ItemClassGroup>();
  public static sellersMap: Map<string, Seller> = new Map<string, Seller>();
  public static sellers: Array<Seller> = new Array<Seller>();

  public static auctionItemsMap: Map<number, AuctionItem> = new Map<number, AuctionItem>();
  public static auctionItems: Array<AuctionItem> = new Array<AuctionItem>();
  public static auctions: Array<Auction> = new Array<Auction>();
  public static tsm: Map<number, TSM> = new Map<number, TSM>();
  public static wowUction: Map<number, WoWUction> = new Map<number, WoWUction>();

  public static recipesForUser: Map<number, Array<string>> = new Map<number, Array<string>>();
  public static recipes: Array<Recipe> = new Array<Recipe>();
  public static recipesMap: Map<number, Recipe> = new Map<number, Recipe>();
  public static recipesMapPerItemKnown: Map<number, Recipe> = new Map<number, Recipe>();
  public static itemRecipeMap: Map<number, Array<Recipe>> = new Map<number, Array<Recipe>>();

  public static tsmAddonData: TSMCSV = {};
  public static items: Map<number, Item> = new Map<number, Item>();
  public static itemsUnmapped: Array<Item> = new Array<Item>();
  public static tradeVendorItemMap: Map<number, TradeVendorItemValue> = new Map<number, TradeVendorItemValue>();
  public static tradeVendorMap: Map<number, TradeVendor> = new Map<number, TradeVendor>();

  public static pets: Map<number, Pet> = new Map<number, Pet>();

  public static realms: Map<string, Realm> = new Map<string, Realm>();
  public static userRealms: Array<Realm> = new Array<Realm>();

  public static selectedItemId: number;
  public static selectedPetSpeciesId: AuctionPet;
  public static selectedSeller: Seller;
  public static zoneMap: Map<number, Zone>;


  public static itemDashboards: Array<Dashboard> = new Array<Dashboard>();
  public static sellerDashboards: Array<Dashboard> = new Array<Dashboard>();

  public static notifications: Array<Notification> = new Array<Notification>();

  public static downloading = {
    auctions: false,
    tsmAuctions: false,
    wowUctionAuctions: false,
    items: false,
    pets: false,
    recipes: false,
    characterData: false
  };

  /* istanbul ignore next */
  public static isDownloading(): boolean {
    return SharedService.downloading.auctions ||
      SharedService.downloading.tsmAuctions ||
      SharedService.downloading.wowUctionAuctions ||
      SharedService.downloading.items ||
      SharedService.downloading.pets ||
      SharedService.downloading.recipes ||
      SharedService.downloading.characterData;
  }
}
