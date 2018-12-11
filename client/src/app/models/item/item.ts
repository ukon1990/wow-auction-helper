import { ItemSpells } from './itemspells';
import { WoWHead } from './wowhead';

export class Item {
    id: number;
    name = 'Missing item';
    icon = 'inv_scroll_03';
    itemLevel: number;
    itemClass: number;
    itemSubClass: number;
    quality: number;
    itemSource?: WoWHead;
    itemSpells?: ItemSpells[];
    buyPrice: number;
    sellPrice: number;
    itemBind: number;
    minFactionId: string;
    minReputation: number;
    isDropped: boolean;
    isBoughtForGold?: boolean;
    expansionId: number;
}
