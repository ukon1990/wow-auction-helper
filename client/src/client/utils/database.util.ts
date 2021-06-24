import Dexie from 'dexie';

export class DatabaseUtil {

  private readonly TSM_TABLE_COLUMNS = 'Id,Name,Level,VendorBuy,VendorSell,MarketValue,MinBuyout,HistoricalPrice,'
    + 'RegionMarketAvg,RegionMinBuyoutAvg,RegionHistoricalPrice,RegionSaleAvg,'
    + 'RegionAvgDailySold,RegionSaleRate';
  private readonly WOWUCTION_TABLE_COLUMNS = 'id,mktPrice,avgDailyed,avgDailySold,estDemand,dailyPriceChange';
  private readonly ITEM_TABLE_COLUMNS = 'id,name,icon,itemLevel,itemClass,itemSubClass,quality,itemSpells'
    + ',itemSource,buyPrice,sellPrice,itemBind,minFactionId,minReputation';
  private readonly ITEM_CLASSIC_TABLE_COLUMNS = 'id,name,icon,itemLevel,itemClass,itemSubClass,quality,itemSpells'
    + ',itemSource,buyPrice,sellPrice,itemBind,minFactionId,minReputation,classicPhase';
  private readonly PET_TABLE_COLUMNS = 'speciesId,petTypeId,creatureId,name,icon,description,source';
  private readonly AUCTIONS_TABLE_COLUMNS = 'auc,item,owner,ownerRealm,bid,buyout,quantity,timeLeft,rand,seed,context,realm,timestamp';
  private readonly RECIPE_TABLE_COLUMNS = 'id,icon,name,description,rank,craftedItemId,hordeCraftedItemId,' +
    'allianceCraftedItemId,minCount,maxCount,procRate,professionId,skillTierId,reagents';
  private readonly TSM_ADDON_HISTORY = 'timestamp,data';
  private readonly ADDON = 'id,name,gameVersion,timestamp,data';
  private readonly NPC_TABLE_COLUMNS = 'id,name,zoneId,coordinates,sells,drops,skinning,' +
    'expansionId,isAlliance,isHorde,minLevel,maxLevel,tag,type,classification';
  private readonly NPC_ENTRY_COLUMNS = 'id,item,foundOn';
  private readonly ZONE_TABLE_COLUMNS = 'id,name,patch,typeId,parentId,parent,territoryId,minLevel,maxLevel';
  private readonly PROFESSION_TABLE_COLUMNS = 'id,name,description,icon,type,skillTiers';
  private readonly DASHBOARD_TABLE_COLUMNS = 'id,parentId,idParam,title,columns,sortOrder,isDisabled,onlyItemsWithRules,' +
    'sortRule,rules,itemRules,tsmShoppingString,message,isPublic,createdBy,createdById,lastModified,idIsBackendGenerated';

  // Sorted by old to new
  private versionHistory = [
    // The first version
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: `id,name,icon,itemClass,itemSubClass,quality,itemSpells,itemSource`,
      pets: this.PET_TABLE_COLUMNS
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: 'id,mktPrice,avgDailyPosted,avgDailySold,estDemand,realm',
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: 'spellID,itemID,name,profession,rank,minCount,maxCount,reagents,expansion'
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: 'spellID,itemID,name,profession,rank,minCount,maxCount,reagents,expansion',
      tsmAddonHistory: this.TSM_ADDON_HISTORY
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: 'spellID,itemID,name,profession,rank,minCount,maxCount,reagents,expansion',
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      tsmAddonHistory: this.TSM_ADDON_HISTORY
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: 'spellID,itemID,name,profession,rank,minCount,maxCount,reagents,expansion',
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      addons: this.ADDON
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: this.RECIPE_TABLE_COLUMNS,
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      professions: this.PROFESSION_TABLE_COLUMNS,
      addons: this.ADDON
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: this.RECIPE_TABLE_COLUMNS,
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      professions: this.PROFESSION_TABLE_COLUMNS,
      addons: this.ADDON
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes2: this.RECIPE_TABLE_COLUMNS,
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      professions: this.PROFESSION_TABLE_COLUMNS,
      addons: this.ADDON
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes2: this.RECIPE_TABLE_COLUMNS,
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      professions: this.PROFESSION_TABLE_COLUMNS,
      addons: this.ADDON,
      dashboards: this.DASHBOARD_TABLE_COLUMNS
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes2: this.RECIPE_TABLE_COLUMNS,
      npcsBase: this.NPC_TABLE_COLUMNS,
      npcsDrops: this.NPC_ENTRY_COLUMNS,
      npcsSells: this.NPC_ENTRY_COLUMNS,
      npcsSkinns: this.NPC_ENTRY_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      professions: this.PROFESSION_TABLE_COLUMNS,
      addons: this.ADDON,
      dashboards: this.DASHBOARD_TABLE_COLUMNS
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes2: this.RECIPE_TABLE_COLUMNS,
      recipesClassic: this.RECIPE_TABLE_COLUMNS,
      npcsBase: this.NPC_TABLE_COLUMNS,
      npcsDrops: this.NPC_ENTRY_COLUMNS,
      npcsSells: this.NPC_ENTRY_COLUMNS,
      npcsSkinns: this.NPC_ENTRY_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      professions: this.PROFESSION_TABLE_COLUMNS,
      addons: this.ADDON,
      dashboards: this.DASHBOARD_TABLE_COLUMNS
    },
    {
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      auctionsClassic: this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      itemsClassic: this.ITEM_CLASSIC_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes2: this.RECIPE_TABLE_COLUMNS,
      recipesClassic: this.RECIPE_TABLE_COLUMNS,
      npcsBase: this.NPC_TABLE_COLUMNS,
      npcsDrops: this.NPC_ENTRY_COLUMNS,
      npcsSells: this.NPC_ENTRY_COLUMNS,
      npcsSkinns: this.NPC_ENTRY_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      professions: this.PROFESSION_TABLE_COLUMNS,
      addons: this.ADDON,
      dashboards: this.DASHBOARD_TABLE_COLUMNS
    }
  ];

  setVersion(db: Dexie) {
    this.versionHistory.forEach((schema, index) => {
      db.version(index + 1)
        .stores(schema)
        .upgrade(() => {
        console.log('Upgraded db');
      });
    });
  }
}
