import { Component, OnInit, AfterViewInit } from '@angular/core';

declare var $;
@Component({
  selector: 'wah-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements AfterViewInit {
  currentDate: string;
  lastUpdateDate = '15.02.2018';
  showNews: boolean;

  constructor() {
    this.currentDate = new Date().toLocaleDateString();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      try {
        console.log(localStorage['timestamp_news'], this.lastUpdateDate);
        if (localStorage['realm'] &&
          localStorage['timestamp_news'] !== this.lastUpdateDate) {
            this.showNews = true;
        }
      } catch (e) {
        console.log(e);
      }
    }, 1000);
  }

  close(): void {
    localStorage['timestamp_news'] = this.lastUpdateDate;
    this.showNews = false;
  }
}
