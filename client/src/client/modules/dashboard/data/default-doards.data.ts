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

export const defaultBoards: DashboardV2[] = [
  profitableCrafts,
  profitableKnownCrafts,
];
