"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const push_js_1 = __importDefault(require("push.js"));
class Notification {
    constructor(title, message) {
        this.title = title;
        this.message = message;
        this.timestamp = new Date();
    }
}
exports.Notification = Notification;
class NotificationSettings {
    constructor() {
        this.isUpdateAvailable = true;
        this.isBelowVendorSell = true;
        this.isUndercut = true;
        this.isWatchlist = true;
    }
}
exports.NotificationSettings = NotificationSettings;
class Notifications {
    static requestPermission() {
        push_js_1.default.Permission.request();
    }
    static send(title, message) {
        if (push_js_1.default.Permission.get() === push_js_1.default.Permission.DENIED) {
            return;
        }
        else if (push_js_1.default.Permission.get() === push_js_1.default.Permission.DEFAULT) {
            this.requestPermission();
        }
        push_js_1.default.create(title, {
            body: message,
            icon: 'https://render-eu.worldofwarcraft.com/icons/56/inv_scroll_03.jpg',
            timeout: 4000,
            onClick: function () {
                window.focus();
                this.close();
            }
        });
    }
}
exports.Notifications = Notifications;
//# sourceMappingURL=notification.js.map