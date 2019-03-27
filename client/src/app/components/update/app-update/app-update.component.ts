import { Component, OnDestroy } from '@angular/core';
import { SubscriptionsUtil } from '../../../utils/subscriptions.util';
import { UpdateService } from '../../../services/update.service';
import { UpdateActivatedEvent } from '@angular/service-worker';

@Component({
  selector: 'wah-app-update',
  templateUrl: './app-update.component.html',
  styleUrls: ['./app-update.component.scss']
})
export class AppUpdateComponent implements OnDestroy {
  subscriptions = new SubscriptionsUtil();
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
