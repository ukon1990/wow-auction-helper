import { ItemSpells } from "./itemspells";
import { NPC } from "./wowdb";

export class Item {
  id: number;
  name = "Missing item";
  icon = "inv_scroll_03";
  itemLevel: number;
  itemClass: number;
  itemSubClass: number;
  quality: number;
  itemSpells: ItemSpells[];
  itemSource?: NPC[];
  buyPrice: number;
  sellPrice: number;
  itemBind: number;
  minFactionId: string;
  minReputation: number;
  isDropped: boolean;
  expansionId: number;

  constructor(item?: Item) {
    if (item) {
      this.id = item.id;
      this.name = item.name;
      this.icon = item.icon;
      this.itemLevel = item.itemLevel;
      this.itemClass = item.itemClass;
      this.itemSubClass = item.itemSubClass;
      this.quality = item.quality;
      this.buyPrice = item.buyPrice;
      this.sellPrice = item.sellPrice;
      this.itemBind = item.itemBind;
      this.minFactionId = item.minFactionId;
      this.minReputation = item.minReputation;
    }
  }
}
