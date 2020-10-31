import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'wah-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
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
    username: new FormControl(),
    email: new FormControl(),
    password: new FormControl(),
    confirmPassword: new FormControl(),
  });
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(),
    password: new FormControl(),
  });

  constructor(private service: AuthService) { }

  ngOnInit(): void {
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
    this.registerForm.disable();
    this.error = undefined;
    this.signup.message = undefined;
    this.signup.isWaitingForConfirmation = true;
    this.service.resendConfirmationCode(this.registerForm.getRawValue().email)
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
    this.error = undefined;
    this.signupConfirmation.disable();
    this.service.userConfirmation(
      this.registerForm.getRawValue().email,
      this.signupConfirmation.getRawValue().code)
      .then(response => {
        this.signup.isWaitingForConfirmation = false;
        console.log('Response', response);
      })
      .catch(error => {
        console.error(error);
        this.error = error;
        this.signupConfirmation.enable();
        this.signup.message = 'Invalid confirmation code';
      });
  }

  login() {
    this.service.login(this.loginForm.value)
      .then(response => {
        console.log(response);
      })
      .catch(console.error);
  }
}
