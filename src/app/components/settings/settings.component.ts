import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RealmService } from '../../services/realm.service';
import { AuctionService } from '../../services/auctions.service';
import { CharacterService } from '../../services/character.service';
import { Title } from '@angular/platform-browser';
import { IUser } from '../../utils/interfaces';
import { lists, db } from '../../utils/globals';
import Crafting from '../../utils/crafting';
import { Router } from '@angular/router';
import Auctions from '../../utils/auctions';
import { ItemService } from '../../services/item.service';
import { DownloadsComponent } from 'app/components/downloads/downloads.component';
import { User } from 'app/models/user';
import { Notification } from 'app/models/notification';
import { watchlist } from 'app/utils/objects';

declare const ga: Function;
@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['../../app.component.css'],
  providers: [DownloadsComponent]
})
export class SettingsComponent implements OnInit {
  characterForm: FormGroup;
  customPriceForm: FormGroup;
  userCrafterForm: FormGroup;
  customPrices = [];
  newCustomPrice = { 'itemID': 0 };
  customPriceSearchQuery: string;
  customPriceQueryItems = [];
  regions: any;
  importedSettings: string;
  exportedSettings: string;
  originalRealm: string;
  userCrafter: string;
  userCraftersChanged = false;
  userCraftersDownloading = false;
  darkMode = true;
  tabIndex = 0;
  tabs = [
    { name: 'Realm, Seller & API', path: '' },
    { name: 'Crafting', path: 'crafting' },
    { name: 'Notifications', path: 'notifications' }
  ];

  constructor(private downloadComponent: DownloadsComponent, private titleService: Title,
    private formBuilder: FormBuilder, private router: Router,
    private rs: RealmService, private auctionService: AuctionService,
    private characterService: CharacterService, private itemService: ItemService) {
    this.characterForm = this.formBuilder.group({
      region: CharacterService.user.region ? CharacterService.user.region : '',
      realm: CharacterService.user.realm ? CharacterService.user.realm : '',
      name: CharacterService.user.character ? CharacterService.user.character : '',
      buyoutLimit: CharacterService.user.buyoutLimit ? CharacterService.user.buyoutLimit : 0,
      apiTsm: CharacterService.user.apiTsm ? CharacterService.user.apiTsm : '',
      apiToUse: CharacterService.user.apiToUse ? CharacterService.user.apiToUse : '',
      customPrices: CharacterService.user.customPrices ? CharacterService.user.customPrices : {},
      notifications: this.formBuilder.group({
        isUpdateAvailable: CharacterService.user.notifications.isUpdateAvailable ? CharacterService.user.notifications.isUpdateAvailable : true,
        isBelowVendorSell: CharacterService.user.notifications.isBelowVendorSell ? CharacterService.user.notifications.isBelowVendorSell : true,
        isUndercutted: CharacterService.user.notifications.isUndercutted ? CharacterService.user.notifications.isUndercutted : true,
        isWatchlist: CharacterService.user.notifications.isWatchlist ? CharacterService.user.notifications.isWatchlist : true
      }),
      watchlist: CharacterService.user.watchlist ? CharacterService.user.watchlist : watchlist,
      isDarkMode: CharacterService.user.isDarkMode ? CharacterService.user.isDarkMode : false
    });
    this.customPriceForm = formBuilder.group({
      'query': ''
    });
    this.userCrafterForm = formBuilder.group({
      'query': ''
    });

    Object.keys(lists.customPrices).forEach(k => {
      this.customPrices.push({
        'itemID': k,
        'name': lists.items[k] !== undefined ? lists.items[k].name : 'undefined',
        'price': lists.customPrices[k]
      });
    });

    if (localStorage.getItem('darkMode') !== null) {
      this.darkMode = JSON.parse(localStorage.getItem('darkMode'));
    }
    this.originalRealm = localStorage.getItem('realm');
    this.titleService.setTitle('Wah - Settings');
  }

  ngOnInit(): void {
    this.rs.getRealms().then(
      r => {
        this.regions = r.region;
      });
  }

