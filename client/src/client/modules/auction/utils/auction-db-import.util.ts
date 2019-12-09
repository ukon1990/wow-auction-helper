import {LuaUtil} from '../../../utils/lua.util';
import {Report} from '../../../utils/report.util';

export class AuctionDBImportUtil {
  static import(input: any): any {
    const data = LuaUtil.toObject(input);
    const result = this.processData(data);
    Report.debug('AuctionDBImportUtil', data, result);
    return result;
  }

  static processData(data: object) {
    // shit
  }
}
