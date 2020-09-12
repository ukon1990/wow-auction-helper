import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseCraftingUtil} from '../../utils/base-crafting.util';
import {SharedService} from '../../../../services/shared.service';
import {User} from '../../../../models/user/user';
import {CraftingUtil} from '../../utils/crafting.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Dashboard} from '../../../dashboard/models/dashboard.model';
import {Report} from '../../../../utils/report.util';
import {ThemeUtil} from '../../../core/utils/theme.util';
import {UserUtil} from '../../../../utils/user/user.util';
import {DashboardService} from '../../../dashboard/services/dashboard.service';

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

  constructor(private fb: FormBuilder, private dashboardService: DashboardService) {
    const useIntermediateCrafting = SharedService.user.useIntermediateCrafting;
    this.form = fb.group({
      intermediate: useIntermediateCrafting !== null ? useIntermediateCrafting : true,
      strategy: SharedService.user.craftingStrategy,
    });

    this.sm.add(
      this.form.valueChanges,
      ({strategy, intermediate}) => {
        const strategyChanged = SharedService.user.craftingStrategy !== strategy;
        SharedService.user.craftingStrategy = strategy;
        SharedService.user.useIntermediateCrafting = intermediate;
        UserUtil.save();
        CraftingUtil.calculateCost(strategyChanged);
        // Dashboard.addDashboards();
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
