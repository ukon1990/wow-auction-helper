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
        quantity: {
            key: 'quantity',
            title: 'Size',
            dataType: 'number'
        },
        mktPrice: {
            key: 'mktPrice',
            title: 'Market value',
            dataType: 'gold'
        }
    },
    recipe: {
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
        mostProfitableRank: {
            key: 'source.recipe.all.0.rank',
            title: 'Rank',
            dataType: 'number'
        },
        mostProfitableROI: {
            key: 'source.recipe.all.0.roi',
            title: 'Profit',
            dataType: 'gold'
        },
    }
};
