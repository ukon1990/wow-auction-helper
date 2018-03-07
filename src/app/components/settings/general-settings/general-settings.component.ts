import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { Realm } from '../../../models/realm';
import { User } from '../../../models/user/user';
import { RealmService } from '../../../services/realm.service';
import { AuctionsService } from '../../../services/auctions.service';
import { Angulartics2 } from 'angulartics2';
import { FileService } from '../../../services/file.service';

@Component({
  selector: 'wah-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  _characterForm: FormGroup;

  constructor(private _formBuilder: FormBuilder,
    private angulartics2: Angulartics2,
    private _realmService: RealmService,
    private _auctionService: AuctionsService) {
    this._characterForm = this._formBuilder.group({
      region: [ SharedService.user.region, Validators.required],
      realm: [ SharedService.user.realm, Validators.required],
      tsmKey: SharedService.user.apiTsm,
      importString: '',
      exportString: ''
    });
  }

  ngOnInit() {
    if (!SharedService.realms || Object.keys(SharedService.realms).length === 0) {
      this.getRealms();
    }
  }

  hasRealmChange(): boolean {
    return SharedService.user.realm !== this._characterForm.value.realm ||
      SharedService.user.region !== this._characterForm.value.region;
  }

  saveRealmAndRegion() {
    RealmService.changeRealm(
      this._auctionService,
      this._characterForm.value.realm,
      this._characterForm.value.region);
  }

  hasTSMKeyChanged(): boolean {
    return SharedService.user.apiTsm !== this._characterForm.value.tsmKey;
  }

  saveTSMKey(): void {
    SharedService.user.apiTsm = this._characterForm.value.tsmKey;
    if (SharedService.user.apiTsm.length > 0) {
      SharedService.user.apiToUse = 'tsm';
      this._auctionService.getTsmAuctions();
    } else {
      SharedService.user.apiToUse = 'none';
    }
    User.save();
  }

  getRealmsKeys() {
    return SharedService.realms ? Object.keys(SharedService.realms) : [];
  }

  getRealmWithkey(slug?: string): Realm {
    if (!slug) {
      slug = this._characterForm.value.realm;
    }
    return SharedService.realms[slug] ? SharedService.realms[slug] : new Realm();
  }

  getRealms(): void {
    setTimeout(() => {
      this._realmService
        .getRealms(this._characterForm.value.region);
    }, 100);
  }

  isValid(): boolean {
    return this._characterForm.status === 'VALID';
  }

  exportData(): void {
    this._characterForm.controls['exportString']
      .setValue(
        JSON.stringify(User.getSettings(true)));
    this.angulartics2.eventTrack.next({
      action: 'Exported settings to string',
      properties: { category: 'General settings' },
    });
  }

  exportAsFile(): void {
    FileService.saveJSONToFile(User.getSettings(true), 'wah-settings.json');

    this.angulartics2.eventTrack.next({
      action: 'Exported settings to file',
      properties: { category: 'General settings' },
    });
  }

  importUser(): void {
    if (this.isImportStringNotEmpty()) {
      SharedService.user.watchlist
        .attemptRestoreFromString(this._characterForm.value.importString);
      User.import(this._characterForm.value.importString);

      this.angulartics2.eventTrack.next({
        action: 'Imported existing setup',
        properties: { category: 'General settings' },
      });

      this.saveRealmAndRegion();
    }
  }

  importFromFile(fileEvent): void {
    console.log('File', fileEvent);
    const files = fileEvent.target.files;
    const reader = new FileReader();
    reader.onload = () => {
      console.log(JSON.parse(reader.result));
      try {
        SharedService.user.watchlist
          .attemptRestoreFromString(reader.result);

        User.import(reader.result);

        this.angulartics2.eventTrack.next({
          action: 'Imported existing setup from file',
          properties: { category: 'General settings' },
        });

        this.saveRealmAndRegion();
      } catch (e) {
        console.error('Could not import from file', e);
      }
    };
    reader.readAsText(files[0]);
  }

  isImportStringNotEmpty(): boolean {
    return this._characterForm.value.importString.length > 0;
  }
}
