import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SharedService} from '../../../../services/shared.service';
import {Router} from '@angular/router';
import {Report} from '../../../../utils/report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {BackgroundDownloadService} from '../../../core/services/background-download.service';
import {UserUtil} from '../../../../utils/user/user.util';

declare function require(moduleName: string): any;

const version = require('../../../../../../package.json').version;

@Component({
  selector: 'wah-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent {
  form: FormGroup;
  locales = SharedService.locales;

  sm = new SubscriptionManager();

  constructor(private fb: FormBuilder, private router: Router, private service: BackgroundDownloadService) {
    this.form = this.fb.group({
      region: ['eu', Validators.required],
      realm: [null, Validators.required],
      importString: '',
      locale: localStorage['locale']
    });

    this.sm.add(
      this.form.controls.locale.valueChanges,
      locale => {
        localStorage['locale'] = locale;
      });
  }

  isValid(): boolean {
    return this.form.status === 'VALID';
  }

  importUserData(): void {
    if (this.form.value.importString.length > 0) {
      UserUtil.import(this.form.value.importString);
      this.redirectUserFromRestore();
    }
  }

  importFromFile(fileEvent): void {
    Report.debug('File', fileEvent);
    const files = fileEvent.target.files;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        SharedService.user.watchlist
          .attemptRestoreFromString(reader.result);

        UserUtil.import(reader.result as string);

        Report.send('Imported existing setup from file', 'User registration');

        this.redirectUserFromRestore();
      } catch (e) {
        console.error('Could not import from file', e);
      }
    };
    reader.readAsText(files[0]);
  }

  redirectUserFromRestore(): void {
    Report.send('Imported existing setup', 'User registration');
    this.router.navigateByUrl('/crafting')
      .catch(console.error);
  }

  completeSetup(): void {
    if (this.isValid()) {
      localStorage['region'] = this.form.value.region;
      localStorage['realm'] = this.form.value.realm;
      localStorage['character'] = this.form.value.name;
      localStorage['timestamp_news'] = version;
      Report.send('New user registered', 'User registration');

      UserUtil.restore();
      /*
      this.service.init()
        .catch(console.error);
      this.router.navigateByUrl('/dashboard')
        .catch(console.error);
      */

      if (localStorage.getItem('initialUrl')) {
        location.pathname = localStorage.getItem('initialUrl');
      } else {
        location.reload();
      }
    }
  }

  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

  realmSelectionEvent(change: { region: string; realm: string; locale: string }) {
    Object.keys(change)
      .forEach(key =>
        this.form.controls[key]
          .setValue(change[key]));
  }
}
