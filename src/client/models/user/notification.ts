import Push from 'push.js';
import {SharedService} from '../../services/shared.service';
import {ErrorReport} from '../../utils/error-report.util';
import {Report} from '../../utils/report.util';

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
  isUndercut = false;
  disableNotifications = false;

  constructor(input?: NotificationSettings) {
    if (input) {
      this.isUpdateAvailable = input.isUpdateAvailable;
      this.isUndercut = input.isUndercut;
      this.disableNotifications = input.disableNotifications;
    }
  }

  getString(): string {
    if (this.isUpdateAvailable) {
      return 'isUpdateAvailable';
    }

    if (this.isUndercut) {
      return 'isUndercut';
    }

    return 'disableNotifications';
  }

  setString(type: string): void {
    Object.keys(this)
      .forEach(key => {
        if (key === type) {
          this[key] = true;
        } else if (this[key] === true) {
          // trying to avoid overwriting the functions here
          this[key] = false;
        }
      });
  }
}

export class Notifications {
  public static requestPermission(): void {
    Push.Permission.request();
  }

  public static send(
    title: string, message: string, icon = 'https://render-eu.worldofwarcraft.com/icons/56/inv_scroll_03.jpg'): void {
    if (this.isNotificationsDisabled()) {
      return;
    } else if (Push.Permission.get() === Push.Permission.DEFAULT) {
      this.requestPermission();
    }

    try {
      Push.create(title, {
        body: message,
        icon: icon,
        timeout: 4000,
        onClick: function () {
          window.focus();
          this.close();
        }
      });
    } catch (e) {
      ErrorReport.sendError('Notifications.send', e);
    }
  }

  private static isNotificationsDisabled() {
    const notifications = SharedService.user.notifications;
    const isAllowed = notifications.disableNotifications ||
      Push.Permission.get() === Push.Permission.DENIED;

    Report.debug('Notifications.isNotificationsDisabled', notifications, isAllowed);

    if (!isAllowed && !notifications.disableNotifications) {
      notifications.disableNotifications = true;
    }
    return isAllowed;
  }
}
