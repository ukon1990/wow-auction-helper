import {Item} from '../models/item/item';
import {AuthHandler} from '../handlers/auth.handler';
import {HttpClientUtil} from './http-client.util';
import {Endpoints} from './endpoints.util';
import {MediaGameData, ItemGameData} from '../models/item/item-game-data.model';
import {BLIZZARD} from '../secrets';

export class ItemUtil {
  public static handleItems(items: Item[]): Item[] {
    items.forEach(item =>
      ItemUtil.handleItem(item));
    return items;
  }

  public static handleItem(item: Item): Item {
    console.log('ITEM', item);
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

  static getFromBlizzard(id: number, locale: string = 'en_GB', region: string = 'eu'): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      await AuthHandler.getToken();
      new HttpClientUtil().get(new Endpoints()
        .getPath(`item/${id}`, region, true))
        .then(async ({body}) => {
          const raw: ItemGameData = body;
          const item: Item = new Item().fromAPI(raw, locale);
          item.icon = await this.getMedia(raw.media, region);
          resolve(item as Item);
        })
        .catch(() =>
          reject(`Could not find item with id=${id} from Blizzard`));
    });
  }

  private static async getMedia({key}: MediaGameData, region: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
     new HttpClientUtil().get(`${key.href}&access_token=${BLIZZARD.ACCESS_TOKEN}`)
       .then(({body}) => {
         if (body && body.assets && body.assets[0].key === 'icon') {
           const icon = body.assets[0].value;
           resolve(icon
             .replace(`https://render-${region}.worldofwarcraft.com/icons/56/`, '')
             .replace('.jpg', ''));
           return;
         }
         reject('No media found');
       })
       .catch(() => reject('No media found'));
    });
  }
}

