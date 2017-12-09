import { Component, OnInit, Input, OnChanges, AfterViewInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { RealmService } from '../../../services/realm.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CharacterService } from '../../../services/character.service';
import { User } from '../../../models/user/user';
import { Realm } from '../../../models/realm';

@Component({
  selector: 'wah-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss']
})
export class CharactersComponent implements AfterViewInit, OnChanges {
  @Input() region: string;
  @Input() realm: string;

  regions: any;
  downloading: boolean;
  _characterForm: FormGroup;

  constructor(private _characterService: CharacterService,
    private _realmService: RealmService, private formBuilder: FormBuilder
  ) {
    this._characterForm = this.formBuilder.group({
      realm: '',
      name: ''
    });
  }

  ngOnChanges(change): void {
    if (change.realm && change.realm.currentValue) {
      this._characterForm.controls.realm.setValue(change.realm.currentValue);
    }
  }

  getCharacter(): void {
    this.downloading = true;
    this._characterService
      .getCharacter(
      this._characterForm.value.name,
      this._characterForm.value.realm,
      this.region ? this.region : SharedService.user.region
      )
      .then(c => {
        this._characterForm.controls.name.setValue('');
        SharedService.user.characters.push(c);
        localStorage['characters'] = JSON.stringify(SharedService.user.characters);
        this.downloading = false;
      }).catch(() => this.downloading = false);
  }

  updateCharacter(index: number): void {
    SharedService.user.characters[index]['downloading'] = true;
    this._characterService.getCharacter(
      SharedService.user.characters[index].name,
      SharedService.user.characters[index].realm
    ).then(c => {
      SharedService.user.characters[index] = c;
      localStorage['characters'] = JSON.stringify(SharedService.user.characters);
    });
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

  removeCharacter(index: number): void {
    SharedService.user.characters.splice(index, 1);
    localStorage['characters'] = JSON.stringify(SharedService.user.characters);
    User.updateRecipesForRealm();
  }

  getCharacters(): any[] {
    return SharedService.user.characters;
  }
}