  getRegions(): string[] {
    return this.regions ? Object.keys(this.regions) : [];
  }

  async saveUserData() {
    const oldTSMKey = localStorage.getItem('api_tsm') || '';

    this.customPrices.forEach(cp => {
      if (cp.itemID !== null) {
        lists.customPrices[cp.itemID] = cp.price;
      }
    });
    localStorage.setItem('custom_prices', JSON.stringify(lists.customPrices));

    if (localStorage.getItem('crafting_buyout_limit') !== this.characterForm.value.buyoutLimit.toString()) {
      Crafting.getCraftingCosts(this.router);
    }

    if (this.characterForm.value.realm !== CharacterService.user.realm) {
      console.log('The realm is chagned. The old realm was ' +
        this.characterForm.value.realm + ' and new realm is ' +
        CharacterService.user.realm + '. Downloading new auction data.');

      DownloadsComponent.downloading.api = true;
      await Auctions.downloadTSM(this.auctionService)
        .then(r => DownloadsComponent.downloading.api = false)
        .catch(e => DownloadsComponent.downloading.api = false);
      
      DownloadsComponent.downloading.auctions = true;
      await Auctions.download(this.auctionService, this.router)
        .then(r => DownloadsComponent.downloading.auctions = false)
        .catch(e => DownloadsComponent.downloading.auctions = false);

    } else if (CharacterService.user.apiTsm !== localStorage.getItem('api_tsm')) {
      DownloadsComponent.downloading.api = true;
      await Auctions.downloadTSM(this.auctionService)
        .then(r => DownloadsComponent.downloading.api = false)
        .catch(e => DownloadsComponent.downloading.api = false);

      await db.table('auctions').toArray().then(a => {
        Auctions.buildAuctionArray(a, this.router);
      });

    } else {
      db.table('auctions').toArray().then(a => {
        Auctions.buildAuctionArray(a, this.router);
      });
    }

    User.save(this.characterForm.value as User);
    User.updateRecipesForRealm();
  }

  importUserData(): void {
    User.import(this.importedSettings);
    this.importedSettings = '';
  }

  exportUserData(): void {
    this.exportedSettings = JSON.stringify(CharacterService.user);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Settings',
      eventAction: 'User data export'
    });
  }

  deleteUserData(): void {
    User.delete();

    ga('send', {
      hitType: 'event',
      eventCategory: 'Settings',
      eventAction: 'User deleted'
    });
  }

  changeStyle(): void {
    this.darkMode = !this.darkMode;
    document
      .getElementById('custom-style')
      .setAttribute('href',
      (this.darkMode ? 'assets/solar.bootstrap.min.css' : 'assets/paper.bootstrap.min'));
    localStorage.setItem('darkMode', this.darkMode.toString());
    ga('send', {
      hitType: 'event',
      eventCategory: 'Settings',
      eventAction: 'Change style',
      eventLabel: `Darkmode: ${this.darkMode}`
    });
    location.reload();
  }

  addCustomPrice(item: any): void {
    this.customPrices.push({
      'itemID': item.id,
      'name': item.name,
      'price': 20000
    });

    ga('send', {
      hitType: 'event',
      eventCategory: 'Settings',
      eventAction: 'Custom price',
      eventLabel: `Item: ${item.name}`
    });
  }

  searchDB() {
    db.table('items')
      .where('name')
      .startsWithIgnoreCase(this.customPriceForm.value['query'])
      .limit(2)
      .toArray()
      .then(i => {
        this.customPriceQueryItems = i;
      }, e => {
        console.log(e);
      });
  }

  removeCustomPrice(index: number): void {
    this.customPrices.splice(index, 1);
  }

  getMyRecipeCount(): number {
    return lists.myRecipes.length;
  }

  getItemName(itemID: string): string {
    if (lists.items[itemID] === undefined) {
      return 'undefined';
    } else {
      return lists.items[itemID].name;
    }
  }

  selectTab(index: number) {
    this.tabIndex = index;
  }
}
