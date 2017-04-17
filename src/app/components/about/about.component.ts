import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'app-about',
	templateUrl: 'about.component.html'
})
export class AboutComponent {
	constructor(private titleService: Title) {
		this.titleService.setTitle('Wah - About');
	}

}
