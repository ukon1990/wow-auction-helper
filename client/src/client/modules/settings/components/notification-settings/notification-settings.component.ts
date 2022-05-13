import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subscription} from 'rxjs';
import {SharedService} from '../../../../services/shared.service';
import {Notifications, NotificationSettings} from '../../../../models/user/notification';
import {TextUtil} from '@ukon1990/js-utilities';
import {UserUtil} from '../../../../utils/user/user.util';

@Component({
  selector: 'wah-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  isHttps = location.protocol === 'https:' || TextUtil.contains(location.href, 'localhost');
  notificationsForm: FormControl;
  formChanges: Subscription;

  constructor() {
    console.log('SharedService.user.notifications', SharedService.user.notifications);
    const notifications = SharedService.user?.notifications?.getString() || 'disableNotifications';

    this.notificationsForm = new FormControl(notifications);
  }

  ngOnInit(): void {
    this.formChanges = this.notificationsForm.valueChanges
      .subscribe((change) => {
        if (!SharedService.user.notifications) {
          SharedService.user.notifications = new NotificationSettings();
        }
        SharedService.user.notifications.setString(change);
        UserUtil.save();
      });
  }

  ngOnDestroy(): void {
    this.formChanges.unsubscribe();
  }

  sendTest(): void {
    Notifications.send('This is a test', 'This is a test');
  }
}