import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {ValidatorsUtil} from '../../utils/validators.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AppSyncService} from '../../services/app-sync.service';

@Component({
  selector: 'wah-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
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
  registerForm: FormGroup = new FormGroup({
    username: new FormControl(null, [Validators.minLength(3)]),
    email: new FormControl(null, [Validators.minLength(3), Validators.email]),
    password: new FormControl(null, [ValidatorsUtil.password]),
    confirmPassword: new FormControl(null,
      [(control) => ValidatorsUtil.confirmPassword(control, this.registerForm)]),
  });
  loginForm: FormGroup = new FormGroup({
    username: new FormControl(null, [Validators.minLength(3)]),
    password: new FormControl(null, [ValidatorsUtil.password]),
  });
  user;
  isAuthenticated;
  private sm = new SubscriptionManager();

  constructor(private service: AuthService,
              private settingService: AppSyncService) {
  }

  ngOnInit(): void {
    this.sm.add(this.service.user,
      user => this.user = user);
    this.sm.add(this.service.isAuthenticated,
      isAuthenticated => this.isAuthenticated = isAuthenticated);
    this.settingService.getSettings()
      .catch(console.error);
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  register() {
    this.signup.message = undefined;
    this.error = undefined;
    this.signup.isWaitingForConfirmation = true;
    this.registerForm.disable();
    this.service.signUp(this.registerForm.getRawValue())
      .then(response => {
        console.log(response);
        this.signup.isWaitingForConfirmation = !response.userConfirmed;
      })
      .catch(error => {
        console.error(error);
        this.error = error;
        this.registerForm.enable();
        this.signup.isWaitingForConfirmation = false;
      });
  }

  resendConfirmationCode() {
    const {username, email} = this.registerForm.getRawValue();
    this.registerForm.disable();
    this.error = undefined;
    this.signup.message = undefined;
    this.signup.isWaitingForConfirmation = true;
    this.service.resendConfirmationCode(username || email)
      .then(response => {
        this.signup.message = response.Destination;
        console.log(response);
      })
      .catch(error => {
        console.error(error);
        this.error = error;
        this.registerForm.enable();
        this.signup.isWaitingForConfirmation = false;
      });
  }

  confirmRegistration() {
    const {username, email} = this.registerForm.getRawValue();
    this.error = undefined;
    this.signupConfirmation.disable();
    this.service.userConfirmation(
      username || email,
      this.signupConfirmation.getRawValue().code)
      .then(() => {
        this.signup.isWaitingForConfirmation = false;
        this.signup.isInSignup = false;
        this.signup.userConfirmed = true;
      })
      .catch(error => {
        console.error(error);
        this.error = error;
        this.signupConfirmation.enable();
        this.signup.message = 'Invalid confirmation code';
      });
  }

  login() {
    console.log('Login start');
    this.loginForm.disable();
    this.service.login(this.loginForm.getRawValue())
      .then(() => {

      })
      .catch(error => {
        console.error(error);
        if (error.code === 'UserNotConfirmedException') {
          this.signup.userConfirmed = false;
          this.signup.isWaitingForConfirmation = true;
          this.service.resendConfirmationCode(this.loginForm.getRawValue().username)
            .then(() => {
              this.loginForm.enable();
            })
            .catch(err => {
              console.error(err);
              this.loginForm.enable();
            });
        } else {
          this.error = error;
          this.loginForm.enable();
        }
      });
  }

  forgotPassword() {
    this.error = undefined;
    this.loginForm.disable();
    this.service.forgotPassword(this.loginForm.getRawValue())
      .then(() => {
        this.loginForm.enable();
      })
      .catch(error => {
        this.error = error;
        this.loginForm.enable();
      });
  }

  verifyForgotPassword() {
    this.error = undefined;
    this.loginForm.disable();
    this.service.verifyForgotPassword(this.loginForm.getRawValue())
      .then(() => {
        this.loginForm.enable();
      })
      .catch(error => {
        this.error = error;
        this.loginForm.enable();
      });
  }

  signOut() {
    this.service.logOut()
      .catch(() => {});
  }
}
