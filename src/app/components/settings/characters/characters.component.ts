import { FormGroup, FormBuilder } from '@angular/forms';
import { RealmService } from './../../../services/realm.service';
import { CharacterService } from './../../../services/character.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html'
})
export class CharactersComponent implements AfterViewInit {
  regions: Object;
  characters: Array<any> = new Array<any>();
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

  getCharacter(): void {
    this.characterService
      .getCharacter(
        this.characterForm.value.name,
        this.characterForm.value.realm,
        this.characterForm.value.region
      )
      .then(c => {
        this.characters.push(c);
        localStorage['characters'] = JSON.stringify(this.characters);
      });
  }

  getRegions(): string[] {
    return this.regions ? Object.keys(this.regions) : [];
  }
}
