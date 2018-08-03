import { Component, OnInit } from '@angular/core';
import { ProspectingAndMillingUtil } from '../../../utils/prospect-milling.util';
import { Remains } from '../../../models/item/remains.model';
import { ColumnDescription } from '../../../models/column-description';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'wah-milling',
  templateUrl: './milling.component.html',
  styleUrls: ['./milling.component.scss']
})
export class MillingComponent implements OnInit {
  locale = localStorage['locale'].split('-')[0];
  columns: ColumnDescription[] = [
    { key: 'name', title: 'Name', dataType: 'name'},
    { key: 'cost', title: 'Cost', dataType: 'gold'},
    { key: 'roi', title: 'ROI', dataType: 'gold'},
    { key: 'dropChance', title: 'Drop chance', dataType: 'percent'}
  ];
  constructor() { }

  ngOnInit() {
  }

  getMilling(): Remains[] {
    return ProspectingAndMillingUtil.pigmentSource;
  }

  getProspects(): Remains[] {
    return ProspectingAndMillingUtil.gemSource;
  }
}
