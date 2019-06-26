import {Item} from '../models/item/item';

export class ItemUtil {
  public static handleItems(items: Item[]): Item[] {
    items.forEach(item =>
      ItemUtil.handleItem(item));
    return items;
  }

  public static handleItem(item: Item): Item {
    delete item['timestamp'];
    if (item.itemSource) {
      item.itemSource = JSON.parse((item.itemSource as any).replace(/[\n]/g, ''));
    }
    // TODO: Fix some issues regarding this json in the DB - r.itemSpells
    if (item.itemSpells) {
      item.itemSpells = JSON.parse(item.itemSpells as any);
    }
    return item;
  }
}
