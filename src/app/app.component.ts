import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './models/user/user';
import { SharedService } from './services/shared.service';
import { CraftingService } from './services/crafting.service';
import { AuctionsService } from './services/auctions.service';
import { ItemService } from './services/item.service';

@Component({
  selector: 'wah-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private _router: Router,
    private _craftingService: CraftingService,
    private _auctionsService: AuctionsService,
    private _itemService: ItemService) {
    User.restore();

    if (!SharedService.user.realm || !SharedService.user.region) {
      this._router.navigateByUrl('setup');
    } else {
      this._itemService.getItems();
      this._craftingService.getRecipes();
      this._auctionsService.getAuctions();
    }
  }

  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }
}
