import {ItemLocale, Key} from '../../shared/models';
import {Links} from '@models/character/character-game-data.model';

export interface CreatedItem {
    id: number;
    key: Key;
    name: ItemLocale | string;
}

export interface CompatibleCategory {
    key: Key;
    name: ItemLocale;
    id: number;
}

export interface ReagentSlotType {
    _links: Links;
    id: number;
    name: ItemLocale;
    description: ItemLocale;
    compatible_categories: CompatibleCategory[];
}

interface SlotType extends ReagentSlotType {
    key: Key;
    id: number;
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
        slot_type: SlotType,
        display_order: number;
    }[];
}