import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SharedService} from '../../../services/shared.service';
import {Realm} from '../../../models/realm';
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

@Component({
  selector: 'wah-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit, OnDestroy {
  form: FormGroup;
  changedLocales = false;
  changedRealm = false;


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
      tsmKey: SharedService.user.apiTsm,
      wowUctionKey: SharedService.user.apiWoWu,
      importString: '',
      exportString: '',
      locale: localStorage['locale'],
      updateAPIOnRealmChange: this.getUpdateAPIOnRealmChange()
    });

    this.subscriptions.add(
      this.form.controls.region.valueChanges,
      () => {
        this.changedRealm = true;
      }
    );

    this.subscriptions.add(
      this.form.controls.realm.valueChanges,
      () => {
        this.setSelectedRealm();
      });

    this.subscriptions.add(
      this.form.controls.locale.valueChanges,
      () => {
        this.changedLocales = true;
      });

    this.subscriptions.add(
      this.form.controls.updateAPIOnRealmChange.valueChanges,
      (value) => this.setUpdateAPIOnRealmChange(value));
  }

  private setUpdateAPIOnRealmChange(value: boolean): void {
    localStorage.setItem('updateAPIOnRealmChange', value.toString());
  }

  private getUpdateAPIOnRealmChange() {
    const value = localStorage.getItem('updateAPIOnRealmChange');
    return value ? JSON.parse(value) : false;
  }

  private setSelectedRealm() {
    this.changedRealm = true;
  }

  ngOnInit() {
    if (!SharedService.realms || Object.keys(SharedService.realms).length === 0) {
      this.getRealms();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  isWithinSupported3RDPartyAPIRegion(): boolean {
    return this.form.getRawValue().region === 'eu' ||
      this.form.getRawValue().region === 'us';
  }

  hasRealmChange(): boolean {
    return SharedService.user.realm !== this.form.value.realm ||
      SharedService.user.region !== this.form.value.region;
  }

  async saveRealmAndRegion() {
    if (this.changedLocales) {
      localStorage['locale'] = this.form.value.locale;
      delete localStorage['timestamp_items'];
      await this.itemService.getItems();
      delete localStorage['timestamp_pets'];
      await this.petsService.getPets();
      delete localStorage['timestamp_recipes'];
      await this.craftingService.getRecipes();

      // Updating the watchlist names
      SharedService.user.watchlist.groups.forEach(g => {
        g.items.forEach(i => {
          if (SharedService.items[i.itemID]) {
            i.name = SharedService.items[i.itemID].name;
          }
        });
      });
      SharedService.user.watchlist.save();

      this.changedLocales = false;

      if (!this.changedRealm) {
        AuctionHandler.organize(SharedService.auctions);
      }
    }

    if (this.changedRealm) {
      await this._realmService.changeRealm(
        this._auctionService,
        this.form.value.realm,
        this.form.value.region,
        false);
      this.changedRealm = false;
    }
  }

  hasTSMKeyChanged(): boolean {
    return SharedService.user.apiTsm !== this.form.value.tsmKey;
  }

  hasWoWUctionKeyChanged(): boolean {
    return SharedService.user.apiWoWu !== this.form.value.wowUctionKey;
  }

  saveWoWuction(): void {
    SharedService.user.apiWoWu = this.form.value.wowUctionKey;
    if (SharedService.user.apiWoWu.length > 0) {
      SharedService.user.apiToUse = 'wowuction';
      this._auctionService.getWoWUctionAuctions();
    } else {
      SharedService.user.apiToUse = 'none';
    }
    User.save();
  }

  isUsingWoWUction(): boolean {
    return SharedService.user.apiToUse === 'wowuction';
  }

  isUsingTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }

  saveTSMKey(): void {
    SharedService.user.apiTsm = this.form.value.tsmKey;
    if (SharedService.user.apiTsm.length > 0) {
      SharedService.user.apiToUse = 'tsm';
      this._auctionService.getTsmAuctions();
    } else {
      SharedService.user.apiToUse = 'none';
    }
    User.save();
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

  getRealms(region?: string): void {
    setTimeout(() => {
      this._realmService
        .getRealms(region ? region : this.form.value.region);
    }, 100);
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
}
