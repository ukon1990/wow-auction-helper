import {Component, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SharedService} from '../../../../services/shared.service';
import {User} from '../../../../models/user/user';
import {RealmService} from '../../../../services/realm.service';
import {AuctionsService} from '../../../../services/auctions.service';
import {FileService} from '../../../../services/file.service';
import {ItemService} from '../../../../services/item.service';
import {CraftingService} from '../../../../services/crafting.service';
import {PetsService} from '../../../../services/pets.service';
import {AuctionUtil} from '../../../auction/utils/auction.util';
import {DatabaseService} from '../../../../services/database.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Report} from '../../../../utils/report.util';
import {ObjectUtil} from '@ukon1990/js-utilities/dist/utils/object.util';
import {Difference} from '@ukon1990/js-utilities/dist/models/difference.model';
import {ProfessionService} from '../../../crafting/services/profession.service';
import {ZoneService} from '../../../zone/service/zone.service';
import {NpcService} from '../../../npc/services/npc.service';

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
              private _realmService: RealmService,
              private dbServie: DatabaseService,
              private itemService: ItemService,
              private craftingService: CraftingService,
              private zoneService: ZoneService,
              private petsService: PetsService,
              private npcService: NpcService,
              private professionService: ProfessionService,
              private _auctionService: AuctionsService) {
    this.form = this._formBuilder.group({
      region: [SharedService.user.region, Validators.required],
      realm: [SharedService.user.realm, Validators.required],
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
    if (this.userChanges.has('locale')) {
      localStorage['locale'] = this.form.value.locale;
      /*
      delete localStorage['timestamp_items'];
      delete localStorage['timestamp_pets'];
      delete localStorage['timestamp_recipes'];*/
      await Promise.all([
        this.zoneService.get(),
        this.professionService.getAll(),
        this.itemService.getItems(),
        this.npcService.get(),
        this.petsService.getPets(),
        this.craftingService.get()
      ])
        .catch(console.error);

      // Updating the watchlist names
      this.updateWatchlistItemNamesToNewLocale();


      if (this.hasNotChangedRealmOrRegion()) {
        await AuctionUtil.organize(SharedService.auctions);
      }
    }

    if (this.hasChangedRealmOrRegion()) {
      await this._realmService.changeRealm(
        this._auctionService,
        this.form.value.realm,
        this.form.value.region);
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
    const files = fileEvent.target.files;
    const reader = new FileReader();
    reader.onload = () => {
      this.onFileLoaded(reader);
    };
    reader.readAsText(files[0]);
  }

  private onFileLoaded(reader) {
    try {
      SharedService.user.watchlist
        .attemptRestoreFromString(reader.result);

      User.import(reader.result.toString());

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
    this.dbServie.deleteDB();
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
