import {ItemDailyPriceEntry, ItemPriceEntry, ItemPriceEntryResponse} from '../models/item-price-entry.model';
import {Recipe} from '../../crafting/models/recipe';
import {AuctionsService} from '../../../services/auctions.service';

export class PriceHistoryComponentUtil {
  constructor(private auctionService: AuctionsService) {
  }

  extractGroupedValuesFromReagentHistory(recipe: Recipe, result: Map<string, ItemPriceEntryResponse>) {
    const dailyMap = new Map<number, ItemDailyPriceEntry>();
    const hourlyMap = new Map<number, ItemPriceEntry>();
    const groupedValues: ItemPriceEntryResponse = {
      hourly: [],
      daily: []
    };
    recipe.reagents.forEach(reagent => {
      const history = result.get(`${reagent.id}--1--1`);
      const item = this.auctionService.getById(reagent.id);
      const vendorPrice = item && item.source && item.source.npc ? item.source.npc.vendorBuyPrice : 0;
      if (history) {
        history.hourly.forEach(entry => {
          if (!hourlyMap.has(entry.timestamp)) {
            hourlyMap.set(entry.timestamp, {
              itemId: 0,
              bonusIds: '-1',
              petSpeciesId: -1,
              min: 0,
              quantity: 0,
              timestamp: entry.timestamp,
            });
            groupedValues.hourly.push(hourlyMap.get(entry.timestamp));
          }
          const quantity = (reagent.quantity / recipe.minCount);
          hourlyMap.get(entry.timestamp).min += (vendorPrice || entry.min) * quantity;
        });

        history.daily.forEach(entry => {
          if (!dailyMap.has(entry.timestamp)) {
            dailyMap.set(entry.timestamp, {
              itemId: 0,
              bonusIds: '-1',
              petSpeciesId: -1,
              min: 0,
              minQuantity: 0,
              avg: 0,
              avgQuantity: 0,
              max: 0,
              maxQuantity: 0,
              timestamp: entry.timestamp,
            });
            groupedValues.daily.push(dailyMap.get(entry.timestamp));
          }
          const quantity = (reagent.quantity / recipe.minCount);
          dailyMap.get(entry.timestamp).min += (vendorPrice || entry.min) * quantity;
          dailyMap.get(entry.timestamp).avg += (vendorPrice || entry.avg) * quantity;
          dailyMap.get(entry.timestamp).max += (vendorPrice || entry.max) * quantity;
        });
      }
    });
    return groupedValues;
  }

  getChartDataForItemPriceHistoryForReagents(groupedValues: ItemPriceEntryResponse) {
    const hourly = [];
    const daily = [];
    groupedValues.hourly
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(entry =>
        hourly.push([+entry.timestamp, entry.min]));
    groupedValues.daily
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(entry => {
        // this.dailyChart[4]['data'].push([+entry.timestamp, entry.min, entry.max]);
        daily.push([+entry.timestamp, entry.avg]);
      });
    return {
      hourly,
      daily
    };
  }

  /**
   * Get week days -> Color based on x % from 100% market value?
   * | Day -> | Monday | Tuesday | wednesday | Thursday | Friday | Saturday | Sunday |
   * | Min    | 100g   | 90g     | 89g
   * | Avg    | 110g   | 98g     | 89g
   * | Max    | 120g   | 115g    | 89g
   *
   * Profit heatmap!
   * | Day -> | Monday | Tuesday | wednesday | Thursday | Friday | Saturday | Sunday |
   * | Min    | -5g    | 90g     | 89g
   * | Avg    | 3g     | 98g     | 89g
   * | Max    | 19g    | 115g    | 89g
   *
   */
  getDailyHeatmap(dailyPrices: number[][], dailyCosts: number[][], start: Date, end: Date) {
    const filteredPrice = dailyPrices.filter(([timestamp]) => timestamp >= +start && timestamp <= +end);
    const filteredCost = dailyCosts.filter(([timestamp]) => timestamp >= +start && timestamp <= +end);


    const columns = [
      {key: 'name', title: '', dataType: 'text'},
      {key: '1', title: 'Monday', dataType: 'gold'},
      {key: '2', title: 'Tuesday', dataType: 'gold'},
      {key: '3', title: 'Wednesday', dataType: 'gold'},
      {key: '4', title: 'Thursday', dataType: 'gold'},
      {key: '5', title: 'Friday', dataType: 'gold'},
      {key: '6', title: 'Saturday', dataType: 'gold'},
      {key: '0', title: 'Sunday', dataType: 'gold'},
    ];
    const prices = [
      {name: 'Lowest price', '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0},
      {name: 'Avg price', '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0},
      {name: 'Highest price', '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0},
    ];
    let roi = [];

    const calculate = (array: any[], [timestamp, value]: number[]) => {
      const dayOfWeek = new Date(timestamp).getDay();
      if ((!array[0][dayOfWeek]) || value < array[0][dayOfWeek]) {
        array[0][dayOfWeek] = value;
      }
      if ((!array[2][dayOfWeek]) || value > array[2][dayOfWeek]) {
        array[2][dayOfWeek] = value;
      }
      if ((!array[1][dayOfWeek])) {
        array[1][dayOfWeek] = value;
      } else {
        array[1][dayOfWeek] = (value + array[1][dayOfWeek]) / 2;
      }
    };

    filteredPrice.forEach((entry) => calculate(prices, entry));
    if (filteredCost && filteredCost.length) {
      roi = [
        {name: 'Lowest ROI', '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0},
        {name: 'Avg ROI', '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0},
        {name: 'Highest ROI', '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0},
      ];
      filteredCost.forEach(([timestamp, value], index) =>
        calculate(roi, [timestamp, filteredPrice[index][1] - value]));
    }

    return {
      columns,
      prices,
      roi,
    };
  }
}
