import { FormGroup, FormBuilder } from '@angular/forms';
import { RealmService } from './../../../services/realm.service';
import { CharacterService } from './../../../services/character.service';
import { Component, Input, OnInit, AfterViewInit, OnChanges } from '@angular/core';
import { User } from 'app/models/user';

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html'
})
export class CharactersComponent implements AfterViewInit, OnChanges {
  @Input() region: string;
  @Input() realm: string;

  regions: Object;
  downloading: boolean;
  characterForm: FormGroup;

  constructor(private characterService: CharacterService,
    private realmService: RealmService, private formBuilder: FormBuilder
  ) {
    this.characterForm = this.formBuilder.group({
      region: '',
      realm: '',
      name: ''
    });
  }

  ngAfterViewInit() {
    this.realmService.getRealms()
      .then(r => {
        console.log(r);
        this.regions = r.region;
      });
  }

  ngOnChanges(change): void {
    if (change.region && change.region.currentValue) {
      this.characterForm.controls.region.setValue(change.region.currentValue);
    }

    if (change.realm && change.realm.currentValue) {
      this.characterForm.controls.realm.setValue(change.realm.currentValue);
    }
  }

  getCharacter(): void {
    this.downloading = true;
    this.characterService
      .getCharacter(
      this.characterForm.value.name,
      this.characterForm.value.realm,
      this.characterForm.value.region
      )
      .then(c => {
        this.characterForm.controls.name.setValue('');
        CharacterService.user.characters.push(c);
        localStorage['characters'] = JSON.stringify(CharacterService.user.characters);
        this.downloading = false;
      }).catch(() => this.downloading = false);
  }

  updateCharacter(index: number): void {
    CharacterService.user.characters[index]['downloading'] = true;
    this.characterService.getCharacter(
      CharacterService.user.characters[index].name,
      CharacterService.user.characters[index].realm
    ).then(c => {
      CharacterService.user.characters[index] = c;
      localStorage['characters'] = JSON.stringify(CharacterService.user.characters);
    });
  }

  getRegions(): string[] {
    return this.regions ? Object.keys(this.regions) : [];
  }

  removeCharacter(index: number): void {
    CharacterService.user.characters.splice(index, 1);
    localStorage['characters'] = JSON.stringify(CharacterService.user.characters);
    User.updateRecipesForRealm();
  }

  getCharacters(): any[] {
    return CharacterService.user.characters;
  }
}
