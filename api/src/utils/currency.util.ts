import {HttpClientUtil} from './http-client.util';
import {WoWHeadUtil} from './wowhead.util';
import {Currency} from '../../../client/src/client/modules/core/models/currency.model';
import {languages} from '../static-data/language.data';
import {ItemLocale} from '../models/item/item-locale';
import {Language} from '../models/language.model';

export class CurrencyUtil {
  static getList() {
    return new Promise<Currency[]>(async (resolve, reject) => {
      const map = {},
        list = [],
        promises: Promise<void>[] = languages.map(lang =>
          this.getCurrencyWithLanguage(lang, map, list));
      await Promise.all(promises)
        .catch(console.error);
      resolve(list);
    });
  }

  private static getCurrencyWithLanguage(lang: Language, map, list: any[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      new HttpClientUtil().get(`https://${lang.key}.wowhead.com/currencies`, false)
        .then(({body}) => {
          resolve(WoWHeadUtil.getNewListViewData<Currency>(body, 'currency', 'currencies')
            .forEach(c => {
              const name = c['name'];
              delete c['popularity'];
              delete c['totalCount'];
              if (!map[c.id]) {
                const locale = new ItemLocale();
                delete locale.id;
                c.name = locale;
                map[c.id] = c;
                list.push(map[c.id]);
              }
              lang.locales.forEach(locale =>
                map[c.id].name[locale] = name);
            }));
        })
        .catch(reject);
    });
  }
}
