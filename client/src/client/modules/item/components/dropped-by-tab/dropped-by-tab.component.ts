import {Component, Input} from '@angular/core';
import {ItemDroppedByRow} from '../../models/item-dropped-by-row.model';
import {ColumnDescription} from '@shared/models';

@Component({
  selector: 'wah-dropped-by-tab',
  templateUrl: './dropped-by-tab.component.html',
  styleUrls: ['./dropped-by-tab.component.scss']
})
export class DroppedByTabComponent {
  @Input() droppedBy: ItemDroppedByRow[];
  droppedByColumns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name', options: {noIcon: true}},
    {key: 'levelRange', title: 'Level range', dataType: 'string'},
    {key: 'dropChance', title: 'Drop chance', dataType: 'percent'},
    {key: 'zoneName', title: 'Zone', dataType: 'zone', options: {idName: 'zoneId'}},
    {key: 'id', title: 'WoWDB', dataType: 'wdb-link'},
    {key: 'id', title: 'WoWHead', dataType: 'whead-link'}
  ];
}