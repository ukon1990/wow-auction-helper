import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuctionsService} from '../../../services/auctions.service';

@Component({
  selector: 'wah-ah-summary',
  templateUrl: './ah-summary.component.html',
  styleUrls: ['./ah-summary.component.scss']
})
export class AhSummaryComponent implements OnInit, OnDestroy {
  ahEvents: Subscription;

  /**
   * Potential interesting data:
   * - How many sellers
   * - How many unique items
   * - How many per item class and sub class
   */

  constructor() {
  }

  ngOnInit() {
    this.ahEvents = AuctionsService.events.auctions
      .subscribe(() =>
        this.summarizeData());
    this.summarizeData();
  }

  ngOnDestroy(): void {
    this.ahEvents.unsubscribe();
  }

  summarizeData(): void {
  }
}
