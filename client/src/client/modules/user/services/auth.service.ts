import {Injectable} from '@angular/core';
import {Auth} from '@aws-amplify/auth';
import {CognitoUser, ISignUpResult, CodeDeliveryDetails} from 'amazon-cognito-identity-js';
import {COGNITO} from '../../../secrets';
import {ForgotPassword, Login, Register} from '../models/auth.model';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    Auth.configure({
      userPoolId: COGNITO.POOL_ID,
      userPoolWebClientId: COGNITO.CLIENT_ID
    });
  }

  getCurrentUser(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      Auth.currentAuthenticatedUser()
        .then(resolve)
        .catch(reject);
    });
  }

  login({username, password}: Login): Promise<void> {
    return new Promise<any>((resolve, reject) => {
      Auth.signIn(username, password)
        .then((user: CognitoUser) => {
          console.log('Successfully signed in', user);
          this.isAuthenticated.next(true);
          resolve();
        })
        .catch(error => {
          this.isAuthenticated.next(false);
          console.error(error);
          reject(error);
        });
    });
  }

  logOut(): Promise<void> {
    return new Promise<any>((resolve, reject) => {
      Auth.signOut()
        .then((user: CognitoUser) => {
          console.log(user);
          this.isAuthenticated.next(true);
          resolve();
        })
        .catch(error => {
          this.isAuthenticated.next(false);
          console.error(error);
          reject(error);
        });
    });
  }

  signUp({username, password, email, confirmPassword}: Register): Promise<ISignUpResult> {
    return new Promise<any>((resolve, reject) => {
      if (password === confirmPassword) {
        Auth.signUp({
          username: username || email,
          password,
          attributes: {
            email
          }
        }).then((result: ISignUpResult) => {
          console.log(result);
          resolve(result);
        })
          .catch(error => {
            console.error(error);
            reject(error);
          });
      } else {
        reject({
          message: `The passwords don't match`
        });
      }
    });
  }

  resendConfirmationCode(username: string): Promise<CodeDeliveryDetails> {
    return new Promise<any>((resolve, reject) => {
      Auth.resendSignUp(username)
        .then(res => resolve(res.CodeDeliveryDetails))
        .catch(reject);
    });
  }

  userConfirmation(username: string, confirmationCode: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      Auth.confirmSignUp(username, confirmationCode)
        .then(resolve)
        .catch(reject);
    });
  }

  forgotPassword({username}: Login): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      Auth.forgotPassword(username)
        .then((response) => {
          console.log(response);
          resolve(response);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }

  verifyForgotPassword({username, password, code}: ForgotPassword) {
    return new Promise<any>((resolve, reject) => {
      Auth.forgotPasswordSubmit(username, code, password)
        .then((response) => {
          console.log(response);
          resolve(response);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }
}
