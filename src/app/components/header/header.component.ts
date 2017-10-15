import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html'
})
export class HeaderComponent {
	@Input() isRealmSet: Function;
	@Input() exists: Function;
	@Input() isCharacterSet: Function;
	@Input() isSmallWindow: Function;
	@Input() downloadingText: string;
	@Input() timeSinceLastModified: number;

}
