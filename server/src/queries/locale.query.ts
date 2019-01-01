import {safeifyString} from '../util/string.util';

export class LocaleQuery {
  public static insert(tableName: string, idName: string, data: any): string {
    return `INSERT INTO ${tableName}
        (${idName},
          en_GB,
          en_US,
          de_DE,
          es_ES,
          es_MX,
          fr_FR,
          it_IT,
          pl_PL,
          pt_PT,
          pt_BR,
          ru_RU)
        VALUES
        (${data['id']},
          "${safeifyString(data['en_GB'])}",
          "${safeifyString(data['en_US'])}",
          "${safeifyString(data['de_DE'])}",
          "${safeifyString(data['es_ES'])}",
          "${safeifyString(data['es_MX'])}",
          "${safeifyString(data['fr_FR'])}",
          "${safeifyString(data['it_IT'])}",
          "${safeifyString(data['pl_PL'])}",
          "${safeifyString(data['pt_PT'])}",
          "${safeifyString(data['pt_BR'])}",
          "${safeifyString(data['ru_RU'])}");`;
  }
}
