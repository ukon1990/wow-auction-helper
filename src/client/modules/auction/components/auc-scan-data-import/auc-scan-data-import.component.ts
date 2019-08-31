import {Component, OnInit} from '@angular/core';
import {Report} from '../../../../utils/report.util';
import {ErrorReport} from '../../../../utils/error-report.util';
import {AucScanDataImportUtil} from '../../utils/auc-scan-data-import.util';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {AuctionUtil} from '../../utils/auction.util';
import {PetsService} from '../../../../services/pets.service';
import {SharedService} from '../../../../services/shared.service';
import {RealmService} from '../../../../services/realm.service';
import {Realm} from '../../../../models/realm';
import {AuctionHouseStatus} from '../../models/auction-house-status.model';
import {User} from '../../../../models/user/user';
import {AuctionsService} from '../../../../services/auctions.service';

@Component({
  selector: 'wah-auc-scan-data-import',
  templateUrl: './auc-scan-data-import.component.html',
  styleUrls: ['./auc-scan-data-import.component.scss']
})
export class AucScanDataImportComponent implements OnInit {
  lastModified: number;
  result = [];
  realmControl = new FormControl();
  form: FormGroup;
  sm = new SubscriptionManager();

  constructor(private auctionsService: AuctionsService,
    private realmService: RealmService, private petService: PetsService, private fb: FormBuilder) {
    this.form = this.fb.group({
      realm: null,
      isClassicMode: false
    });
  }

  ngOnInit() {
    const lua = localStorage.getItem('temp_lua');
    const realm = localStorage.getItem('realmClassic');
    const isClassicMode = localStorage.getItem('isClassicMode');

    if (lua) {
      this.result = AucScanDataImportUtil.import(lua);
    }

    this.sm.add(this.form.controls.realm.valueChanges,
      realmClassic =>
        this.onRealmChange(realmClassic));

    this.sm.add(
      this.form.controls.isClassicMode.valueChanges,
      is => {
        SharedService.user.isClassicMode = is;
        User.save();
      });

    if (realm) {
      this.form.controls.realm.setValue(realm);
    }

    this.form.controls.isClassicMode.setValue(SharedService.user.isClassicMode);
  }

  importFromFile(fileEvent): void {
    try {
      const files = fileEvent.target.files;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = reader.result;
          this.result = AucScanDataImportUtil.import(result);
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

  private async onRealmChange(realm: string) {
    localStorage.setItem('realmClassic', realm);
    await this.loadData();
  }

  async loadData() {
    const realm = this.result[0];
    this.auctionsService.events.list.next(realm.auctions);
    await AuctionUtil.organize(realm.auctions, this.petService);
    const status = new AuctionHouseStatus();
    status.lastModified = realm.lastScan;
    this.realmService.events.realmStatus.next(status);
  }
}
