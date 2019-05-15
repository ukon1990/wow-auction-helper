import {AfterContentInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {RealmService} from '../../../services/realm.service';
import {RealmStatus} from '../../../models/realm-status.model';
import {SharedService} from '../../../services/shared.service';
import {ObjectUtil} from '../../../utils/object.util';

@Component({
  selector: 'wah-select-realm',
  templateUrl: './select-realm.component.html',
  styleUrls: ['./select-realm.component.scss']
})
export class SelectRealmComponent implements AfterContentInit, OnChanges {
  @Input() region: string;
  @Input() realm: string;
  @Input() locale: string;
  @Output() changes: EventEmitter<{
    region: string;
    realm: string;
    locale: string;
  }> = new EventEmitter();

  form: FormGroup = new FormGroup({
    region: new FormControl(),
    realm: new FormControl(),
    locale: new FormControl()
  });
  locales = SharedService.locales;
  regions = [
    {id: 'eu', name: 'Europe'},
    {id: 'us', name: 'America'},
    {id: 'kr', name: 'Korea'},
    {id: 'tw', name: 'Taiwan'}
  ];
  realmsMap = {
    eu: [],
    us: [],
    kr: [],
    tw: []
  };
  currentRealm: RealmStatus;

  sm = new SubscriptionManager();

  constructor(private service: RealmService) {
  }

  ngAfterContentInit(): void {
    this.sm.add(
      this.service.events.list,
      (list: RealmStatus[]) =>
        this.processRealms(list));

    this.setFormValues();
    this.sm.add(
      this.form.valueChanges,
      (value) => this.handleFormChanges(value));

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  private setFormValues() {
    Object.keys(this.form.controls)
      .forEach(key =>
        this.form.controls[key].setValue(this[key]));
  }

  setSelectedRealm(): void {
    const form = this.form.getRawValue();
    if (ObjectUtil.isNullOrUndefined(form.region)) {
      return;
    }

    this.realmsMap[form.region].forEach((status: RealmStatus) => {
      if (form.region === status.region && (name || form.realm) === status.slug) {
        this.currentRealm = status;
      }
    });
  }

  private processRealms(list: RealmStatus[]) {
    Object.keys(this.realmsMap)
      .forEach(key =>
        this.realmsMap[key] = []);
    list.forEach(status =>
      this.realmsMap[status.region].push(status));

    this.setSelectedRealm();
  }

  milliSecondsToMinutes(status: RealmStatus): number {
    if (!SharedService.auctionResponse || !status) {
      return 0;
    }
    const ms = new Date().getTime() - (status.lastModified);
    return Math.round(ms / 60000);
  }

  private handleFormChanges(value: any) {
    this.changes.emit(value);
    this.setSelectedRealm();
  }
}
