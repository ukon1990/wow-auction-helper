import {Component, OnInit} from '@angular/core';
import {ThemeUtil} from '../../utils/theme.util';
import {Theme} from '../../models/theme.model';
import {Report} from '../../../../utils/report.util';
import {faCheck, faPalette} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'wah-theme-select',
  templateUrl: './theme-select.component.html',
  styleUrls: ['./theme-select.component.scss']
})
export class ThemeSelectComponent implements OnInit {
  list = ThemeUtil.list;
  currentTheme = ThemeUtil.current;
  faCheck = faCheck;
  faPalette = faPalette;

  constructor() {
  }

  ngOnInit() {
  }

  setTheme(theme: Theme): void {
    ThemeUtil.setTheme(theme);
    Report.send(
      `setTheme(${theme.name}, ${theme.className})`,
      'ThemeSelectComponent');
  }
}
