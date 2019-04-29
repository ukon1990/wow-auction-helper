import {Item} from '../models/item/item';
import {safeifyString} from '../utils/string.util';
import {getLocale} from '../utils/locale.util';

export class ItemQuery {
  public static update(item: Item) {
    const columns: any[] = [];
    Object.keys(item).forEach(key => {
      if (item[key]) {
        if (typeof item[key] === 'string') {
          columns.push(`${key} = "${safeifyString(item[key])}"`);
        } else if (typeof item[key] === 'object') {
          columns.push(`
            ${key} = "${safeifyString(JSON.stringify(item[key]))}"`);
        } else {
          columns.push(`${key} = ${item[key]}`);
        }
      }
    });
    return `
      UPDATE items
      SET
        ${columns.toString()},
        timestamp = CURRENT_TIMESTAMP
      WHERE id = ${item.id};`;
  }

  public static insert(item: Item) {
    return `
      INSERT INTO items VALUES(${
      item.id
      },"${
      safeifyString(item.name)
      }", "${
      item.icon
      }", ${
    item.itemLevel || 0
      }, ${
    item.itemClass || 0
      }, ${
    item.itemSubClass || 0
      }, ${
    item.quality || 0
      }, "${
      item.itemSpells ? safeifyString(JSON.stringify(item.itemSpells)) : '[]'
      }", "${
      item.itemSource ? safeifyString(JSON.stringify(item.itemSource)) : '[]'
      }", ${
    item.buyPrice || 0
      }, ${
    item.sellPrice || 0
      }, ${
    item.itemBind || 0
      }, ${
    item.minFactionId || 0
      }, ${
    item.minReputation || 0
      }, ${
    item.isDropped || false
      }
        ,CURRENT_TIMESTAMP
        ,${
    item.expansionId || 0
      });`;
  }

  public static getById(id: number, locale: string) {
    return `
    SELECT
      i.id,
     COALESCE(${getLocale(locale)}, i.name) as name,
     icon,
     itemLevel,
     itemClass,
     itemSubClass,
     quality,
     itemSpells,
     itemSource,
     buyPrice,
     sellPrice,
     itemBind,
     minFactionId,
     minReputation,
     isDropped,
     expansionId
    FROM items as i
    LEFT OUTER JOIN item_name_locale as l
    ON i.id = l.id
    WHERE i.id = ${id};`;
  }

  public static getAllAuctionsAfterAndOrderByTimestamp(locale: string, timestamp: Date) {
    return `
    SELECT
         i.id,
         COALESCE(${getLocale(locale)}, i.name) as name,
         icon,
         itemLevel,
         itemClass,
         itemSubClass,
         quality,
         itemSpells,
         itemSource,
         buyPrice,
         sellPrice,
         itemBind,
         minFactionId,
         minReputation,
         isDropped,
         expansionId,
         timestamp
    FROM items as i
    LEFT OUTER JOIN item_name_locale as l
    ON i.id = l.id
    WHERE timestamp > "${timestamp}"
    ORDER BY timestamp desc;`;
  }

  public static getAllItemsOrderByTimestamp(locale: string) {
    return `
      SELECT
             i.id, COALESCE(${getLocale(locale)}, i.name) as name,
             icon,
             itemLevel,
             itemClass,
             itemSubClass,
             quality,
             itemSpells,
             itemSource,
             buyPrice,
             sellPrice,
             itemBind,
             minFactionId,
             minReputation,
             isDropped,
             expansionId,
             timestamp
      FROM items as i
      LEFT OUTER JOIN item_name_locale as l
      ON i.id = l.id
      ORDER BY timestamp desc;`;
  }

  public static getItemSourceForId(req) {
    return `
      SELECT itemSource
      FROM items as i
      WHERE id = ${req.params.id};`;
  }

  public static getItemsToUpdate() {
    return `SELECT *
            FROM items
            WHERE itemLevel > 400;`;
  }

  public static findMissingLocales(): string {
    return `select *
            from item_name_locale
            where
            \ten_GB = 404 or en_GB is null or
                en_US = 404 or en_US is null or
                de_DE = 404 or de_DE is null or
                es_ES = 404 or es_ES is null or
                es_MX = 404 or es_MX is null or
                it_IT = 404 or it_IT is null or
                pl_PL = 404 or pl_PL is null or
                pt_PT = 404 or pt_PT is null or
                pt_BR = 404 or pt_BR is null or
                ru_RU = 404 or ru_RU is null or
                ko_KR = 404 or ko_KR is null or
                zh_TW = 404 or zh_TW is null or
                fr_FR = 404 or fr_FR is null;`;
  }
}
