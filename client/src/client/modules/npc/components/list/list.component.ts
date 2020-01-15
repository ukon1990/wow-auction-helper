import {Component, OnDestroy, OnInit} from '@angular/core';
import {NpcService} from '../../services/npc.service';
import {ColumnDescription} from '../../../table/models/column-description';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {DroppedItem, NPC, VendorItem} from '../../models/npc.model';
import {AuctionsService} from '../../../../services/auctions.service';
import {ZoneService} from '../../../zone/service/zone.service';
import {Zone} from '../../../zone/models/zone.model';
import {RowClickEvent} from '../../../table/models/row-click-event.model';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Filters} from '../../../../utils/filtering';

@Component({
  selector: 'wah-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  list: any[] = [];
  commonColumns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name', options: {tooltipType: 'npc', noIcon: true}},
    {key: 'tag', title: 'Tag', dataType: 'string', hideOnMobile: true},
    {key: 'zone', title: 'Zone', dataType: 'string'},
    {key: 'minLevel', title: 'Min level', dataType: 'number', hideOnMobile: true},
    {key: 'maxLevel', title: 'Max level', dataType: 'number', hideOnMobile: true}
  ];
  table = {
    dropped: {
      columns: [
        ...this.commonColumns,
        {key: 'dropCount', title: 'Drop#', dataType: 'number', hideOnMobile: true},
        {key: 'vendorValue', title: 'Vendor value', dataType: 'gold'},
        {key: 'buyoutValue', title: 'AH value', dataType: 'gold'}
      ], data: []
    },
    sold: {
      columns: [
        ...this.commonColumns,
        {key: 'sellCount', title: 'Sell#', dataType: 'number', hideOnMobile: true},
        {key: 'limitedSupplyCount', title: 'Limited supply', dataType: 'number'},
        {key: 'roi', title: 'Potential profit', dataType: 'gold'},
      ], data: []
    }
  };
  sm = new SubscriptionManager();
  form: FormGroup;

  constructor(private service: NpcService, private auctionService: AuctionsService, private zoneService: ZoneService,
              private router: Router, private fb: FormBuilder) {
    this.form = fb.group({
      minSaleRate: null,
      minAvgDailySold: null,
      minAHValue: 0,
      minVendorValue: 0
    });
    this.sm.add(this.service.list, (data: NPC[]) => {
      this.list = data;
      this.mapDataToTable(data);
    });
    this.sm.add(this.auctionService.events.groupedList, () => {
      this.mapDataToTable();
    });

    this.sm.add(
      this.form.valueChanges, () => this.mapDataToTable());
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  private mapDataToTable(data: NPC[] = this.service.list.value) {
    this.table.dropped.data = [];
    this.table.sold.data = [];
    data.forEach((npc) => {
      const drops = npc.drops && npc.drops.filter(item => this.filter(item)) || [];
      const sells = npc.sells && npc.sells.filter(item => this.filter(item)) || [];
      const {score, buyoutValue, vendorValue} = NPC.calculateValueOfDrops(drops);
      const {limitedSupplyCount, roi} = NPC.calculateVendorValue(sells);
      const obj = {
        id: npc.id,
        name: npc.name,
        tag: npc.tag,
        zone: this.getZoneName(npc),
        locations: npc.coordinates ? npc.coordinates.length : 0,
        minLevel: npc.minLevel,
        maxLevel: npc.maxLevel,
        dropCount: drops.length,
        sellCount: sells.length,
        buyoutValue,
        vendorValue,
        score,
        limitedSupplyCount,
        roi
      };
      if (drops && drops.length > 0) {
        this.table.dropped.data.push(obj);
      }
      if (sells && sells.length > 0) {
        this.table.sold.data.push(obj);
      }
    });
    console.log('NPCs', this.table);
  }

  private filter({id}: DroppedItem | VendorItem) {
    const {minSaleRate, minAvgDailySold} = this.form.value;
    return Filters.isSaleRateMatch(id, minSaleRate) &&
      Filters.isDailySoldMatch(id, minAvgDailySold);
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
