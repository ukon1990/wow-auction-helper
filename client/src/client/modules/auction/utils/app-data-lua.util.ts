import {ErrorReport} from '../../../utils/error-report.util';
import * as lua from 'luaparse';
import {Report} from '../../../utils/report.util';
import {TextUtil} from '@ukon1990/js-utilities/dist/utils/text.util';

export class AppDataLuaUtil {
  private static extract(field: string, input: string): string {
    const regex = field === 'fields' ? /fields=\{[\s\S]*?\}/gm : /data=\{\{[\s\S]*?\}\}/gm;
    const result = (regex.exec(input) || [''])[0];
    console.log('RX result', result);
    return result
      .replace(`${field}=`, '')
      .replace(/\{/gm, '[')
      .replace(/\}/gm, ']');
  }
  static process(input: unknown): unknown {
    try {
      const parsed = lua.parse(input);
      const result = {};

      (parsed.body || []).forEach(({expression}) => {
        if (expression) {
          const [typeRaw, targetRaw, dataRaw] = expression.arguments;
          const type = typeRaw.value;
          const target = targetRaw.value;
          const data = dataRaw.value;
          if (TextUtil.isEqualIgnoreCase('eu', target) || TextUtil.isEqualIgnoreCase('us', target)) {
            const withoutReturn = data.replace('return ', '');
            const fields: string[] = JSON.parse(this.extract('fields', withoutReturn));
            const dataContent: string[][] = JSON.parse(this.extract('data', withoutReturn));
            const downloadTime = +/downloadTime=[0-9]{0,30},/
              .exec(withoutReturn)[0]
              .replace('downloadTime=', '')
              .replace(',', '');
            result[target] = {
              downloadTime: downloadTime * 1000,
              fields,
              data: dataContent,
              mappedData: dataContent.map(row => {
                let res = {
                  id: undefined,
                };
                row.forEach((value, index) => {
                  const field = fields[index];
                  if (field === 'itemString') {
                    res = {
                      ...res,
                      ...this.extractItemString(value),
                    };
                  } else {
                    res[field] = value;
                  }
                });
                return res;
              }),
              withoutReturn,
            }; // lua.parse();
          }
        }
      });
      Report.debug('AppDataLuaUtil.process.parsed', {parsed, result});
      return result;
    } catch (error) {
      ErrorReport.sendError('AppDataLuaUtil.process', error);
      return undefined;
    }
  }

  private static extractItemString(value: string | number) {
    if (typeof value === 'number') {
      return {id: value};
    }
    // // i:173194::2:6887:7180:1:9:51;
    const [
      temType, itemId, rand, bonusIdsStr, modifiersStrm
    ] = value.split(':');
    const bonusIds = [];
    /*
    if (bonusId1) {
      bonusIds.push(bonusId1);
    }
    if (bonusId2) {
      bonusIds.push(bonusId2);
    }*/
    return {
      id: +itemId,
      bonusIds,
      itemString: value,
      temType, itemId, rand, bonusIdsStr, modifiersStrm
    };
  }
}
