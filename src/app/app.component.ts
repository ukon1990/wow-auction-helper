import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from './models/user/user';
import { SharedService } from './services/shared.service';
import { CraftingService } from './services/crafting.service';
import { AuctionsService } from './services/auctions.service';
import { ItemService } from './services/item.service';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { Angulartics2 } from 'angulartics2';
import { ProspectingAndMillingUtil } from './utils/prospect-milling.util';
import { environment } from '../environments/environment';
import { UpdateService } from './services/update.service';
import { ErrorReport } from './utils/error-report.util';
import { MatSnackBar } from '@angular/material';

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
    private updateService: UpdateService,
    private matSnackBar: MatSnackBar,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    private angulartics2: Angulartics2) {
    if (!localStorage['locale']) {
      switch (navigator.language) {
        case 'it':
          localStorage['locale'] = 'it_IT';
          break;
        case 'pt':
          localStorage['locale'] = 'pt_PT';
          break;
        case 'es':
          localStorage['locale'] = 'es_ES';
          break;
        case 'ru':
          localStorage['locale'] = 'ru_RU';
          break;
        case 'fr':
          localStorage['locale'] = 'fr_FR';
          break;
        case 'de':
          localStorage['locale'] = 'de_DE';
          break;
        default:
          localStorage['locale'] = 'en_GB';
          break;
      }
    }
    User.restore();
    ErrorReport.init(this.angulartics2, this.matSnackBar);
    SharedService.user.shoppingCart.restore();
    ProspectingAndMillingUtil.restore();
  }

  ngOnInit(): void {
    if (this.isStandalone() && localStorage['current_path']) {
      this._router.navigateByUrl(localStorage['current_path']);
    }
  }

  ngAfterViewInit(): void {
    if (this.isStandalone()) {
      this.angulartics2.eventTrack.next({
        action: `Device: ${window.navigator.platform}, ${window.navigator.vendor}`,
        properties: { category: `Standalone startup` },
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
