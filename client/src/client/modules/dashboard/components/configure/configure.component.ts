import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Dashboard} from '../../models/dashboard.model';
import {faSave} from '@fortawesome/free-solid-svg-icons/faSave';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {DefaultDashboardSettings} from '../../models/default-dashboard-settings.model';
import {ObjectUtil} from '@ukon1990/js-utilities';

@Component({
  selector: 'wah-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class ConfigureComponent implements OnChanges {
  @Input() dashboard: Dashboard;
  @Output() event: EventEmitter<void> = new EventEmitter<void>();

  faSave = faSave;
  faTrash = faTrashAlt;
  clone: DefaultDashboardSettings;
  hasChanges: boolean;

  ngOnChanges({dashboard}: SimpleChanges) {
    if (dashboard && dashboard.currentValue && dashboard.currentValue.settings) {
      this.clone = ObjectUtil.clone(dashboard.currentValue.settings) as DefaultDashboardSettings;
    }
  }

  onEvent(settings: DefaultDashboardSettings) {
    setTimeout(() =>
      this.hasChanges = !!ObjectUtil.getDifference(this.dashboard.settings, settings).length);
  }

  onSave(): void {
    // TODO: Needs to be able to calculate individual dashboards
    if (this.dashboard.settings) {
      ObjectUtil.overwrite(this.clone, this.dashboard.settings);
      DefaultDashboardSettings.save(this.clone);
      // Calculate
    } else {
      // Save
      // Calculate
    }
    this.event.emit();
  }

  onDiscard(): void {
    if (this.dashboard.settings) {
      this.clone = ObjectUtil.clone(this.dashboard.settings) as DefaultDashboardSettings;
    } else {

    }
    this.event.emit();
  }
}
