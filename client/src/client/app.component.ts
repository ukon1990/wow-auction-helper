import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {User} from './models/user/user';
import {SharedService} from './services/shared.service';
import {Angulartics2GoogleAnalytics} from 'angulartics2/ga';
import {Angulartics2} from 'angulartics2';
import {ProspectingAndMillingUtil} from './utils/prospect-milling.util';
import {ErrorReport} from './utils/error-report.util';
import {MatSnackBar} from '@angular/material';
import {DefaultDashboardSettings} from './modules/dashboard/models/default-dashboard-settings.model';
import {Report} from './utils/report.util';
import {Platform} from '@angular/cdk/platform';
import {ShoppingCart} from './modules/shopping-cart/models/shopping-cart.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {ReportService} from './services/report/report.service';
import {Title} from '@angular/platform-browser';
import {RoutingUtil} from './modules/core/utils/routing.util';
import {MenuItem} from './modules/core/models/menu-item.model';

@Component({
  selector: 'wah-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  subs = new SubscriptionManager();
  mainWindowScrollPosition = 0;
  shouldAskForConcent = false;
  pageTitle: string;

  constructor(public platform: Platform,
              private router: Router,
              private matSnackBar: MatSnackBar,
              private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
              private angulartics2: Angulartics2,
              private reportService: ReportService,
              private title: Title) {
    this.setLocale();
    DefaultDashboardSettings.init();
    User.restore();
    ErrorReport.init(this.angulartics2, this.matSnackBar, this.reportService);
    Report.init(this.angulartics2, this.reportService);
    SharedService.user.shoppingCart = new ShoppingCart();
    ProspectingAndMillingUtil.restore();

    this.subs.add(
      SharedService.events.detailPanelOpen,
      () =>
        this.scrollToTheTop());

    this.subs.add(
      this.router.events,
      (event: NavigationEnd) =>
        this.onNavigationChange(event));
    this.angulartics2GoogleAnalytics.startTracking();
  }

  private redirectToCorrectPath(url: string) {
    if (url === '/') {
      if (SharedService.user.realm && SharedService.user.region) {
        this.router.navigateByUrl('dashboard');
      } else {
        this.router.navigateByUrl('setup');
      }
    }
  }

  ngOnInit(): void {
    this.restorePreviousLocation();
    this.shouldAskForConcent = localStorage.getItem('doNotReport') === null;
    Report.debug('Local user config:', SharedService.user, this.shouldAskForConcent);
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
    if (!this.isPanelOpen()) {
      window.scroll(0, SharedService.preScrollPosition);
    }
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
    this.redirectToCorrectPath(event.url);
    this.saveCurrentRoute(event);
    const menuItem: MenuItem = RoutingUtil.getCurrentRoute(event.url);
    if (menuItem) {
      this.pageTitle = menuItem.title;
      this.title.setTitle(`WAH - ${menuItem.title}`);
    }
    Report.navigation(event);
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

  isPanelOpen(): boolean {
    return SharedService.selectedSeller !== undefined ||
      SharedService.selectedItemId !== undefined ||
      SharedService.selectedPetSpeciesId !== undefined;
  }

  isStandalone(): boolean {
    return window.navigator['standalone'] || window.matchMedia('(display-mode: standalone)').matches;
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

  /* istanbul ignore next */
  isItemSelected(): boolean {
    return !!SharedService.selectedItemId;
  }

  /* istanbul ignore next */
  isSellerSelected(): boolean {
    return !!SharedService.selectedSeller;
  }
}
