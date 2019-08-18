import { Component, OnInit } from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {Vendor} from '../../models/vendor.model';
import {SharedService} from '../../../../services/shared.service';
import {ItemSourceUtil} from '../../utils/item-source.util';
import {ColumnDescription} from '../../../table/models/column-description';

@Component({
  selector: 'wah-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})
export class VendorComponent implements OnInit {
  sm = new SubscriptionManager();
  vendors: Vendor[] = [];
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'string'},
    {key: 'tag', title: 'Tag', dataType: 'string'},
    {key: 'location', title: 'Zone', dataType: 'zone'},
    {key: 'itemCount', title: '# Items', dataType: 'number'},
    {key: 'potentialValue', title: 'Potential AH value', dataType: 'gold'}
  ];
  currentNPC: Vendor;

  constructor() {
    SharedService.events.title.next('Item vendor');
  }

  ngOnInit() {
    this.sm.add(
      SharedService.events.auctionUpdate, () => {
      ItemSourceUtil.processSources();
      this.vendors = [...ItemSourceUtil.sourceMap.soldBy.list];
    });
  }

  handleRowClick(npc: Vendor) {
    this.currentNPC = npc;
  }
}
