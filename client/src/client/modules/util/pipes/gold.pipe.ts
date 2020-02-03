import { Pipe, PipeTransform } from '@angular/core';
import {split} from 'ts-node';
import {TextUtil} from '@ukon1990/js-utilities';
import {NumberUtil} from '../utils/number.util';

@Pipe({
  name: 'gold'
})
export class GoldPipe implements PipeTransform {

  static toCopper(newValue: any): number {
    let copper = 0;
    if (isNaN(newValue)) {
      const splitted = newValue.replace(/[,]{1,}/gi, '').split(' ');
      splitted.forEach(val => {
        if (TextUtil.contains(val, 'g')) {
          copper += +val.replace('g', '') * 10000;
        } else if (TextUtil.contains(val, 's')) {
          copper += +val.replace('s', '') * 100;
        } else if (TextUtil.contains(val, 'c')) {
          copper += +val.replace('c', '');
        }
      });
      return copper;
    }
    return +newValue;
  }

  transform(copper: number, args?: any): string {
    if (!copper) {
      return '0g 0s 0c';
    }
    const result = [];
    copper = Math.round(copper);
    result[0] = copper % 100;
    copper = (copper - result[0]) / 100;
    // Silver
    result[1] = copper % 100;
    // Gold
    result[2] = NumberUtil.format(((copper - result[1]) / 100), false);

    return result[2] + 'g ' + result[1] + 's ' + result[0] + 'c';
  }
}
