import { ItemLocale } from '../../../../../../api/src/models/item/item-locale';

export interface ItemClassLocale {
  id: number;
  name: ItemLocale;
  subClasses?: ItemClassLocale[];
}

export interface ItemClass {
  id: number;
  name: string;
  subClasses?: ItemClass[];
}
