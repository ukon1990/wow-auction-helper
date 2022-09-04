import {EventEmitter, Injectable} from '@angular/core';
import {Auth, CognitoHostedUIIdentityProvider} from '@aws-amplify/auth';
import {Hub, ICredentials} from '@aws-amplify/core';
import {CodeDeliveryDetails, CognitoUser, CognitoUserSession, ISignUpResult} from 'amazon-cognito-identity-js';
import {COGNITO} from '../../../secrets';
import {ChangePassword, ForgotPassword, Login, Register} from '../models/auth.model';
import {BehaviorSubject} from 'rxjs';
import {FederatedProvider} from '../enums/federated-provider.enum';
import {AppSyncService} from './app-sync.service';
import {SettingsService} from './settings/settings.service';
import {MatDialog} from '@angular/material/dialog';
import {EmptyUtil, TextUtil} from '@ukon1990/js-utilities';
import {DatabaseService} from '../../../services/database.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {RoutingUtil} from '../../core/utils/routing.util';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  openSetupComponent: EventEmitter<boolean> = new EventEmitter<boolean>();
  openLoginComponent: EventEmitter<boolean> = new EventEmitter<boolean>();
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  hasLoadedSettings: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  user: BehaviorSubject<CognitoUser> = new BehaviorSubject<CognitoUser>(undefined);
  session: BehaviorSubject<CognitoUserSession> = new BehaviorSubject<CognitoUserSession>(undefined);
  authEvent = new BehaviorSubject(undefined);
  userGroups: string[];

  constructor(private appSync: AppSyncService,
              private db: DatabaseService,
              private dialog: MatDialog,
              public snackBar: MatSnackBar,
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
      console.log('Hub event', event, data);
      switch (event) {
        case 'signIn':
          this.getCurrentUser()
            .catch(() => {
            });
          break;
        case 'signOut':
          this.getCurrentUser()
            .catch(() => {
            });
          break;
        case 'customOAuthState':
          break;
      }
    });
  }

  init(): Promise<void> {
    return new Promise<void>(resolve => {
      this.getCurrentUser(true)
        .then(async (currentUser) => {
          if (this.isAuthenticated) {
            this.getAndSetUserGroups(currentUser);
            this.settingsSync.init();
            await this.settingsSync.getSettings()
              .catch(console.error);
            const {
              realm, region
            } = this.settingsSync.settings.value || {realm: undefined, region: undefined};
            this.hasLoadedSettings.next(true);
            this.openSetupDialog(realm, region);
            resolve();
          }
        })
        .catch(() => {
          this.hasLoadedSettings.next(true);
          resolve();
        });
    });
  }

  isAdmin(): boolean {
    if (!this.userGroups) {
      return false;
    }
    return this.userGroups.indexOf('Admin') > -1;
  }

  private getAndSetUserGroups(currentUser: CognitoUser) {
    try {
      const {
        'cognito:groups': cognitoGroups
      } = currentUser.getSignInUserSession().getIdToken().payload;

      this.userGroups = cognitoGroups;
      RoutingUtil.isAdmin = this.isAdmin();
    } catch (error) {
      ErrorReport.sendError('AuthService.getAndSetUserGroups', error);
    }
  }

  getCurrentUser(bypassCache?: boolean): Promise<CognitoUser> {
    return new Promise<any>((resolve, reject) => {
      Auth.currentAuthenticatedUser({bypassCache})
        .then(async (user: CognitoUser) => {
          this.user.next(user);
          await Auth.currentSession()
            .then(session => this.session.next(session))
            .catch(console.error);
          this.isAuthenticated.next(!!user);
          this.appSync.isAuthenticated.next(!!user);
          if (this.isAuthenticated.value) {
            localStorage.setItem('useAppSync', 'true');
          }
          resolve(user);
        })
        .catch(error => {
          const realm = localStorage.getItem('realm');
          const region = localStorage.getItem('region');
          const useAppSync = localStorage.getItem('useAppSync');
          const isRealmSet: boolean = !!(realm && region);
          const userIsNotAuthenticated = error === 'The user is not authenticated';
          if (userIsNotAuthenticated && useAppSync === 'true' || EmptyUtil.isNullOrUndefined(useAppSync)) {
            this.openLoginComponent.emit(true);
          } else if (!isRealmSet) {
            this.openSetupDialog(
              localStorage.getItem('realm'), localStorage.getItem('region'));
          }
          reject(error);
        });
    });
  }

  private openSetupDialog(realm: string, region: string) {
    const isRealmSet: boolean = !!(realm && region);
    if (!isRealmSet) {
      this.openSetupComponent.emit(true);
    }
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
          reject(error);
        });
    });
  }

  federatedSignIn(provider: FederatedProvider | CognitoHostedUIIdentityProvider) {
    return new Promise<ICredentials>((resolve, reject) => {
      Auth.federatedSignIn({provider: provider as CognitoHostedUIIdentityProvider})
        .then(user => {
        })
        .catch(reject);
    });
  }

  confirmSignIn(verificationCode: string): Promise<CognitoUser> {
    return new Promise<CognitoUser>(async (resolve, reject) => {
      const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
      Auth.confirmSignIn(currentAuthenticatedUser, verificationCode, 'SOFTWARE_TOKEN_MFA', {})
        .then(async user => {
          await this.getCurrentUser()
            .catch(() => {
            });
          resolve(user);
        })
        .catch(reject);
    });
  }

  logOut(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Auth.signOut()
        .then(async (user: CognitoUser) => {
          Object.keys(localStorage)
            .forEach(key => {
              if (!TextUtil.contains(key, 'timestamp') && !TextUtil.contains(key, 'version')) {
                localStorage.removeItem(key);
              }
            });
          await this.db.clearUserData()
            .catch(console.error);
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

  forgotPassword(username: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      Auth.forgotPassword(username)
        .then((response) => {
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
          resolve(response);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }

  changePassword({oldPassword, password}: ChangePassword) {
    return new Promise<any>(async (resolve, reject) => {
      const user = await Auth.currentAuthenticatedUser();
      Auth.changePassword(user, oldPassword, password)
        .then((response) => {
          resolve(response);
        })
        .catch(error => {
          console.error(error);
          this.snackBar.open('Could not change password', 'Ok');
          reject(error);
        });
    });
  }

  changeEmail({email}: { email: string }) {
    return new Promise<any>(async (resolve, reject) => {
      const user = await Auth.currentAuthenticatedUser();
      Auth.updateUserAttributes(user, {email})
        .then((response) => {
          resolve(response);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }

  verifyUserAttribute(code: string) {
    return new Promise<void>(async (resolve, reject) => {
      Auth.verifyCurrentUserAttributeSubmit('email', code)
        .then(() => {
          this.snackBar.open('Your email has now been verified.', 'ok');
          resolve();
        })
        .catch(error => {
          console.error(error);
          this.snackBar.open(error.message, 'ok');
          reject(error);
        });
    });
  }

  getAttributeVerificationCode() {
    return new Promise<void>(async (resolve, reject) => {
      this.user.value.getAttributeVerificationCode(
        'email', {
          onSuccess: () => {
            this.snackBar.open('Successfully requested a new confirmation code.', 'ok');
            resolve();
          },
          onFailure: (error) => {
            this.snackBar.open(error.message, 'ok');
            reject(error);
          }
        });
    });
  }

  getUserAttributes(user: CognitoUser = this.user.value) {
    return new Promise((resolve, reject) => {
      user.getUserAttributes((error, attributes) => {
        if (error) {
          reject(error);
        } else {
          const result = {};
          attributes.forEach(attribute => result[attribute.Name] = attribute.Value);
          resolve(result);
        }
      });
    });
  }
}