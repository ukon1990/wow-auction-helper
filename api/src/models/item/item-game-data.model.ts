
export interface ItemGameData {
  _links: Links;
  id: number;
  name: Locale;
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
  description: Locale;
}

interface Locale {
  en_US: string;
  es_MX: string;
  pt_BR: string;
  de_DE: string;
  en_GB: string;
  es_ES: string;
  fr_FR: string;
  it_IT: string;
  ru_RU: string;
  ko_KR: string;
  zh_TW: string;
  zh_CN: string;
}

interface ItemClass {
  key: Self;
  name: Locale;
  id: number;
}

export interface MediaGameData {
  key: Self;
  id: number;
}


interface Quality {
  type: string;
  name: Locale;
}

interface Links {
  self: Self;
}

interface Self {
  href: string;
}
