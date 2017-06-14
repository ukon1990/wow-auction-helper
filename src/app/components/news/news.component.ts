import { Component, OnInit, AfterViewInit } from '@angular/core';

declare var $;
@Component({
	selector: 'app-news',
	templateUrl: './news.component.html',
	styleUrls: ['./news.component.css']
})
export class NewsComponent implements AfterViewInit {
	currentDate: string;
	lastUpdateDate = '14.6.2017';

	constructor() {
		this.currentDate = new Date().toLocaleDateString();
	}

	ngAfterViewInit() {
		setTimeout(() => {
			try {
				console.log(localStorage.getItem('timestamp_news'), this.lastUpdateDate);
				if (localStorage.getItem('realm') &&
					localStorage.getItem('timestamp_news') !== this.lastUpdateDate) {
					$(window).load(function() {
						$('#news-modal').modal('show');
					});

					// Binding closing functionality
					$('#news-modal').on('hidden.bs.modal', () => {
						localStorage.setItem('timestamp_news', this.lastUpdateDate);
					});
				}
			} catch (e) {
				console.log(e);
			}
		}, 1000);
	}

}
