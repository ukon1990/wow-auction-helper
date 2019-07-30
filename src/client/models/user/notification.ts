import Push from 'push.js';

export class Notification {
  title: string;
  message: string;
  timestamp: Date;

  constructor(title: string, message: string) {
    this.title = title;
    this.message = message;
    this.timestamp = new Date();
  }
}

export class NotificationSettings {
  isUpdateAvailable = true;
  isBelowVendorSell = true;
  isUndercut = true;
  isWatchlist = true;
}

export class Notifications {
  public static requestPermission(): void {
    Push.Permission.request();
  }

  public static send(title: string, message: string): void {
    if (Push.Permission.get() === Push.Permission.DENIED) {
      return;
    } else if (Push.Permission.get() === Push.Permission.DEFAULT) {
      this.requestPermission();
    }

    Push.create(title, {
      body: message,
      icon: 'https://render-eu.worldofwarcraft.com/icons/56/inv_scroll_03.jpg',
      timeout: 4000,
      onClick: function() {
        window.focus();
        this.close();
      }
    });
  }
}
