import {Component, Input} from '@angular/core';
import {ColumnDescription} from '../../../table/models/column-description';
import {ItemSoldByRow} from '../../models/item-sold-by-row.model';

@Component({
  selector: 'wah-sold-by-tab',
  templateUrl: './sold-by-tab.component.html',
  styleUrls: ['./sold-by-tab.component.scss']
})
export class SoldByTabComponent {
  @Input() soldBy: ItemSoldByRow[];

  soldByColumns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: ''},
    {key: 'tag', title: 'Tag', dataType: ''},
    {key: 'zoneName', title: 'Zone', dataType: 'zone', options: {idName: 'zoneId'}},
    {key: 'cost', title: 'Price', dataType: 'vendor-currency'},
    {key: 'id', title: 'WoWDB', dataType: 'wdb-link'},
    {key: 'id', title: 'WoWHead', dataType: 'whead-link'}
  ];

  constructor() { }

}