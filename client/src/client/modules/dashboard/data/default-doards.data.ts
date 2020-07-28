import {DashboardV2} from '../models/dashboard-v2.model';
import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';
import generateUUID from '../../../utils/uuid.util';
import {columnConfig} from './columns.data';

const profitableCrafts: DashboardV2 = {
  id: generateUUID(),
  idIsBackendGenerated: false,
  sortOrder: 0,
  idParam: 'id',
  title: 'Profitable crafts',
  columns: [
    columnConfig.item.name,
    columnConfig.auction.buyout,
    columnConfig.recipe.rank,
    columnConfig.recipe.ROI,
    columnConfig.recipe.cost,
    columnConfig.auction.regionSaleRate,
    columnConfig.item.itemLevel,
    columnConfig.shoppingCartInput
  ],
  sortRule: {
    field: columnConfig.recipe.ROI.key,
    sortDesc: true
  },
  rules: [{
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: columnConfig.auction.buyout.key,
    toValue: 1.10,
    toField: columnConfig.recipe.cost.key
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: columnConfig.auction.regionSaleRate.key,
    toValue: .15
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: columnConfig.auction.avgDailySold.key,
    toValue: 1
  }],
  data: []
};

const profitableKnownCrafts: DashboardV2 = {
  id: generateUUID(),
  idIsBackendGenerated: false,
  sortOrder: 1,
  idParam: 'id',
  title: 'Profitable known crafts',
  columns: [
    columnConfig.item.name,
    columnConfig.auction.buyout,
    columnConfig.recipe.knownRank,
    columnConfig.recipe.knownROI,
    columnConfig.recipe.knownCost,
    columnConfig.auction.regionSaleRate,
    columnConfig.item.itemLevel,
    columnConfig.shoppingCartInput
  ],
  sortRule: {
    field: columnConfig.recipe.knownROI.key,
    sortDesc: true
  },
  rules: [{
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: columnConfig.auction.buyout.key,
    toValue: 1.10,
    toField: columnConfig.recipe.knownCost.key
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: columnConfig.auction.regionSaleRate.key,
    toValue: .15
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: columnConfig.auction.avgDailySold.key,
    toValue: 1
  }],
  data: []
};

const potentialDeals: DashboardV2 = {
  id: generateUUID(),
  idIsBackendGenerated: false,
  sortOrder: 2,
  idParam: 'id',
  title: 'Potential deals',
  columns: [
    columnConfig.item.name,
    columnConfig.auction.mktPrice,
    columnConfig.auction.buyout,
    columnConfig.auction.mktPriceMinusBuyout,
    columnConfig.item.vendorSell,
    columnConfig.auction.avgDailySold,
    columnConfig.auction.regionSaleRate,
    columnConfig.auction.regionSaleAvg,
  ],
  sortRule: {
    field: 'mktPrice-buyout',
    sortDesc: true
  },
  rules: [{
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'quality',
    toValue: 0
  }, {
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
    condition: ConditionEnum.LESS_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: 'buyout',
    toValue: .75,
    toField: 'mktPrice'
  }, {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.GOLD,
    field: 'buyout',
    toValue: 0
  }],
  data: []
};

const potentialBidDeals: DashboardV2 = {
  id: generateUUID(),
  idIsBackendGenerated: false,
  sortOrder: 3,
  idParam: 'id',
  title: 'Potential bid deals',
  columns: [
    columnConfig.item.name,
    columnConfig.auction.auctionsBid,
    columnConfig.auction.buyout,
    columnConfig.auction.auctionsBidMinusBuyout,
    columnConfig.item.vendorSell,
    columnConfig.auction.quantity,
    columnConfig.auction.timeLeft
  ],
  sortRule: {
    field: columnConfig.auction.auctionsBidMinusBuyout.key,
    sortDesc: true
  },
  rules: [
    {
      condition: ConditionEnum.LESS_THAN_OR_EQUAL_TO,
      targetValueType: TargetValueEnum.GOLD,
      field: 'bid',
      toValue: .9,
      toField: 'buyout',
    }, {
      condition: ConditionEnum.GREATER_THAN,
      targetValueType: TargetValueEnum.GOLD,
      field: 'bid',
      toValue: 0
    },
    {
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
      condition: ConditionEnum.GREATER_THAN,
      targetValueType: TargetValueEnum.NUMBER,
      field: 'quality',
      toValue: 0
    }, {
      condition: ConditionEnum.GREATER_THAN,
      targetValueType: TargetValueEnum.GOLD,
      field: '[auctions].bid',
      toValue: 0
    }, {
      condition: ConditionEnum.LESS_THAN,
      targetValueType: TargetValueEnum.PERCENT,
      field: '[auctions].bid',
      toValue: .9,
      toField: 'buyout'
    }],
  data: []
};

