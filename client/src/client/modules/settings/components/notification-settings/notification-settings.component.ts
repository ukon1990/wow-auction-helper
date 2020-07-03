import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {SharedService} from '../../../../services/shared.service';
import {User} from '../../../../models/user/user';
import {Notifications} from '../../../../models/user/notification';
import {TextUtil} from '@ukon1990/js-utilities';
import {Report} from '../../../../utils/report.util';
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
    const notifications = SharedService.user.notifications.getString();

    this.notificationsForm = new FormControl(notifications);
  }

  ngOnInit(): void {
    this.formChanges = this.notificationsForm.valueChanges
      .subscribe((change) => {
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
