export const columnConfig = {
  item: {
    name: {
      key: 'name',
      title: 'Name',
      dataType: 'name',
    },
    vendorSell: {
      key: 'vendorSell',
      title: 'Vendor sell',
      dataType: 'gold'
    },
    itemLevel: {
      key: 'itemLevel',
      title: 'ILvL',
      dataType: 'number'
    },
    expansion: {
      key: 'item.expansionId',
      title: 'Expansion',
      dataType: 'expansion'
    },
    quality: {
      key: 'quality',
      title: 'Quality',
      dataType: 'quality'
    },
    shoppingCartInput: {
      key: undefined, title: 'In cart', dataType: 'cart-item-count', options: {
        idName: 'id',
      }
    },
  },
  auction: {
    buyout: {
      key: 'buyout',
      title: 'Lowest buyout',
      dataType: 'gold',
    },
    pricePast24HoursTrend: {
      key: 'stats.past24Hours.price.trend',
      title: '24H trend',
      dataType: 'gold',
    },
    quantityPast24HoursTrend: {
      key: 'stats.past24Hours.quantity.trend',
      title: '24 H trend #',
      dataType: 'number',
    },
    pricePast7DaysTrend: {
      key: 'stats.past7Days.price.trend',
      title: '7 Day trend',
      dataType: 'gold',
    },
    quantityPast7DaysTrend: {
      key: 'stats.past7Days.quantity.trend',
      title: '7 Day trend #',
      dataType: 'number',
    },
    mktPriceMinusBuyout: {
      key: 'mktPrice-buyout',
      title: 'ROI',
      dataType: 'gold'
    },
    buyoutVsMktPrice: {
      key: 'buyout/mktPrice',
      title: 'Buyout Vs Mv',
      dataType: 'percent',
      options: {
        tooltip: 'Buyout vs market value',
      }
    },
    bid: {
      key: 'bid',
      title: 'Lowest bid',
      dataType: 'gold',
    },
    auctionsBid: {
      key: '[auctions].bid',
      title: 'Bid',
      dataType: 'gold'
    },
    bidVsBuyout: {
      key: 'bid/buyout',
      title: 'Profit',
      dataType: 'percent'
    },
    buyoutVsVendorSell: {
      key: 'buyout/vendorSell',
      title: 'Buyout vs vendor',
      dataType: 'percent'
    },
    vendorSellVsBuyout: {
      key: 'vendorSell/buyout',
      title: 'Vendor ROI',
      dataType: 'percent'
    },
    auctionsBidMinusBuyout: {
      key: 'buyout-[auctions].bid',
      title: 'Profit',
      dataType: 'gold'
    },
    /* TODO: If TSM is public again
    regionSaleRate: {
      key: 'regionSaleRate',
      title: 'Sale rate',
      dataType: 'percent'
    },
    avgDailySold: {
      key: 'avgDailySold',
      title: 'Avg daily sold',
      dataType: 'number'
    },*/
    timeLeft: {
      key: '[auctions].timeLeft',
      title: 'Time left',
      dataType: 'time-left'
    },
    quantityTotal: {
      key: 'quantityTotal', title: 'Quantity total', dataType: 'number'
    },
    quantity: {
      key: '[auctions].quantity',
      title: 'Size',
      dataType: 'number'
    },
    mktPrice: {
      key: 'mktPrice',
      title: 'Market value',
      dataType: 'gold'
    },
    /* TODO: If TSM is public again
    regionSaleAvg: {
      key: 'regionSaleAvg', title: 'Avg sales price', dataType: 'gold'
    },
    */
    past24HoursSaleRate: {
      key: 'past24HoursSaleRate', title: '24h Sale rate', dataType: 'percent'
    },
    past7DaysSaleRate: {
      key: 'past7DaysSaleRate', title: '7 days Sale rate', dataType: 'percent'
    },
    past14DaysSaleRate: {
      key: 'past14DaysSaleRate', title: '14 days Sale rate', dataType: 'percent'
    },
    past30DaysSaleRate: {
      key: 'past30DaysSaleRate', title: '30 days Sale rate', dataType: 'percent'
    },
    past60DaysSaleRate: {
      key: 'past60DaysSaleRate', title: '60 days Sale rate', dataType: 'percent'
    },
    past90DaysSaleRate: {
      key: 'past90DaysSaleRate', title: '90 days Sale rate', dataType: 'percent'
    },
    allTimeSaleRate: {
      key: 'totalSaleRate', title: 'All time Sale rate', dataType: 'percent'
    }
  },
  recipe: {
    shoppingCartInput: {
      key: undefined, title: 'In cart', dataType: 'cart-recipe-count', options: {
        idName: 'recipeId',
      }
    },
    mostProfitableKnownName: {
      key: 'source.recipe.0.known.name', title: 'Name', dataType: 'name'
    },
    mostProfitableKnownRank: {
      key: 'source.recipe.known.0.rank',
      title: 'Rank',
      dataType: 'number'
    },
    mostProfitableKnownROI: {
      key: 'source.recipe.known.0.roi',
      title: 'Profit',
      dataType: 'gold'
    },
    mostProfitableKnownCost: {
      key: 'source.recipe.known.0.cost', title: 'Cost', dataType: 'gold'
    },
    mostProfitableKnownProfession: {
      key: 'source.recipe.known.0.professionId',
      title: 'Profession',
      dataType: 'profession'
    },
    knownName: {
      key: 'source.recipe.[known].name',
      title: 'Name',
      dataType: 'name'
    },
    knownRank: {
      key: 'source.recipe.[known].rank',
      title: 'Rank',
      dataType: 'number'
    },
    knownReagents: {
      key: 'source.recipe.[known].reagents',
      title: 'Reagents',
      dataType: 'materials'
    },
    knownROI: {
      key: '0.95*buyout-source.recipe.[known].cost',
      title: 'Profit',
      dataType: 'gold'
    },
    knownROIPercent: {
      key: '0.95*buyout/source.recipe.[known].cost',
      title: 'ROI %',
      dataType: 'percent'
    },
    knownCost: {
      key: 'source.recipe.[known].cost', title: 'Cost', dataType: 'gold'
    },
    knownProfession: {
      key: 'source.recipe.[known].professionId',
      title: 'Profession',
      dataType: 'profession'
    },
    mostProfitableName: {
      key: 'source.recipe.all.0.name',
      title: 'Name',
      dataType: 'name'
    },
    mostProfitableRank: {
      key: 'source.recipe.all.0.rank',
      title: 'Rank',
      dataType: 'number'
    },
    mostProfitableROI: {
      key: 'source.recipe.all.0.roi',
      title: 'ROI',
      dataType: 'gold'
    },
    mostProfitableROIPercent: {
      key: '0.95*buyout/source.recipe.all.0.roi',
      title: 'ROI %',
      dataType: 'percent'
    },
    mostProfitableCost: {
      key: 'source.recipe.all.0.cost',
      title: 'Cost',
      dataType: 'gold'
    },
    mostProfitableProfession: {
      key: 'source.recipe.all.0.professionId',
      title: 'Profession',
      dataType: 'profession'
    },
    name: {
      key: 'source.recipe.[all].name',
      title: 'Name',
      dataType: 'name'
    },
    rank: {
      key: 'source.recipe.[all].rank',
      title: 'Rank',
      dataType: 'number'
    },
    reagents: {
      key: 'source.recipe.[all].reagents',
      title: 'Reagents',
      dataType: 'materials'
    },
    ROI: {
      key: '0.95*buyout-source.recipe.[all].cost',
      title: 'ROI',
      dataType: 'gold'
    },
    ROIPercent: {
      key: '0.95*buyout/source.recipe.[all].cost',
      title: 'ROI %',
      dataType: 'percent'
    },
    cost: {
      key: 'source.recipe.[all].cost',
      title: 'Cost',
      dataType: 'gold'
    },
    profession: {
      key: 'source.recipe.[all].professionId',
      title: 'Profession',
      dataType: 'profession'
    }
  },
  pet: {
    level: {
      key: 'petLevel', title: 'Pet level', dataType: 'number'
    }, quality: {
      key: 'petQualityId', title: 'Pet quality', dataType: 'quality'
    }
  },
  source: {
    soldBy: {
      name: {
        key: 'source.npc.[soldBy].name',
        title: 'Vendor', dataType: 'name',
        options: {
          idName: 'soldById',
          noIcon: true,
          tooltipType: 'npc'
        }
      },
      tag: {
        key: 'source.npc.[soldBy].tag', title: 'Vendor tag', dataType: 'string'
      },
      zoneName: {
        key: 'source.npc.[soldBy].zoneName', title: 'Zone', dataType: 'name', options: {
          idName: 'zoneId',
          noIcon: true,
          tooltipType: 'zone'
        }
      },
      price: {
        key: 'source.npc.[soldBy].price', title: 'Sell price', dataType: 'gold'
      },
      unitPrice: {
        key: 'source.npc.[soldBy].unitPrice', title: 'Unit price', dataType: 'gold'
      },
      stackSize: {
        key: 'source.npc.[soldBy].stackSize', title: 'Stack size', dataType: 'number'
      },
      currency: {
        key: 'source.npc.[soldBy].currency', title: 'Currency', dataType: 'vendor-currency', options: {
          idName: 'source.npc.[soldBy].currency',
        }
      }
    },
    droppedBy: {
      name: {
        key: 'source.npc.[droppedBy].name', title: 'NPC name', dataType: 'name', options: {
          idName: 'droppedById',
          noIcon: true,
          tooltipType: 'npc'
        }
      },
      tag: {
        key: 'source.npc.[droppedBy].tag', title: 'Tag', dataType: 'string'
      },
      zoneName: {
        key: 'source.npc.[droppedBy].zoneName', title: 'Zone', dataType: 'name', options: {
          idName: 'source.npc.[droppedBy].zoneId',
          noIcon: true,
          tooltipType: 'zone'
        }
      },
      dropChance: {
        key: 'source.npc.[droppedBy].dropChance', title: 'Drop chance', dataType: 'percent'
      },
      levelRange: {
        key: 'source.npc.[droppedBy].levelRange', title: 'Level range', dataType: 'text'
      }
    },
    tradeVendor: {
      name: {
        key: 'source.tradeVendor.name', title: 'Currency', dataType: 'name', options: {
          idName: 'sourceID'
        }
      },
      bestValueName: {
        key: 'source.tradeVendor.bestValueName', title: 'Best value', dataType: 'name', options: {
          idName: 'itemID'
        }
      },
      roi: {
        key: 'source.tradeVendor.roi', title: 'ROI', dataType: 'gold'
      },
      value: {
        key: 'source.tradeVendor.value', title: 'Value', dataType: 'gold'
      },
      sourceBuyout: {
        key: 'source.tradeVendor.sourceBuyout', title: 'Source buyout', dataType: 'gold'
      },
      buyout: {
        key: 'source.tradeVendor.buyout', title: 'Best value buyout', dataType: 'gold'
      }

    }
  },
  prospecting: {
    name: {key: `source.destroy.prospecting.sourceIn.name`, title: 'Name', dataType: 'name'},
    yield: {key: `source.destroy.prospecting.sourceIn.yield`, title: 'ROI', dataType: 'gold'},
  },
  milling: {
    name: {key: `source.destroy.milling.sourceIn.name`, title: 'Name', dataType: 'name'},
    yield: {key: `source.destroy.milling.sourceIn.yield`, title: 'ROI', dataType: 'gold'},
  },
  inventory: {
    quantity: {
      key: 'item.inventory.quantity', title: 'Inventory qty', dataType: 'number'
    }
  }
};
