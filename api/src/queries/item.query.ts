import {Item} from '../../../client/src/client/models/item/item';
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

  public static getItemWithNameLike(name: string): string {
    return `SELECT id
            FROM items
            WHERE name like '%${name}%';`;
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
}
