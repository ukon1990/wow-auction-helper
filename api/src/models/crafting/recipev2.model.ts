import {ItemLocale} from '../item/item-locale';
import {Key} from '../game-data/Key.model';

export interface CreatedItem {
    id: number;
    key: Key;
    name: ItemLocale | string;
}

export interface Recipev2 {
    id: number;
    name: ItemLocale | string;
    media: {
        id: number;
        key: Key
    };
    _links: {
        self: Key;
    };
    reagents: {
        reagent: {
            id: number;
            key: Key;
            name: ItemLocale | string;
        };
        quantity: number;
    }[];
    crafted_item?: CreatedItem;
    description: ItemLocale | string;
    rank?: number;
    horde_crafted_item?: CreatedItem;
    alliance_crafted_item?: CreatedItem;
}
