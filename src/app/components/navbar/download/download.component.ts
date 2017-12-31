import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { ItemService } from '../../../services/item.service';
import { CraftingService } from '../../../services/crafting.service';
import { AuctionsService } from '../../../services/auctions.service';
import { PetsService } from '../../../services/pets.service';

@Component({
  selector: 'wah-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {

  constructor(
    private _itemService: ItemService,
    private _craftingService: CraftingService,
    private _auctionsService: AuctionsService,
    private _petService: PetsService) { }

  async ngOnInit() {
    if (SharedService.user.realm || SharedService.user.region) {
      await this._itemService.getItems();
      await this._petService.getPets();
      await this._craftingService.getRecipes();
      await this._auctionsService.getTsmAuctions();
      await this._auctionsService.getAuctions();
    }
  }

  getDownloading() {
    return SharedService.downloading;
  }

  isDownloading(): boolean {
    return SharedService.isDownloading();
  }
}