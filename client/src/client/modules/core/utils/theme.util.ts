import {Theme} from '../models/theme.model';
import {ObjectUtil} from '@ukon1990/js-utilities';

export class ThemeUtil {
  static list: Theme[] = [
    new Theme(
      '',
      'Default',
      '#3f51b5',
      '#ff4081'),
    new Theme(
      'unicorn-dark-theme',
      'Dark yellow',
      '#607d8b',
      '#ffd740',
      'table-dark'),
    new Theme(
      'dark-blue-theme',
      'Dark blue',
      '#607d8b',
      '#40c4ff',
      'table-dark'
    ),
    new Theme(
      'dark-pink-theme',
      'Dark pink',
      '#e91e63',
      '#eeeeee',
      'table-dark'
    )
  ];

  static current: Theme = ThemeUtil.getFromLocalStorage();

  static setTheme(theme: Theme): void {
    localStorage.setItem('theme', theme.className);
    ObjectUtil.overwrite(theme, this.current);
    this.setBodyClass(this.current);
  }

  private static getFromLocalStorage(): Theme {
    const className = localStorage.getItem('theme');
    const theme = this.list.filter(t =>
      t.className === className);
    const current = new Theme('', '', '', '');
    ObjectUtil.overwrite(
      theme ? theme[0] : ThemeUtil.list[0], current);
    this.setBodyClass(current);
    return current;
  }

  private static setBodyClass(theme: Theme) {
    if (document && document.getElementsByTagName('body')[0]) {
      document.getElementsByTagName('body')[0].className = theme.className;
    }
  }
}
