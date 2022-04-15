import {RuleFieldGroup} from '../models/rule-field.model';
import {columnConfig} from './columns.data';
import {TargetValueEnum} from '../types/target-value.enum';

export const ruleFields: RuleFieldGroup[] = [
  {
    name: 'Item',
    options: [
      {
        key: 'name',
        name: 'ItemModel name',
        column: columnConfig.item.name,
        defaultType: TargetValueEnum.TEXT
      },
      {
        key: 'vendorSell',
        name: 'Vendor sell',
        column: columnConfig.item.vendorSell,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: 'item.expansionId',
        name: 'Expansion',
        column: columnConfig.item.expansion,
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: 'item.itemClass',
        name: 'ItemModel class',
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: 'item.itemSubClass',
        name: 'ItemModel sub class',
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: 'quality',
        name: 'Quality',
        column: columnConfig.item.quality,
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: 'itemLevel',
        name: 'ItemModel level',
        column: columnConfig.item.itemLevel,
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: '[bonusIds]',
        name: 'Bonus',
        defaultType: null
      },
      {
        key: 'petLevel',
        name: 'Pet level',
        column: columnConfig.pet.level,
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: 'petQuality',
        name: 'Pet quality',
        column: columnConfig.pet.quality,
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: columnConfig.item.shoppingCartInput.key,
        name: 'ItemModel shopping cart input',
        column: columnConfig.item.shoppingCartInput,
        defaultType: TargetValueEnum.NUMBER
      },
    ]
  },
  {
    name: 'Auction',
    options: [
      {
        key: 'buyout',
        name: 'Buyout',
        column: columnConfig.auction.buyout,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: 'bid',
        name: 'Lowest bid',
        column: columnConfig.auction.bid,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: '[auctions].bid',
        name: 'Auction bid',
        column: columnConfig.auction.bid,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: columnConfig.auction.vendorSellVsBuyout.key,
        name: columnConfig.auction.vendorSellVsBuyout.title,
        column: columnConfig.auction.vendorSellVsBuyout,
        defaultType: TargetValueEnum.PERCENT
      },
      {
        key: columnConfig.auction.buyoutVsVendorSell.key,
        name: columnConfig.auction.buyoutVsVendorSell.title,
        column: columnConfig.auction.buyoutVsVendorSell,
        defaultType: TargetValueEnum.PERCENT
      }, {
        key: columnConfig.auction.timeLeft.key,
        name: columnConfig.auction.timeLeft.title,
        column: columnConfig.auction.timeLeft,
        defaultType: TargetValueEnum.TEXT
      },
      {
        key: columnConfig.auction.pricePast24HoursTrend.key,
        name: columnConfig.auction.pricePast24HoursTrend.title,
        column: columnConfig.auction.pricePast24HoursTrend,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: columnConfig.auction.quantityPast24HoursTrend.key,
        name: columnConfig.auction.quantityPast24HoursTrend.title,
        column: columnConfig.auction.quantityPast24HoursTrend,
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: columnConfig.auction.pricePast7DaysTrend.key,
        name: columnConfig.auction.pricePast7DaysTrend.title,
        column: columnConfig.auction.pricePast7DaysTrend,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: columnConfig.auction.quantityPast7DaysTrend.key,
        name: columnConfig.auction.quantityPast7DaysTrend.title,
        column: columnConfig.auction.quantityPast7DaysTrend,
        defaultType: TargetValueEnum.NUMBER
      },
      /* TODO: If TSM is public again
      {
        key: 'regionSaleRate',
        name: 'Sale rate',
        column: columnConfig.auction.regionSaleRate,
        defaultType: TargetValueEnum.PERCENT
      },
      {
        key: 'avgDailySold',
        name: 'Avg daily sold',
        column: columnConfig.auction.avgDailySold,
        defaultType: TargetValueEnum.NUMBER
      },
      */
      {
        key: 'mktPrice',
        name: 'Market price',
        column: columnConfig.auction.mktPrice,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: columnConfig.auction.buyoutVsMktPrice.key,
        name: columnConfig.auction.buyoutVsMktPrice.title,
        column: columnConfig.auction.buyoutVsMktPrice,
        defaultType: TargetValueEnum.PERCENT
      },
      /* TODO: If TSM is public again
      {
        key: 'regionSaleAvg',
        name: 'Avg sales price',
        column: columnConfig.auction.regionSaleAvg,
        defaultType: TargetValueEnum.GOLD
      },*/
      {
        key: 'quantityTotal',
        name: 'Quantity total',
        column: columnConfig.auction.quantityTotal,
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: 'past24HoursSaleRate',
        name: 'Sales rate past 24h(personal)',
        column: columnConfig.auction.past24HoursSaleRate,
        defaultType: TargetValueEnum.PERCENT
      },
      {
        key: 'past7DaysSaleRate',
        name: 'Sales rate past 7 days(personal)',
        column: columnConfig.auction.past7DaysSaleRate,
        defaultType: TargetValueEnum.PERCENT
      },
      {
        key: 'past14DaysSaleRate',
        name: 'Sales rate past 14 days(personal)',
        column: columnConfig.auction.past14DaysSaleRate,
        defaultType: TargetValueEnum.PERCENT
      },
      {
        key: 'past30DaysSaleRate',
        name: 'Sales rate past 30 days(personal)',
        column: columnConfig.auction.past30DaysSaleRate,
        defaultType: TargetValueEnum.PERCENT
      },
      {
        key: 'past60DaysSaleRate',
        name: 'Sales rate past 60 days(personal)',
        column: columnConfig.auction.past60DaysSaleRate,
        defaultType: TargetValueEnum.PERCENT
      },
      {
        key: 'past90DaysSaleRate',
        name: 'Sales rate past 90 days(personal)',
        column: columnConfig.auction.past90DaysSaleRate,
        defaultType: TargetValueEnum.PERCENT
      },
      {
        key: 'totalSaleRate',
        name: 'All time sales rate(personal)',
        column: columnConfig.auction.allTimeSaleRate,
        defaultType: TargetValueEnum.PERCENT
      },
    ]
  },
  {
    name: 'Source: Known recipes',
    options: [
      {
        key: columnConfig.recipe.knownName.key,
        name: 'Name',
        column: columnConfig.recipe.knownName,
        defaultType: TargetValueEnum.TEXT
      },
      {
        key: columnConfig.recipe.knownRank.key,
        name: 'Rank',
        column: columnConfig.recipe.knownRank,
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: columnConfig.recipe.knownCost.key,
        name: 'Cost',
        column: columnConfig.recipe.knownCost,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: columnConfig.recipe.knownROI.key,
        name: 'ROI',
        column: columnConfig.recipe.knownROI,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: columnConfig.recipe.knownROIPercent.key,
        name: 'ROI %',
        column: columnConfig.recipe.knownROIPercent,
        defaultType: TargetValueEnum.PERCENT
      },
      {
        key: columnConfig.recipe.knownProfession.key,
        name: 'Profession',
        column: columnConfig.recipe.knownProfession,
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: columnConfig.recipe.shoppingCartInput.key,
        name: 'Recipe shopping cart input',
        column: columnConfig.recipe.shoppingCartInput,
        defaultType: TargetValueEnum.NUMBER
      }
    ]
  },
  {
    name: 'Source: All recipes',
    options: [
      {
        key: undefined,
        name: 'Add to cart action',
        column: columnConfig.recipe.shoppingCartInput,
        defaultType: TargetValueEnum.INPUT_NUMBER
      },
      {
        key: columnConfig.recipe.name.key,
        name: 'Name',
        column: columnConfig.recipe.name,
        defaultType: TargetValueEnum.TEXT
      },
      {
        key: columnConfig.recipe.rank.key,
        name: 'Rank',
        column: columnConfig.recipe.rank,
        defaultType: TargetValueEnum.NUMBER
      },
      {
        key: columnConfig.recipe.cost.key,
        name: 'Cost',
        column: columnConfig.recipe.cost,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: columnConfig.recipe.ROI.key,
        name: 'ROI',
        column: columnConfig.recipe.ROI,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: columnConfig.recipe.ROIPercent.key,
        name: 'ROI %',
        column: columnConfig.recipe.ROIPercent,
        defaultType: TargetValueEnum.PERCENT
      },
      {
        key: columnConfig.recipe.profession.key,
        name: 'Profession',
        column: columnConfig.recipe.profession,
        defaultType: TargetValueEnum.NUMBER
      }
    ]
  },
  {
    name: 'Source: Sold by',
    options: [
      {
        key: 'source.npc.[soldBy].name',
        name: 'Vendor',
        column: columnConfig.source.soldBy.name,
        defaultType: TargetValueEnum.TEXT
      }, {
        key: 'source.npc.[soldBy].tag',
        name: 'Tag',
        column: columnConfig.source.soldBy.tag,
        defaultType: TargetValueEnum.TEXT
      }, {
        key: 'source.npc.[soldBy].zoneName',
        name: 'Zone',
        column: columnConfig.source.soldBy.zoneName,
        defaultType: TargetValueEnum.TEXT
      }, {
        key: 'source.npc.[soldBy].price',
        name: 'Sell price',
        column: columnConfig.source.soldBy.price,
        defaultType: TargetValueEnum.GOLD
      }, {
        key: 'source.npc.[soldBy].unitPrice',
        name: 'Unit price',
        column: columnConfig.source.soldBy.unitPrice,
        defaultType: TargetValueEnum.GOLD
      }, {
        key: 'source.npc.[soldBy].stackSize',
        name: 'Stack size',
        column: columnConfig.source.soldBy.stackSize,
        defaultType: TargetValueEnum.NUMBER
      }, {
        key: 'source.npc.[soldBy].currency',
        name: 'Currency',
        column: columnConfig.source.soldBy.currency,
        defaultType: TargetValueEnum.NUMBER
      }
    ]
  },
  {
    name: 'Source: Dropped by',
    options: [
      {
        key: 'source.npc.[droppedBy].name',
        name: 'NPC name',
        column: columnConfig.source.droppedBy.name,
        defaultType: TargetValueEnum.TEXT
      }, {
        key: 'source.npc.[droppedBy].tag',
        name: 'Tag',
        column: columnConfig.source.droppedBy.tag,
        defaultType: TargetValueEnum.TEXT
      }, {
        key: 'source.npc.[droppedBy].zoneName',
        name: 'Zone',
        column: columnConfig.source.droppedBy.zoneName,
        defaultType: TargetValueEnum.TEXT
      }, {
        key: 'source.npc.[droppedBy].dropChance',
        name: 'Drop chance',
        column: columnConfig.source.droppedBy.dropChance,
        defaultType: TargetValueEnum.NUMBER
      }, {
        key: 'source.npc.[droppedBy].levelRange',
        name: 'Level range',
        column: columnConfig.source.droppedBy.levelRange,
        defaultType: TargetValueEnum.TEXT
      }
    ]
  },
  {
    name: 'Source: Trade vendors',
    options: [
      {
        key: 'source.tradeVendor.name',
        name: 'Currency',
        column: columnConfig.source.tradeVendor.name,
        defaultType: TargetValueEnum.TEXT
      },
      {
        key: 'source.tradeVendor.bestValueName',
        name: 'Best value',
        column: columnConfig.source.tradeVendor.bestValueName,
        defaultType: TargetValueEnum.TEXT
      },
      {
        key: 'source.tradeVendor.roi',
        name: 'ROI',
        column: columnConfig.source.tradeVendor.roi,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: 'source.tradeVendor.value',
        name: 'Value',
        column: columnConfig.source.tradeVendor.value,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: 'source.tradeVendor.sourceBuyout',
        name: 'Source buyout',
        column: columnConfig.source.tradeVendor.sourceBuyout,
        defaultType: TargetValueEnum.GOLD
      },
      {
        key: 'source.tradeVendor.buyout',
        name: 'Best value buyout',
        column: columnConfig.source.tradeVendor.buyout,
        defaultType: TargetValueEnum.GOLD
      }
    ]
  },
  {
    name: 'Destroying: Prospecting',
    options: [
      {
        key: columnConfig.prospecting.name.key,
        name: columnConfig.prospecting.name.title,
        column: columnConfig.prospecting.name,
        defaultType: TargetValueEnum.TEXT
      },
      {
        key: columnConfig.prospecting.yield.key,
        name: columnConfig.prospecting.yield.title,
        column: columnConfig.prospecting.yield,
        defaultType: TargetValueEnum.GOLD
      }
    ]
  },
  {
    name: 'Destroying: Milling',
    options: [
      {
        key: columnConfig.milling.name.key,
        name: columnConfig.milling.name.title,
        column: columnConfig.milling.name,
        defaultType: TargetValueEnum.TEXT
      },
      {
        key: columnConfig.milling.yield.key,
        name: columnConfig.milling.yield.title,
        column: columnConfig.milling.yield,
        defaultType: TargetValueEnum.GOLD
      }
    ]
  },
  {
    name: 'Inventory',
    options: [
      {
        key: 'item.inventory.quantity',
        name: 'Quantity',
        column: columnConfig.inventory.quantity,
        defaultType: TargetValueEnum.NUMBER
      }
    ]
  }
];