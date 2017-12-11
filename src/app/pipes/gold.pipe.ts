import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gold'
})
export class GoldPipe implements PipeTransform {

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
    result[2] = ((copper - result[1]) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return result[2] + 'g ' + result[1] + 's ' + result[0] + 'c';
  }
}
