import { Component, OnInit, AfterViewInit, Input, OnChanges } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { RealmService } from '../../../services/realm.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CharacterService } from '../../../services/character.service';
import { User } from '../../../models/user/user';
import { Realm } from '../../../models/realm';
import { AuctionHandler } from '../../../models/auction/auction-handler';
import { Crafting } from '../../../models/crafting/crafting';
import { CraftingService } from '../../../services/crafting.service';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'wah-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss']
})
export class CharactersComponent implements OnChanges, AfterViewInit {
  @Input() region: string;
  @Input() realm: string;

  regions: any;
  downloading: boolean;
  _characterForm: FormGroup;

  constructor(private _characterService: CharacterService,
    private _realmService: RealmService, private _craftingService: CraftingService,
    private formBuilder: FormBuilder, private angulartics2: Angulartics2
  ) {
    this._characterForm = this.formBuilder.group({
      region: SharedService.user.region,
      realm: SharedService.user.realm,
      name: ''
    });
  }

  ngAfterViewInit(): void {
    if (!SharedService.realms[this._characterForm.value.region]) {
      this.getRealms();
    }
  }

  ngOnChanges(change): void {
    if (change.realm && change.realm.currentValue) {
      this._characterForm.controls.realm.setValue(change.realm.currentValue);
    }

    if (change.region && change.region.currentValue) {
      this._characterForm.controls.region.setValue(change.region.currentValue);
    }
  }

  getCharacter(): void {
    this.downloading = true;
    this.angulartics2.eventTrack.next({
      action: 'Added',
      properties: { category: 'Characters' },
    });
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

        if (SharedService.user.region && SharedService.user.realm) {
          AuctionHandler.organize(SharedService.auctions);
        }
      }).catch(() => this.downloading = false);
  }

  updateCharacter(index: number): void {
    SharedService.user.characters[index]['downloading'] = true;
    this.angulartics2.eventTrack.next({
      action: 'Updated',
      properties: { category: 'Characters' },
    });
    this._characterService.getCharacter(
      SharedService.user.characters[index].name,
      SharedService.user.characters[index].realm
    ).then(c => {
      SharedService.user.characters[index] = c;
      localStorage['characters'] = JSON.stringify(SharedService.user.characters);
      User.updateRecipesForRealm();
      Crafting.checkForMissingRecipes(this._craftingService);

      if (SharedService.user.region && SharedService.user.realm) {
        AuctionHandler.organize(SharedService.auctions);
      }
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
      this._realmService
        .getRealms(this._characterForm.value.region);
    }, 100);
  }

  removeCharacter(index: number): void {
    SharedService.user.characters.splice(index, 1);
    localStorage['characters'] = JSON.stringify(SharedService.user.characters);
    User.updateRecipesForRealm();
    this.angulartics2.eventTrack.next({
      action: 'Removed',
      properties: { category: 'Characters' },
    });
  }

  getCharacters(): any[] {
    return SharedService.user.characters;
  }
}
