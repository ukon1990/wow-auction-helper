import {ItemLocale} from '../../models';

export interface Currency {
  id: number;
  category: number;
  name: ItemLocale;
  icon: string;
}