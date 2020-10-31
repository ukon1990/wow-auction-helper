import {Injectable} from '@angular/core';
import {Auth} from '@aws-amplify/auth';
import {CognitoUser, ISignUpResult, CodeDeliveryDetails} from 'amazon-cognito-identity-js';
import {COGNITO} from '../../../secrets';
import {Register} from '../models/register.model';
import {Login} from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {
    Auth.configure({
      userPoolId: COGNITO.POOL_ID,
      userPoolWebClientId: COGNITO.CLIENT_ID
    });
  }

  login({email, password}: Login): Promise<any> {
    return new Promise<any>((resolve) => resolve());
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
}
