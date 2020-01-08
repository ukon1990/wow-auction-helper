import {ItemSoldByRow} from './item-sold-by-row.model';
import {ItemDroppedByRow} from './item-dropped-by-row.model';
import {NpcService} from '../../npc/services/npc.service';
import {ZoneService} from '../../zone/service/zone.service';
import {DroppedItem, NPC, VendorItem} from '../../npc/models/npc.model';
import {Zone} from '../../zone/models/zone.model';
import {EmptyUtil} from '@ukon1990/js-utilities';

export class ItemNpcDetails {
  soldBy: ItemSoldByRow[] = [];
  droppedBy: ItemDroppedByRow[] = [];

  constructor(private npcService: NpcService, private zoneService: ZoneService) {
  }

  public setForItemId(itemId: number): void {
    this.soldBy.length = 0;
    this.droppedBy.length = 0;
    this.npcService.list.value.forEach((npc: NPC) => {
      this.handleDroppedItems(npc.drops, itemId, npc);
      this.handleVendorItems(npc.sells, itemId, npc);
    });

    this.droppedBy.sort((a, b) =>
      b.dropChance - a.dropChance);
  }

  private handleVendorItems(sells: VendorItem[], itemId: number, {zoneId, id, name, tag}: NPC) {
    if (sells) {
      for (let i = 0; i < sells.length; i++) {
        if (sells[i].id === itemId) {
          const {stock, unitPrice, currency, price, stackSize} = sells[i] as VendorItem;
          this.soldBy.push({id, name, tag, zoneId, zoneName: this.getZoneName(zoneId), unitPrice, stock, currency, price, stackSize});
          return;
        }
      }
    }
  }

  private handleDroppedItems(drops: DroppedItem[], itemId: number, {zoneId, id, name, tag, minLevel, maxLevel}: NPC) {
    if (drops) {
      for (let i = 0; i < drops.length; i++) {
        if (drops[i].id === itemId) {
          const {dropChance} = drops[i] as DroppedItem,
            levelRange = this.getRange(minLevel, maxLevel);
          this.droppedBy.push({id, name, tag, zoneId, zoneName: this.getZoneName(zoneId), dropChance, levelRange});
          return;
        }
      }
    }
  }

  private getZoneName(zoneId: number) {
    const zone: Zone = this.zoneService.mapped.value.get(zoneId),
     levelRange = zone ? this.getRange(zone.minLevel, zone.maxLevel) : '';
    return zone ? `${zone.name} ${levelRange.length ? `(${levelRange})` : ''}` : '';
  }

  private getRange(min: number, max: number): string {
    if (min && max && max > min) {
      return `${min}- ${max}`;
    }
    if (min) {
      return '' + min;
    }
    return max ? '' + max : '';
  }
}
