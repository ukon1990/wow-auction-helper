import {AfterViewInit, Component, Input, OnChanges} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {CharacterService} from '../../../services/character.service';
import {RealmService} from '../../../services/realm.service';
import {CraftingService} from '../../../services/crafting.service';
import {AuctionsService} from '../../../services/auctions.service';
import {SharedService} from '../../../services/shared.service';
import {ErrorOptions, ErrorReport} from '../../../utils/error-report.util';
import {Character} from '../models/character.model';
import {CraftingUtil} from '../../crafting/utils/crafting.util';
import {AuctionUtil} from '../../auction/utils/auction.util';
import {Report} from '../../../utils/report.util';
import {Realm} from '../../../models/realm';
import {User} from '../../../models/user/user';

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
  form: FormGroup;

  constructor(private _characterService: CharacterService,
              private snackBar: MatSnackBar,
              private realmService: RealmService,
              private craftingService: CraftingService,
              private auctionService: AuctionsService,
              private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      region: SharedService.user.region,
      realm: SharedService.user.realm,
      name: '',
      characterBelowLevelTen: false
    });
  }

  ngAfterViewInit(): void {
    if (!SharedService.realms[this.form.value.region]) {
      this.getRealms();
    }
  }

  ngOnChanges(change): void {
    if (change.realm && change.realm.currentValue) {
      this.form.controls.realm.setValue(change.realm.currentValue);
    }

    if (change.region && change.region.currentValue) {
      this.form.controls.region.setValue(change.region.currentValue);
    }
  }

  getCharacter(): void {
    this.downloading = true;

    if (this.form.value.characterBelowLevelTen) {
      this.addLowLevelCharacter();
      Report.send('Added level < 10 character', 'Characters');
    } else {
      this._characterService
        .getCharacter(
          this.form.value.name,
          this.form.value.realm,
          this.region ? this.region : SharedService.user.region
        )
        .then(c =>
          this.addCharacter(c))
        .catch((error: HttpErrorResponse) =>
          this.handleCharacterError(error));
    }
  }

  private handleCharacterError(error: HttpErrorResponse) {
    this.downloading = false;
    ErrorReport.sendHttpError(
      error,
      new ErrorOptions(
        true,
        `Something went wrong, while adding ${this.form.value.name}.`));
  }

  private addCharacter(c) {
    if (!c.error && c.status !== 'nok') {
      this.processCharacter(c);
      this.openSnackbar(`${c.name} was successfully added`);

      Report.send('Added character', 'Characters');
    } else {
      if (c.error.status === 404) {
        ErrorReport.sendHttpError(
          c.error,
          new ErrorOptions(
            true,
            `${
              this.form.value.name
            } could not be found on the realm ${
              this.form.value.realm
            }.`));
      }
    }
    this.downloading = false;
  }

  addLowLevelCharacter(): void {
    const character = new Character();
    character.name = this.form.value.name;
    character.realm = SharedService.realms[this.form.value.realm].name;
    character.media = {
      renderUrl: '',
      avatarUrl: '',
      bustUrl: '',
    };
    character.level = 0;

    Report.send('Added a lower than level 10 character', 'Characters');
    this.processCharacter(character);
    return;
  }

  processCharacter(character: Character): void {
    this.form.controls.name.setValue('');
    SharedService.user.characters.push(character);
    localStorage['characters'] = JSON.stringify(SharedService.user.characters);

    User.updateRecipesForRealm();

    this.downloading = false;
    Realm.gatherRealms();

    if (SharedService.user.region && SharedService.user.realm) {
      AuctionUtil.organize(SharedService.auctions);
    }
  }

  updateCharacter(index: number): void {
    const character: Character = SharedService.user.characters[index],
      professions = character.professions;
    if (character.level) {
      character['downloading'] = true;
      this._characterService.getCharacter(
        SharedService.user.characters[index].name,
        User.slugifyString(SharedService.user.characters[index].realm),
        this.form.value.region
      ).then(c => {
        if (c && !c.error) {
          if (!c.professions) {
            c.professions = professions;
          }

          SharedService.user.characters[index] = c;
          localStorage['characters'] = JSON.stringify(SharedService.user.characters);
          User.updateRecipesForRealm();

          if (SharedService.user.region && SharedService.user.realm) {
            AuctionUtil.organize(
              this.getAuctions());
          }


          Report.send('Updated', 'Characters');
        } else {
          delete SharedService.user.characters[index]['downloading'];
          ErrorReport.sendHttpError(
            c.error,
            new ErrorOptions(true, 'Could not update the character'));
        }
      });
    }
  }

  private getAuctions() {
    return this.auctionService.events.list.getValue();
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

  getRealms(): void {
    setTimeout(() => {
      this.realmService
        .getRealms(this.form.value.region);
    }, 100);
  }

  removeCharacter(index: number): void {
    SharedService.user.characters.splice(index, 1);
    localStorage['characters'] = JSON.stringify(SharedService.user.characters);
    try {
      User.updateRecipesForRealm();
      Realm.gatherRealms();
    } catch (e) {
      ErrorReport.sendError('removeCharacter', e);
    }

    if (SharedService.user.region && SharedService.user.realm) {
      AuctionUtil.organize(this.getAuctions());
    }

    Report.send('Removed character', 'Characters');
  }

  getCharacters(): any[] {
    return SharedService.user.characters;
  }

  private openSnackbar(message: string): void {
    this.snackBar.open(message, 'Ok', {duration: 15000});
  }

  realmSelectionEvent(change: { region: string; realm: string; locale: string }) {
    Object.keys(change)
      .forEach(key => {
        const control: AbstractControl = this.form.controls[key];
        if (control) {
          control.setValue(change[key]);
        }
      });
  }
}
