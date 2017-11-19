import { Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { lists } from '../../utils/globals';
import { RealmService } from '../../services/realm.service';
import { CharacterService } from '../../services/character.service';
import { Title } from '@angular/platform-browser';

declare const ga: Function;
@Component({
  selector: 'app-selector',
  templateUrl: 'front.page.component.html'
})

export class FrontPageComponent implements OnInit {
  u;
  regions: Object;
  userForm: FormGroup;
  userCrafterForm: FormGroup;
  importSettingsForm: FormGroup;
  userCrafter: string;

  constructor(private formBuilder: FormBuilder, private router: Router,
    private titleService: Title, private rs: RealmService, private characterService: CharacterService) {
    this.userForm = this.formBuilder.group({
      region: '',
      realm: '',
      name: '',
      tsmKey: ''
    });
    this.userCrafterForm = formBuilder.group({
      'query': ''
    });
    this.importSettingsForm = formBuilder.group({
      'settings': ''
    });
    this.titleService.setTitle('Wah - Setup');
  }

  ngOnInit(): void {
    this.rs.getRealms().then(
      r => {
        this.regions = r.region;
      });
    if (localStorage['realm'] && localStorage['region']) {
      this.router.navigateByUrl('/crafting');
    }
  }

  getRegions(): string[] {
    return this.regions ? Object.keys(this.regions) : [];
  }

  registerUser(): void {
    if (this.isValid()) {
      localStorage['region'] = this.userForm.value.region;
      localStorage['realm'] = this.userForm.value.realm;
      localStorage['character'] = this.userForm.value.name;

      if (this.userForm.value.tsmKey.length > 0) {
        localStorage['api_tsm'] = this.userForm.value.tsmKey;
        localStorage['api_to_use'] = 'tsm';
      } else {
        localStorage['api_to_use'] = 'none';
      }

      localStorage['timestamp_news'] = new Date().toLocaleDateString();

      ga('send', {
        hitType: 'event',
        eventCategory: 'User registration',
        eventAction: 'New user registered'
      });

      this.router.navigateByUrl('/crafting');
    }
  }

  isValid() {
    return this.userForm.value.region && this.userForm.value.region.length > 0 && this.userForm.value.realm && this.userForm.value.realm.length > 0;
  }

  getRealmValue(realm): void {
    this.u.realm = realm;
    console.log('realm: ' + realm);
  }

  importUserData(): void {
    this.u = JSON.parse(this.importSettingsForm.value['settings']);
  }

  addCrafter() {
    this.u.crafters.push(this.userCrafterForm.value['query']);
    this.userCrafterForm.value['query'] = '';
  }

  removeCrafter(index: number) {
    this.u.crafters.splice(index, 1);
  }

  getMyRecipeCount(): number {
    return lists.myRecipes.length;
  }
}
