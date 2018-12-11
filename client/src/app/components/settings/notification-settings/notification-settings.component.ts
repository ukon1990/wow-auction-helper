import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { Notifications } from '../../../models/user/notification';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user/user';

@Component({
  selector: 'wah-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {

  form: FormGroup;
  formChanges: Subscription;

  constructor(private _formBuilder: FormBuilder) {
    this.form = this._formBuilder.group({
      isUpdateAvailable: SharedService.user.notifications.isUpdateAvailable,
      isBelowVendorSell: SharedService.user.notifications.isBelowVendorSell,
      isUndercut: SharedService.user.notifications.isUndercut,
      isWatchlist: SharedService.user.notifications.isWatchlist
    });
  }

  ngOnInit(): void {
    this.formChanges = this.form.valueChanges.subscribe( (change) => {
      SharedService.user.notifications.isUndercut = change.isUndercut;
      User.save();
    });
  }

  ngOnDestroy(): void {
    this.formChanges.unsubscribe();
  }

  sendTest(): void {
    Notifications.send('This is a test', 'This is a test');
  }

  isHttps(): boolean {
    return location.protocol === 'https:';
  }
}
