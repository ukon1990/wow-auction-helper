import { ItemSpells } from "./itemspells";

export class Item {
    id: number;
    name = "Missing item";
    icon = "inv_scroll_03";
    itemLevel: number;
    itemClass: number;
    itemSubClass: number;
    quality: number;
    itemSpells: ItemSpells[];
    itemSource?: number[];
    buyPrice: number;
    sellPrice: number;
    itemBind: number;
    minFactionId: string;
    minReputation: number;
    isDropped: boolean;
    expansionId: number;
}
