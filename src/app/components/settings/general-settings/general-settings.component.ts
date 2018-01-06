import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { Realm } from '../../../models/realm';
import { User } from '../../../models/user/user';
import { RealmService } from '../../../services/realm.service';
import { AuctionsService } from '../../../services/auctions.service';

@Component({
  selector: 'wah-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  _characterForm: FormGroup;

  constructor(private _formBuilder: FormBuilder, private _realmService: RealmService, private _auctionService: AuctionsService) {
    this._characterForm = this._formBuilder.group({
      region: [ SharedService.user.region, Validators.required],
      realm: [ SharedService.user.realm, Validators.required],
      tsmKey: SharedService.user.apiTsm,
      importString: ''
    });
  }

  ngOnInit() {
    if (!SharedService.realms || Object.keys(SharedService.realms).length === 0) {
      this.getRealms();
    }
  }

  async saveRealmAndRegion() {
    SharedService.user.region = this._characterForm.value.region;
    SharedService.user.realm = this._characterForm.value.realm;
    User.save();

    await this._auctionService.getLastModifiedTime(true);
    if (SharedService.user.apiToUse !== 'none') {
      await this._auctionService.getTsmAuctions();
    }
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

  importUserData(): void {
    if (this._characterForm.value.importString.length > 0) {
      User.import(this._characterForm.value.importString);
      /*ga('send', {
        hitType: 'event',
        eventCategory: 'User registration',
        eventAction: 'Imported existing setup'
      });*/
    }
  }
}
