import {DashboardV2} from '../models/dashboard-v2.model';
import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';
import {columnConfig} from './columns.data';
import {Profession} from '@shared/models/profession/profession.model';

enum BoardModifiedDate {
  DECEMBER_27_2020 = 1609059487771,
  DECEMBER_19_2020 = 1608352139874,
  JULY_24_2020 = 1595541600000,
}
const previousTimestamps = [
  BoardModifiedDate.DECEMBER_19_2020,
  BoardModifiedDate.JULY_24_2020,
];


const profitableCrafts: DashboardV2 = {
  id: 'default-profitable-crafts',
  idIsBackendGenerated: false,
  sortOrder: 0,
  idParam: 'id',
  title: 'Profitable crafts',
  tags: ['Crafting'],
  columns: [
    columnConfig.item.name,
    columnConfig.auction.buyout,
    columnConfig.recipe.rank,
    columnConfig.recipe.ROI,
    columnConfig.recipe.ROIPercent,
    columnConfig.recipe.cost,
    // columnConfig.auction.regionSaleRate,
    columnConfig.item.itemLevel,
    columnConfig.recipe.shoppingCartInput
  ],
  sortRule: {
    field: columnConfig.recipe.ROI.key,
    sortDesc: true
  },
  rules: [{
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: columnConfig.auction.buyout.key,
    toValue: 110,
    toField: columnConfig.recipe.cost.key
  }
  /* , {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: columnConfig.auction.regionSaleRate.key,
    toValue: 15
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: columnConfig.auction.avgDailySold.key,
    toValue: 1
  }*/
  ],
  data: [],
  lastModified: BoardModifiedDate.DECEMBER_19_2020
};

const profitableKnownCrafts: DashboardV2 = {
  id: 'default-profitable-known-crafts',
  idIsBackendGenerated: false,
  sortOrder: 1,
  idParam: 'id',
  title: 'Profitable known crafts',
  tags: ['Crafting'],
  columns: [
    columnConfig.item.name,
    columnConfig.auction.buyout,
    columnConfig.recipe.knownRank,
    columnConfig.recipe.knownROI,
    columnConfig.recipe.knownROIPercent,
    columnConfig.recipe.knownCost,
    // columnConfig.auction.regionSaleRate,
    columnConfig.item.itemLevel,
    columnConfig.recipe.shoppingCartInput,
  ],
  sortRule: {
    field: columnConfig.recipe.knownROI.key,
    sortDesc: true
  },
  rules: [{
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: columnConfig.auction.buyout.key,
    toValue: 110,
    toField: columnConfig.recipe.knownCost.key
  }
  /*, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: columnConfig.auction.regionSaleRate.key,
    toValue: 15
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: columnConfig.auction.avgDailySold.key,
    toValue: 1
  }*/
  ],
  data: [],
  lastModified: BoardModifiedDate.DECEMBER_19_2020
};

const potentialDeals: DashboardV2 = {
  id: 'default-potential-deals',
  idIsBackendGenerated: false,
  sortOrder: 2,
  idParam: 'id',
  title: 'Potential deals',
  tags: ['Deals'],
  columns: [
    columnConfig.item.name,
    columnConfig.auction.mktPrice,
    columnConfig.auction.buyout,
    columnConfig.auction.mktPriceMinusBuyout,
    columnConfig.item.vendorSell,
    // columnConfig.auction.avgDailySold,
    // columnConfig.auction.regionSaleRate,
    // columnConfig.auction.regionSaleAvg,
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
  }
  /*
  , {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: 'regionSaleRate',
    toValue: 30
  }, {
    condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.NUMBER,
    field: 'avgDailySold',
    toValue: 1
  }*/
    , {
    condition: ConditionEnum.LESS_THAN_OR_EQUAL_TO,
    targetValueType: TargetValueEnum.PERCENT,
    field: 'buyout',
    toValue: 75,
    toField: 'mktPrice'
  }, {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.GOLD,
    field: 'buyout',
    toValue: '0c'
  }],
  data: [],
  lastModified: BoardModifiedDate.DECEMBER_19_2020
};

const potentialBidDeals: DashboardV2 = {
  id: 'default-potential-bid-deals',
  idIsBackendGenerated: false,
  sortOrder: 3,
  idParam: 'id',
  title: 'Potential bid deals',
  tags: ['Deals'],
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
      targetValueType: TargetValueEnum.PERCENT,
      field: 'bid',
      toValue: .9,
      toField: 'buyout',
    }, {
      condition: ConditionEnum.GREATER_THAN,
      targetValueType: TargetValueEnum.GOLD,
      field: 'bid',
      toValue: '0c'
    },
    /*
    {
      condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
      targetValueType: TargetValueEnum.PERCENT,
      field: 'regionSaleRate',
      toValue: 30
    }, {
      condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
      targetValueType: TargetValueEnum.NUMBER,
      field: 'avgDailySold',
      toValue: 1
    },
    */{
      condition: ConditionEnum.GREATER_THAN,
      targetValueType: TargetValueEnum.NUMBER,
      field: 'quality',
      toValue: 0
    }, {
      condition: ConditionEnum.GREATER_THAN,
      targetValueType: TargetValueEnum.GOLD,
      field: '[auctions].bid',
      toValue: '0c'
    }, {
      condition: ConditionEnum.LESS_THAN,
      targetValueType: TargetValueEnum.PERCENT,
      field: '[auctions].bid',
      toValue: 90,
      toField: 'buyout'
    }],
  data: [],
  lastModified: BoardModifiedDate.DECEMBER_19_2020
};

