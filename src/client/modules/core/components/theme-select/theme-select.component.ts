import { Component, OnInit } from '@angular/core';
import {ThemeUtil} from '../../utils/theme.util';
import {Theme} from '../../models/theme.model';

@Component({
  selector: 'wah-theme-select',
  templateUrl: './theme-select.component.html',
  styleUrls: ['./theme-select.component.scss']
})
export class ThemeSelectComponent implements OnInit {
  list = ThemeUtil.list;

  constructor() { }

  ngOnInit() {
  }

  setTheme(theme: Theme): void  {
    ThemeUtil.setTheme(theme);
  }
}
