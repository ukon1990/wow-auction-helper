import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserSettings} from '../../models/settings.model';
import {SettingsService} from '../../services/settings/settings.service';
import {faSyncAlt} from '@fortawesome/free-solid-svg-icons/faSyncAlt';

@Component({
  selector: 'wah-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: CognitoUser;
  settings: UserSettings;
  form: FormGroup = new FormGroup({
    username: new FormControl({value: null, disabled: true}),
    email: new FormControl({value: null, disabled: true}, [Validators.email]),
    confirmEmail: new FormControl(null, [Validators.email]),
  });
  updateIcon = faSyncAlt;

  constructor(private service: AuthService,
              private settingsService: SettingsService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<ProfileComponent>) {
    this.user = this.service.user.value;
    this.settings = settingsService.settings.value;
    this.form.setValue({
      username: this.user.getUsername(),
      email: this.user['attributes'].email,
      confirmEmail: null,
    });
  }

  ngOnInit(): void {
    console.log('User', this.user);
  }

  logout(): void {
    this.service.logOut()
      .then(() => {
        this.service.openLoginComponent.emit(true);
        this.dialogRef.close();
        location.reload();
      })
      .catch(console.error );
  }

  close() {
    this.dialogRef.close();
  }

  updateSettings() {
    this.settingsService.getSettings()
      .then(settings => this.settings = settings)
      .catch(console.error);
  }
}
