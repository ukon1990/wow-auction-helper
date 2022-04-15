import {ItemLocale} from '../../../../../../shared/models/item/item-locale';

export interface Currency {
  id: number;
  category: number;
  name: ItemLocale;
  icon: string;
}