import {Component, OnDestroy, OnInit} from '@angular/core';
import {SharedService} from '../../../../services/shared.service';
import {FormControl, FormGroup} from '@angular/forms';
import {RealmService} from '../../../../services/realm.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {CharacterService} from '../../../character/services/character.service';
import {AuctionsService} from '../../../../services/auctions.service';
import {TextUtil} from '@ukon1990/js-utilities';
import {DatabaseService} from '../../../../services/database.service';
import {Report} from '../../../../utils/report.util';
import {RealmStatus} from '@shared/models/realm/realm-status.model';
import {AuctionHouseStatus} from '../../../auction/models/auction-house-status.model';
import {CraftingService} from '../../../../services/crafting.service';
import {ErrorReport} from '../../../../utils/error-report.util';
import {faUserPlus} from '@fortawesome/free-solid-svg-icons/faUserPlus';
import {SettingsService} from '../../../user/services/settings/settings.service';
import {UserSettings} from '../../../user/models/settings.model';

interface Realm extends AuctionHouseStatus {
  characterCount?: number;
}

@Component({
  selector: 'wah-realm-quick-select',
  templateUrl: './realm-quick-select.component.html',
  styleUrls: ['./realm-quick-select.component.scss']
})
export class RealmQuickSelectComponent implements OnInit, OnDestroy {
  form: FormGroup = new FormGroup({
    ahTypeId: new FormControl(),
    region: new FormControl(),
    realm: new FormControl(),
    faction: new FormControl()
  });
  realmListAll: Realm[] = [];
  realmList: Realm[] = [];
  realmListMap = {};
  allianceCharacterCountForRealm = 0;
  hordeCharacterCountForRealm = 0;
  list = [];
  faUserPlus = faUserPlus;
  private ignoreNextChange: boolean;

  sm = new SubscriptionManager();

  constructor(private realmService: RealmService,
              private dbService: DatabaseService,
              private craftingService: CraftingService,
              private characterService: CharacterService,
              private settingSync: SettingsService,
              private auctionsService: AuctionsService) {
  }

