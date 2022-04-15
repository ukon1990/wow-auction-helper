import { ItemLocale } from '../../../../../../shared/models/item/item-locale';

export interface ItemClassLocale {
  id: number;
  name: ItemLocale;
  map?: Map<number, ItemClass>;
  subClasses?: ItemClassLocale[];
}

export interface ItemClass {
  id: number;
  name: string;
  map?: Map<number, ItemClass>;
  subClasses?: ItemClass[];
}