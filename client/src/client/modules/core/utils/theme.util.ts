import {Theme} from '../models/theme.model';
import * as hc from 'highcharts';
import {EventEmitter} from '@angular/core';
import {Options} from 'highcharts';
import {BehaviorSubject} from 'rxjs';

export class ThemeUtil {
  static chartThemeChange: BehaviorSubject<Options> = new BehaviorSubject<Options>(null);

  private static pinkAndBlue: Theme = new Theme(
    'pink-blue',
    'Pink & blue',
    '#3f51b5',
    '#ff4081',
    '#f44336',
    '#fff',
    undefined,
    false
  );
  private static unicornDarkBlue: Theme = new Theme(
    'unicorn-dark-theme',
    'Dark yellow',
    '#607d8b',
    '#ffd740',
    '#ff5722',
    '#424242',
    'table-dark',
    true
  );
  private static darkBlue: Theme = new Theme(
    'dark-blue-theme',
    'Dark blue',
    '#607d8b',
    '#40c4ff',
    '#f44336',
    '#424242',
    'table-dark',
    true
  );
  private static darkPink: Theme = new Theme(
    'dark-pink-theme',
    'Dark pink',
    '#e91e63',
    '#eeeeee',
    '#f44336',
    '#424242',
    'table-dark',
    true
  );

  static list: Theme[] = [
    ThemeUtil.pinkAndBlue, /*
    new Theme(
      'solarized-light-theme',
      'White & Orange',
      '#3f51b5',
      '#ff4081',
      undefined,
      false
    ),*/
    ThemeUtil.unicornDarkBlue,
    ThemeUtil.darkBlue,
    ThemeUtil.darkPink,
  ];

  static current: Theme = ThemeUtil.getFromLocalStorage();

  static setTheme(theme: Theme): void {
    localStorage.setItem('theme', theme.className);

    this.update(theme);
    this.setBodyClass(this.current);
    this.setChartTheme(this.current);
  }

  private static getFromLocalStorage(): Theme {
    const className = localStorage.getItem('theme');
    const theme = this.list.filter(t =>
      t.className === className);
    const current = new Theme('', '', '', '', '','', undefined, false);
    this.update(
      theme ? theme[0] : ThemeUtil.unicornDarkBlue, current);

    this.setBodyClass(current);
    this.setChartTheme(current);
    return current;
  }

  private static setBodyClass(theme: Theme) {
    if (document && document.getElementsByTagName('body')[0]) {
      document.getElementsByTagName('body')[0].className = theme.className;
    }
  }

  private static update(theme: Theme, current: Theme = this.current): void {
    try {
      Object.keys(theme)
        .forEach(key => current[key] = theme[key]);
    } catch (e) {
    }
  }

  private static setChartTheme(current: Theme) {
    const chartTheme: Options = {
      chart: {
        backgroundColor: 'transparent',
      },
      title: {
        style: {
          color: current.primaryColorCode,
          font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      subtitle: {
        style: {
          color: current.accentColorCode,
          font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      legend: {
        backgroundColor: current.backgroundColor,
        borderColor: current.primaryColorCode,
        itemStyle: {
          font: '9pt Trebuchet MS, Verdana, sans-serif',
          color: current.accentColorCode
        },
        itemHoverStyle: {
          color: current.accentColorCode
        }
      },
      tooltip: {
        backgroundColor: current.backgroundColor,
        borderColor: current.primaryColorCode,
        style: {
          color: current.accentColorCode,
        }
      }
    };

    this.chartThemeChange.next(chartTheme);
  }
}
