import {EventEmitter, Injectable} from '@angular/core';
import {User} from '../models/user/user';
import {AuctionItem} from '../modules/auction/models/auction-item.model';
import {Recipe} from '../modules/crafting/models/recipe';
import {Item, Pet} from '@shared/models';
import {Realm} from '@shared/models/realm/realm';
import {DEPRICATEDDashboard} from '../modules/dashboard/models/dashboard.model';
import {AuctionResponse} from '../modules/auction/models/auctions-response.model';
import {TradeVendor, TradeVendorItemValue} from '../models/item/trade-vendor';
import {UserAuctions} from '../modules/auction/models/user-auctions.model';
import {CustomPrice} from '../modules/crafting/models/custom-price';
import {AuctionPet} from '../modules/auction/models/auction-pet.model';
import {Notification} from '../models/user/notification';
import {CustomProc} from '../modules/crafting/models/custom-proc.model';
import {DefaultDashboardSettings} from '../modules/dashboard/models/default-dashboard-settings.model';
import {TSMCSV} from '../utils/tsm/tsm-lua.util';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class SharedService {
  public static user: User = {} as User;
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
    detailSelection: new EventEmitter<Item | AuctionItem | Pet | AuctionPet>(),
    auctionUpdate: new EventEmitter<boolean>(),
    items: new EventEmitter<boolean>(),
    recipes: new EventEmitter<boolean>(),
    pets: new EventEmitter<boolean>(),
    realms: new EventEmitter<boolean>(),
    shoppingCart: new EventEmitter<Recipe>(),
    isUserSet: new BehaviorSubject<boolean>(false),
    title: new BehaviorSubject('')
  };
  public static preScrollPosition = 0;

  public static defaultDashboardSettingsListMap = new Map<string, DefaultDashboardSettings>();

  public static customPricesMap: Map<number, CustomPrice> = new Map<number, CustomPrice>();
  public static customProcsMap: Map<number, CustomProc> = new Map<number, CustomProc>();
  public static auctionResponse: AuctionResponse = {
    lastModified: parseInt(localStorage['timestamp_auctions'], 10), url: undefined};

  public static userAuctions: UserAuctions = new UserAuctions();
  public static itemRecipeMap: Map<number, Array<Recipe>> = new Map<number, Array<Recipe>>();

  public static tsmAddonData: TSMCSV = {};
  public static items: Map<number, Item> = new Map<number, Item>();
  public static itemsUnmapped: Array<Item> = new Array<Item>();
  public static tradeVendorItemMap: Map<number, TradeVendorItemValue> = new Map<number, TradeVendorItemValue>();
  public static tradeVendorMap: Map<number, TradeVendor> = new Map<number, TradeVendor>();
  static bonusIdMap: any = {};

  public static pets: Map<number, Pet> = new Map<number, Pet>();

  public static realms: Map<string, Realm> = new Map<string, Realm>();
  public static userRealms: Array<Realm> = new Array<Realm>();

  public static itemDashboards: Array<DEPRICATEDDashboard> = new Array<DEPRICATEDDashboard>();
  public static sellerDashboards: Array<DEPRICATEDDashboard> = new Array<DEPRICATEDDashboard>();

  public static notifications: Array<Notification> = new Array<Notification>();

  public static downloading = {
    auctions: false,
    tsmAuctions: false,
    items: false,
    pets: false,
    recipes: false,
    characterData: false,
    zone: false,
    npc: false,
    professions: false
  };

  /* istanbul ignore next */
  static addonData = {};
  public static isDownloading(): boolean {
    return SharedService.downloading.auctions ||
      SharedService.downloading.tsmAuctions ||
      SharedService.downloading.professions ||
      SharedService.downloading.items ||
      SharedService.downloading.pets ||
      SharedService.downloading.recipes ||
      SharedService.downloading.characterData;
  }
}