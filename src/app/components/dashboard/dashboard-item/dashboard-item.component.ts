import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'wah-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent implements OnInit {
  @Input() data;
  @Input() title;

  detailView: boolean;
  constructor() { }

  ngOnInit() {
  }

  logic(): void {
    console.log('Click');
    this.detailView = !this.detailView;
  }
}
