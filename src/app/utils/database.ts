import Dexie from 'dexie';
// Local database start
const TSM_TABLE_COLUMNS = `Id,Name,Level,VendorBuy,VendorSell,MarketValue,MinBuyout,HistoricalPrice,
    RegionMarketAvg,RegionMinBuyoutAvg,RegionHistoricalPrice,RegionSaleAvg,
    RegionAvgDailySold,RegionSaleRate`,
    WOWUCTION_TABLE_COLUMNS = 'id,mktPrice,avgDailyPosted,avgDailySold,estDemand,realm',
    ITEM_TABLE_COLUMNS = `id,name,icon,itemLevel,itemClass,itemSubClass,quality,itemSpells,
itemSource,buyPrice,sellPrice,itemBind,minFactionId,minReputation`,
    PET_TABLE_COLUMNS = 'speciesId,petTypeId,creatureId,name,icon,description,source',
    AUCTIONS_TABLE_COLUMNS = 'auc,item,owner,ownerRealm,bid,buyout,quantity,timeLeft,rand,seed,context,realm,timestamp';
export const DB_TABLES = { TSM_TABLE_COLUMNS, WOWUCTION_TABLE_COLUMNS, ITEM_TABLE_COLUMNS, PET_TABLE_COLUMNS, AUCTIONS_TABLE_COLUMNS };

export const db = new Dexie('wah-db');
db.version(2).stores({
    auctions: AUCTIONS_TABLE_COLUMNS,
    wowuction: WOWUCTION_TABLE_COLUMNS,
    tsm: TSM_TABLE_COLUMNS,
    items: ITEM_TABLE_COLUMNS,
    pets: PET_TABLE_COLUMNS
}).upgrade(() => {
    console.log('Upgraded db');
});
db.version(1).stores({
    auctions: AUCTIONS_TABLE_COLUMNS,
    wowuction: WOWUCTION_TABLE_COLUMNS,
    tsm: TSM_TABLE_COLUMNS,
    items: `id,name,icon,itemClass,itemSubClass,quality,itemSpells,itemSource`,
    pets: PET_TABLE_COLUMNS
});
db.open()
    .then(() => {
        console.log('wah-db successfully started');
    }).catch(error => {
        console.log('Unable to start indexedDB', error);
    });