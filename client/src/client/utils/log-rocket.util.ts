import * as LogRocket from 'logrocket';
import generateUUID from './uuid.util';
import {SharedService} from '../services/shared.service';
import {environment} from '../../environments/environment.prod';

export class LogRocketUtil {
  static init(): void {
    if (environment.production) {
      LogRocket.init('ovw5eo/wow-auction-helper');
      this.identify();
    }
  }

  static newSession(): void {
    LogRocket.startNewSession();
  }

  static identify(): void {
    LogRocket.identify(generateUUID(), {
      region: SharedService.user.region,
      realm: SharedService.user.realm,
      locale: SharedService.user.locale,
    });
  }
}
