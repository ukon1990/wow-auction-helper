import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {startWith, map} from 'rxjs/operators';
import {Angulartics2} from 'angulartics2';

import {RealmService} from '../../../services/realm.service';
import {SharedService} from '../../../services/shared.service';
import {Realm} from '../../../models/realm';
import {Router} from '@angular/router';
import {User} from '../../../models/user/user';
import {Report} from '../../../utils/report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {RealmStatus} from '../../../models/realm-status.model';

@Component({
  selector: 'wah-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  form: FormGroup;
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

  sm = new SubscriptionManager();

  constructor(private _formBuilder: FormBuilder, private _realmService: RealmService, private _router: Router,
              private angulartics2: Angulartics2) {
    this.form = this._formBuilder.group({
      region: ['eu', Validators.required],
      realm: ['aegwynn', Validators.required],
      tsmKey: '',
      wowUctionKey: '',
      importString: '',
      locale: localStorage['locale']
    });

    this.sm.add(
      this.form.controls.locale.valueChanges,
      locale => {
        localStorage['locale'] = locale;
      });
  }

  ngOnInit() {
    if (SharedService.user.realm && SharedService.user.region) {
      this._router.navigateByUrl('dashboard');
    }
  }

  isWithinSupported3RDPartyAPIRegion(): boolean {
    return this.form.getRawValue().region === 'eu' ||
      this.form.getRawValue().region === 'us';
  }

  getRealmsKeys() {
    return SharedService.realms ? Object.keys(SharedService.realms) : [];
  }

  getRealmWithkey(slug?: string): Realm {
    if (!slug) {
      slug = this.form.value.realm;
    }
    return SharedService.realms[slug] ? SharedService.realms[slug] : new Realm();
  }

  isValid(): boolean {
    return this.form.status === 'VALID';
  }

  importUserData(): void {
    if (this.form.value.importString.length > 0) {
      User.import(this.form.value.importString);
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
          properties: {category: 'User registration'},
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
      properties: {category: 'User registration'},
    });
  }

  completeSetup(): void {
    if (this.isValid()) {
      localStorage['region'] = this.form.value.region;
      localStorage['realm'] = this.form.value.realm;
      localStorage['character'] = this.form.value.name;

      localStorage['api_tsm'] = this.form.value.tsmKey;
      localStorage['api_wowuction'] = this.form.value.wowUctionKey;
      if (this.form.value.tsmKey.length > 0) {
        localStorage['api_to_use'] = 'tsm';
      } else if (this.form.value.wowUctionKey.length > 0) {
        localStorage['api_to_use'] = 'wowuction';
      } else {
        localStorage['api_to_use'] = 'none';
      }

      localStorage['timestamp_news'] = new Date().toLocaleDateString();

      User.restore();
      this._router.navigateByUrl('/dashboard');
      Report.send('New user registered', 'User registration');
    }
  }

  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

  saveUser(evt: any): void {
    SharedService.user.isDarkMode = evt.checked;
  }

  realmSelectionEvent(change: { region: string; realm: string; locale: string }) {
    Object.keys(change)
      .forEach(key =>
        this.form.controls[key]
          .setValue(change[key]));
  }
}
