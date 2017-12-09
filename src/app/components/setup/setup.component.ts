import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RealmService } from '../../services/realm.service';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { SharedService } from '../../services/shared.service';
import { Realm } from '../../models/realm';

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

  constructor(private _formBuilder: FormBuilder, private _realmService: RealmService) {
    this._characterForm = this._formBuilder.group({
      region: ['', Validators.required],
      realm: ['', Validators.required]
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

  completeSetup(): void {
    // logic
  }
}
