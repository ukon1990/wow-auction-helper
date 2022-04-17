import {SharedService} from '../../../services/shared.service';
import {DEPRICATEDDashboard} from './dashboard.model';
import {ObjectUtil} from '@ukon1990/js-utilities';

export class DefaultDashboardSettings {
  public static list = [
    new DefaultDashboardSettings(
      'Profitable crafts',
      DEPRICATEDDashboard.TYPES.PROFITABLE_CRAFTS,
      false,
      0.1,
      1,
      0.1,
      -1
    ),
    new DefaultDashboardSettings(
      'Profitable known crafts',
      DEPRICATEDDashboard.TYPES.PROFITABLE_KNOWN_CRAFTS,
      false,
      0.1,
      1,
      0.1,
      -1
    ),
    new DefaultDashboardSettings(
      'Known watchlist craft alerts',
      DEPRICATEDDashboard.TYPES.WATCH_LIST_CRAFTS,
      false,
      0.1,
      1,
      0.1,
      -1
    ),
    new DefaultDashboardSettings(
      'Profitable herbs to mill',
      DEPRICATEDDashboard.TYPES.MILLING,
      false,
      null,
      null,
      null,
      -1
    ),
    new DefaultDashboardSettings(
      'Profitable ore to prospect',
      DEPRICATEDDashboard.TYPES.PROSPECTING,
      false,
      null,
      null,
      null,
      -1
    ),
    new DefaultDashboardSettings(
      'Items by availability',
      DEPRICATEDDashboard.TYPES.MOST_AVAILABLE_ITEMS,
      false,
      null,
      null,
      null,
      -1
    ),
    new DefaultDashboardSettings(
      'Potential deals',
      DEPRICATEDDashboard.TYPES.POTENTIAL_DEALS,
      false,
      0.3,
      1,
      0.15,
      -1
    ),
    new DefaultDashboardSettings(
      'Potential bid deals',
      DEPRICATEDDashboard.TYPES.CHEAP_BIDS,
      false,
      0.3,
      1,
      0.1,
      -1
    ),
    new DefaultDashboardSettings(
      'Potential 2 hour bid deals',
      DEPRICATEDDashboard.TYPES.CHEAP_BIDS_WITH_LOW_TIME_LEFT,
      false,
      0.30,
      1,
      0.1,
      -1
    ),
    new DefaultDashboardSettings(
      'Buyout below vendor sell price',
      DEPRICATEDDashboard.TYPES.CHEAPER_THAN_VENDOR_SELL,
      false,
      null,
      null,
      null,
      -1
    ),
    new DefaultDashboardSettings(
      'Trade vendor currency in gold',
      DEPRICATEDDashboard.TYPES.TRADE_VENDOR_VALUES,
      false,
      null,
      null,
      null,
      -1
    )
  ];

  constructor(
    public title: string,
    public typeId: string,
    public isDisabled: boolean,
    public regionSaleRate: number,
    public avgDailySold: number,
    public minROIPercent: number,
    public limitToExpansion: number
  ) {}

  public static init(): void {
    DefaultDashboardSettings.list.forEach(dbs => {
      SharedService.defaultDashboardSettingsListMap[dbs.typeId] = dbs;
      if (localStorage[dbs.typeId]) {
        const saved = JSON.parse(localStorage[dbs.typeId]);
        Object.keys(dbs).forEach(key => {
          if (key !== 'title') {
            dbs[key] = saved[key];
          }
        });
      }
    });
  }

  public static save(board: DefaultDashboardSettings): void {
    ObjectUtil.overwrite(board, SharedService.defaultDashboardSettingsListMap[board.typeId]);
    localStorage[board.typeId] = JSON.stringify(board);
  }
}