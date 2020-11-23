import {safeifyString} from '../utils/string.util';
import {RDSQueryUtil} from '../utils/query.util';

export class LocaleQuery {
  public static insert(tableName: string, idName: string, data: any): string {
    delete data['zh_CN'];
    return new RDSQueryUtil(tableName, false).insertOrUpdate(data);
  }

  public static getMissingItemsLocales(localeTableName: string, locale: string): string {
    return `
      SELECT locale.id
      FROM ${localeTableName} as locale
      WHERE ${locale} IS NULL;`;
  }

  static updateSingleLocale(tableName: string, idName: string, id: any, locale: string, data: string) {
    return `UPDATE ${tableName}
            SET ${locale}='${LocaleQuery.cleanUpString(data)}'
            WHERE ${idName}=${id};`;
  }

  private static cleanUpString(data: string) {
    return data.replace(/[']/g, '\\\'');
  }

  public static findMissingLocales(type: string): string {
    const idName = type === 'pet' ? 'speciesId' : 'id';
    return `select *
            from ${type}_name_locale
            where
              en_GB = 404 or en_GB is null or
              en_US = 404 or en_US is null or
              de_DE = 404 or de_DE is null or
              es_ES = 404 or es_ES is null or
              es_MX = 404 or es_MX is null or
              it_IT = 404 or it_IT is null or
              pl_PL = 404 or pl_PL is null or
              pt_PT = 404 or pt_PT is null or
              pt_BR = 404 or pt_BR is null or
              ru_RU = 404 or ru_RU is null or
              fr_FR = 404 or fr_FR is null or
              ko_KR = 404 or ko_KR is null or
              zh_TW = 404 or zh_TW is null
            union
            select
              ${idName},
              'insert' as en_GB,
              'insert' as en_US,
              'insert' as de_DE,
              'insert' as es_ES,
              'insert' as es_MX,
              'insert' as fr_FR,
              'insert' as it_IT,
              'insert' as pl_PL,
              'insert' as pt_PT,
              'insert' as pt_BR,
              'insert' as ru_RU,
              'insert' as ko_KR,
              'insert' as zh_TW
            from ${type}s
            where
                ${idName} not in (select ${idName} from ${type}_name_locale);`;
    /**
     */
  }

  public static updateTimestamp(table: string, id: number, idName: string): string {
    return `UPDATE ${table}
            SET \`timestamp\`= CURRENT_TIMESTAMP
            WHERE \`${idName}\`=${id};`;
  }
}
