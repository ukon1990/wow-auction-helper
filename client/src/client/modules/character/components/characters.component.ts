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
import {DashboardService} from '../../dashboard/services/dashboard.service';
import {ProfessionService} from '../../crafting/services/profession.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {TextUtil} from '@ukon1990/js-utilities';
import {CraftingUtil} from '../../crafting/utils/crafting.util';
import {SettingsService} from '../../user/services/settings/settings.service';

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
  shouldRecalculateDashboards: boolean;
  private lastCalculationTime: number;

  constructor(public characterService: CharacterService,
              private settingSync: SettingsService,
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
    let firstDuplicateIndex: number;
    this.characterService.characters.value.forEach((character, index) => {
      if (TextUtil.isEqualIgnoreCase(character.slug, this.form.value.realm) &&
        TextUtil.isEqualIgnoreCase(character.name, name)) {
        firstDuplicateIndex = index;
        return character;
      }
    });
    if (firstDuplicateIndex !== undefined) {
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
          this.handleCharacterError(error, name));
    }
  }

  private handleCharacterError(error: HttpErrorResponse, name: string) {
    this.downloading = false;
    ErrorReport.sendHttpError(
      error,
      new ErrorOptions(
        true,
        `${name} could not be found on ${this.form.value.realm}. If you are sure that the name matches, try loggin in and out of the character.`));
  }

  private addCharacter(c) {
    if (!c.error && c.status !== 'nok') {
      this.processCharacter(c);
      this.characterService.updateAppSync();
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
      main: '',
      avatar: '',
      inset: '',
    };
    character.level = 0;

    Report.send('Added a lower than level 10 character', 'Characters');
    await this.processCharacter(character);
    return;
  }

  async processCharacter(character: Character): Promise<void> {
    this.form.controls.name.setValue('');
    this.characterService.characters.value.push(character);
    localStorage['characters'] = JSON.stringify(this.characterService.characters.value);

    this.characterService.updateCharactersForRealmAndRecipes();

    this.downloading = false;
    RealmService.gatherRealms();

    if (SharedService.user.region && SharedService.user.realm) {
      await this.auctionService.organize();
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
      if (timeDiff >= 1000) {
        await this.getCharacter(name);
      }
    }, 1000);
  }
}
