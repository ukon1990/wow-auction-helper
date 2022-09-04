import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserSettings} from '../../models/settings.model';
import {SettingsService} from '../../services/settings/settings.service';
import {faSyncAlt} from '@fortawesome/free-solid-svg-icons/faSyncAlt';
import {ValidatorsUtil} from '../../utils/validators.util';
import {Subscription} from 'rxjs';

@Component({
  selector: 'wah-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: CognitoUser;
  isEditing?: boolean;
  isSavingPassword: boolean;
  isSavingEmail: boolean;
  emailCodeExpired: boolean;
  settings: UserSettings;
  form: FormGroup = new FormGroup({
    username: new FormControl({value: null, disabled: true}),
    email: new FormControl({value: null, disabled: true}, [Validators.email]),
    emailVerified: new FormControl({value: null, disabled: true}, [Validators.email]),
  });
  passwordForm: FormGroup = new FormGroup({
    oldPassword: new FormControl(null, ValidatorsUtil.password),
    password: new FormControl(null, ValidatorsUtil.password),
    confirmPassword: new FormControl(
      null,
      [(control) =>
        ValidatorsUtil.confirmPassword(control, this.passwordForm), Validators.required]
    )
  });
  emailForm: FormGroup = new FormGroup({
    email: new FormControl(null, Validators.email),
  });
  verifyEmailForm: FormGroup = new FormGroup({
    confirmationCode: new FormControl(
      null,
      [
        Validators.minLength(1),
        Validators.maxLength(30)
      ]),
  });
  updateIcon = faSyncAlt;
  subs = new Subscription();

  constructor(private service: AuthService,
              private settingsService: SettingsService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<ProfileComponent>) {
    this.settings = settingsService.settings.value;

    this.subs.add(this.service.user.subscribe(user => {
      this.user = this.service.user.value;
      this.form.setValue({
        username: this.user.getUsername(),
        email: this.user['attributes'].email,
        emailVerified: this.user['attributes'].email_verified || false,
      });
    }));
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
    this.service.getUserAttributes();
    this.settingsService.getSettings()
      .then(settings => this.settings = settings)
      .catch(console.error);
  }

  changePassword() {
    this.isSavingPassword = true;
    this.passwordForm.disable();
    this.service.changePassword(this.passwordForm.getRawValue())
      .finally(() => {
        this.isSavingPassword = false;
        this.passwordForm.enable();
        this.passwordForm.reset();
      });
  }

  changeEmail() {
    this.isSavingEmail = true;
    this.emailForm.disable();
    this.service.changeEmail(this.emailForm.getRawValue())
      .finally(() => {
        this.emailForm.enable();
        this.emailForm.reset();
        this.isSavingEmail = false;
      });
  }

  confirmEmailChange() {
    this.isSavingEmail = true;
    this.service.verifyUserAttribute(`${this.verifyEmailForm.value.confirmationCode}`)
      .then(() => {
        this.form.controls.emailVerified.setValue(true);
        this.user.getUserAttributes(res => console.log('getUserAttributes', res));
        // this.service.user.next()
      })
      .catch(error => {
        this.emailCodeExpired = error.name === 'ExpiredCodeException';
        if (this.emailCodeExpired) {
          this.resendVerificationCode();
        }
      })
      .finally(() => this.isSavingEmail = false);
  }

  resendVerificationCode() {
    this.isSavingEmail = true;
    this.service.getAttributeVerificationCode()
      .finally(() => {
        this.isSavingEmail = false;
        this.emailCodeExpired = false;
      });
  }
}