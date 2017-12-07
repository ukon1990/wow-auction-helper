import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RealmService } from '../../services/realm.service';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'wah-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  _characterForm: FormGroup;

  constructor(private _formBuilder: FormBuilder, private _realmService: RealmService) {
    this._characterForm = this._formBuilder.group({
      region: ['', Validators.required],
      realm: ['', Validators.required]
    });

    this._characterForm.controls.region.valueChanges.pipe(
      startWith(''),
      map(region => this._realmService.getRealms(region))
    );
  }

  ngOnInit() {
  }

  getRealmsKeys() {
    return Object.keys(SharedService.realms);
  }
}
