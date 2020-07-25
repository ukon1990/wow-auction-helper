import {ColumnDescription} from '../../table/models/column-description';
import {RuleField, RuleFieldGroup} from '../models/rule-field.model';
import {columnConfig} from './columns.data';

export const ruleFields: RuleFieldGroup[] = [
  {
    name: 'Item',
    options: [
      {
        key: 'name', name: 'Item name', column: columnConfig.item.name
      },
      {
        key: 'vendorSell', name: 'Vendor sell', column: columnConfig.item.vendorSell
      },
      {
        key: 'item.expansionId', name: 'Expansion', column: columnConfig.item.expansion
      },
      {
        key: 'item.itemClass', name: 'Item class'
      },
      {
        key: 'item.itemSubClass', name: 'Item sub class'
      },
      {
        key: 'itemLevel', name: 'Item level', column: columnConfig.item.itemLevel
      },
      {
        key: '[bonusIds]', name: 'Bonus'
      },
      {
        key: 'petLevel', name: 'Pet level', column: columnConfig.pet.level
      },
      {
        key: 'petQuality', name: 'Pet quality', column: columnConfig.pet.quality
      },
    ]
  },
  {
    name: 'Auction',
    options: [

      {
        key: 'buyout', name: 'Buyout', column: columnConfig.auction.buyout
      },
      {
        key: 'bid', name: 'Bid', column: columnConfig.auction.bid
      },
      {
        key: 'regionSaleRate', name: 'Sale rate', column: columnConfig.auction.regionSaleRate
      },
      {
        key: 'avgDailySold', name: 'Avg daily sold', column: columnConfig.auction.avgDailySold
      },
      {
        key: 'mktPrice', name: 'Market price', column: columnConfig.auction.mktPrice
      },
      {
        key: 'regionSaleAvg', name: 'Avg sales price', column: columnConfig.auction.regionSaleAvg
      },
      {
        key: 'quantityTotal', name: 'Quantity total', column: columnConfig.auction.quantityTotal
      },
      {
        key: 'past24HoursSaleRate', name: 'Sales rate past 24h(personal)', column: columnConfig.auction.past24HoursSaleRate
      },
      {
        key: 'past7DaysSaleRate', name: 'Sales rate past 7 days(personal)', column: columnConfig.auction.past7DaysSaleRate
      },
      {
        key: 'past14DaysSaleRate', name: 'Sales rate past 14 days(personal)', column: columnConfig.auction.past14DaysSaleRate
      },
      {
        key: 'past30DaysSaleRate', name: 'Sales rate past 30 days(personal)', column: columnConfig.auction.past30DaysSaleRate
      },
      {
        key: 'past60DaysSaleRate', name: 'Sales rate past 60 days(personal)', column: columnConfig.auction.past60DaysSaleRate
      },
      {
        key: 'past90DaysSaleRate', name: 'Sales rate past 90 days(personal)', column: columnConfig.auction.past90DaysSaleRate
      },
      {
        key: 'totalSaleRate', name: 'All time sales rate(personal)', column: columnConfig.auction.allTimeSaleRate
      },
    ]
  },
  {
    name: 'Source: Known recipes',
    options: [
      {
        key: 'source.recipe.0.known.name', name: 'Name', column: columnConfig.recipe.mostProfitableKnownName
      },
      {
        key: 'source.recipe.known.0.cost', name: 'Cost', column: columnConfig.recipe.mostProfitableKnownCost
      },
      {
        key: 'source.recipe.known.0.roi', name: 'ROI', column: columnConfig.recipe.mostProfitableKnownROI
      }
    ]
  },
  {
    name: 'Source: All recipes',
    options: [
      {
        key: 'source.recipe.all.0.name', name: 'Name', column: columnConfig.recipe.mostProfitableName
      },
      {
        key: 'source.recipe.all.0.cost', name: 'Cost', column: columnConfig.recipe.mostProfitableCost
      },
      {
        key: 'source.recipe.all.0.roi', name: 'ROI', column: columnConfig.recipe.mostProfitableROI
      }
    ]
  },
  {
    name: 'Source: Sold by',
    options: [
      {
        key: 'source.npc.[soldBy].name', name: 'Vendor', column: columnConfig.source.soldBy.name
      }, {
        key: 'source.npc.[soldBy].tag', name: 'Tag', column: columnConfig.source.soldBy.tag
      }, {
        key: 'source.npc.[soldBy].zoneName', name: 'Zone', column: columnConfig.source.soldBy.zoneName
      }, {
        key: 'source.npc.[soldBy].price', name: 'Sell price', column: columnConfig.source.soldBy.price
      }, {
        key: 'source.npc.[soldBy].unitPrice', name: 'Unit price', column: columnConfig.source.soldBy.unitPrice
      }, {
        key: 'source.npc.[soldBy].stackSize', name: 'Stack size', column: columnConfig.source.soldBy.stackSize
      }, {
        key: 'source.npc.[soldBy].currency', name: 'Currency', column: columnConfig.source.soldBy.currency
      }
    ]
  },
  {
    name: 'Source: Dropped by',
    options: [
      {
        key: 'source.npc.[droppedBy].name', name: 'NPC name', column: columnConfig.source.droppedBy.name
      }, {
        key: 'source.npc.[droppedBy].tag', name: 'Tag', column: columnConfig.source.droppedBy.tag
      }, {
        key: 'source.npc.[droppedBy].zoneName', name: 'Zone', column: columnConfig.source.droppedBy.zoneName
      }, {
        key: 'source.npc.[droppedBy].dropChance', name: 'Drop chance', column: columnConfig.source.droppedBy.dropChance
      }, {
        key: 'source.npc.[droppedBy].levelRange', name: 'Level range', column: columnConfig.source.droppedBy.levelRange
      }
    ]
  },
  {
    name: 'Source: Trade vendors',
    options: [
      {
        key: 'source.tradeVendor.name', name: 'Currency', column: columnConfig.source.tradeVendor.name
      },
      {
        key: 'source.tradeVendor.bestValueName', name: 'Best value', column: columnConfig.source.tradeVendor.bestValueName
      },
      {
        key: 'source.tradeVendor.roi', name: 'ROI', column: columnConfig.source.tradeVendor.roi
      },
      {
        key: 'source.tradeVendor.value', name: 'Value', column: columnConfig.source.tradeVendor.value
      },
      {
        key: 'source.tradeVendor.sourceBuyout', name: 'Source buyout', column: columnConfig.source.tradeVendor.sourceBuyout
      },
      {
        key: 'source.tradeVendor.buyout', name: 'Best value buyout', column: columnConfig.source.tradeVendor.buyout
      }
    ]
  },
  {
    name: 'Inventory',
    options: [
      {
        key: 'item.inventory.quantity', name: 'Quantity', column: columnConfig.inventory.quantity
      }
    ]
  }
];
