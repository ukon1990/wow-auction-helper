import { Component, OnInit, Input } from '@angular/core';
import Crafting from 'app/utils/crafting';
import Pets from 'app/utils/pets';
import { Item } from 'app/utils/item';
import Auctions from 'app/utils/auctions';
import { ItemService } from 'app/services/item.service';
import { AuctionService } from 'app/services/auctions.service';
import { Router } from '@angular/router';
import { lists, db } from 'app/utils/globals';
import { Notification } from 'app/utils/notification';
import { IUser } from 'app/utils/interfaces';
import { CharacterService } from 'app/services/character.service';
import { User } from 'app/models/user';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.css']
})
export class DownloadsComponent implements OnInit {
  tempTimestamps = {
    pets: new Date(),
    recipes: new Date()
  };

  downloading = {
    items: false,
    api: false,
    auctions: false,
    recipes: false,
    pets: false
  };

  private lastModified: number;
  timeSinceLastModified: number;
  private oldTimeDiff: number;
  private auctionObserver = {};
  private itemObserver = {};
  private petObserver = {};
  private date: Date;
  showDropdown: boolean;
  constructor(private auctionService: AuctionService,
    private itemService: ItemService, private characterService: CharacterService,
    private router: Router) {}

  async ngOnInit() {
    this.date = new Date();
    if (this.isRealmSet()) {
			/**
			 * Ohh, this is so bad.. Need to clean this up O_o
			 */
      // Loading user settings
      try {

        if (localStorage.watchlist) {
          CharacterService.user.watchlist = JSON.parse(localStorage.watchlist);
          Object.keys(CharacterService.user.watchlist.items).forEach(k => {
            CharacterService.user.watchlist.items[k].forEach(w => {
              if (w.alert === undefined) {
                w['alert'] = true;
              }
            });
          });
          console.log('watchlist:', CharacterService.user.watchlist);
        }
      } catch (e) {
        console.log('app.component init', e);
      }

      if (
        CharacterService.user.apiToUse === 'tsm' &&
        localStorage.getItem('api_tsm') !== null &&
        localStorage.getItem('api_tsm') !== undefined &&
        localStorage.getItem('api_tsm').length > 0 &&
        localStorage.getItem('api_tsm') !== 'null') {
        if (new Date(localStorage.getItem('timestamp_tsm')).toDateString() !== new Date().toDateString()) {
          this.auctionService.getTSMData().subscribe(result => {
            result.forEach(r => {
              lists.tsm[r.Id] = r;
            });
          }, err => {
            console.log(err);
          });
          console.log('TSM done');

          if (CharacterService.user.apiToUse === 'tsm') {
            // TODO: this.downloadPets();
          }
        } else {
          console.log('Loaded TSM from local DB');
          db.table('tsm').toArray().then(
            result => {
              result.forEach(r => {
                lists.tsm[r.Id] = r;
              });
            });

          if (CharacterService.user.apiToUse === 'tsm') {
            // TODO: this.downloadPets();
          }
        }
      } else if (
        CharacterService.user.apiToUse === 'wowuction' &&
        localStorage.getItem('api_wowuction') !== null &&
        localStorage.getItem('api_wowuction') !== undefined &&
        localStorage.getItem('api_wowuction').length > 0 &&
        localStorage.getItem('api_wowuction') !== 'null') {
        if (new Date(localStorage.getItem('timestamp_wowuction')).toDateString() !== new Date().toDateString()) {
          console.log('Downloading wowuction data');
          this.auctionService.getWoWuctionData().subscribe(res => {
            res.forEach(r => {
              lists.wowuction[r.id] = r;
            });

            if (CharacterService.user.apiToUse === 'wowuction') {
              // TODO: this.downloadPets();
            }
          });
        } else {
          console.log('Loading wowuction data from local storage');
          db.table('wowuction').toArray().then(r => {
            r.forEach(w => {
              lists.wowuction[w.id] = w;
            });

            if (CharacterService.user.apiToUse === 'wowuction') {
              // TODO: this.downloadPets();
            }
          });
        }
      } else {
        // TODO: this.downloadPets();
      }
      
      await this.donloadRecipes();

      await this.downloadPets();

      await this.downloadItems();

      await Auctions.checkForUpdates(this.auctionService);

      await this.downloadAuctions();
      setInterval(() => this.checkForUpdate(), 60000);

      if (localStorage.getItem('custom_prices') !== null) {
        lists.customPrices = JSON.parse(localStorage.getItem('custom_prices'));
      }
    }
  }


  checkForUpdate() {
    console.log('checking for update');
    if (this.isRealmSet()) {
      this.auctionService.getLastUpdated()
        .then(r => {
          this.lastModified = r['lastModified'];
          this.setTimeSinceLastModified();
        });
    }
  }

  setTimeSinceLastModified() {
    this.date = new Date();

    const updateTime = new Date(this.lastModified).getMinutes(),
      currentTime = this.date.getMinutes();

    // Checking if there is a new update available
    if (this.lastModified && this.lastModified > 0 && this.timeDiff(updateTime, currentTime) < this.oldTimeDiff && !lists.isDownloading) {
      if (CharacterService.user.notifications.isUpdateAvailable) {
        Notification.send(
          'New auction data is available!',
          `Downloading new auctions for ${
            CharacterService.user.realm}@${
              CharacterService.user.region}.`,
              this.router);
      }
      Auctions.download(this.auctionService, this.router);
    }

    this.timeSinceLastModified = this.timeDiff(updateTime, currentTime);
    this.oldTimeDiff = this.timeSinceLastModified;
  }

  timeDiff(updateTime, currentTime) {
    return (updateTime > currentTime ?
      (60 - updateTime + currentTime) : currentTime - updateTime);
  }

  exists(value): boolean {
    return value !== null && value !== undefined && value.length > 0;
  }

  isRealmSet(): boolean {
    return this.exists(localStorage.getItem('realm')) &&
      this.exists(localStorage.getItem('region'));
  }

  isCharacterSet(): boolean {
    return this.isRealmSet() && this.exists(CharacterService.user.character);
  }

  getTimestamp(type: string): any {
    return localStorage[`timestamp_${type}`]
  }

  donloadRecipes(): void {
    this.downloading.recipes = true;
    Crafting.download(this.itemService)
      .then(r => {
        this.downloading.recipes = false;
        this.tempTimestamps.recipes = new Date();
      }).catch(r => this.downloading.recipes = false);
  }

  downloadPets(): void {
    this.downloading.pets = true;
    Pets.download(this.itemService)
      .then(r => {
        this.downloading.pets = false;
        this.tempTimestamps.pets = new Date();
      }).catch(r => this.downloading.pets = false);
  }

  downloadItems(): void {
    this.downloading.items = true;
    Item.download(this.itemService)
      .then(r => this.downloading.items = false)
      .catch(r => this.downloading.items = false);
  }

  checkForUpdates(): void {
    Auctions.checkForUpdates(this.auctionService);
  }

  downloadAuctions(): void {
    this.downloading.auctions = true;
    Auctions.download(this.auctionService, this.router)
      .then(r => this.downloading.auctions = false)
      .catch(r => this.downloading.auctions = false);
  }

  isDownloading(): boolean {
    return this.downloading.api || this.downloading.auctions || this.downloading.items
      || this.downloading.pets || this.downloading.recipes;
  }
}
