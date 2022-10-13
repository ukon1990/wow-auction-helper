import {Component, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SharedService} from '../../../../services/shared.service';
import {User} from '../../../../models/user/user';
import {RealmService} from '../../../../services/realm.service';
import {AuctionsService} from '../../../../services/auctions.service';
import {ItemService} from '../../../../services/item.service';
import {CraftingService} from '../../../../services/crafting.service';
import {PetsService} from '../../../../services/pets.service';
import {DatabaseService} from '../../../../services/database.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Report} from '../../../../utils/report.util';
import {Difference} from '@ukon1990/js-utilities/dist/models/difference.model';
import {ProfessionService} from '../../../crafting/services/profession.service';
import {ZoneService} from '../../../zone/service/zone.service';
import {NpcService} from '../../../npc/services/npc.service';
import {UserUtil} from '../../../../utils/user/user.util';
import {SettingsService} from '../../../user/services/settings/settings.service';

@Component({
  selector: 'wah-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnDestroy {
  form: FormGroup;
  originalUserObject: { realm: string; region: string; locale: string };
  userChanges: Map<string, Difference> = new Map<string, Difference>();

  subscriptions = new SubscriptionManager();

  constructor(private _formBuilder: FormBuilder,
              private _realmService: RealmService,
              private dbServie: DatabaseService,
              private itemService: ItemService,
              private craftingService: CraftingService,
              private zoneService: ZoneService,
              private petsService: PetsService,
              private npcService: NpcService,
              private settingsSync: SettingsService,
              private professionService: ProfessionService,
              private _auctionService: AuctionsService) {
    this.form = this._formBuilder.group({
      region: [SharedService.user.region, Validators.required],
      realm: [SharedService.user.realm, Validators.required],
      ahTypeId: [SharedService.user.ahTypeId || 0, Validators.required],
      importString: '',
      exportString: '',
      locale: localStorage['locale']
    });

    this.setOriginalUserObject();
    this.addSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private addSubscriptions() {
    this.subscriptions.add(
      this.form.valueChanges,
      (value) =>
        this.userChanges = this.getDifferenceMap(value)
    );
  }

  private getDifferenceMap({region, realm, locale}) {
    const differenceMap = new Map<string, any>();
    if (locale !== localStorage.getItem('locale')) {
      differenceMap.set('locale', locale);
    }
    if (region !== this.originalUserObject.region) {
      differenceMap.set('region', region);
    }
    if (realm !== this.originalUserObject.realm) {
      differenceMap.set('realm', realm);
    }
    return differenceMap;
  }

  isWithinSupported3RDPartyAPIRegion(): boolean {
    return this.form.getRawValue().region === 'eu' ||
      this.form.getRawValue().region === 'us';
  }

  hasRealmChanges(): boolean {
    return this.hasChangedRealmOrRegion() ||
      this.userChanges.has('locale');
  }

  async saveRealmAndRegion() {
    const {realm, region, locale, ahTypeId} = this.form.value;
    const hasLocaleChanges = this.userChanges.has('locale');

    if (hasLocaleChanges) {
      localStorage.setItem('locale', locale);
      await Promise.all([
        this.zoneService.get(),
        this.professionService.getAll(),
        this.itemService.getItems(),
        this.npcService.get(),
        this.petsService.getPets(),
        this.craftingService.get(this._realmService.isClassic)
      ])
        .catch(console.error);

      if (this.hasNotChangedRealmOrRegion()) {
        await this._auctionService.organize();
      }
    }

    if (locale !== localStorage.getItem('locale')) {
      this.settingsSync.updateSettings({locale});
    }

    if (this.hasChangedRealmOrRegion()) {
      await this._realmService.changeRealm(realm, region, ahTypeId);
    }
    this.setOriginalUserObject();
  }

  private hasNotChangedRealmOrRegion() {
    return !this.userChanges.has('region') && !this.userChanges.has('realm');
  }


  private setOriginalUserObject() {
    const user: User = SharedService.user;
    this.originalUserObject = {
      region: user.region,
      realm: user.realm,
      locale: user.locale
    };
  }

  isValid(): boolean {
    return this.form.status === 'VALID';
  }
/*
  exportData(): void {
    this.form.controls['exportString']
      .setValue(
        JSON.stringify(UserUtil.getSettings(true)));
    Report.send('Exported settings to string',
      'General settings');
  }

  exportAsFile(): void {
    FileService.saveJSONToFile(UserUtil.getSettings(true), `wah-settings-${SharedService.user.realm}.json`);

    Report.send(
      'Exported settings to file',
      'General settings');
  }
*/
  importUser(): void {
    if (this.isImportStringNotEmpty()) {
      UserUtil.import(this.form.value.importString);
      Report.send(
        'Imported existing setup',
        'General settings');

      this.saveRealmAndRegion();
    }
  }

  importFromFile(fileEvent): void {
    const files = fileEvent.target.files;
    const reader = new FileReader();
    reader.onload = () => {
      this.onFileLoaded(reader);
    };
    reader.readAsText(files[0]);
  }

  private onFileLoaded(reader) {
    try {
      UserUtil.import(reader.result.toString());

      Report.send('Imported existing setup from file', 'General settings');

      this.saveRealmAndRegion()
        .catch(console.error);
    } catch (e) {
      console.error('Could not import from file', e);
    }
  }

  isImportStringNotEmpty(): boolean {
    return this.form.value.importString.length > 0;
  }

  deleteUser(): void {
    localStorage.clear();
    this.dbServie.deleteDB()
      .then(() => location.reload());
  }

  realmSelectionEvent(change: { region: string; realm: string; locale: string, ahTypeId: number }) {
    if (!change.region || !change.realm) {
      return;
    }
    console.log('yo', change);
    Object.keys(change)
      .forEach(key =>
        this.form.controls[key]
          .setValue(change[key]));
  }

  private hasChangedRealmOrRegion(): boolean {
    return this.userChanges.has('region') ||
      this.userChanges.has('realm');
  }
}