import {ItemLocale} from '@shared/models';

export interface Currency {
  id: number;
  category: number;
  name: ItemLocale;
  icon: string;
}