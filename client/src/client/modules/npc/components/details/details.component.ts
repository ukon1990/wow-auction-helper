import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {DroppedItem, NPC, VendorItem} from '../../models/npc.model';
import {ZoneService} from '../../../zone/service/zone.service';
import {NpcService} from '../../services/npc.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuctionsService} from '../../../../services/auctions.service';
import {Zone} from '../../../zone/models/zone.model';
import {GameBuild} from '../../../../utils/game-build.util';

@Component({
  selector: 'wah-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  npc: NPC;
  zone: Zone;
  npcId: number;
  sm = new SubscriptionManager();
  table = {
    drops: {
      columns: [
        {key: 'name', title: 'Name', dataType: 'name'},
        {key: 'sellPrice', title: 'Sell price', dataType: 'gold'},
        {key: 'buyout', title: 'Buyout', dataType: 'gold'},
        {key: 'dropChance', title: 'Drop chance', dataType: 'percent'},
        {key: 'vendorValue', title: 'Vendor value', dataType: 'gold'},
        {key: 'buyoutValue', title: 'Buyout value', dataType: 'gold'},
        {key: 'mktValue', title: 'Market price', dataType: 'gold'},
        {key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent'},
        {key: 'avgDailySold', title: 'Avg daily sold', dataType: 'number'},
      ], data: []
    },
    sells: {
      columns: [
        {key: 'name', title: 'Name', dataType: 'name'},
        {key: 'stock', title: 'Stock', dataType: 'number'},
        {key: 'price', title: 'Stack price', dataType: 'vendor-currency'},
        {key: 'stackSize', title: 'Stack size', dataType: 'number'},
        {key: 'unitPrice', title: 'Unit price', dataType: 'vendor-currency'},
        {key: 'buyout', title: 'Buyout', dataType: 'gold'},
        {key: 'roi', title: 'Potential profit', dataType: 'gold'},
        {key: 'mktPrice', title: 'Market price', dataType: 'gold'},
        {key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent'},
        {key: 'avgDailySold', title: 'Avg daily sold', dataType: 'number'},
      ], data: []
    },
    skinning: {columns: [], data: []}
  };
  territories = GameBuild.territories;
  zoneTypes = GameBuild.zoneType;
  potentialValue = {
    vendor: 0,
    ah: 0
  };

  constructor(private zoneService: ZoneService, private npcService: NpcService,
              private route: ActivatedRoute, private auctionService: AuctionsService, private router: Router) {
  }

  ngOnInit() {
    this.territories = GameBuild.territories;
    this.zoneTypes = GameBuild.zoneType;
    console.log('Route', this.route.snapshot.paramMap);


    this.sm.add(this.route.params, ({id}) => {
      this.npcId = +id;
      this.setTableData();
    });

    this.sm.add(this.npcService.mapped, (map) => {
      this.setTableData(map);
    });
    this.sm.add(this.auctionService.events.list, (list) => {
      if (list.length > 0) {
        this.setTableData();
      }
    });

  }

  private setTableData(map?) {
    if (!map) {
      map = this.npcService.mapped.value;
    }
    this.npc = map[this.npcId];
    this.zone = undefined;
    this.potentialValue.vendor = 0;
    this.potentialValue.ah = 0;

    if (this.npc) {
      this.zone = this.zoneService.mapped.value.get(this.npc.zoneId);
      if (this.npc.drops) {
        this.table.drops.data = this.npc.drops.map((drop: DroppedItem) => {
          const result = DroppedItem.getScoredItem(drop);
          this.potentialValue.vendor += result.vendorValue;
          this.potentialValue.ah += result.buyoutValue;
          return result;
        })
          .sort((a, b) => b.dropChance - a.dropChance);
      } else {
        this.table.drops.data = [];
      }

      if (this.npc.sells) {
        this.table.sells.data = this.npc.sells.map((item: VendorItem) => {
          return {
            ...item,
            ...NPC.calculateSellerVendorItemROI(item)
          };
        })
          .sort((a, b) => b.roi - a.roi);
      } else {
        this.table.sells.data = [];
      }
    }
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  backToList(): void {
    this.router.navigateByUrl('tools/npc');
  }
}
