import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './models/user/user';
import { SharedService } from './services/shared.service';
import { CraftingService } from './services/crafting.service';
import { AuctionsService } from './services/auctions.service';
import { ItemService } from './services/item.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

@Component({
  selector: 'wah-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private _router: Router,
    private _craftingService: CraftingService,
    private _auctionsService: AuctionsService,
    private _itemService: ItemService,
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
    User.restore();
  }

  ngOnInit(): void {
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

  /* istanbul ignore next */
  isItemSelected(): boolean  {
    return SharedService.selectedItemId ? true : false;
  }
}
