import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { ItemService } from '../../../services/item.service';
import { CraftingService } from '../../../services/crafting.service';
import { AuctionsService } from '../../../services/auctions.service';
import { PetsService } from '../../../services/pets.service';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'wah-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {
  checkingForUpdates: boolean;
  lastCheckedMin;
  timeSinceUpdate = 0;
  constructor(
    private _itemService: ItemService,
    private _craftingService: CraftingService,
    private _auctionsService: AuctionsService,
    private _petService: PetsService,
    private _dbService: DatabaseService) { }

  async ngOnInit() {
    if (SharedService.user.realm || SharedService.user.region) {
      await this._itemService.getItems();
      await this._petService.getPets();
      await this._craftingService.getRecipes();
      if (SharedService.user.apiToUse === 'tsm') {
        await this._auctionsService.getTsmAuctions();
      }
      await this._dbService.getAllAuctions()
        .then(r => {
          if (SharedService.auctions.length === 0) {
            this._auctionsService.getLastModifiedTime();
          }
        })
        .catch(e => {
          console.error('Could not restore auctions from DB');
          if (SharedService.auctions.length === 0) {
            this._auctionsService.getLastModifiedTime();
          }
        });

      this.timeSinceUpdate = this.milliSecondsToMinutes();

      setInterval(() => this.setLastUpdateAvailableTime(), 30000);
    }
  }

  getDownloading() {
    return SharedService.downloading;
  }

  isDownloading(): boolean {
    return SharedService.isDownloading();
  }

  setLastUpdateAvailableTime(): void {
    const timeSince = this.milliSecondsToMinutes(),
      lastModified = SharedService.auctionResponse ? SharedService.auctionResponse.lastModified : undefined;

    if (!this.checkingForUpdates) {
      this.checkingForUpdates = true;
      this._auctionsService.getLastModifiedTime()
        .then(r => {
          if (SharedService.auctionResponse.lastModified !== lastModified) {
            this.lastCheckedMin = undefined;
            this.checkingForUpdates = false;
          } else {
            this.lastCheckedMin = timeSince;
            this.checkingForUpdates = false;
          }
        });
    }
    this.timeSinceUpdate = timeSince;
  }

  private milliSecondsToMinutes(): number {
    if (!SharedService.auctionResponse) {
      return 0;
    }
    const ms = new Date().getTime() - (SharedService.auctionResponse.lastModified);
    return Math.round(ms / 60000);
  }
}
