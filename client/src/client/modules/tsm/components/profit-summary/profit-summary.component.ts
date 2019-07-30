import {AfterContentInit, AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SharedService} from '../../../../services/shared.service';
import {TSMCSV, TsmLuaUtil, UserProfit} from '../../../../utils/tsm-lua.util';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {TextUtil} from '@ukon1990/js-utilities/dist/utils/text.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';

@Component({
  selector: 'wah-profit-summary',
  templateUrl: './profit-summary.component.html',
  styleUrls: ['./profit-summary.component.scss']
})
export class ProfitSummaryComponent implements OnInit, OnDestroy {
  realms = [];
  form: FormGroup;
  sm = new SubscriptionManager();
  profitSummary = {};

  constructor(private formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      realm: new FormControl()
    });

  }

  ngOnInit(): void {
    this.sm.add(
      TsmLuaUtil.events,
      (data: TSMCSV) =>
        this.handleTsmEvent(data));

    this.initContent();
  }

  initContent(): void {
    const realm = SharedService.realms[SharedService.user.realm];
    if (realm) {
      this.form.controls.realm.setValue(realm.name);
    } else {
      this.sm.add(
        SharedService.events.realms,
        () => this.initContent(),
        {terminateUponEvent: true});
    }
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  handleTsmEvent(data: TSMCSV): void {
    if (!data) {
      return;
    }

    this.profitSummary = data.profitSummary;

    Object.keys(data.profitSummary)
      .forEach(realm =>
        this.realms.push(realm));
  }
}
