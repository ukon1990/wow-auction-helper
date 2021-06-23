import {Component, EventEmitter, OnDestroy, Output} from '@angular/core';
import {BaseCraftingUtil} from '../../utils/base-crafting.util';
import {SharedService} from '../../../../services/shared.service';
import {CraftingUtil} from '../../utils/crafting.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Report} from '../../../../utils/report.util';
import {ThemeUtil} from '../../../core/utils/theme.util';
import {UserUtil} from '../../../../utils/user/user.util';
import {DashboardService} from '../../../dashboard/services/dashboard.service';
import {AuctionsService} from '../../../../services/auctions.service';
import {EmptyUtil} from '@ukon1990/js-utilities';
import {RealmService} from '../../../../services/realm.service';

@Component({
  selector: 'wah-crafting-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnDestroy {
  @Output() changed: EventEmitter<void> = new EventEmitter();
  strategies = BaseCraftingUtil.STRATEGY_LIST;
  sm = new SubscriptionManager();
  form: FormGroup;
  theme = ThemeUtil.current;
  isClassic = false;

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private realmService: RealmService,
    private auctionService: AuctionsService
  ) {
    const useIntermediateCrafting = SharedService.user.useIntermediateCrafting;
    this.form = fb.group({
      intermediate: useIntermediateCrafting !== null ? useIntermediateCrafting : true,
      strategy: EmptyUtil.isNullOrUndefined(SharedService.user.craftingStrategy) ?
        BaseCraftingUtil.STRATEGY.NEEDED :
        SharedService.user.craftingStrategy,
    });

    this.sm.add(this.realmService.events.realmStatus, status => this.isClassic = status && status.gameBuild > 0);

    this.sm.add(
      this.form.valueChanges,
      ({strategy, intermediate}) => {
        const strategyChanged = SharedService.user.craftingStrategy !== strategy;
        SharedService.user.craftingStrategy = strategy;
        SharedService.user.useIntermediateCrafting = intermediate;
        UserUtil.save();
        CraftingUtil.calculateCost(strategyChanged, this.auctionService.mapped.value);
        this.dashboardService.calculateAll();
        if (strategyChanged) {
          const strategyObj = BaseCraftingUtil.STRATEGY_LIST[strategy];
          Report.send(
            'Crafting strategy changed',
            'ConfigComponent',
            'Crafting strategy: ' + strategyObj ? strategyObj.name : strategy);
        }
        this.changed.emit();
      }
    );
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }
}
