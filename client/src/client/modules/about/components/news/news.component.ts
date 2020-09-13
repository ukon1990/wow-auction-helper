import {Component, AfterViewInit, Inject, OnDestroy} from '@angular/core';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DashboardService} from '../../../dashboard/services/dashboard.service';
import {NewsUtil} from '../../utils/news.util';

declare function require(moduleName: string): any;

const version = require('../../../../../../package.json').version;
declare var $;

@Component({
  selector: 'wah-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnDestroy {
  showNews: boolean;
  faTimes = faTimes;

  constructor(
    public dialogRef: MatDialogRef<NewsComponent>,
    @Inject(MAT_DIALOG_DATA) public input: string | any) {
  }

  ngOnDestroy(): void {
    this.setNewsHasBeenClosed();
    NewsUtil.events.next(false);
  }

  close(): void {
    this.dialogRef.close();
  }

  private setNewsHasBeenClosed() {
    localStorage['timestamp_news'] = version;
    this.showNews = false;
  }
}
