import {Component, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SharedService} from '../../../services/shared.service';
import {User} from '../../../models/user/user';
import {RealmService} from '../../../services/realm.service';
import {AuctionsService} from '../../../services/auctions.service';
import {Angulartics2} from 'angulartics2';
import {FileService} from '../../../services/file.service';
import {ItemService} from '../../../services/item.service';
import {CraftingService} from '../../../services/crafting.service';
import {PetsService} from '../../../services/pets.service';
import {AuctionHandler} from '../../../models/auction/auction-handler';
import {DatabaseService} from '../../../services/database.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {Report} from '../../../utils/report.util';
import {ObjectUtil} from '@ukon1990/js-utilities/dist/utils/object.util';
import {Difference} from '@ukon1990/js-utilities/dist/models/difference.model';

@Component({
  selector: 'wah-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnDestroy {
  form: FormGroup;
  originalUserObject: User;
  userChanges: Map<string, Difference> = new Map<string, Difference>();

  subscriptions = new SubscriptionManager();

  constructor(private _formBuilder: FormBuilder,
              private angulartics2: Angulartics2,
              private _realmService: RealmService,
              private dbServie: DatabaseService,
              private itemService: ItemService,
              private craftingService: CraftingService,
              private petsService: PetsService,
              private _auctionService: AuctionsService) {
    this.form = this._formBuilder.group({
      region: [SharedService.user.region, Validators.required],
      realm: [SharedService.user.realm, Validators.required],
      apiTsm: SharedService.user.apiTsm,
      importString: '',
      exportString: '',
      locale: localStorage['locale'],
      updateAPIOnRealmChange: this.getUpdateAPIOnRealmChange()
    });

    this.setOriginalUserObject();
    this.addSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private addSubscriptions() {
    this.subscriptions.add(
      this.form.controls.updateAPIOnRealmChange.valueChanges,
      (value) => this.setUpdateAPIOnRealmChange(value));

    this.subscriptions.add(
      this.form.valueChanges,
      (value) =>
        this.userChanges = this.getDifferenceMap(value)
    );
  }

  private getDifferenceMap(value) {
    const differenceMap = new Map<string, any>();
    ObjectUtil
      .getDifference(
        this.originalUserObject,
        value,
        undefined,
        Object.keys(this.form.getRawValue()))
      .forEach(field =>
        differenceMap.set(field.name, field));
    return differenceMap;
  }

  private setUpdateAPIOnRealmChange(value: boolean): void {
    localStorage.setItem('updateAPIOnRealmChange', value.toString());
  }

  private getUpdateAPIOnRealmChange() {
    const value = localStorage.getItem('updateAPIOnRealmChange');
    return value ? JSON.parse(value) : false;
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
    if (this.userChanges.has('locale')) {
      localStorage['locale'] = this.form.value.locale;
      delete localStorage['timestamp_items'];
      await this.itemService.getItems();
      delete localStorage['timestamp_pets'];
      await this.petsService.getPets();
      delete localStorage['timestamp_recipes'];
      await this.craftingService.getRecipes();

      // Updating the watchlist names
      this.updateWatchlistItemNamesToNewLocale();


      if (this.hasNotChangedRealmOrRegion()) {
        AuctionHandler.organize(SharedService.auctions);
      }
    }

    if (this.hasChangedRealmOrRegion()) {
      await this._realmService.changeRealm(
        this._auctionService,
        this.form.value.realm,
        this.form.value.region,
        false);
    }
    this.setOriginalUserObject();
  }

  private hasNotChangedRealmOrRegion() {
    return !this.userChanges.has('region') && !this.userChanges.has('realm');
  }

  private updateWatchlistItemNamesToNewLocale() {
    SharedService.user.watchlist.groups.forEach(g => {
      g.items.forEach(i => {
        if (SharedService.items[i.itemID]) {
          i.name = SharedService.items[i.itemID].name;
        }
      });
    });
    SharedService.user.watchlist.save();
  }

  isUsingTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }

  saveTSMKey(): void {
    SharedService.user.apiTsm = this.form.value.apiTsm;
    if (SharedService.user.apiTsm.length > 0) {
      SharedService.user.apiToUse = 'tsm';
      this._auctionService.getTsmAuctions();
    } else {
      SharedService.user.apiToUse = 'none';
    }
    User.save();
    this.setOriginalUserObject();
  }

  private setOriginalUserObject() {
    this.originalUserObject = ObjectUtil.clone(SharedService.user) as User;
  }

  isValid(): boolean {
    return this.form.status === 'VALID';
  }

  exportData(): void {
    this.form.controls['exportString']
      .setValue(
        JSON.stringify(User.getSettings(true)));
    Report.send('Exported settings to string',
      'General settings');
  }

  exportAsFile(): void {
    FileService.saveJSONToFile(User.getSettings(true), `wah-settings-${SharedService.user.realm}.json`);

    Report.send(
      'Exported settings to file',
      'General settings');
  }

  importUser(): void {
    if (this.isImportStringNotEmpty()) {
      SharedService.user.watchlist
        .attemptRestoreFromString(this.form.value.importString);
      User.import(this.form.value.importString);
      Report.send(
        'Imported existing setup',
        'General settings');

      this.saveRealmAndRegion();
    }
  }

  importFromFile(fileEvent): void {
    console.log('File', fileEvent);
    const files = fileEvent.target.files;
    const reader = new FileReader();
    reader.onload = () => {
      this.onFileLoaded(reader);
    };
    reader.readAsText(files[0]);
  }

  private onFileLoaded(reader) {
    console.log(reader.result);
    try {
      SharedService.user.watchlist
        .attemptRestoreFromString(reader.result);

      User.import(reader.result.toString());

      this.angulartics2.eventTrack.next({
        action: 'Imported existing setup from file',
        properties: {category: 'General settings'},
      });

      this.saveRealmAndRegion();
    } catch (e) {
      console.error('Could not import from file', e);
    }
  }

  isImportStringNotEmpty(): boolean {
    return this.form.value.importString.length > 0;
  }

  deleteUser(): void {
    localStorage.clear();
    this.dbServie.clearDB();
    setTimeout(() => {
      location.reload();
    }, 2000);
  }

  realmSelectionEvent(change: { region: string; realm: string; locale: string }) {
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
