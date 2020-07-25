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
      key: 'item.expansionId', title: 'Expansion', dataType: 'expansion'
    }
  },
  auction: {
    buyout: {
      key: 'buyout',
      title: 'Buyout',
      dataType: 'gold',
    },
    bid: {
      key: 'bid',
      title: 'Bid',
      dataType: 'gold',
    },
    bidVsBuyout: {
      key: 'bid/buyout',
      title: 'Profit',
      dataType: 'percent'
    },
    regionSaleRate: {
      key: 'regionSaleRate',
      title: 'Sale rate',
      dataType: 'percent'
    },
    avgDailySold: {
      key: 'avgDailySold',
      title: 'Avg daily sold',
      dataType: 'number'
    },
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
    regionSaleAvg: {
      key: 'regionSaleAvg', title: 'Avg sales price', dataType: 'gold'
    },
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
    }, mostProfitableName: {
      key: 'source.recipe.all.0.name', title: 'Name', dataType: 'name'
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
    mostProfitableCost: {
      key: 'source.recipe.all.0.cost',
      title: 'Cost',
      dataType: 'gold'
    },

  },
  pet: {
    level: {
      key: 'petLevel', title: 'Pet level', dataType: 'number'
    }, quality: {
      key: 'petQuality', title: 'Pet quality', dataType: 'number'
    }

  },
  source: {
    soldBy: {
      name: {
        key: 'source.npc.[soldBy].name', title: 'Vendor', dataType: 'name', options: {
          idName: 'source.npc.[soldBy].id'
        }
      },
      tag: {
        key: 'source.npc.[soldBy].tag', title: 'Vendor tag', dataType: 'string'
      },
      zoneName: {
        key: 'source.npc.[soldBy].zoneName', title: 'Zone', dataType: 'name', options: {
          idName: 'source.npc.[soldBy].zoneId'
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
        key: 'source.npc.[soldBy].currency', title: 'Currency', dataType: 'currency', options: {
          idName: 'source.npc.[soldBy].currency'
        }
      }
    },
    droppedBy: {
      name: {
        key: 'source.npc.[droppedBy].name', title: 'NPC name', dataType: 'name', options: {
          idName: 'source.npc.[droppedBy].id'
        }
      },
      tag: {
        key: 'source.npc.[droppedBy].tag', title: 'Tag', dataType: 'string'
      },
      zoneName: {
        key: 'source.npc.[droppedBy].zoneName', title: 'Zone', dataType: 'name', options: {
          idName: 'source.npc.[droppedBy].zoneId'
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
  inventory: {
    quantity: {
      key: 'item.inventory.quantity', title: 'Inventory qty', dataType: 'number'
    }
  }
};
