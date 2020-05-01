
export interface Self {
  href: string;
}

export interface Links {
  self: Self;
}

export interface Name {
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

export interface Key {
  href: string;
}

export interface Media {
  key: Key;
  id: number;
}

export interface Key2 {
  href: string;
}

export interface Name2 {
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

export interface CraftedItem {
  key: Key2;
  name: Name2;
  id: number;
}

export interface Key3 {
  href: string;
}

export interface Name3 {
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

export interface Reagent2 {
  key: Key3;
  name: Name3;
  id: number;
}

export interface Reagent {
  reagent: Reagent2;
  quantity: number;
}

export interface Recipev2 {
  _links: Links;
  id: number;
  name: Name;
  media: Media;
  crafted_item: CraftedItem;
  reagents: Reagent[];
}
