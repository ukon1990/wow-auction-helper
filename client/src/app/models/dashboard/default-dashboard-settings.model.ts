import { SharedService } from '../../services/shared.service';
import { Dashboard } from '../dashboard';

export class DefaultDashboardSettings {
  public static list = [
    new DefaultDashboardSettings(
      'Profitable crafts',
      Dashboard.TYPES.PROFITABLE_CRAFTS,
      false,
      0.1,
      1,
      0.1,
      -1
    ),
    new DefaultDashboardSettings(
      'Profitable known crafts',
      Dashboard.TYPES.PROFITABLE_KNOWN_CRAFTS,
      false,
      0.1,
      1,
      0.1,
      -1
    ),
    new DefaultDashboardSettings(
      'Known watchlist craft alerts',
      Dashboard.TYPES.WATCH_LIST_CRAFTS,
      false,
      0.1,
      1,
      0.1,
      -1
    ),
    new DefaultDashboardSettings(
      'Profitable herbs to mill',
      Dashboard.TYPES.MILLING,
      false,
      null,
      null,
      null,
      -1
    ),
    new DefaultDashboardSettings(
      'Profitable ore to prospect',
      Dashboard.TYPES.PROSPECTING,
      false,
      null,
      null,
      null,
      -1
    ),
    new DefaultDashboardSettings(
      'Items by availability',
      Dashboard.TYPES.MOST_AVAILABLE_ITEMS,
      false,
      null,
      null,
      null,
      -1
    ),
    new DefaultDashboardSettings(
      'Potential deals',
      Dashboard.TYPES.POTENTIAL_DEALS,
      false,
      0.3,
      1,
      0.15,
      -1
    ),
    new DefaultDashboardSettings(
      'Potential bid deals',
      Dashboard.TYPES.CHEAP_BIDS,
      false,
      0.3,
      1,
      0.1,
      -1
    ),
    new DefaultDashboardSettings(
      'Potential 2 hour bid deals',
      Dashboard.TYPES.CHEAP_BIDS_WITH_LOW_TIME_LEFT,
      false,
      0.30,
      1,
      0.1,
      -1
    ),
    new DefaultDashboardSettings(
      'Buyout below vendor sell price',
      Dashboard.TYPES.CHEAPER_THAN_VENDOR_SELL,
      false,
      null,
      null,
      null,
      -1
    ),
    new DefaultDashboardSettings(
      'Trade vendor currency in gold',
      Dashboard.TYPES.TRADE_VENDOR_VALUES,
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

  public static save(id: string): void {
    localStorage[id] = JSON.stringify(SharedService.defaultDashboardSettingsListMap[id]);
  }
}
