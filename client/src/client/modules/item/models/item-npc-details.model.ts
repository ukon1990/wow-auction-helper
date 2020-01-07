import {ItemSoldByRow} from './item-sold-by-row.model';
import {ItemDroppedByRow} from './item-dropped-by-row.model';
import {NpcService} from '../../npc/services/npc.service';
import {ZoneService} from '../../zone/service/zone.service';
import {DroppedItem, NPC, VendorItem} from '../../npc/models/npc.model';
import {Zone} from '../../zone/models/zone.model';

export class ItemNpcDetails {
  soldBy: ItemSoldByRow[] = [];
  droppedBy: ItemDroppedByRow[] = [];

  constructor(private npcService: NpcService, private zoneService: ZoneService) {
  }

  public setForItemId(itemId: number): void {
    this.soldBy.length = 0;
    this.droppedBy.length = 0;
    this.npcService.list.value.forEach(({id, name, tag, drops, sells, zoneId}: NPC) => {
      this.handleDroppedItems(drops, itemId, zoneId, id, name, tag);
      this.handleVendorItems(sells, itemId, zoneId, id, name, tag);
    });
  }

  private handleVendorItems(sells: VendorItem[], itemId: number, zoneId: number, id: number, name: string, tag: string) {
    if (sells) {
      for (let i = 0; i < sells.length; i++) {
        if (sells[i].id === itemId) {
            const {stock, unitPrice, currency} = sells[i] as VendorItem;
          this.soldBy.push({id, name, tag, zoneId, zoneName: this.getZoneName(zoneId), unitPrice, stock, currency});
          return;
        }
      }
    }
  }

  private handleDroppedItems(drops: DroppedItem[], itemId: number, zoneId: number, id: number, name: string, tag: string) {
    if (drops) {
      for (let i = 0; i < drops.length; i++) {
        if (drops[i].id === itemId) {
          const {dropChance} = drops[i] as DroppedItem;
          this.droppedBy.push({id, name, tag, zoneId, zoneName: this.getZoneName(zoneId), dropChance});
          return;
        }
      }
    }
  }

  private getZoneName(zoneId: number) {
    const zone: Zone = this.zoneService.mapped.value.get(zoneId);
    return zone ? zone.name : '';
  }
}
