import {Component, Input, OnInit} from '@angular/core';
import {SharedService} from '../../../../services/shared.service';
import {UserProfit} from '../../../../utils/tsm-lua.util';

@Component({
  selector: 'wah-profit-summary',
  templateUrl: './profit-summary.component.html',
  styleUrls: ['./profit-summary.component.scss']
})
export class ProfitSummaryComponent implements OnInit {
  @Input() realm: string;

  constructor() {
  }

  ngOnInit() {
  }

  getProfit() {
    if (!this.realm) {
      return new UserProfit(0, {});
    }
    return SharedService.tsmAddonData['profitSummary'][this.realm];
  }
}
