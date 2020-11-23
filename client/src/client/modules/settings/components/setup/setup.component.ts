import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SharedService} from '../../../../services/shared.service';
import {Router} from '@angular/router';
import {Report} from '../../../../utils/report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {UserUtil} from '../../../../utils/user/user.util';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SettingsService} from '../../../user/services/settings/settings.service';
import {CharacterService} from '../../../character/services/character.service';
import {UserSettings} from '../../../user/models/settings.model';
import {ThemeUtil} from '../../../core/utils/theme.util';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private settingsSync: SettingsService,
    private characterService: CharacterService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SetupComponent>) {
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

  onClose(): void {
    this.dialogRef.close();
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

  completeSetup() {
    console.log('Start on complete setup');
    if (this.isValid()) {
      const {region, realm, locale} = this.form.getRawValue();
      const settings = new UserSettings();
      localStorage['region'] = region;
      localStorage['realm'] = realm;
      localStorage['timestamp_news'] = version;
      settings.realm = realm;
      settings.region = region;
      settings.locale = locale;
      settings.theme = ThemeUtil.current;
      settings.characters = this.settingsSync.reduceCharacters(
        this.characterService.characters.value).characters;

      Report.send('New user registered', 'User registration');
      // this.dialogRef.close();
      try {
      } catch (err) {}
      this.settingsSync.createSettings(settings)
        .then(() => location.reload())
        .catch(() => location.reload());
      // UserUtil.restore();
      this.dialogRef.close();

      /*
      this.service.init()
        .catch(console.error);
      this.router.navigateByUrl('/dashboard')
        .catch(console.error);

      if (localStorage.getItem('initialUrl')) {
        location.pathname = localStorage.getItem('initialUrl');
      } else {
        // location.reload();
      }
      */
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
