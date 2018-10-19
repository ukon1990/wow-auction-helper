import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Angulartics2 } from 'angulartics2';

import { RealmService } from '../../../services/realm.service';
import { SharedService } from '../../../services/shared.service';
import { Realm } from '../../../models/realm';
import { Router } from '@angular/router';
import { User } from '../../../models/user/user';

@Component({
  selector: 'wah-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  isDownloadingRealm: boolean;
  _characterForm: FormGroup;
  locales = SharedService.locales;
  imagesForRoll = [
    {
      src: 'assets/img/auctions-default.jpg',
      alt: 'Default auctions window'
    }, {
      src: 'assets/img/auctions.jpg',
      alt: 'Searching for auctions'
    }, {
      src: 'assets/img/cart-darkmode.jpg',
      alt: 'Shopping cart in darkmode'
    }, {
      src: 'assets/img/cart-lightmode.jpg',
      alt: 'Shopping cart in light mode'
    }, {
      src: 'assets/img/crafting.jpg',
      alt: 'The crafting window'
    }, {
      src: 'assets/img/dashboard.jpg',
      alt: 'The dashboard'
    }, {
      src: 'assets/img/download.jpg',
      alt: 'Data download panel'
    }, {
      src: 'assets/img/my-auctions.jpg',
      alt: 'My auctions panel'
    }, {
      src: 'assets/img/trade-vendors.jpg',
      alt: 'Trade vendors window'
    }, {
      src: 'assets/img/watchlist-groups.jpg',
      alt: 'Watchlist'
    }, {
      src: 'assets/img/locale-support.jpg',
      alt: 'Support for different locales'
    }
  ];

  constructor(private _formBuilder: FormBuilder, private _realmService: RealmService, private _router: Router,
    private angulartics2: Angulartics2) {
    this._characterForm = this._formBuilder.group({
      region: ['eu', Validators.required],
      realm: ['aegwynn', Validators.required],
      tsmKey: '',
      wowUctionKey: '',
      importString: '',
      locale: localStorage['locale']
    });

    this._characterForm.controls.locale.valueChanges.subscribe(locale => {
      localStorage['locale'] = locale;
    });

    this.getRealms();
    this._characterForm.controls.region
          .valueChanges
        .subscribe(region => this.getRealms(region));
  }

  ngOnInit() {
    if (SharedService.user.realm && SharedService.user.region) {
      this._router.navigateByUrl('dashboard');
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.log('Not https!');
      location.href = window.location.href.replace('http', 'https');
    }
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

  getRealms(region?: string): void {
    this.isDownloadingRealm = true;
    setTimeout(() => {
      this._realmService
        .getRealms(region ? region : this._characterForm.value.region)
          .then(r => {
            this.isDownloadingRealm = false;
          })
          .catch(e => {
            this.isDownloadingRealm = false;
          });
    }, 100);
  }

  isValid(): boolean {
    return this._characterForm.status === 'VALID';
  }

  importUserData(): void {
    if (this._characterForm.value.importString.length > 0) {
      User.import(this._characterForm.value.importString);
      this.redirectUserFromRestore();
    }
  }

  importFromFile(fileEvent): void {
    console.log('File', fileEvent);
    const files = fileEvent.target.files;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        SharedService.user.watchlist
          .attemptRestoreFromString(reader.result);

        User.import(reader.result as string);

        this.angulartics2.eventTrack.next({
          action: 'Imported existing setup from file',
          properties: { category: 'User registration' },
        });

        this.redirectUserFromRestore();
      } catch (e) {
        console.error('Could not import from file', e);
      }
    };
    reader.readAsText(files[0]);
  }

  redirectUserFromRestore(): void {
    this._router.navigateByUrl('/crafting');
    this.angulartics2.eventTrack.next({
      action: 'Imported existing setup',
      properties: { category: 'User registration' },
    });
  }

  completeSetup(): void {
    if (this.isValid()) {
      localStorage['region'] = this._characterForm.value.region;
      localStorage['realm'] = this._characterForm.value.realm;
      localStorage['character'] = this._characterForm.value.name;

      localStorage['api_tsm'] = this._characterForm.value.tsmKey;
      localStorage['api_wowuction'] = this._characterForm.value.wowUctionKey;
      if (this._characterForm.value.tsmKey.length > 0) {
        localStorage['api_to_use'] = 'tsm';
      } else if (this._characterForm.value.wowUctionKey.length > 0) {
        localStorage['api_to_use'] = 'wowuction';
      } else {
        localStorage['api_to_use'] = 'none';
      }

      localStorage['timestamp_news'] = new Date().toLocaleDateString();

      User.restore();
      this._router.navigateByUrl('/dashboard');
      this.angulartics2.eventTrack.next({
        action: 'New user registered',
        properties: { category: 'User registration' },
      });
    }
  }

  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

  saveUser(evt: any): void {
    SharedService.user.isDarkMode = evt.checked;
  }
}
