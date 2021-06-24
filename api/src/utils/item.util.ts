import {Item} from '../../../client/src/client/models/item/item';
import {AuthHandler} from '../handlers/auth.handler';
import {HttpClientUtil} from './http-client.util';
import {Endpoints} from './endpoints.util';
import {ItemGameData} from '../models/item/item-game-data.model';
import {WoWDBItem} from '../models/item/wowdb';
import {GameMediaUtil} from './game-media.util';
import {WoWHeadUtil} from './wowhead.util';
import {NameSpace} from '../enums/name-space.enum';

export class ItemUtil {
  public static handleItems(items: Item[]): Item[] {
    items.forEach(item =>
      ItemUtil.handleItem(item));
    return items;
  }

  public static handleItem(item: Item): Item {
    delete item['timestamp'];

    if (item.itemSource) {
      try {
          item.itemSource = JSON.parse((item.itemSource as any).replace(/[\n]/g, ''));
          delete item.itemSource.soldBy;
          delete item.itemSource.droppedBy;
      } catch (e) {
        // console.log(`Malformed source JSON for item ${item.id} - ${item.name}`);
        delete item.itemSource;
      }
    }
    // TODO: Fix some issues regarding this json in the DB - r.itemSpells
   try {
     if (item.itemSpells) {
       item.itemSpells = JSON.parse(item.itemSpells as any);
     }
   } catch (e) {
     console.log(`Malformed spells JSON for item ${item.id} - ${item.name}`);
   }
    return item;
  }

  static getFromBlizzard(
    id: number,
    locale: string = 'en_GB',
    region: string = 'us',
    namespaceType: NameSpace = NameSpace.STATIC_RETAIL
  ): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      await AuthHandler.getToken();
      const url = new Endpoints()
        .getPath(`item/${id}`, region, namespaceType);
      console.log('URL', url);
      new HttpClientUtil().get(url)
        .then(async ({body}) => {
          const raw: ItemGameData = body;
          const item: Item = new Item().fromAPI(raw, locale);
          item.icon = await GameMediaUtil.getIcon(raw.media, region);
          resolve(item as Item);
        })
        .catch((err) => {
          console.error(err);
          reject(`Could not find item with id=${id} from Blizzard`);
        });
    });
  }

  static getWowDBData(id: number): Promise<WoWDBItem> {
    return new Promise<WoWDBItem>(((resolve, reject) => {
      const errorMessage = {error: `Could not get data from WoWDB for an item id=${id}`};

      new HttpClientUtil().get(`http://wowdb.com/api/item/${id}`, false)
        .then(({body}) => {
          try {
            const object = body.slice(1, body.length - 1);
            resolve(
              JSON.parse(object) as WoWDBItem);
          } catch (e) {
            reject(errorMessage);
          }
        })
        .catch(error => reject(errorMessage));
    }));
  }

  static getNewItemsForPatch(patchNumber: number): Promise<any[]> {
    return new Promise<any[]>(async(resolve) => {
      let items = [];
      for (let i = 0; i < 6; i++) {
        await this.getItemsByQualityForPatch(patchNumber, i)
          .then(list => items = [...items, ...list])
          .catch(console.error);
      }
      resolve(items);
    });
  }

  private static getItemsByQualityForPatch(patchNumber: number, quality: number): Promise<any> {
    return new Promise<any>((resolve) => {
      const url = `https://ptr.wowhead.com/items/quality:${
        quality}?filter=82:161;2:1;${patchNumber}:0`;
      console.log('getItemsByQualityForPatch', url);
      new HttpClientUtil().get(url, false)
        .then(({body}) => {
          resolve(WoWHeadUtil.getArrayVariable('listviewitems', body));
        })
        .catch((error) => {
          console.error(error);
          resolve([]);
        });
    });
  }
}

