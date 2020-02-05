import {ItemSoldByRow} from './item-sold-by-row.model';
import {ItemDroppedByRow} from './item-dropped-by-row.model';
import {NpcService} from '../../npc/services/npc.service';
import {ZoneService} from '../../zone/service/zone.service';
import {DroppedItem, NPC, VendorItem} from '../../npc/models/npc.model';
import {Zone} from '../../zone/models/zone.model';
import {EmptyUtil} from '@ukon1990/js-utilities';

export class ItemNpcDetails {
  vendorBuyPrice: number;
  vendorAvailable: number;
  soldBy: ItemSoldByRow[] = [];
  droppedBy: ItemDroppedByRow[] = [];

  constructor(private npcService?: NpcService, private zoneService?: ZoneService) {
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

  private handleVendorItems(sells: VendorItem[], itemId: number, npc: NPC) {
    if (sells) {
      for (let i = 0; i < sells.length; i++) {
        if (sells[i].id === itemId) {
          this.addSoldBy(sells[i], npc);
          return;
        }
      }
    }
  }

  public addSoldBy({stock, unitPrice, currency, price, stackSize}: VendorItem,
                    {zoneId, id, name, tag}: NPC) {
    this.soldBy.push({id, name, tag, zoneId, zoneName: this.getZoneName(zoneId), unitPrice, stock, currency, price, stackSize});
    if ((!this.vendorBuyPrice || this.vendorBuyPrice > unitPrice) && (!currency || currency < 1)) {
      this.vendorBuyPrice = unitPrice;
      this.vendorAvailable = stock;
    }
  }

  private handleDroppedItems(drops: DroppedItem[], itemId: number, npc: NPC) {
    if (drops) {
      for (let i = 0; i < drops.length; i++) {
        if (drops[i].id === itemId) {
          this.addDroppedBy(drops[i], npc);
          return;
        }
      }
    }
  }

  public addDroppedBy({dropChance}: DroppedItem,
                      {zoneId, id, name, tag, minLevel, maxLevel}: NPC) {
    const levelRange = this.getRange(minLevel, maxLevel);
    this.droppedBy.push({id, name, tag, zoneId, zoneName: this.getZoneName(zoneId), dropChance, levelRange});
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
