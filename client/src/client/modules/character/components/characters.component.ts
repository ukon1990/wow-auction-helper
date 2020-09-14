import {AfterViewInit, Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HttpErrorResponse} from '@angular/common/http';
import {CharacterService} from '../services/character.service';
import {RealmService} from '../../../services/realm.service';
import {CraftingService} from '../../../services/crafting.service';
import {AuctionsService} from '../../../services/auctions.service';
import {SharedService} from '../../../services/shared.service';
import {ErrorOptions, ErrorReport} from '../../../utils/error-report.util';
import {Character} from '../models/character.model';
import {AuctionUtil} from '../../auction/utils/auction.util';
import {Report} from '../../../utils/report.util';
import {Realm} from '../../../models/realm';
import {UserUtil} from '../../../utils/user/user.util';
import {DashboardService} from '../../dashboard/services/dashboard.service';
import {ProfessionService} from '../../crafting/services/profession.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';

@Component({
  selector: 'wah-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss']
})
export class CharactersComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() region: string;
  @Input() realm: string;

  regions: any;
  downloading: boolean;
  form: FormGroup;
  private sm = new SubscriptionManager();
  private shouldRecalculateDashboards: boolean;
  private lastCalculationTime: number;

  constructor(private characterService: CharacterService,
              private snackBar: MatSnackBar,
              private realmService: RealmService,
              private craftingService: CraftingService,
              private professionService: ProfessionService,
              private auctionService: AuctionsService,
              private dashboardService: DashboardService,
              private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      region: SharedService.user.region,
      realm: SharedService.user.realm,
      name: '',
      characterBelowLevelTen: false
    });

    this.sm.add(this.form.controls.name.valueChanges,
      name => this.handleCharacterNameChange(name));
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

  ngOnDestroy() {
    if (this.shouldRecalculateDashboards) {
      this.dashboardService.calculateAll();
    }
    this.sm.unsubscribe();
  }

  async getCharacter(name: string = this.form.value.name) {
    if (this.downloading || !name) {
      return;
    }

    this.downloading = true;

    if (this.professionService.list.value.length === 0) {
      this.professionService.getAll()
        .catch(console.error);
    }

    if (this.form.value.characterBelowLevelTen) {
      await this.addLowLevelCharacter();
      Report.send('Added level < 10 character', 'Characters');
    } else {
      this.characterService
        .getCharacter(
          name,
          this.form.value.realm,
          this.region ? this.region : SharedService.user.region
        )
        .then(c => {
          this.addCharacter(c);
          this.characterService.updateCharactersForRealmAndRecipes();
        })
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
        `${this.form.value.name} could not be found on ${this.form.value.realm}.`));
  }

  private addCharacter(c) {
    if (!c.error && c.status !== 'nok') {
      this.processCharacter(c);
      this.openSnackbar(`${c.name} was successfully added`);

      Report.send('Added character', 'Characters');
      this.shouldRecalculateDashboards = true;
    }
    this.downloading = false;
  }

  async addLowLevelCharacter(): Promise<void> {
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
    await this.processCharacter(character);
    return;
  }

  async processCharacter(character: Character): Promise<void> {
    this.form.controls.name.setValue('');
    SharedService.user.characters.push(character);
    localStorage['characters'] = JSON.stringify(SharedService.user.characters);

    this.characterService.updateCharactersForRealmAndRecipes();

    this.downloading = false;
    RealmService.gatherRealms();

    if (SharedService.user.region && SharedService.user.realm) {
      await this.auctionService.organize();
    }
  }

  updateCharacter(index: number): void {
    this.shouldRecalculateDashboards = true;
    const character: Character = SharedService.user.characters[index],
      professions = character.professions;
    if (character.level) {
      character['downloading'] = true;
      this.characterService.getCharacter(
        SharedService.user.characters[index].name,
        UserUtil.slugifyString(SharedService.user.characters[index].realm),
        this.form.value.region
      ).then(async c => {
        if (c && !c.error) {
          if (!c.professions) {
            c.professions = professions;
          }

          SharedService.user.characters[index] = c;
          localStorage['characters'] = JSON.stringify(SharedService.user.characters);
          this.characterService.updateCharactersForRealmAndRecipes();

          if (SharedService.user.region && SharedService.user.realm) {
            await this.auctionService.organize();
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
    return this.auctionService.auctions.getValue();
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
    this.shouldRecalculateDashboards = true;
    SharedService.user.characters.splice(index, 1);
    localStorage['characters'] = JSON.stringify(SharedService.user.characters);
    try {
      RealmService.gatherRealms();
      this.characterService.updateCharactersForRealmAndRecipes();
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

  private handleCharacterNameChange(name: any) {
    this.lastCalculationTime = +new Date();
    setTimeout(async () => {
      const timeDiff = +new Date() - this.lastCalculationTime;
      if (timeDiff >= 500) {
        await this.getCharacter(name);
      }
    }, 500);
  }
}
