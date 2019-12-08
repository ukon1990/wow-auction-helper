import {ItemLocale} from './item-locale';

export interface ItemGameData {
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
  sell_price: number;
  max_count: number;
  is_equippable: boolean;
  is_stackable: boolean;
  description: ItemLocale;
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
