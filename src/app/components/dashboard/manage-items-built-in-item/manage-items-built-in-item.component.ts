import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DefaultDashboardSettings } from '../../../models/dashboard/default-dashboard-settings.model';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GameBuild } from '../../../utils/game-build.util';
import { Subscription } from 'rxjs';
import { SharedService } from '../../../services/shared.service';
import { Dashboard } from '../../../models/dashboard';

@Component({
  selector: 'wah-manage-items-built-in-item',
  templateUrl: './manage-items-built-in-item.component.html',
  styleUrls: ['./manage-items-built-in-item.component.scss']
})
export class ManageItemsBuiltInItemComponent implements OnInit, OnDestroy {
  @Input() board: DefaultDashboardSettings;
  expansions = GameBuild.expansionMap;
  form: FormGroup;
  changeSubscription: Subscription;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      isDisabled: new FormControl(this.board.isDisabled),
      regionSaleRate: new FormControl(
        this.board.regionSaleRate !== null ? this.board.regionSaleRate * 100 : null),
      avgDailySold: new FormControl(
        this.board.avgDailySold !== null ? this.board.avgDailySold : null),
      minROIPercent: new FormControl(
        this.board.minROIPercent !== null ? this.board.minROIPercent * 100 : null),
      limitToExpansion: new FormControl(this.board.limitToExpansion)
    });

    this.changeSubscription = this.form.valueChanges
      .subscribe((change) => {
        Object.keys(change)
          .forEach(key => {
            if (change[key] !== null && change[key] !== undefined) {
              switch (key) {
                case 'regionSaleRate':
                case 'minROIPercent':
                  this.board[key] = change[key] / 100;
                  break;
                default:
                  this.board[key] = change[key];
                  break;
              }
            }
          });

      DefaultDashboardSettings.save(this.board.typeId);
      Dashboard.addDashboards();
    });
  }

  ngOnDestroy(): void {
    this.changeSubscription.unsubscribe();
  }

  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }
}
