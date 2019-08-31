import {Component, OnInit} from '@angular/core';
import {TsmLuaUtil} from '../../../../utils/tsm/tsm-lua.util';
import {Report} from '../../../../utils/report.util';
import {ErrorReport} from '../../../../utils/error-report.util';
import {AucScanDataImportUtil} from '../../utils/auc-scan-data-import.util';

@Component({
  selector: 'wah-auc-scan-data-import',
  templateUrl: './auc-scan-data-import.component.html',
  styleUrls: ['./auc-scan-data-import.component.scss']
})
export class AucScanDataImportComponent implements OnInit {
  lastModified: number;

  constructor() {
  }

  ngOnInit() {
    const lua = localStorage.getItem('temp_lua');
    if (lua) {
      AucScanDataImportUtil.import(lua);
    }
  }

  importFromFile(fileEvent): void {
    try {
      const files = fileEvent.target.files;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = reader.result;
          AucScanDataImportUtil.import(result);
          localStorage.setItem('temp_lua', result as string);
          this.lastModified = fileEvent['srcElement']['files'][0].lastModifiedDate;
          // this.dbService.addTSMAddonData(reader.result, this.lastModified);
          Report.send('Imported TSM addon data', 'Import');
        } catch (error) {
          ErrorReport.sendError('TsmAddonDbComponent.importFromFile', error);
        }
      };
      reader.readAsText(files[0]);
    } catch (error) {
      ErrorReport.sendError('TsmAddonDbComponent.importFromFile', error);
    }
  }
}
