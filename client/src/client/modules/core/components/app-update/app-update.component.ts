import {Component, OnDestroy} from '@angular/core';
import {UpdateService} from '../../../../services/update.service';
import {UpdateActivatedEvent} from '@angular/service-worker';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';

@Component({
  selector: 'wah-app-update',
  templateUrl: './app-update.component.html',
  styleUrls: ['./app-update.component.scss']
})
export class AppUpdateComponent implements OnDestroy {
  subscriptions = new SubscriptionManager();
  updateAvailable: boolean;

  constructor() {
    this.subscriptions.add(
      UpdateService.events,
      (evt: UpdateActivatedEvent) =>
        this.updateAvailable = true);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  reload(): void {
    window.location.reload();
  }

  close(): void {
    this.updateAvailable = false;
  }
}
