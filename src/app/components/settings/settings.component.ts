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

declare const ga: Function;
@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['../../app.component.css'],
  providers: [DownloadsComponent]
})
export class SettingsComponent implements OnInit {
  user: IUser;
  customPriceForm: FormGroup;
  userCrafterForm: FormGroup;
  customPrices = [];
  newCustomPrice = { 'itemID': 0 };
  customPriceSearchQuery: string;
  customPriceQueryItems = [];
  realmListEu = [];
  realmListUs = [];
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
    this.user = CharacterService.user;
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
        this.realmListEu = r.region.eu;
        this.realmListUs = r.region.us;
      });
  }

  getRealms() {
    if (this.user.region === 'us') {
      return this.realmListUs['realms'] || [];
    } else {
      return this.realmListEu['realms'] || [];
    }
  }

  saveUserData(): void {
    const oldTSMKey = localStorage.getItem('api_tsm') || '';

    this.customPrices.forEach(cp => {
      if (cp.itemID !== null) {
        lists.customPrices[cp.itemID] = cp.price;
      }
    });
    localStorage.setItem('custom_prices', JSON.stringify(lists.customPrices));

    if (localStorage.getItem('crafting_buyout_limit') !== this.user.buyoutLimit.toString()) {
      Crafting.getCraftingCosts(this.router);
      localStorage.setItem('crafting_buyout_limit', this.user.buyoutLimit.toString());
    }

    if (this.originalRealm !== this.user.realm) {
      console.log('The realm is chagned. The old realm was ' +
        this.originalRealm + ' and new realm is ' +
        this.user.realm + '. Downloading new auction data.');

      this.auctionService.getTSMData().subscribe(result => {
        result.forEach(r => {
          lists.tsm[r.Id] = r;
        });
        // Downloading the auctions
        localStorage.setItem('timestamp_auctions', '0');
        Auctions.download(this.auctionService, this.router);
      }, err => {
        console.log(err);
      });
    } else if (oldTSMKey !== localStorage.getItem('api_tsm')) {
      this.auctionService.getTSMData().subscribe(result => {
        result.forEach(r => {
          lists.tsm[r.Id] = r;
          db.table('auctions').toArray().then(a => {
            Auctions.buildAuctionArray(a, this.router);
          });
        });
      }, err => {
        console.log(err);
      });
    } else {
      db.table('auctions').toArray().then(a => {
        Auctions.buildAuctionArray(a, this.router);
      });
    }

    this.updateRecipesForRealm();
    User.save(this.user as User);
  }

  importUserData(): void {
    User.import(this.importedSettings);
    this.user = CharacterService.user;
    this.importedSettings = '';
  }

  exportUserData(): void {
    this.exportedSettings = JSON.stringify(this.user);
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

  updateRecipesForRealm(): void {
    lists.myRecipes = [];
    this.user.characters.forEach(character => {
      User.setRecipesForCharacter(character);
    });
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
