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
        columnConfig.recipe.mostProfitableRank,
        columnConfig.recipe.mostProfitableROI,
        columnConfig.auction.regionSaleRate
    ],
    sortRule: {
        field: columnConfig.recipe.mostProfitableROI.key,
        sortDesc: true
    },
    rules: [{
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: columnConfig.recipe.mostProfitableROI.key,
        toValue: 1.10
    }, {
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: columnConfig.auction.regionSaleRate.key,
        toValue: .10
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
        columnConfig.recipe.mostProfitableKnownRank,
        columnConfig.recipe.mostProfitableKnownROI,
        columnConfig.auction.regionSaleRate
    ],
    sortRule: {
        field: columnConfig.recipe.mostProfitableKnownROI.key,
        sortDesc: true
    },
    rules: [{
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: columnConfig.recipe.mostProfitableKnownROI.key,
        toValue: 1.10
    }, {
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: columnConfig.auction.regionSaleRate.key,
        toValue: .10
    }, {
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: columnConfig.auction.avgDailySold.key,
        toValue: 1
    }],
    data: []
};

const potentialBidDeals: DashboardV2 = {
    id: generateUUID(),
    idIsBackendGenerated: false,
    sortOrder: 2,
    idParam: 'id',
    title: 'Potential 2 hour bid deals',
    columns: [
        columnConfig.item.name,
        columnConfig.auction.bid,
        columnConfig.auction.buyout,
        columnConfig.auction.bidVsBuyout,
        columnConfig.item.vendorSell,
        columnConfig.auction.quantity,
        columnConfig.auction.timeLeft
    ],
    sortRule: {
        field: 'bid',
        sortDesc: true
    },
    rules: [{
        condition: ConditionEnum.LESS_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: 'bid',
        toValue: .9,
        toField: 'buyout',
    },
        /*
      [{
        condition: ConditionEnum.EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: '[auctions].timeLeft',
        toValue: 'MEDIUM'
      }, {
        condition: ConditionEnum.EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: '[auctions].timeLeft',
        toValue: 'SHORT'
      }],
      */{
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
    id: generateUUID(),
    idIsBackendGenerated: false,
    sortOrder: 3,
    idParam: 'id',
    title: 'Buyout below vendor sell price',
    columns: [
        {key: 'name', title: 'Name', dataType: 'name'},
        {key: 'buyout', title: 'Buyout', dataType: 'gold'},
        {key: 'vendorSell', title: 'Vendor sell', dataType: 'gold'}
    ],
    sortRule: {
        field: 'buyout',
        sortDesc: true
    },
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
    id: generateUUID(),
    idIsBackendGenerated: false,
    sortOrder: 4,
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
        {key: 'source.tradeVendor.roi', title: 'Roi', dataType: 'gold'},
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

export const defaultBoards: DashboardV2[] = [
    profitableCrafts,
    profitableKnownCrafts,
    potentialBidDeals,
    buyoutBelowVendorSellPrice,
    tradeVendorCurrencyInGold
];
