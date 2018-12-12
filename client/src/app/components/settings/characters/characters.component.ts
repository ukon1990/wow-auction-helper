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
import { Character } from '../../../models/character/character';
import { MatSnackBar } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorReport, ErrorOptions } from '../../../utils/error-report.util';

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
    private snackBar: MatSnackBar,
    private _realmService: RealmService, private _craftingService: CraftingService,
    private formBuilder: FormBuilder, private angulartics2: Angulartics2
  ) {
    this._characterForm = this.formBuilder.group({
      region: SharedService.user.region,
      realm: SharedService.user.realm,
      name: '',
      characterBelowLevelTen: false
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

    if (this._characterForm.value.characterBelowLevelTen) {
      this.addLowlevelCharacter();
      this.angulartics2.eventTrack.next({
        action: 'Added level < 10 character',
        properties: { category: 'Characters' },
      });
    }
    this._characterService
      .getCharacter(
        this._characterForm.value.name,
        this._characterForm.value.realm,
        this.region ? this.region : SharedService.user.region
      )
      .then(c => {
        if (!c.error) {
          this.processCharacter(c);
          this.openSnackbar(`${c.name} was successfully added`);
          this.angulartics2.eventTrack.next({
            action: 'Added character',
            properties: { category: 'Characters' },
          });
        } else {
          if (c.error.status === 404) {
            ErrorReport.sendHttpError(
              c.error,
              new ErrorOptions(
                true,
                `${
                this._characterForm.value.name
                } could not be found on the realm ${
                this._characterForm.value.realm
                }.`));
          } else {
            this.addLowlevelCharacter();
            ErrorReport.sendHttpError(
              c.error,
              new ErrorOptions(
                true,
                `Could not find any character data for ${
                this._characterForm.value.name
                }@${
                this._characterForm.value.realm
                }. Blizzard's service responded with: ${
                c.error.statusText
                }. The character will be added to your list, but with no profession data etc.
                 You can try to manually update the character later.`));
          }
        }
        this.downloading = false;
      }).catch((error: HttpErrorResponse) => {
        this.downloading = false;
        ErrorReport.sendHttpError(
          error,
          new ErrorOptions(
            true,
            `Something went wrong, while adding ${this._characterForm.value.name}.`));
      });
  }

  addLowlevelCharacter(): void {
    const character = new Character();
    character.name = this._characterForm.value.name;
    character.realm = SharedService.realms[this._characterForm.value.realm].name;
    character.thumbnail = '';
    character.level = 0;

    this.angulartics2.eventTrack.next({
      action: 'Added a lower than level 10 character',
      properties: { category: 'Characters' },
    });
    this.processCharacter(character);
    return;
  }

  processCharacter(character: Character): void {
    this._characterForm.controls.name.setValue('');
    SharedService.user.characters.push(character);
    localStorage['characters'] = JSON.stringify(SharedService.user.characters);

    User.updateRecipesForRealm();
    Crafting.checkForMissingRecipes(this._craftingService);

    this.downloading = false;
    Realm.gatherRealms();

    if (SharedService.user.region && SharedService.user.realm) {
      AuctionHandler.organize(SharedService.auctions);
    }
  }

  updateCharacter(index: number): void {
    SharedService.user.characters[index]['downloading'] = true;
    this._characterService.getCharacter(
      SharedService.user.characters[index].name,
      User.slugifyString(SharedService.user.characters[index].realm),
      this._characterForm.value.region
    ).then(c => {
      if (!c.error) {
        SharedService.user.characters[index] = c;
        localStorage['characters'] = JSON.stringify(SharedService.user.characters);
        User.updateRecipesForRealm();
        Crafting.checkForMissingRecipes(this._craftingService);

        if (SharedService.user.region && SharedService.user.realm) {
          AuctionHandler.organize(SharedService.auctions);
        }

        this.angulartics2.eventTrack.next({
          action: 'Updated',
          properties: { category: 'Characters' },
        });
      } else {
        delete SharedService.user.characters[index]['downloading'];
        ErrorReport.sendHttpError(
          c.error,
          new ErrorOptions(true, 'Could not update the character'));
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
    Realm.gatherRealms();

    if (SharedService.user.region && SharedService.user.realm) {
      AuctionHandler.organize(SharedService.auctions);
    }

    this.angulartics2.eventTrack.next({
      action: 'Removed character',
      properties: { category: 'Characters' },
    });
  }

  getCharacters(): any[] {
    return SharedService.user.characters;
  }

  private openSnackbar(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 15000 });
  }
}
