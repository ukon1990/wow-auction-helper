import {Component, Input, OnInit} from '@angular/core';
import {ColumnDescription} from '@shared/models';
import {WoWHeadContainedInObject} from '@shared/models';
import {ZoneService} from '../../../zone/service/zone.service';
import {Zone} from '../../../zone/models/zone.model';

@Component({
  selector: 'wah-contained-in-tab',
  templateUrl: './contained-in-tab.component.html',
  styleUrls: ['./contained-in-tab.component.scss']
})
export class ContainedInTabComponent implements OnInit {
  @Input() items: any[];
  @Input() isObjects = false;
  data: any[] = [];
  containedInItemColumns: Array<ColumnDescription> = [
    {key: 'name', title: 'Name', dataType: 'name', options: {tooltipType: 'item'}},
    {key: 'dropChance', title: 'Drop chance', dataType: 'percent'},
    {key: 'id', title: 'WoWDB', dataType: 'wdb-link'},
    {key: 'id', title: 'WoWHead', dataType: 'whead-link'}
  ];

  containedInObjectColumns: ColumnDescription[] = [
    {
      key: 'name', title: 'Name', dataType: 'name', options: {
        tooltipType: 'object', noIcon: true
      }
    },
    {
      key: 'zoneName', title: 'Zone', dataType: 'zone', options: {
        idName: 'zoneId', tooltipType: 'zone'
      }
    },
    {key: 'dropChance', title: 'Drop chance', dataType: 'percent'},
    {key: 'id', title: 'WoWDB', dataType: 'wdb-link'},
    {key: 'id', title: 'WoWHead', dataType: 'whead-link'}
  ];

  constructor(private zoneService: ZoneService) {
  }

  ngOnInit(): void {
    this.setTableData();
  }

  private setTableData() {
    if (this.isObjects) {
      this.data = this.items.map((obj: WoWHeadContainedInObject) => ({
        id: obj.id,
        name: obj.name,
        dropChance: obj.dropChance,
        ...this.getZoneNameAndId(obj.location[0])
      }));
    } else {
      this.data = this.items;
    }
    console.log('data', this.data);
  }

  private getZoneNameAndId(id: number) {
    const zone: Zone = this.zoneService.mapped.value.get(id);
    if (zone) {
      return {
        zoneId: zone.id,
        zoneName: zone.name
      };
    }
    return {
      zoneId: undefined,
      zoneName: ''
    };
  }
}