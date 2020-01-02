import {Component, OnDestroy, OnInit} from '@angular/core';
import {NpcService} from '../../services/npc.service';
import {ColumnDescription} from '../../../table/models/column-description';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {NPC} from '../../models/npc.model';
import {AuctionsService} from '../../../../services/auctions.service';
import {ZoneService} from '../../../zone/service/zone.service';
import {Zone} from '../../../zone/models/zone.model';
import {RowClickEvent} from '../../../table/models/row-click-event.model';
import {Router} from '@angular/router';

@Component({
  selector: 'wah-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  list: any[] = [];
  commonColumns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'string'},
    {key: 'tag', title: 'Tag', dataType: 'string'},
    {key: 'zone', title: 'Zone', dataType: 'string'},
    {key: 'minLevel', title: 'Min level', dataType: 'number'},
    {key: 'maxLevel', title: 'Max level', dataType: 'number'}
  ];
  table = {
    dropped: { columns: [
        ...this.commonColumns,
        {key: 'dropCount', title: 'Drop#', dataType: 'number'},
        {key: 'vendorValue', title: 'Vendor value', dataType: 'gold'},
        {key: 'buyoutValue', title: 'AH value', dataType: 'gold'},
        {key: 'score', title: 'Score', dataType: 'number'}
      ], data: []},
    sold: { columns: [
        ...this.commonColumns,
        {key: 'sellCount', title: 'Sell#', dataType: 'number'},
        {key: 'limitedSupplyCount', title: 'Limited supply', dataType: 'number'},
        {key: 'roi', title: 'Potential profit', dataType: 'gold'},
      ], data: []}
  };
  sm = new SubscriptionManager();

  constructor(private service: NpcService, private auctionService: AuctionsService, private zoneService: ZoneService,
              private router: Router) {
    this.sm.add(this.service.list, (data: NPC[]) => {
      this.list = data;
      this.mapDataToTable(data);
    });
    this.sm.add(this.auctionService.events.groupedList, () => {
      this.mapDataToTable(this.service.list.value);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  private mapDataToTable(data: NPC[]) {
    this.table.dropped.data = [];
    this.table.sold.data = [];
    data.forEach((npc) => {
      const {score, buyoutValue, vendorValue} = NPC.calculateValueOfDrops(npc.drops);
      const {limitedSupplyCount, roi} = NPC.calculateVendorValue(npc.sells);
      const obj = {
        id: npc.id,
        name: npc.name,
        tag: npc.tag,
        zone: this.getZoneName(npc),
        locations: npc.coordinates ? npc.coordinates.length : 0,
        minLevel: npc.minLevel,
        maxLevel: npc.maxLevel,
        dropCount: npc.drops ? npc.drops.length : 0,
        sellCount: npc.sells ? npc.sells.length : 0,
        buyoutValue,
        vendorValue,
        score,
        limitedSupplyCount,
        roi
      };
      if (npc.drops && npc.drops.length > 0) {
        this.table.dropped.data.push(obj);
      }
      if (npc.sells && npc.sells.length > 0) {
        this.table.sold.data.push(obj);
      }
    });
    console.log('NPCs', this.table);
  }

  private getZoneName(npc: NPC) {
    let zoneName = '';
    if (this.zoneService.mapped.value) {
      const zone: Zone = this.zoneService.mapped.value.get(npc.zoneId);
      if (zone) {
        zoneName = zone.name;
      }
    }
    return zoneName;
  }

  onRowClick({column, row}: RowClickEvent<NPC>) {
    this.router.navigateByUrl(`${this.router.url}/${row.id}`);
  }
}
