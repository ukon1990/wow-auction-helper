import {Report} from '../../../utils/report.util';
import {LuaUtil} from '../../../utils/lua.util';

export class AucScanDataImportUtil {
  static import(input) {
    Report.debug('AucScanDataImportUtil', LuaUtil.toObject(input));
  }
}
