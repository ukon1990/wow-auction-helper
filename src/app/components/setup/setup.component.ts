import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RealmService } from '../../services/realm.service';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { SharedService } from '../../services/shared.service';
import { Realm } from '../../models/realm';
import { Router } from '@angular/router';
import { User } from '../../models/user/user';

@Component({
  selector: 'wah-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  _characterForm: FormGroup;
  imagesForRoll = [
    {
      src: 'https://i.ytimg.com/vi/BldfMdBK8bs/maxresdefault.jpg',
      alt: 'Homer'
    }, {
      src: 'http://www.dagsavisen.no/polopoly_fs/1.301032.1442908298!/image/image.jpg_gen/derivatives/169_1600/image.jpg',
      alt: 'Skomaker andersen'
    }
  ];

  constructor(private _formBuilder: FormBuilder, private _realmService: RealmService, private _router: Router) {
    this._characterForm = this._formBuilder.group({
      region: ['', Validators.required],
      realm: ['', Validators.required],
      tsmKey: '',
      importString: ''
    });
  }

  ngOnInit() {
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
      console.log('valg', this._characterForm.value.region);
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

      this._router.navigateByUrl('/crafting');
    }
  }

  completeSetup(): void {
    if (this.isValid()) {
      localStorage['region'] = this._characterForm.value.region;
      localStorage['realm'] = this._characterForm.value.realm;
      localStorage['character'] = this._characterForm.value.name;

      if (this._characterForm.value.tsmKey.length > 0) {
        localStorage['api_tsm'] = this._characterForm.value.tsmKey;
        localStorage['api_to_use'] = 'tsm';
      } else {
        localStorage['api_to_use'] = 'none';
      }

      localStorage['timestamp_news'] = new Date().toLocaleDateString();

      /*
      ga('send', {
        hitType: 'event',
        eventCategory: 'User registration',
        eventAction: 'New user registered'
      });*/

      this._router.navigateByUrl('/crafting');
    }
  }
}
