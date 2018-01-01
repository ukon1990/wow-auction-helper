import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { Realm } from '../../../models/realm';
import { User } from '../../../models/user/user';
import { RealmService } from '../../../services/realm.service';

@Component({
  selector: 'wah-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  _characterForm: FormGroup;

  constructor(private _formBuilder: FormBuilder, private _realmService: RealmService) {
    this._characterForm = this._formBuilder.group({
      region: ['', Validators.required],
      realm: ['', Validators.required],
      tsmKey: '',
      importString: ''
    });
  }

  ngOnInit() {
  }

  saveChanges(): void {}

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
