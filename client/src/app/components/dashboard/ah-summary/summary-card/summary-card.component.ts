import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'wah-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.scss']
})
export class SummaryCardComponent implements OnInit {
  @Input() summary: any;
  constructor() { }

  ngOnInit() {
  }

  selection(id: number) {
    console.log('selected', id);
  }
}
