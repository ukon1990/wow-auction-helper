import {Component, Input} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {TsmLuaUtil} from '../../../utils/tsm/tsm-lua.util';
import {Report} from '../../../utils/report.util';
import {DatabaseService} from '../../../services/database.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {Router} from '@angular/router';
import {AuctionsService} from '../../../services/auctions.service';

@Component({
  selector: 'wah-addon',
  templateUrl: './addon.component.html',
  styleUrls: ['./addon.component.scss']
})
export class AddonComponent {
  @Input() importMode: boolean;
  lastModified: Date = localStorage['timestamp_tsm_addon_import'] ?
    new Date(localStorage['timestamp_tsm_addon_import']) : undefined;

  constructor() {
  }

  importFromFile(fileEvent): void {
    try {
      const files = fileEvent.target.files;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          new TsmLuaUtil().convertList(reader.result);
          this.lastModified = fileEvent['srcElement']['files'][0].lastModifiedDate;
          // this.dbService.addTSMAddonData(reader.result, this.lastModified);
          Report.send('Imported TSM addon data', 'Import');
        } catch (error) {
          ErrorReport.sendError('AddonComponent.importFromFile', error);
        }
      };
      reader.readAsText(files[0]);
    } catch (error) {
      ErrorReport.sendError('AddonComponent.importFromFile', error);
    }
  }
}
