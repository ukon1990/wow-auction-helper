import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {SharedService} from '../../../../services/shared.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {RealmService} from '../../../../services/realm.service';
import {Realm} from '../../../../models/realm';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {CharacterService} from '../../../../services/character.service';
import {AuctionsService} from '../../../../services/auctions.service';
import {TextUtil} from '@ukon1990/js-utilities';
import {User} from '../../../../models/user/user';
import {DatabaseService} from '../../../../services/database.service';
import {Report} from '../../../../utils/report.util';
import {RealmStatus} from '../../../../models/realm-status.model';
import {AuctionHouseStatus} from '../../../auction/models/auction-house-status.model';

@Component({
  selector: 'wah-realm-quick-select',
  templateUrl: './realm-quick-select.component.html',
  styleUrls: ['./realm-quick-select.component.scss']
})
export class RealmQuickSelectComponent implements AfterViewInit, OnDestroy {
  form: FormGroup;
  realmList = [];
  realmListMap = {};

  list = [];

  sm = new SubscriptionManager();

  constructor(
    private fb: FormBuilder, private realmService: RealmService, private dbService: DatabaseService,
    private characterService: CharacterService, private auctionsService: AuctionsService) {
    this.form = this.fb.group({
      region: new FormControl(this.getFormValueFor('region')),
      realm: new FormControl(this.getFormValueFor('realm')),
      faction: new FormControl(this.getFormValueFor('faction'))
    });
  }

  ngAfterViewInit(): void {
    this.sm.add(this.realmService.events.list,
      (realms) => this.setRealmList(realms));

    this.sm.add(this.realmService.events.realmStatus,
      () => this.setRealmList());

    this.sm.add(this.characterService.events,
      () => this.setRealmList());

    this.sm.add(
      this.form.controls.realm.valueChanges,
      (realm?) => this.handleRealmChange(realm));

    this.sm.add(
      this.form.controls.faction.valueChanges,
      (faction: number) => this.handleFactionChange(faction));
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  private getFormValueFor(userField: string): any {
    if (SharedService.user && SharedService.user[userField] !== undefined) {
      return SharedService.user[userField];
    }
    return null;
  }

  private setRealmList(realms?: Realm[]) {
    if (!realms) {
      realms = this.realmService.events.list.value;
    }

    if (!SharedService.user || !SharedService.user.characters || !realms) {
      return;
    }
    const map = {};
    this.realmList.length = 0;

    this.setRealmsFromCharacters(map);
    this.setSlugFromRealms(realms, map);

    this.realmList.sort((a, b) =>
      b.characterCount - a.characterCount);

    this.handleRealmChange();
  }

  private setSlugFromRealms(realms: Realm[], map) {
    realms.forEach((realm: Realm) => {
      if (map[realm.name]) {
        map[realm.name].slug = realm.slug;
        this.realmListMap[realm.slug] = map[realm.name];
      }
    });
  }

  private setRealmsFromCharacters(map) {
    // this.pupulateDropdownWithCurrentRealm(map);
    SharedService.user.characters.forEach(character => {
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
  }

  private pupulateDropdownWithCurrentRealm(map) {
    const status: AuctionHouseStatus = this.realmService.events.realmStatus.value;
    if (status) {
      const currentRealm: RealmStatus = this.realmService.events.map.value[status.id];
      if (currentRealm) {
        map[currentRealm.name] = {
          name: currentRealm.name,
          slug: currentRealm.slug,
          factions: [0, 0],
          characterCount: 0
        };
        this.realmList.push(map[currentRealm.name]);
      }
    }
  }

  private handleRealmChange(slug?: string) {
    if (!slug) {
      slug = this.form.getRawValue().realm;
    }

    if (TextUtil.isEmpty(slug)) {
      return;
    }
    const realm = this.realmListMap[slug];
    const faction = SharedService.user.faction;
    if (realm && (!this.isCurrentRealm(slug) || faction === undefined)) {
      this.form.controls.faction.setValue(
        realm.factions[0] > realm.factions[1] ? 0 : 1
      );
    }

    if (!this.isCurrentRealm(slug)) {
      this.realmService.changeRealm(this.auctionsService, slug);
    }
    Report.send('handleRealmChange', 'CharacterSelectComponent');
  }

  private isCurrentRealm(slug: string) {
    return slug === SharedService.user.realm;
  }

  private handleFactionChange(faction: number) {
    SharedService.user.faction = faction;
    User.save();

    this.dbService.getAddonData();
    Report.send('handleFactionChange', 'CharacterSelectComponent');
  }
}
