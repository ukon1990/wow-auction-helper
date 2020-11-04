import {Injectable} from '@angular/core';
import {Auth, CognitoHostedUIIdentityProvider} from '@aws-amplify/auth';
import {Hub} from '@aws-amplify/core';
import {
  CognitoUser, ISignUpResult, CodeDeliveryDetails, CognitoUserSession
} from 'amazon-cognito-identity-js';
import {COGNITO} from '../../../secrets';
import {ForgotPassword, Login, Register} from '../models/auth.model';
import {BehaviorSubject} from 'rxjs';
import {FederatedProvider} from '../enums/federated-provider.enum';
import {ICredentials} from '@aws-amplify/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AppSyncService} from './app-sync.service';
import {SettingsService} from './settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  user: BehaviorSubject<CognitoUser> = new BehaviorSubject<CognitoUser>(undefined);
  session: BehaviorSubject<CognitoUserSession> = new BehaviorSubject<CognitoUserSession>(undefined);
  authEvent = new BehaviorSubject(undefined);
  sm = new SubscriptionManager();

  constructor(private appSync: AppSyncService,
              private settingsSync: SettingsService) {
    Auth.configure({
      userPoolId: COGNITO.POOL_ID,
      userPoolWebClientId: COGNITO.CLIENT_ID,
      oauth: {
        region: 'eu-west-1',
        domain: 'https://wow-auction-helper.auth.eu-west-1.amazoncognito.com',
        scope: ['email', 'openid', 'aws.cognito.signin.user.admin'],
        redirectSignIn: location.origin,
        redirectSignOut: location.origin,
        responseType: 'code',
      }
    });

    Hub.listen('auth', ({payload: {event, data}}) => {
      switch (event) {
        case 'signIn':
          this.getCurrentUser()
            .catch(() => {});
          break;
        case 'signOut':
          this.getCurrentUser()
            .catch(() => {});
          break;
        case 'customOAuthState':
          break;
      }
    });
  }

  init(): Promise<void> {
    return new Promise<void>(resolve => {
      this.getCurrentUser()
        .then(async () => {
          if (this.isAuthenticated) {
            await this.settingsSync.getSettings()
              .catch(console.error);
            console.log('Settings loaded', this.settingsSync.settings.value);
            resolve();
          }
        })
        .catch(() => {
          resolve();
        });
    });
  }

  getCurrentUser(): Promise<CognitoUser> {
    return new Promise<any>((resolve, reject) => {
      Auth.currentAuthenticatedUser()
        .then(async (user: CognitoUser) => {
          this.user.next(user);
          await Auth.currentSession()
            .then(session => this.session.next(session))
            .catch(console.error);
          this.isAuthenticated.next(!!user);
          if (this.isAuthenticated) {
            localStorage.setItem('useAppSync', 'true');
            this.settingsSync.init();
          }
          console.log('Current user', user);
          resolve(user);
        })
        .catch(reject);
    });
  }

  checkIfUserHasMFAS(): Promise<boolean> {
    return new Promise<any>((resolve, reject) => {
      this.getCurrentUser()
        .then(async (user) => {
          const preferredMFA = await Auth.getPreferredMFA(user)
            .catch(console.error);

          if (preferredMFA === 'NOMFA') {
            console.log('No MFA is configured for the current user');
          }
          resolve(preferredMFA !== 'NOMFA');
        })
        .catch(reject);
    });
  }

  getMFAQRCodeForUser(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      Auth.setupTOTP(this.user.value)
        .then(code => {
          const qrData = `otpauth://totp/Wow Auction Helper(${this.user.value.getUsername()})?secret=${code}`,
            url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURI(qrData)}&size=300x300`;
          resolve(url);
        })
        .catch(reject);
    });
  }

  setMFAForUser(verificationCode: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      Auth.verifyTotpToken(this.user.value, verificationCode)
        .then(() => {
          Auth.setPreferredMFA(this.user.value, 'TOTP')
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  /**
   * @param username
   * @param password
   * @returns true if MFA auth is required
   */
  login({username, password}: Login): Promise<void> {
    return new Promise<any>((resolve, reject) => {
      Auth.signIn(username, password)
        .then((user) => {
          console.log('Successfully signed in', user);
          this.user.next(user);
          this.isAuthenticated.next(true);

          if (user.challengeName === 'SOFTWARE_TOKEN_MFA') {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(error => {
          this.isAuthenticated.next(false);
          console.error(error);
          reject(error);
        });
    });
  }

  federatedSignIn(provider: FederatedProvider | CognitoHostedUIIdentityProvider) {
    return new Promise<ICredentials>((resolve, reject) => {
      Auth.federatedSignIn({ provider: provider as CognitoHostedUIIdentityProvider})
        .then(user => {})
        .catch(reject);
    });
  }

  confirmSignIn(verificationCode: string): Promise<CognitoUser> {
    return new Promise<CognitoUser>((resolve, reject) => {
      Auth.confirmSignIn(this.user.value, verificationCode, 'SOFTWARE_TOKEN_MFA')
        .then(async user => {
          await this.getCurrentUser()
            .catch(() => {});
          resolve(user);
        })
        .catch(reject);
    });
  }

  logOut(): Promise<void> {
    return new Promise<any>((resolve, reject) => {
      Auth.signOut()
        .then((user: CognitoUser) => {
          console.log(user);
          this.isAuthenticated.next(false);
          this.user.next(undefined);
          this.session.next(undefined);
          resolve();
        })
        .catch(error => {
          this.isAuthenticated.next(false);
          this.user.next(undefined);
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