  ngOnInit() {
    this.form.setValue({
      ahTypeId: this.getFormValueFor('ahTypeId'),
      region: this.getFormValueFor('region'),
      realm: this.getFormValueFor('realm'),
      faction: this.getFaction() || 0
    }, {emitEvent: false});

    this.sm.add(this.realmService.events.list,
      (realms: AuctionHouseStatus[]) => {
        this.setRealmList(undefined, realms);
        this.realmListAll = realms.filter(status =>
          TextUtil.isEqualIgnoreCase(status.region, this.form.controls.region.value));
      });

    this.sm.add(this.realmService.events.realmStatus,
      (status) => this.setRealmList(status));

    this.sm.add(this.characterService.events,
      () => this.setRealmList());

    this.sm.add(
      this.form.controls.realm.valueChanges,
      (realm?) => this.handleRealmChange(realm));

    this.sm.add(
      this.form.controls.faction.valueChanges,
      (faction: number) => this.handleFactionChange(faction));

    this.sm.add(this.settingSync.settings,
        settings => this.setChanges(settings));
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  private getFormValueFor(userField: string): number | string | boolean {
    if (SharedService.user && SharedService.user[userField] !== undefined) {
      return SharedService.user[userField];
    }
    return null;
  }

  private setRealmList(
    realmStatus: AuctionHouseStatus = this.realmService.events.realmStatus.value,
    realms: AuctionHouseStatus[] = this.realmService.events.list.value
  ) {
    if (realmStatus && realmStatus.slug !== this.form.value.realm) {
      this.form.controls.realm.setValue(realmStatus.slug);
    }

    if (!this.characterService.characters.value || !realms) {
      return;
    }
    const map = {};
    this.realmList.length = 0;

    this.setRealmsFromCharacters(map);
    this.setSlugFromRealms(realms, map);

    this.realmList.sort((a, b) =>
      b.characterCount - a.characterCount);
  }

  private setSlugFromRealms(realms: AuctionHouseStatus[], map) {
    realms.forEach((realm: AuctionHouseStatus) => {
      if (map[realm.name]) {
        map[realm.name].slug = realm.slug;
        this.realmListMap[realm.slug] = map[realm.name];
      }
    });
  }

  private setRealmsFromCharacters(map) {
    this.characterService.characters.value.forEach(character => {
      if (!map[character.realm]) {
        map[character.realm] = {
          name: character.realm,
          slug: '',
          factions: [
            character.faction === 0 ? 1 : 0, // Alliance
            character.faction === 1 ? 1 : 0 // Horde
          ],
          characterCount: 1
        };
        this.realmList.push(map[character.realm]);
      } else {
        map[character.realm].characterCount++;
        map[character.realm].factions[character.faction]++;
      }
    });

    if (map[this.form.value.realm]) {
      const realm = map[this.form.value.realm];
      this.allianceCharacterCountForRealm = realm.factions[0];
      this.allianceCharacterCountForRealm = realm.factions[1];
    }
  }

  private handleRealmChange(slug?: string) {
    const realmStatus = this.realmService.events.realmStatus.value;
    if (!realmStatus) {
      return;
    }
    const currentRealm = this.realmService.events.list.value
      .filter((status: RealmStatus) =>
        status.slug === realmStatus.slug && realmStatus.region === status.region);
    if (!slug) {
      slug = currentRealm && currentRealm.length ?
        currentRealm[0].slug : this.form.getRawValue().realm;
    }

    if (TextUtil.isEmpty(slug)) {
      return;
    }
    const realm = this.realmListMap[slug];
    // const faction = SharedService.user.faction;
    const {faction, region, ahTypeId} = this.form.value;
    const ahTypeIdForFaction = faction === 0 ? 2 : 6;
    const newAhTypeId = ahTypeId || SharedService.user.ahTypeId || ahTypeIdForFaction;
    if (realm && (!this.isCurrentRealm(slug, newAhTypeId) || faction === undefined)) {
      this.form.controls.faction.setValue(
        realm.factions[0] > realm.factions[1] ? 0 : 1,
        {emitEvent: false}
      );
    }
    Report.debug('Changed realm', this.isCurrentRealm(slug, ahTypeId), {faction, region, ahTypeId});

    if (!this.isCurrentRealm(slug, ahTypeId)) {
      this.settingSync.updateSettings({faction, realm: slug, region, ahTypeId: newAhTypeId});
      this.realmService.changeRealm(slug)
        .then((status) => {
          Report.send('handleRealmChange', 'RealmQuickSelectComponent');
        })
        .catch(error =>
          ErrorReport.sendError('RealmQuickSelectComponent', error));
    }
  }

  private isCurrentRealm(slug: string, ahTypeId: number) {
    return slug === SharedService.user.realm && ahTypeId === SharedService.user.ahTypeId;
  }

  private handleFactionChange(faction: number) {
    if (!this.ignoreNextChange) {
    }
    const {realm, region} = this.form.value;
    const ahTypeIdForFaction = faction === 1 ? 6 : 2;
    if (this.realmService.events.realmStatus.value.gameBuild > 0) {
      this.form.controls.ahTypeId.setValue(ahTypeIdForFaction);
      this.realmService.changeRealm(realm, region, ahTypeIdForFaction)
        .then((status) => {
          Report.send('handleRealmChange', 'RealmQuickSelectComponent');
        })
        .catch(error =>
          ErrorReport.sendError('RealmQuickSelectComponent', error));
    }
    this.settingSync.updateSettings({faction, realm, region, ahTypeId: ahTypeIdForFaction});
    this.craftingService.handleRecipes(CraftingService.list.value);

    this.dbService.getAddonData();
    Report.send('handleFactionChange', 'RealmQuickSelectComponent');
  }

  private setChanges(settings: UserSettings) {
    console.log('QuickChange.setChanges', settings);
    if (!settings || !settings.region || !settings.realm) {
      return;
    }
    const {region: prevRegion, realm: prevRealm, faction: prevFaction} = this.form.value;
    const {region, realm, faction, ahTypeId} = settings;
    if (region !== prevRegion || realm !== prevRealm || faction !== prevFaction) {
      this.form.setValue({region, realm, faction: this.getFaction(faction), ahTypeId}, {emitEvent: false});
    }
  }

  private getFaction(faction = this.getFormValueFor('faction')) {
    const ahTypeId = this.getFormValueFor('ahTypeId');
    if (faction) {
      return isNaN(+faction) ? 0 : +faction;
    }
    if (ahTypeId) {
      switch (ahTypeId) {
        case 0:
        case 2:
          return 0;
        default:
          return 1;
      }
    }
  }
}