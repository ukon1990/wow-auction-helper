import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {AuctionsService} from '../../../../services/auctions.service';

declare function require(moduleName: string): any;
const version = require('../../../../../../package.json').version;

@Component({
  selector: 'wah-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnDestroy {
  appVersion = version;
  numberOfUndercutAuctions = 0;
  sm = new SubscriptionManager();

  constructor(private service: AuctionsService) {
    this.sm.add(this.service.events.list,
      (list) =>
        this.numberOfUndercutAuctions = list.length);
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }
}
