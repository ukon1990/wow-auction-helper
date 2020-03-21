import {ItemPriceEntry} from '../models/item-price-entry.model';
import {ChartData} from '../../util/models/chart.model';

export class PriceSummaryUtil {
  static days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  static processHourly(data: ItemPriceEntry[], numberOfWeeks): any[] {
    const dayMap = {},
      nWeeksAgo = this.getNWeeksAgo(numberOfWeeks);
    const dayList = [];
    data.forEach(({timestamp, min, quantity}, index) => {
      if (timestamp <= nWeeksAgo) {
        return;
      }

      const date = new Date(timestamp),
        day = date.getDay(),
        hour = date.getHours();

      if (!dayMap[day]) {
        this.handleUnmappedDay(dayMap, day, min, quantity, hour, dayList);
      } else {
        this.handleMappedDay(dayMap, day, min, hour, quantity);
      }

      if (!dayMap[day].hour[hour]) {
        this.handleUnmappedHour(dayMap, day, hour, min, quantity, data, index);
      } else {
        this.handleMappedHour(dayMap, day, hour, min, data, index);
      }
    });

    return dayList;
  }

  private static getNWeeksAgo(numberOfWeeks) {
    return +new Date() - 1000 * 60 * 60 * 24 * 7 * numberOfWeeks;
  }

  private static handleMappedHour(
    dayMap: {}, day: number, hour: number, min: number, data: ItemPriceEntry[], index: number) {
    const hourData = dayMap[day].hour[hour];
    hourData.avg.price = (hourData.avg.price + min) / 2;
    if (hourData.min.price > min) {
      hourData.min.price = min;
    }
    if (hourData.max.price < min) {
      hourData.max.price = min;
    }
    hourData.change = data[index].min - data[index - 1].min;
  }

  private static handleUnmappedHour(
    dayMap: {}, day: number, hour: number, min: number, quantity: number, data: ItemPriceEntry[], index: number) {
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
      change: data[index - 1] ? data[index].min - data[index - 1].min : 0
    };
  }

  private static handleUnmappedDay(dayMap: {}, day: number, min: number, quantity: number, hour: number, dayList: any[]) {
    dayMap[day] = {
      min: min,
      avg: min,
      max: min,
      avgQuantity: quantity,
      minTimeOfDay: hour,
      maxTimeOfDay: hour,
      avgPriceChange: undefined,
      hour: {}
    };
    dayList.push(dayMap[day]);
  }

  private static handleMappedDay(dayMap: {}, day: number, min: number, hour: number, quantity: number) {
    const dayData = dayMap[day];
    if (dayData.min > min) {
      dayMap[day].min = min;
      dayMap[day].minTimeOfDay = hour;
    }
    if (dayData.max < min) {
      dayMap[day].max = min;
      dayMap[day].maxTimeOfDay = hour;
    }

    dayMap[day].avg = (dayMap[day].avg + min) / 2;
    dayMap[day].avgQuantity = (dayMap[day].avgQuantity + quantity) / 2;
  }

  static calculateAndSetAvgPriceChange(hour: number, index: number, day, dayList: {}) {
    try {
      let prev;
      if (!hour) {
        prev = this.getFirstExistingPreviousPrice(index, dayList);
      } else if (hour) {
        prev = day.hour[hour - 1];
      }
      const change = day.hour[hour].avg.price - prev.avg.price;
      if (day.avgPriceChange === undefined) {
        day.avgPriceChange = (day.avgPriceChange + change) / 2;
      } else {
        day.avgPriceChange = change;
      }
    } catch (e) {
    }
  }


  private static getFirstExistingPreviousPrice(index: number, dayList: {}) {
    const dayIndex = !index ? 6 : (index - 1);

    for (let hour = 23; hour > 0; hour--) {
      if (dayList[dayIndex].hour[hour]) {
        return dayList[dayIndex].hour[hour];
      }
    }
    return undefined;
  }

  static setPerHourForDayOfWeek(hour: number, index: number, day, dayList: {}, datasetsForDay: ChartData) {
    const labelText = (hour > 10 ? hour : ('0' + hour)) + ':00';
    try {
      let prev;
      if (!hour) {
        const dayIndex = !index ? 6 : (index - 1);
        prev = dayList[dayIndex].hour[23];
      } else {
        prev = day.hour[hour - 1];
      }

      datasetsForDay.labels.push(labelText);
      datasetsForDay.datasets[0].data.push(day.hour[hour].min.price / 10000);
      datasetsForDay.datasets[1].data.push(day.hour[hour].avg.price / 10000);
      datasetsForDay.datasets[2].data.push(day.hour[hour].max.price / 10000);
      if (prev) {
        const change = day.hour[hour].avg.price - prev.avg.price;
        datasetsForDay.datasets[3].data.push(change / 10000);
      }
    } catch (e) {
    }
  }

  static processAndSetWeekdayData(index: number, day, dayList: {}, datasetsForDay: ChartData, groupedDaysSets: ChartData) {
    for (let hour = 0; hour < 24; hour++) {
      PriceSummaryUtil.calculateAndSetAvgPriceChange(hour, index, day, dayList);
      PriceSummaryUtil.setPerHourForDayOfWeek(hour, index, day, dayList, datasetsForDay);
    }
    groupedDaysSets.labels.push(this.days[index]);
    groupedDaysSets.datasets[0].data.push(day.min / 10000);
    groupedDaysSets.datasets[1].data.push(day.avg / 10000);
    groupedDaysSets.datasets[2].data.push(day.max / 10000);
    groupedDaysSets.datasets[3].data.push(day.avgPriceChange / 10000);
  }
}
