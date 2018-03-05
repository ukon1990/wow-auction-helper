import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from './models/user/user';
import { SharedService } from './services/shared.service';
import { CraftingService } from './services/crafting.service';
import { AuctionsService } from './services/auctions.service';
import { ItemService } from './services/item.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'wah-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(private _router: Router,
    private _craftingService: CraftingService,
    private _auctionsService: AuctionsService,
    private _itemService: ItemService,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    private angulartics2: Angulartics2) {
    User.restore();
    SharedService.user.shoppingCart.restore();
  }

  ngOnInit(): void {
    if (this.isStandalone() && localStorage['current_path']) {
      this._router.navigateByUrl(localStorage['current_path']);
    }
  }

  ngAfterViewInit(): void {
    if (this.isStandalone()) {
      this.angulartics2.eventTrack.next({
        action: 'Standalone startup',
        properties: { category: `Standalone device: ${window.navigator.platform}, ${window.navigator.vendor}` },
      });

      this._router.events.subscribe(s => {
        try {
          localStorage['current_path'] = s['url'];
        } catch (e) {
          console.error('Could not save router change', e);
        }
      });
    }
  }

  isStandalone(): boolean {
    return window.navigator['standalone'] || window.matchMedia('(display-mode: standalone)').matches;
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

  /* istanbul ignore next */
  isItemSelected(): boolean  {
    return SharedService.selectedItemId ? true : false;
  }

  /* istanbul ignore next */
  isSellerSelected(): boolean  {
    return SharedService.selectedSeller ? true : false;
  }
}
