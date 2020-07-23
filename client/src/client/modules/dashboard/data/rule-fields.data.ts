import {ColumnDescription} from '../../table/models/column-description';
import {RuleField, RuleFieldGroup} from '../models/rule-field.model';

export const ruleFields: RuleFieldGroup[] = [
  {
    name: 'Item',
    options: [
      {
        key: 'name', name: 'Item name', column: {
          key: 'name', title: 'Name', dataType: 'name'
        }
      },
      {
        key: 'vendorSell', name: 'Vendor sell', column: {
          key: 'vendorSell', title: 'Vendor sell', dataType: 'gold'
        }
      },
      {
        key: 'item.expansionId', name: 'Expansion', column: {
          key: 'item.expansionId', title: 'Expansion', dataType: 'expansion'
        }
      },
      {
        key: 'item.itemSubClass', name: 'Item sub class'/*, column: {
          key: 'petQuality', title: 'Item class', dataType: 'number'
        }*/
      },
      {
        key: 'item.itemSubClass', name: 'Item sub class'/*, column: {
          key: 'petQuality', title: 'Item class', dataType: 'number'
        }*/
      },
      {
        key: 'itemLevel', name: 'Item level', column: {
          key: 'itemLevel', title: 'Item level', dataType: 'number'
        }
      },
      {
        key: '[bonusIds]', name: 'Bonus'
      },
      {
        key: 'petLevel', name: 'Pet level', column: {
          key: 'petLevel', title: 'Pet level', dataType: 'number'
        }
      },
      {
        key: 'petQuality', name: 'Pet quality', column: {
          key: 'petQuality', title: 'Pet quality', dataType: 'number'
        }
      },
    ]
  },
  {
    name: 'Auction',
    options: [

      {
        key: 'buyout', name: 'Buyout', column: {
          key: 'buyout', title: 'Buyout', dataType: 'gold'
        }
      },
      {
        key: 'bid', name: 'Bid', column: {
          key: 'bid', title: 'Bid', dataType: 'gold'
        }
      },
      {
        key: 'regionSaleRate', name: 'Sale rate', column: {
          key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent'
        }
      },
      {
        key: 'avgDailySold', name: 'Avg daily sold', column: {
          key: 'avgDailySold', title: 'Avg daily sold', dataType: 'number'
        }
      },
      {
        key: 'mktPrice', name: 'Market price', column: {
          key: 'mktPrice', title: 'Market price', dataType: 'gold'
        }
      },
      {
        key: 'regionSaleAvg', name: 'Avg sales price', column: {
          key: 'regionSaleAvg', title: 'Avg sales price', dataType: 'gold'
        }
      },
      {
        key: 'quantityTotal', name: 'Quantity total', column: {
          key: 'quantityTotal', title: 'Quantity total', dataType: 'number'
        }
      },
      {
        key: 'past24HoursSaleRate', name: 'Sales rate past 24h(personal)', column: {
          key: 'past24HoursSaleRate', title: '24h Sale rate', dataType: 'percent'
        }
      },
      {
        key: 'past7DaysSaleRate', name: 'Sales rate past 7 days(personal)', column: {
          key: 'past7DaysSaleRate', title: '7 days Sale rate', dataType: 'percent'
        }
      },
      {
        key: 'past14DaysSaleRate', name: 'Sales rate past 14 days(personal)', column: {
          key: 'past14DaysSaleRate', title: '14 days Sale rate', dataType: 'percent'
        }
      },
      {
        key: 'past30DaysSaleRate', name: 'Sales rate past 30 days(personal)', column: {
          key: 'past30DaysSaleRate', title: '30 days Sale rate', dataType: 'percent'
        }
      },
      {
        key: 'past60DaysSaleRate', name: 'Sales rate past 60 days(personal)', column: {
          key: 'past60DaysSaleRate', title: '60 days Sale rate', dataType: 'percent'
        }
      },
      {
        key: 'past90DaysSaleRate', name: 'Sales rate past 90 days(personal)', column: {
          key: 'past90DaysSaleRate', title: '90 days Sale rate', dataType: 'percent'
        }
      },
      {
        key: 'totalSaleRate', name: 'All time sales rate(personal)', column: {
          key: 'totalSaleRate', title: 'All time Sale rate', dataType: 'percent'
        }
      },
    ]
  },
  {
    name: 'Source: Known recipes',
    options: [
      {
        key: 'source.recipe.0.known.name', name: 'Name', column: {
          key: 'source.recipe.0.known.name', title: 'Name', dataType: 'name'
        }
      },
      {
        key: 'source.recipe.known.0.cost', name: 'Cost', column: {
          key: 'source.recipe.known.0.cost', title: 'Cost', dataType: 'gold'
        }
      },
      {
        key: 'source.recipe.known.0.roi', name: 'ROI', column: {
          key: 'source.recipe.known.0.roi', title: 'ROI', dataType: 'gold'
        }
      }
    ]
  },
  {
    name: 'Source: All recipes',
    options: [
      {
        key: 'source.recipe.all.0.name', name: 'Name', column: {
          key: 'source.recipe.all.0.name', title: 'Name', dataType: 'name'
        }
      },
      {
        key: 'source.recipe.all.0.cost', name: 'Cost', column: {
          key: 'source.recipe.all.0.cost', title: 'Cost', dataType: 'gold'
        }
      },
      {
        key: 'source.recipe.all.0.roi', name: 'ROI', column: {
          key: 'source.recipe.all.0.roi', title: 'ROI', dataType: 'gold'
        }
      }
    ]
  },
  {
    name: 'Source: Sold by',
    options: [
      {
        key: 'source.npc.[soldBy].name', name: 'Vendor', column: {
          key: 'source.npc.[soldBy].name', title: 'Vendor', dataType: 'name', options: {
            idName: 'source.npc.[soldBy].id'
          }
        }
      }, {
        key: 'source.npc.[soldBy].tag', name: 'Tag', column: {
          key: 'source.npc.[soldBy].tag', title: 'Vendor tag', dataType: 'string'
        }
      }, {
        key: 'source.npc.[soldBy].zoneName', name: 'Zone', column: {
          key: 'source.npc.[soldBy].zoneName', title: 'Zone', dataType: 'name', options: {
            idName: 'source.npc.[soldBy].zoneId'
          }
        }
      }, {
        key: 'source.npc.[soldBy].price', name: 'Sell price', column: {
          key: 'source.npc.[soldBy].price', title: 'Sell price', dataType: 'gold'
        }
      }, {
        key: 'source.npc.[soldBy].unitPrice', name: 'Unit price', column: {
          key: 'source.npc.[soldBy].unitPrice', title: 'Unit price', dataType: 'gold'
        }
      }, {
        key: 'source.npc.[soldBy].stackSize', name: 'Stack size', column: {
          key: 'source.npc.[soldBy].stackSize', title: 'Stack size', dataType: 'number'
        }
      }, {
        key: 'source.npc.[soldBy].currency', name: 'Currency', column: {
          key: 'source.npc.[soldBy].currency', title: 'Currency', dataType: 'currency', options: {
            idName: 'source.npc.[soldBy].currency'
          }
        }
      }
    ]
  },
  {
    name: 'Source: Dropped by',
    options: [
      {
        key: 'source.npc.[droppedBy].name', name: 'NPC name', column: {
          key: 'source.npc.[droppedBy].name', title: 'NPC name', dataType: 'name', options: {
            idName: 'source.npc.[droppedBy].id'
          }
        }
      }, {
        key: 'source.npc.[droppedBy].tag', name: 'Tag', column: {
          key: 'source.npc.[droppedBy].tag', title: 'Tag', dataType: 'string'
        }
      }, {
        key: 'source.npc.[droppedBy].zoneName', name: 'Zone', column: {
          key: 'source.npc.[droppedBy].zoneName', title: 'Zone', dataType: 'name', options: {
            idName: 'source.npc.[droppedBy].zoneId'
          }
        }
      }, {
        key: 'source.npc.[droppedBy].dropChance', name: 'Drop chance', column: {
          key: 'source.npc.[droppedBy].dropChance', title: 'Drop chance', dataType: 'percent'
        }
      }, {
        key: 'source.npc.[droppedBy].levelRange', name: 'Level range', column: {
          key: 'source.npc.[droppedBy].levelRange', title: 'Level range', dataType: 'text'
        }
      }
    ]
  },
  {
    name: 'Source: Trade vendors',
    options: [
      {
        key: 'source.tradeVendor.name', name: 'Currency', column: {
          key: 'source.tradeVendor.name', title: 'Currency', dataType: 'name', options: {
            idName: 'sourceID'
          }
        }
      },
      {
        key: 'source.tradeVendor.bestValueName', name: 'Best value', column: {
          key: 'source.tradeVendor.bestValueName', title: 'Best value', dataType: 'name', options: {
            idName: 'itemID'
          }
        }
      },
      {
        key: 'source.tradeVendor.roi', name: 'ROI', column: {
          key: 'source.tradeVendor.roi', title: 'ROI', dataType: 'gold'
        }
      },
      {
        key: 'source.tradeVendor.value', name: 'Value', column: {
          key: 'source.tradeVendor.value', title: 'Value', dataType: 'gold'
        }
      },
      {
        key: 'source.tradeVendor.sourceBuyout', name: 'Source buyout', column: {
          key: 'source.tradeVendor.sourceBuyout', title: 'Source buyout', dataType: 'gold'
        }
      },
      {
        key: 'source.tradeVendor.buyout', name: 'Best value buyout', column: {
          key: 'source.tradeVendor.buyout', title: 'Best value buyout', dataType: 'gold'
        }
      }
    ]
  },
  {
    name: 'Inventory',
    options: [
      {
        key: 'item.inventory.quantity', name: 'Quantity', column: {
          key: 'item.inventory.quantity', title: 'Inventory qty', dataType: 'number'
        }
      }
    ]
  }
];
