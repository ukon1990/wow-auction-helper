import {ItemLocale} from './item-locale';
import {Key} from "../character";


export interface ModifiedCraftingCategory {
  key: Key;
  name: ItemLocale;
  id: number;
}

export interface ModifiedCrafting {
  id: number;
  category: ModifiedCraftingCategory;
  description: ItemLocale;
}

export interface ItemGameData {
  modified_crafting: ModifiedCrafting;
  _links: Links;
  id: number;
  name: ItemLocale;
  quality: Quality;
  level: number;
  required_level: number;
  media: MediaGameData;
  item_class: ItemClass;
  item_subclass: ItemClass;
  inventory_type: Quality;
  purchase_price: number;
  purchase_quantity?: number;
  sell_price: number;
  max_count: number;
  is_equippable: boolean;
  is_stackable: boolean;
  description: ItemLocale;
  preview_item: PreviewItem;
}

interface ItemClass {
  key: Self;
  name: ItemLocale;
  id: number;
}

export interface MediaGameData {
  key: Self;
  id: number;
}


interface Quality {
  type: string;
  name: ItemLocale;
}

interface Links {
  self: Self;
}

interface Self {
  href: string;
}

export interface Durability {
  value: number;
  display_string: string;
}

export interface Requirements {
  reputation: {
    faction: { name: string; id: number; };
    min_reputation_level: number;
    display_string: string;
  };
}

export interface PreviewItemRegent {
  reagent: {
    id: number;
    name: string;
  };
  quantity: number;
}

export interface PreviewItemSpells {
  spell: {
    id: number;
    name: string;
  };
  description: string;
}

export interface PreviewItem {
  item: { id: number };
  quality: Quality;
  name: string;
  context: number;
  bonus_list: number[];
  binding: Quality;
  sell_price: { value: number };
  requirements: Requirements;
  reagents: PreviewItemRegent[];
  spells: PreviewItemSpells[];
  durability: Durability;
}