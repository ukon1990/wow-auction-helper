import * as LogRocket from 'logrocket';

export class LogRocketUtil {
  static init(): void {
    LogRocket.init('ovw5eo/wow-auction-helper');
    this.identify();
  }

  static identify(): void {
    LogRocket.identify('THE_USER_ID_IN_YOUR_APP', {
      name: 'James Morrison',
      email: 'jamesmorrison@example.com',

      // Add your own custom user variables here, ie:
      subscriptionType: 'pro'
    });
  }
}