const potentialBidDealsWith2HOrLessLeft: DashboardV2 = {
  id: generateUUID(),
  idIsBackendGenerated: false,
  sortOrder: 4,
  idParam: 'id',
  title: 'Potential 2 hour bid deals',
  columns: [
    columnConfig.item.name,
    columnConfig.auction.bid,
    columnConfig.auction.buyout,
    columnConfig.auction.auctionsBidMinusBuyout,
    columnConfig.item.vendorSell,
    columnConfig.auction.quantity,
    columnConfig.auction.timeLeft
  ],
  sortRule: {
    field: columnConfig.auction.auctionsBidMinusBuyout.key,
    sortDesc: true
  },
  rules: [...potentialBidDeals.rules, {
    condition: ConditionEnum.EQUAL_TO,
    targetValueType: TargetValueEnum.TEXT,
    field: '[auctions].timeLeft',
    toValue: 'MEDIUM',
    or: [
      {
        condition: ConditionEnum.EQUAL_TO,
        targetValueType: TargetValueEnum.TEXT,
        field: '[auctions].timeLeft',
        toValue: 'SHORT'
      }
    ]
  }],
  data: []
};

const buyoutBelowVendorSellPrice: DashboardV2 = {
  id: generateUUID(),
  idIsBackendGenerated: false,
  sortOrder: 6,
  idParam: 'id',
  title: 'Buyout below vendor sell price',
  columns: [
    columnConfig.item.name,
    columnConfig.auction.buyout,
    columnConfig.item.vendorSell,
    columnConfig.auction.buyoutVsVendorSell,
  ],
  sortRule: {
    field: 'buyout',
    sortDesc: true
  },
  rules: [{
    condition: ConditionEnum.LESS_THAN,
    targetValueType: TargetValueEnum.GOLD,
    field: 'buyout',
    toField: 'vendorSell'
  }, {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.GOLD,
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
  id: generateUUID(),
  idIsBackendGenerated: false,
  sortOrder: 6,
  idParam: 'id',
  title: 'Trade vendor currency in gold',
  sortRule: {
    field: 'source.tradeVendor.roi',
    sortDesc: true
  },
  columns: [
    {
      key: 'name', title: 'Currency', dataType: 'name', options: {
        idName: 'source.tradeVendor.sourceID'
      }
    },
    {
      key: 'source.tradeVendor.bestValueName', title: 'Target', dataType: 'name', options: {
        idName: 'source.tradeVendor.itemID'
      }
    },
    {key: 'source.tradeVendor.roi', title: 'ROI', dataType: 'gold'},
    {key: 'source.tradeVendor.value', title: 'Value', dataType: 'gold'},
    {key: 'source.tradeVendor.sourceBuyout', title: 'Currency buyout', dataType: 'gold'},
    {key: 'source.tradeVendor.buyout', title: 'Buyout', dataType: 'gold'}
  ],
  rules: [{
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'source.tradeVendor.sourceBuyout',
    toValue: 0,
  }, {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'source.tradeVendor.value',
    toValue: 0,
  }, {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'source.tradeVendor.roi',
    toValue: 0,
  }, {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'regionSaleRate',
    toValue: .1,
  }],
  data: []
};

const getKnownProfessionBoards: DashboardV2[] = [
  {id: 794, name: 'Archaelogy'},
  {id: 171, name: 'Alchemy'},
  {id: 164, name: 'Blacksmithing'},
  {id: 185, name: 'Cooking'},
  {id: 202, name: 'Engineering'},
  {id: 333, name: 'Enchanting'},
  {id: 356, name: 'Fishing'},
  {id: 182, name: 'Herbalism'},
  {id: 773, name: 'Inscription'},
  {id: 755, name: 'Jewelcrafting'},
  {id: 165, name: 'Leatherworking'},
  {id: 186, name: 'Mining'},
  {id: 393, name: 'Skinning'},
  {id: 197, name: 'Tailoring'}
].map(p => ({
  id: generateUUID(),
  idIsBackendGenerated: false,
  sortOrder: 1,
  idParam: 'id',
  title: p.name,
  columns: [
    columnConfig.item.name,
    columnConfig.auction.buyout,
    columnConfig.recipe.knownRank,
    columnConfig.recipe.knownROI,
    columnConfig.recipe.knownCost,
    columnConfig.auction.regionSaleRate,
    columnConfig.item.itemLevel,
    columnConfig.shoppingCartInput
  ],
  sortRule: {
    field: columnConfig.recipe.knownROI.key,
    sortDesc: true
  },
  rules: [{
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: columnConfig.auction.buyout.key,
    toValue: 1.10,
    toField: columnConfig.recipe.knownCost.key
  }, {
    condition: ConditionEnum.EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: columnConfig.recipe.knownProfession.key,
    toValue: p.id
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: columnConfig.auction.regionSaleRate.key,
    toValue: .15
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: columnConfig.auction.avgDailySold.key,
    toValue: 1
  }],
  data: []
}));

export const defaultBoards: DashboardV2[] = [
  profitableCrafts,
  profitableKnownCrafts,
  ...getKnownProfessionBoards,
  potentialDeals,
  potentialBidDeals,
  potentialBidDealsWith2HOrLessLeft,
  buyoutBelowVendorSellPrice,
  tradeVendorCurrencyInGold
];
