import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {SharedService} from './services/shared.service';
import {Angulartics2GoogleAnalytics} from 'angulartics2/ga';
import {Angulartics2} from 'angulartics2';
import {ProspectingAndMillingUtil} from './utils/prospect-milling.util';
import {ErrorReport} from './utils/error-report.util';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Report} from './utils/report.util';
import {Platform} from '@angular/cdk/platform';
import {ShoppingCart} from './modules/shopping-cart/models/shopping-cart.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ReportService} from './services/report/report.service';
import {Title} from '@angular/platform-browser';
import {RoutingUtil} from './modules/core/utils/routing.util';
import {MenuItem} from './modules/core/models/menu-item.model';
import {UserUtil} from './utils/user/user.util';
import {BackgroundDownloadService} from './modules/core/services/background-download.service';
import {ThemeUtil} from './modules/core/utils/theme.util';
import {AuctionsService} from './services/auctions.service';
import {CraftingUtil} from './modules/crafting/utils/crafting.util';
import {NPC} from './modules/npc/models/npc.model';
import {TsmLuaUtil} from './utils/tsm/tsm-lua.util';
import {Filters} from './utils/filtering';
import {InventoryUtil} from './utils/tsm/inventory.util';
import {MatDialog} from '@angular/material/dialog';
import {NewsUtil} from './modules/about/utils/news.util';
import {NewsComponent} from './modules/about/components/news/news.component';
import {ItemComponent} from './modules/item/components/item.component';
import {LogRocketUtil} from './utils/log-rocket.util';
import {TextUtil} from '@ukon1990/js-utilities';
import {GithubService} from './modules/about/services/github.service';
import {UpdateService} from './services/update.service';
import {AppSyncService} from './modules/user/services/app-sync.service';
import {ShoppingCartService} from './modules/shopping-cart/services/shopping-cart.service';
import {AuthService} from './modules/user/services/auth.service';
import {CharacterService} from './modules/character/services/character.service';
import {SettingsService} from './modules/user/services/settings/settings.service';

@Component({
  selector: 'wah-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  subs = new SubscriptionManager();
  theme = ThemeUtil.current;
  shouldAskForConcent = false;
  pageTitle: string;
  isLoading: boolean;
  isInTheSetup: boolean;
  initialLoadWasSetup: boolean;
  isInNonAppDataPage: boolean;
  useAppSync = localStorage.getItem('useAppSync') ?
    JSON.parse(localStorage.getItem('useAppSync')) : false;

  constructor(public platform: Platform,
              private router: Router,
              private matSnackBar: MatSnackBar,
              private appSyncService: AppSyncService,
              private characterService: CharacterService,
              private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
              private angulartics2: Angulartics2,
              private downloadService: BackgroundDownloadService,
              private auctionService: AuctionsService,
              private reportService: ReportService,
              private githubService: GithubService,
              private updateService: UpdateService,
              public settingsSync: SettingsService,
              private shoppingCartService: ShoppingCartService,
              private authService: AuthService,
              private dialog: MatDialog,
              private title: Title) {
    this.setLocale();
    ErrorReport.init(this.angulartics2, this.matSnackBar, this.reportService);
    Report.init(this.angulartics2, this.reportService);
    // SharedService.user.shoppingCart = new ShoppingCart(this.auctionService);
    ProspectingAndMillingUtil.restore();


    this.subs.add(
      SharedService.events.detailPanelOpen,
      () =>
        this.scrollToTheTop());

    this.subs.add(
      this.router.events,
      (event: NavigationEnd) =>
        this.onNavigationChange(event));

    this.subs.add(SharedService.events.detailSelection, (selection) => {
      if (selection) {
        this.dialog.open(ItemComponent, {
          width: '95%',
          maxWidth: '100%',
          data: selection
        });
      }
    });
    this.subs.add(this.downloadService.isLoading, (isLoading) => {
      this.isLoading = isLoading;
    });

    authService.init()
      .then(() => this.init());
  }

  private redirectToCorrectPath(url: string) {
    if (url && !SharedService.user.realm && !SharedService.user.region &&
      !localStorage.getItem('initialUrl') && !TextUtil.contains(url, 'setup')
    ) {
      localStorage.setItem('initialUrl', url);
    }

    if (url === '/') {
      if (SharedService.user.realm && SharedService.user.region) {
        this.router.navigateByUrl('dashboard')
          .catch(console.error);
      } else {
        this.router.navigateByUrl('setup')
          .catch(console.error);
      }
    }
  }

  ngOnInit(): void {
    this.restorePreviousLocation();
    this.shouldAskForConcent = localStorage.getItem('doNotReport') === null;
    Report.debug('Local user config:', SharedService.user, this.shouldAskForConcent);
    this.displayChangelogIfRelevant();
  }

  private displayChangelogIfRelevant() {
    NewsUtil.shouldTrigger()
      .then(render => {
        if (render) {
          this.githubService.getChangeLogs()
            .then((changelog) => {
              this.dialog.open(NewsComponent, {
                width: '95%',
                maxWidth: '100%',
                data: changelog
              });
            })
            .catch(error => ErrorReport.sendHttpError(error));
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.isStandalone()) {
      Report.send(
        `Device: ${window.navigator.platform}, ${window.navigator.vendor}`,
        `Standalone startup`
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private restorePreviousLocation() {
    if (this.isStandalone() && localStorage['current_path']) {
      this.router.navigateByUrl(localStorage['current_path']);
    }
  }

  private scrollToTheTop() {
    // making sure that we are scrolled back to the correct position after opening the detail panel
    /* TODO: Remove if it actually isnt needed
    if (!this.isPanelOpen()) {
      window.scroll(0, SharedService.preScrollPosition);
    }*/
  }

  private setLocale() {
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
  }

  private onNavigationChange(event: NavigationEnd) {
    if (TextUtil.contains(event.url, 'setup')) {
      this.initialLoadWasSetup = true;
    } else {
      this.initialLoadWasSetup = false;
    }

    if (TextUtil.contains(event.url, 'settings') || TextUtil.contains(event.url, 'about')) {
      this.isInNonAppDataPage = true;
    } else if (event.url) {
      this.isInNonAppDataPage = false;
    }

    this.redirectToCorrectPath(event.url);
    this.saveCurrentRoute(event);
    const menuItem: MenuItem = RoutingUtil.getCurrentRoute(event.url);
    if (menuItem) {
      this.pageTitle = menuItem.title;
      this.title.setTitle(`WAH - ${menuItem.title}`);
    }
    window.scroll(0, 0);
    Report.navigation(event);

    this.isInTheSetup = TextUtil.contains(event.url, 'setup');
  }

  private saveCurrentRoute(event: NavigationEnd) {
    if (!this.isStandalone()) {
      return;
    }
    try {
      /**
       * As iOS does not save where you are upon reload in a "installed" webapp.
       * We're storing the current path.
       */
      localStorage['current_path'] = event['url'];
    } catch (e) {
      console.error('Could not save router change', e);
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
  getDownloading() {
    return SharedService.downloading;
  }

  private init() {
    ProspectingAndMillingUtil.init(this.auctionService);
    CraftingUtil.init(this.auctionService);
    NPC.init(this.auctionService);
    TsmLuaUtil.init(this.auctionService);
    Filters.init(this.auctionService);
    InventoryUtil.init(this.auctionService);


    LogRocketUtil.init();

    this.angulartics2GoogleAnalytics.startTracking();
  }
}
