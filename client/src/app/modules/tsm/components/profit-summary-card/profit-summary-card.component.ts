import {Component, Input, OnInit} from '@angular/core';
import {ColumnDescription} from '../../../table/models/column-description';

@Component({
  selector: 'wah-profit-summary-card',
  templateUrl: './profit-summary-card.component.html',
  styleUrls: ['./profit-summary-card.component.scss']
})
export class ProfitSummaryCardComponent implements OnInit {
  @Input() userProfit;

  /**
   avgPrice: 3610950
   id: 154127
   maxPrice: 1289625
   minPrice: 1289625
   name: "Quick Owlseye"
   quantity: 10
   totalPrice: 36109500
   */
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
