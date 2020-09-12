import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {GameBuild} from '../../../../../utils/game-build.util';
import {SharedService} from '../../../../../services/shared.service';
import {DefaultDashboardSettings} from '../../../models/default-dashboard-settings.model';
import {Dashboard} from '../../../models/dashboard.model';
import {ThemeUtil} from '../../../../core/utils/theme.util';
import {ObjectUtil} from '@ukon1990/js-utilities';

@Component({
  selector: 'wah-manage-items-built-in-item',
  templateUrl: './manage-items-built-in-item.component.html',
  styleUrls: ['./manage-items-built-in-item.component.scss']
})
export class ManageItemsBuiltInItemComponent implements OnInit, OnDestroy, OnChanges {
  @Input() board: DefaultDashboardSettings;
  @Input() autoSave = true;
  @Output() event: EventEmitter<DefaultDashboardSettings> = new EventEmitter<DefaultDashboardSettings>();
  expansions = GameBuild.expansionMap;
  form: FormGroup;
  changeSubscription: Subscription;
  theme = ThemeUtil.current;

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
      .subscribe((change) =>
        this.handleValueChange(change));
  }


  private handleValueChange(change) {
    const result = ObjectUtil.clone(this.board) as DefaultDashboardSettings;
    Object.keys(change)
      .forEach(key => {
        if (change[key] !== null && change[key] !== undefined) {
          switch (key) {
            case 'regionSaleRate':
            case 'minROIPercent':
              result[key] = change[key] / 100;
              break;
            default:
              result[key] = change[key];
              break;
          }
        }
      });

    if (this.autoSave) {
      DefaultDashboardSettings.save(result);
      Dashboard.addDashboards();
    }
    this.event.emit(result);
  }

  ngOnChanges({board}: SimpleChanges) {
    if (board && board.currentValue && this.form) {
      this.handleInputChange(board.currentValue as DefaultDashboardSettings);
    }
  }

  private handleInputChange(board: DefaultDashboardSettings) {
    Object.keys(board).forEach(key => {
      if (this.form.controls[key]) {
        let value;
        switch (key) {
          case 'regionSaleRate':
          case 'minROIPercent':
            value = board[key] * 100;
            break;
          default:
            value = board[key];
            break;
        }
        this.form.controls[key].setValue(value);
      }
    });
  }

  ngOnDestroy(): void {
    this.changeSubscription.unsubscribe();
  }

  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }
}
