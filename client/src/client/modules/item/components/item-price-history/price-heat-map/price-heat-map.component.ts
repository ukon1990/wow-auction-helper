import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ColumnDescription} from '../../../../table/models/column-description';
import {ItemPriceEntry} from '../../../models/item-price-entry.model';

@Component({
  selector: 'wah-price-heat-map',
  templateUrl: './price-heat-map.component.html',
  styleUrls: ['./price-heat-map.component.scss']
})
export class PriceHeatMapComponent implements OnChanges {
  @Input() dailyData: any[];
  @Input() hourlyData: any[];

  columns: ColumnDescription[] = [
    {key: 'hour', title: 'Hour', dataType: 'string'},
    {key: '0', title: 'Monday', dataType: 'gold'}, // TODO: Might be not be a good idea to hard-code
    {key: '1', title: 'Tuesday', dataType: 'gold'},
    {key: '2', title: 'Wednesday', dataType: 'gold'},
    {key: '3', title: 'Thursday', dataType: 'gold'},
    {key: '4', title: 'Friday', dataType: 'gold'},
    {key: '5', title: 'Saturday', dataType: 'gold'},
    {key: '6', title: 'Sunday', dataType: 'gold'}
  ];

  hourlyByDayTable = {
    columns: this.columns,
    data: []
  };

  ngOnChanges({dailyData, hourlyData}: SimpleChanges): void {
    if (hourlyData && hourlyData.currentValue) {
      this.processHourly(hourlyData.currentValue);
    }
  }

  private processHourly(data: ItemPriceEntry[]) {
    const dayMap = {};
    data.forEach(({timestamp, min, quantity}) => {
      /*
        TODO: Calculate the current price trend!
        Is the price declining etc? by using the average price, and calculating from there?

        TODO: Get best time of day and best day of week to buy/sell
       */
      const date = new Date(timestamp),
        day = date.getDay(),
        hour = date.getHours();
      if (!dayMap[day]) {
        dayMap[day] = {
          min: min,
          avg: min,
          max: min,
          avgQuantity: quantity,
          hour: {}
        };
      } else {
        const dayData = dayMap[day];
        if (dayData.min > min) {
          dayMap[day].min = min;
        }
        if (dayData.max < min) {
          dayMap[day].max = min;
        }

        dayMap[day].avg = (dayMap[day].avg + min) / 2;
        dayMap[day].avgQuantity = (dayMap[day].avgQuantity + quantity) / 2;
      }

      if (!dayMap[day].hour[hour]) {
        dayMap[day].hour[hour] = {
          min: {
            price: min,
            quantity
          },
          avg: {
            price: min,
            quantity
          },
          max: {
            price: min,
            quantity
          },
          trend: 0,
        };
      } else {
        const hourData = dayMap[day].hour[hour];
        hourData.avg.price = (hourData.avg.price + min) / 2;
        if (hourData.min.price > min) {
          hourData.min.price = min;
        }
        if (hourData.max.price < min) {
          hourData.max.price = min;
        }
      }
    });

    for (let hour = 0; hour < 24; hour++) {
      for (let day = 0; day < 7; day++) {
        this.addDayForHoursTable(day, hour, dayMap);
      }
    }
    console.log('dayMap', dayMap);
  }

  private addDayForHoursTable(day: number, hour: number, dayMap: {}) {
    if (!this.hourlyByDayTable.data[hour]) {
      this.hourlyByDayTable.data.push({
        hour : hour < 10 ? '0' + hour : hour
      });
    }
    this.hourlyByDayTable.data[hour][day] = dayMap[day].hour[hour].avg.price;
  }
}
