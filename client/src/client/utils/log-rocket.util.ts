import * as LogRocket from 'logrocket';
import generateUUID from './uuid.util';
import {SharedService} from '../services/shared.service';
import {environment} from '../../environments/environment';

export class LogRocketUtil {
  static init(): void {
    if (environment.production) {
      LogRocket.init('ovw5eo/wow-auction-helper');
    }
  }

  static newSession(): void {
    if (environment.production) {
      LogRocket.startNewSession();
    }
  }

  static identify(): void {
    if (environment.production) {
      const {region, realm} = SharedService.user;
      // generateUUID()
      LogRocket.identify(region ? `${realm}@${region}` : 'new_user', {
        region: SharedService.user.region,
        realm: SharedService.user.realm,
        locale: SharedService.user.locale,
      });
    }
  }
}