const potentialBidDealsWith2HOrLessLeft: DashboardV2 = {
  id: 'default-potential-bid-deals-with-2hours-or-less',
  idIsBackendGenerated: false,
  sortOrder: 4,
  idParam: 'id',
  title: 'Potential 2 hour bid deals',
  tags: ['Deals'],
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
  data: [],
  lastModified: BoardModifiedDate.JULY_24_2020
};

const buyoutBelowVendorSellPrice: DashboardV2 = {
  id: 'default-buyout-below-vendor-sell-price',
  idIsBackendGenerated: false,
  sortOrder: 6,
  idParam: 'id',
  title: 'Buyout below vendor sell price',
  tags: ['Deals'],
  columns: [
    columnConfig.item.name,
    columnConfig.auction.buyout,
    columnConfig.item.vendorSell,
    columnConfig.auction.vendorSellVsBuyout,
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
    toValue: '0c'
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
  data: [],
  lastModified: BoardModifiedDate.JULY_24_2020
};

const tradeVendorCurrencyInGold: DashboardV2 = {
  id: 'default-trade-vendor-currency-in-gold',
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
    targetValueType: TargetValueEnum.GOLD,
    field: 'source.tradeVendor.sourceBuyout',
    toValue: '0c',
  }, {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.GOLD,
    field: 'source.tradeVendor.value',
    toValue: '0c',
  }, {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.GOLD,
    field: 'source.tradeVendor.roi',
    toValue: '0c',
  },
  /*
  {
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.PERCENT,
    field: 'regionSaleRate',
    toValue: 10,
  }
  */
  ],
  data: [],
  lastModified: BoardModifiedDate.DECEMBER_19_2020
};

const getKnownProfessionBoards = (professions: Profession[]): DashboardV2[] => professions.map(p => (
  {
    id: 'default-get-known-profession-' + p.id,
    idIsBackendGenerated: false,
    sortOrder: 1,
    idParam: 'id',
    title: p.name,
    tags: ['Crafting'],
    columns: profitableKnownCrafts.columns,
    sortRule: {
      field: columnConfig.recipe.knownROI.key,
      sortDesc: true
    },
    rules: [{
      condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
      targetValueType: TargetValueEnum.PERCENT,
      field: columnConfig.auction.buyout.key,
      toValue: 110,
      toField: columnConfig.recipe.knownCost.key
    }, {
      condition: ConditionEnum.EQUAL_TO,
      targetValueType: TargetValueEnum.NUMBER,
      field: columnConfig.recipe.knownProfession.key,
      toValue: p.id
    },
      /*
      {
      condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
      targetValueType: TargetValueEnum.PERCENT,
      field: columnConfig.auction.regionSaleRate.key,
      toValue: 15
    }, {
      condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
      targetValueType: TargetValueEnum.NUMBER,
      field: columnConfig.auction.avgDailySold.key,
      toValue: 1
    }*/
    ],
    data: [],
    lastModified: BoardModifiedDate.DECEMBER_19_2020
  }));

const destroyBoards = ['milling', 'prospecting'].map((type: string): DashboardV2 => ({
  id: `default-${type}`,
  idIsBackendGenerated: false,
  sortOrder: 6,
  idParam: 'id',
  title: `Profitable ${type}`,
  tags: ['Destroy'],
  sortRule: {
    field: `source.destroy.${type}.sourceIn.yield`,
    sortDesc: true
  },
  columns: [
    {
      key: 'name', title: 'ItemModel name', dataType: 'name'
    },
    {key: 'buyout', title: 'Value', dataType: 'gold'},
    {key: `source.destroy.${type}.sourceIn.yield`, title: 'ROI', dataType: 'gold'},
  ],
  rules: [{
    condition: ConditionEnum.GREATER_THAN,
    targetValueType: TargetValueEnum.GOLD,
    field: `source.destroy.${type}.sourceIn.yield`,
    toValue: '0c',
  },
  ],
  data: [],
  lastModified: BoardModifiedDate.DECEMBER_19_2020
}));

export const getDefaultDashboards = (professions: Profession[]): DashboardV2[] => [
  profitableCrafts,
  profitableKnownCrafts,
  ...getKnownProfessionBoards(professions),
  // TODO: FInd a better rule for them, as TSM data is no longer available -> potentialDeals,
  potentialBidDeals,
  potentialBidDealsWith2HOrLessLeft,
  buyoutBelowVendorSellPrice,
  tradeVendorCurrencyInGold,
  ...destroyBoards
];