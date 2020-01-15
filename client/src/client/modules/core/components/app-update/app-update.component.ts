import {Component, OnDestroy} from '@angular/core';
import {UpdateService} from '../../../../services/update.service';
import {UpdateActivatedEvent} from '@angular/service-worker';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {Report} from '../../../../utils/report.util';

@Component({
  selector: 'wah-app-update',
  templateUrl: './app-update.component.html',
  styleUrls: ['./app-update.component.scss']
})
export class AppUpdateComponent implements OnDestroy {
  subscriptions = new SubscriptionManager();
  updateAvailable: boolean;

  constructor(private service: UpdateService) {
    this.subscriptions.add(
      service.events,
      (evt: UpdateActivatedEvent) => {
        this.updateAvailable = true;
        Report.send('Popup displayed', 'Update available');
      });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  reload(): void {
    this.service.update();
  }

  close(): void {
    this.updateAvailable = false;
    Report.send('Popup closed', 'Update available');
  }
}
