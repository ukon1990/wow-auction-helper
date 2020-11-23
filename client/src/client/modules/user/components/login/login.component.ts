import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {ValidatorsUtil} from '../../utils/validators.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {RegisterComponent} from '../register/register.component';
import {RegistrationConfirmationComponent} from '../register/registration-confirmation/registration-confirmation.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';

@Component({
  selector: 'wah-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  error: HttpErrorResponse;
  signupConfirmation = new FormGroup({
    code: new FormControl(),
  });
  signup = {
    isInSignup: false,
    isWaitingForConfirmation: false,
    userConfirmed: false,
    message: undefined,
  };

  loginForm: FormGroup = new FormGroup({
    username: new FormControl(null, [Validators.minLength(3)]),
    password: new FormControl(null, [ValidatorsUtil.password]),
  });
  user;
  isAuthenticated;
  private sm = new SubscriptionManager();

  constructor(private service: AuthService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<LoginComponent>
  ) {
  }

  ngOnInit(): void {
    this.sm.add(this.service.user,
      user => this.user = user);
    this.sm.add(this.service.isAuthenticated,
      isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
          this.dialogRef.close();
        }
      });
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  login() {
    this.loginForm.disable();
    this.service.login(this.loginForm.getRawValue())
      .then(() => location.reload())
      .catch(error => {
        console.error(error);
        if (error.code === 'UserNotConfirmedException') {
          this.handleUserNotConfirmedException();
        } else {
          this.error = error;
          this.loginForm.enable();
        }
      });
  }

  private handleUserNotConfirmedException() {
    const username = this.loginForm.getRawValue().username;
    this.service.resendConfirmationCode(username)
      .then(() => {
        const id = 'registration-confirmation';
        const diag = this.dialog.open(RegistrationConfirmationComponent, {
          data: {
            username
          }
        });
        this.sm.add(diag.afterClosed(), res => {
          if (res && res.success) {
            this.login();
          }
          this.sm.unsubscribeById(id);
        }, {id});
        this.loginForm.enable();
      })
      .catch(err => {
        console.error(err);
        this.loginForm.enable();
      });
  }


  signOut() {
    this.service.logOut()
      .catch(() => {});
    this.dialogRef.close();
  }

  localMode() {
    localStorage.setItem('useAppSync', 'false');
    this.service.openSetupComponent.emit(true);
    this.dialogRef.close();
  }

  registerNewUser() {
    const id = 'register-new-user';
    const diag = this.dialog.open(RegisterComponent);
    this.sm.add(diag.afterClosed(), (credentials) => {
      if (credentials) {
        this.loginForm.setValue(credentials);
        this.login();
      }
      this.sm.unsubscribeById(id);
    }, {id});
  }

  forgotPassword() {
    const id = 'forgot-password';
    const {username, email} = this.loginForm.getRawValue();
    const diag = this.dialog.open(ForgotPasswordComponent, {
      data: username || email
    });
    this.sm.add(diag.afterClosed(), credentials => {
      if (credentials) {
        this.loginForm.setValue(credentials);
        this.login();
      }
    }, {id});
  }
}
