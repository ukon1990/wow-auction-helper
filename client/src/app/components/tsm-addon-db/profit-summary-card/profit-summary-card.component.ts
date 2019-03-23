import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'wah-profit-summary-card',
  templateUrl: './profit-summary-card.component.html',
  styleUrls: ['./profit-summary-card.component.scss']
})
export class ProfitSummaryCardComponent implements OnInit {
  @Input() userProfit;

  constructor() { }

  ngOnInit() {
  }

}
