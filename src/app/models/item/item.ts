import { ItemSpells } from './itemspells';

export class Item {
    id: number;
    name: string;
    icon: string;
    itemLevel: number;
    itemClass: number;
    itemSubClass: number;
    quality: number;
    itemSpells: ItemSpells[];
    buyPrice: number;
    sellPrice: number;
    itemBind: number;
    minFactionId: string;
    minReputation: number;
    isDropped: boolean;
    expansionId: number;
}
