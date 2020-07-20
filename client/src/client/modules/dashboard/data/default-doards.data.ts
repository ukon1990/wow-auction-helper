import {DashboardV2} from '../models/dashboard-v2.model';
import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';

const profitableCrafts = {
  id: 'asd-dsa',
  idParam: 'id',
  title: 'Profitable crafts',
  columns: [{
    key: 'name',
    title: 'Name',
    dataType: 'name',
  }, {
    key: 'buyout',
    title: 'Buyout',
    dataType: 'gold',
  }, {
    key: 'source.recipe.all.0.rank',
    title: 'Rank',
    dataType: 'number'
  }, {
    key: 'source.recipe.all.0.roi',
    title: 'Profit',
    dataType: 'gold'
  }, {
    key: 'regionSaleRate',
    title: 'Sale rate',
    dataType: 'percent'
  }],
  rules: [{
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'source.recipe.all.0.roi',
    toValue: 1.10
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'regionSaleRate',
    toValue: .10
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'avgDailySold',
    toValue: 1
  }],
  data: []
};

const profitableKnownCrafts = {
  id: 'asd-dsa',
  idParam: 'id',
  title: 'Profitable known crafts',
  columns: [{
    key: 'name',
    title: 'Name',
    dataType: 'name',
  }, {
    key: 'buyout',
    title: 'Buyout',
    dataType: 'gold',
  }, {
    key: 'source.recipe.known.0.rank',
    title: 'Rank',
    dataType: 'number'
  }, {
    key: 'source.recipe.known.0.roi',
    title: 'Profit',
    dataType: 'gold'
  }, {
    key: 'regionSaleRate',
    title: 'Sale rate',
    dataType: 'percent'
  }],
  rules: [{
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'source.recipe.known.0.roi',
    toValue: 1.10
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'regionSaleRate',
    toValue: .10
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'avgDailySold',
    toValue: 1
  }],
  data: []
};

const potentialBidDeals: DashboardV2 = {
  id: 'asd-dsa',
  idParam: 'id',
  title: 'Potential 2 hour bid deals',
  columns: [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'bid', title: 'Bid/item', dataType: 'gold-per-item'},
    {key: 'minBuyout', title: 'Min buyout/item', dataType: 'gold-per-item', hideOnMobile: true},
    {key: 'bid/buyout', title: 'Profit', dataType: 'gold'},
    {key: 'vendorSell', title: 'Vendor sell', dataType: 'gold', hideOnMobile: true},
    {key: 'quantity', title: 'Size', dataType: 'number'},
    {key: 'timeLeft', title: 'Time left', dataType: 'time-left'}
  ],
  rules: [{
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: '[auctions].buyout',
    toValue: 1.10
  },/* [{
    condition: ConditionEnum.EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: '[auctions].timeLeft',
    toValue: 'MEDIUM'
  }, {
    condition: ConditionEnum.EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: '[auctions].timeLeft',
    toValue: 'SHORT'
  }], */{
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'regionSaleRate',
    toValue: .30
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'avgDailySold',
    toValue: 1
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: 'bid',
    toValue: .1,
    toField: 'buyout'
  }],
  data: []
};

const buyoutBelowVendorSellPrice: DashboardV2 = {
  id: 'asd-dsa',
  idParam: 'id',
  title: 'Buyout below vendor sell price',
  columns: [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: 'vendorSell', title: 'Vendor sell', dataType: 'gold'}
  ],
  rules: [{
    condition: ConditionEnum.LESS_THAN,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'buyout',
    toField: 'vendorSell'
  }, {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'buyout',
    toValue: 0
  }, {
    condition: ConditionEnum.IS_NOT,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'item.itemClass',
    toValue: 4
  }, {
    condition: ConditionEnum.IS_NOT,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'item.itemClass',
    toValue: 2
  }],
  data: []
};

const tradeVendorCurrencyInGold: DashboardV2 = {
  id: 'asd-dsa',
  idParam: 'id',
  title: 'Trade vendor currency in gold',
  columns: [
    {key: 'source.npc.soldBy.0.currency', title: 'Name', dataType: 'name', options: {idName: 'sourceID'}},
    {key: 'name', title: 'Target', dataType: 'name'},
    {key: 'roi', title: 'Roi', dataType: 'gold'},
    {key: 'value', title: 'Value', dataType: 'gold'},
    {key: 'sourceBuyout', title: 'Source buyout', dataType: 'gold'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'}
  ],
  rules: [{
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'source.npc.soldBy.length',
    toValue: 0,
  }, {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'source.npc.soldBy.0.currency',
    toValue: 0,
  }],
  data: []
};

export const defaultBoards: DashboardV2[] = [
  profitableCrafts,
  profitableKnownCrafts,
  potentialBidDeals,
  buyoutBelowVendorSellPrice,
  tradeVendorCurrencyInGold
];
