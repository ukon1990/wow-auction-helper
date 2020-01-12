import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {AuctionsService} from '../../../../services/auctions.service';
import {SharedService} from '../../../../services/shared.service';
import {Report} from '../../../../utils/report.util';
import {MenuItem} from '../../models/menu-item.model';
import {RoutingUtil} from '../../utils/routing.util';

declare function require(moduleName: string): any;

const version = require('../../../../../../package.json').version;

@Component({
  selector: 'wah-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnDestroy, OnInit {
  showMenu: boolean;
  appVersion = version;
  numberOfUndercutAuctions = 0;
  sm = new SubscriptionManager();
  isUserSet: boolean;
  menuItems: MenuItem[] = [];

  constructor(private service: AuctionsService) {
    this.sm.add(this.service.events.list,
      (list) =>
        this.numberOfUndercutAuctions = SharedService.userAuctions.undercutAuctions);
    this.sm.add(
      SharedService.events.isUserSet,
      isSet => {
        this.isUserSet = isSet;
        this.ngOnInit();
      });
    Report.send('startup', `App version ${version}`, `API in use: ${SharedService.user.apiToUse}`);
  }

  ngOnInit(): void {
    this.menuItems = RoutingUtil.getMenu();
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  isSmallScreen(): boolean {
    // @ts-ignore
    return window.innerWidth < 991.98;
  }

  displayExtraMenu(): boolean {
    // @ts-ignore
    return window.innerWidth < 1534;
  }

  doNotClose(event: MouseEvent): void {
    if (event && event.preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
