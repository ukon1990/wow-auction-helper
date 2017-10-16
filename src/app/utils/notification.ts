import { Router } from '@angular/router';
import Push from 'push.js';

export class Notification {
	private static notificationsWorking = true;

	public static send(title: string, message: string, router: Router, page?: string, icon?: string) {
		if (!this.notificationsWorking) {
			return;
		}
		try {
			Push.create(title, {
				body: message,
				icon: icon ? `http://media.blizzard.com/wow/icons/56/${icon}.jpg` : 'http://media.blizzard.com/wow/icons/56/inv_scroll_03.jpg',
				timeout: 10000,
				onClick: () => {
					if (page) {
						router.navigateByUrl(page);
					}
					window.focus();
					close();
				}
			});
		} catch (error) {
			this.notificationsWorking = false;
			console.error('Could not send notification', error);
		}
	}
}
