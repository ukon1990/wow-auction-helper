import { Report } from '../../../utils/report.util';
import { LuaUtil } from '../../../utils/lua.util';
import { TextUtil } from '@ukon1990/js-utilities';
import { Auction } from '../models/auction.model';

export class AucScanDataImportUtil {
  static import(input): any {
    const data = LuaUtil.toObject(input);
    const result = this.processData(data);
    Report.debug('AucScanDataImportUtil', data, result);
    return result;
  }

  private static processData({ Version, scans }: any) {
    const realmData = [];
    Object.keys(scans).forEach(realm =>
      realmData.push(this.getProcessedRealmData(realm, scans[realm]))
    );
    return realmData;
  }

  private static getProcessedRealmData(realm, { ropes, scanstats }) {
    const { LastFullScan, LastScan, data } = scanstats;
    const realmName = TextUtil.camelCaseToSentence(realm);
    if (data) {
      const { serverKey, newCount, currentCount } = data[0];

      const auctions = this.getProcessedAuctionData(ropes, realmName);

      return {
        realm: realmName,
        lastScan: new Date(LastScan * 1000),
        newCount,
        currentCount,
        auctions
      };
    }
    return {
      realm: realmName,
      lastScan: undefined,
      newCount: 0,
      currentCount: 0,
      auctions: []
    };
  }

  private static getProcessedAuctionData({ data }: any, realm) {
    if (!data) {
      return;
    }
    let id = 0;
    const csvString = data[0].replace(/^(return {)/, '').replace(/[}]$/, '');
    const rows = csvString.split('},{');
    const auctions = [];
    rows.forEach(row =>
      auctions.push(this.processAuctionCSVRow(row, realm, id++))
    );
    return auctions;
  }

  private static processAuctionCSVRow(row: string, realm, id: number) {
    row.replace(/^[{]/, '').replace(/[\\]+/, '');
    const split = row.split(',');
    const auction: Auction = new Auction();
    auction.auc = id;
    auction.item = +split[22];
    auction.bid = +split[14];
    auction.buyout = +split[16];
    auction.owner = split[19].replace(/[\\"]{1,}/g, '');
    auction.ownerRealm = realm;
    auction.quantity = +split[10];
    auction.timeLeft = this.getTimeLeft(+split[6]);
    return auction;
  }

  private static getTimeLeft(number: number) {
    switch (number) {
      case 1:
        return 'SHORT';
      case 2:
        return 'MEDIUM';
      case 3:
        return 'LONG';
      case 4:
        return 'VERY_LONG';
      default:
        return `Nope, ${number}`;
    }
  }
}
