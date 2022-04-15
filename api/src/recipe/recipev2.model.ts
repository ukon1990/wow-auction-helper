import {ItemLocale} from '@shared/models/item/item-locale';
import {Key} from '../models/game-data/Key.model';

export interface CreatedItem {
    id: number;
    key: Key;
    name: ItemLocale | string;
}

export interface Recipev2 {
    id: number;
    name: ItemLocale;
    description: ItemLocale;
    media: {
        id: number;
        key: Key
        icon: string;
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
    rank?: number;
    horde_crafted_item?: CreatedItem;
    alliance_crafted_item?: CreatedItem;
    crafted_quantity: {
        value: number;
        maximum: number;
        minimum: number;
    };
    modified_crafting_slots: {
        slot_type: {
            key: Key;
            id: number;
        },
        display_order: number;
    }[];
}