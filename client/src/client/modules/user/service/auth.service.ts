import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {Endpoints} from '../../../services/endpoints';
import {SharedService} from '../../../services/shared.service';
import {Report} from '../../../utils/report.util';
import {ErrorReport} from '../../../utils/error-report.util';
import {EmptyUtil} from '@ukon1990/js-utilities';
import {CLIENT_PUBLIC_KEY} from '../../../secrets';
import {NavigationEnd, Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public static authTokenEvent = new BehaviorSubject<any>(undefined);
  private authorizationTab;

  constructor(private http: HttpClient, private route: Router) {
    Report.debug('AuthService.constructor');

    this.setAuthCodeSubscriptionEvent();
  }

  private setAuthCodeSubscriptionEvent() {
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === 'authorization_code') {
        window.removeEventListener('storage', () => {
        });
        this.accessTokenRequest();
        if (this.authorizationTab) {
          this.authorizationTab.close();
        }
      }
    }, false);
  }

  setAuthCode(code: string): void {
    localStorage.setItem('authorization_code', code);
  }

  setAccessToken(token: any): void {
    localStorage.setItem('access_token', JSON.stringify(token));
    AuthService.authTokenEvent.next(token);
  }

  getAuthCode(): string {
    return localStorage.getItem('authorization_code');
  }

  getAccessToken(): string {
    const item = localStorage.getItem('access_token');
    if (EmptyUtil.isNullOrUndefined(item)) {
      return undefined;
    }

    const {access_token} = JSON.parse(item);
    AuthService.authTokenEvent.next(access_token);
    return access_token;
  }

  checkToken() {
    const region = SharedService.user.region;
    this.http.post(Endpoints.getLambdaUrl('auth/verify'), {
      token: this.getAccessToken(),
      region
    }).toPromise()
      .then(res => {
        Report.debug('AuthService.checkToken', res);
      })
      .catch(err => ErrorReport.sendHttpError(err));
  }

  authRequest() {
    const url = 'https://eu.battle.net/oauth/authorize?' +
      'response_type=code' +
      '&redirect_uri=' + location.origin +
      '&scope=wow.profile&' +
      'client_id=' + CLIENT_PUBLIC_KEY;
    console.log('url', url);
    this.authorizationTab = this.openNewTab(url);
  }

  accessTokenRequest() {
    this.http.post(
      Endpoints.getLambdaUrl('auth'),
      JSON.stringify({
        region: SharedService.user.region,
        code: this.getAuthCode(),
        redirectURI: location.origin
      }))
      .toPromise()
      .then((response: any) => {
        if (response.error) {
          /*
          localStorage.removeItem('authorization_code');
          localStorage.removeItem('access_token');
          */
        } else {
          this.setAccessToken(response);
        }

      })
      .catch(error =>
        console.error(error));
  }


  openNewTab(url: string) {
    if (navigator.platform !== 'Win32' &&
      (window.navigator['standalone'] || window.matchMedia('(display-mode: standalone)').matches)) {
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('target', '_blank');

      const dispatch = document.createEvent('HTMLEvents');
      dispatch.initEvent('click', true, true);
      return a.dispatchEvent(dispatch);
    } else {
      return window.open(url, '_blank');
    }
  }

  handleCodeRouteEvent(event: NavigationEnd): void {
    if (event instanceof NavigationEnd) {
      const result = /code=[a-zA-Z0-9]{3,40}/.exec((event as NavigationEnd).urlAfterRedirects);
      if (result && result.length) {
        const code = result[0].replace('code=', '');
        this.setAuthCode(code);
      }
    }
  }
}
