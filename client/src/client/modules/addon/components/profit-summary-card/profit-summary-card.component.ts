import {Component, Input, OnInit} from '@angular/core';
import {ColumnDescription} from '@shared/models';

@Component({
  selector: 'wah-profit-summary-card',
  templateUrl: './profit-summary-card.component.html',
  styleUrls: ['./profit-summary-card.component.scss']
})
export class ProfitSummaryCardComponent implements OnInit {
  @Input() userProfit;

  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'quantity', title: 'Quantity', dataType: 'number'},
    {key: 'minPrice', title: 'Min buyout', dataType: 'gold'},
    {key: 'maxPrice', title: 'Max buyout', dataType: 'gold'},
    {key: 'avgPrice', title: 'Avg buyout', dataType: 'gold'},
    {key: 'totalPrice', title: 'Sum', dataType: 'gold'}
  ];

  constructor() { }

  ngOnInit() {
  }

}