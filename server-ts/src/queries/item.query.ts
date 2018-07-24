import { Item } from '../models/item/item';
import { safeifyString } from '../util/string.util';

export class ItemQuery {
  public static update(item: Item) {
    const columns: any[] = [];
    Object.keys(item).forEach(key => {
      if (item[key]) {
        if (typeof item[key] === 'string') {
          columns.push(`${ key } = "${ safeifyString(item[key]) }"`);
        } else if (typeof item[key] === 'object') {
          columns.push(`
            ${ key } = "${ safeifyString(JSON.stringify(item[key])) }"`);
        } else {
          columns.push(`${ key } = ${ item[key] }`);
        }
      }
    });
    return `
      UPDATE items
      SET
        ${ columns.toString() },
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
          item.itemLevel
        }, ${
          item.itemClass
        }, ${
          item.itemSubClass
        }, ${
          item.quality
        }, "${
          item.itemSpells ? safeifyString(JSON.stringify(item.itemSpells)) : '[]'
        }", "${
          item.itemSource ? safeifyString(JSON.stringify(item.itemSource)) : '[]'
        }", ${
          item.buyPrice
        }, ${
          item.sellPrice
        }, ${
          item.itemBind
        }, ${
          item.minFactionId
        }, ${
          item.minReputation
        }, ${
          item.isDropped
        }
        ,CURRENT_TIMESTAMP
        ,${
          item.expansionId
        });`;
  }
}