import {Component, Input} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {TsmLuaUtil} from '../../../utils/tsm/tsm-lua.util';
import {Report} from '../../../utils/report.util';
import {DatabaseService} from '../../../services/database.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {Router} from '@angular/router';

@Component({
  selector: 'wah-tsm-addon-db',
  templateUrl: './tsm-addon-db.component.html',
  styleUrls: ['./tsm-addon-db.component.scss']
})
export class TsmAddonDbComponent {
  @Input() importMode: boolean;
  lastModified: Date = localStorage['timestamp_tsm_addon_import'] ?
    new Date(localStorage['timestamp_tsm_addon_import']) : undefined;

  constructor(private formBuilder: FormBuilder, private dbService: DatabaseService, private route: Router) {
    const urlParts = this.route.url.split('/');
    if (urlParts.length < 4) {
      this.route.navigateByUrl(`${route.url}/summary`);
    }

  }

  importFromFile(fileEvent): void {
    try {
      const files = fileEvent.target.files;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          new TsmLuaUtil().convertList(reader.result);
          this.lastModified = fileEvent['srcElement']['files'][0].lastModifiedDate;
          this.dbService.addTSMAddonData(reader.result, this.lastModified);
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
