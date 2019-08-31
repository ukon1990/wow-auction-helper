import {Report} from '../../../utils/report.util';
import {LuaUtil} from '../../../utils/lua.util';
import {TextUtil} from '@ukon1990/js-utilities';
import {Auction} from '../models/auction.model';

export class AucScanDataImportUtil {
  static import(input): any {
    const data = LuaUtil.toObject(input);
    const result = this.processData(data);
    Report.debug('AucScanDataImportUtil', data, result);
    return result;
  }

  private static processData({Version, scans}: any) {
    const realmData = [];
    Object.keys(scans).forEach(realm =>
      realmData.push(this.getProcessedRealmData(scans[realm])));
    return realmData;
  }

  private static getProcessedRealmData({ropes, scanstats}) {
    const {LastFullScan, LastScan, data} = scanstats;
    const {serverKey, newCount, currentCount} = data;
    const realm = TextUtil.camelCaseToSentence(serverKey);
    const auctions = this.getProcessedAuctionData(ropes, realm);

    return {
      realm,
      lastScan: new Date(LastScan * 1000),
      newCount,
      currentCount,
      auctions
    };
  }

  private static getProcessedAuctionData({data}: any, realm) {
    if (!data) {
      return;
    }
    const csvString = data
      .replace(/^(return {)/, '')
      .replace(/[}]$/, '');
    const rows = csvString.split('},{');
    const auctions = [];
    rows.forEach(row =>
      auctions.push(this.processAuctionCSVRow(row, realm)));
    return auctions;
  }

  private static processAuctionCSVRow(row: string, realm) {
    row.replace(/^[{]/, '')
      .replace(/[\\]+/, '');
    const split = row.split(',');
    const auction: Auction = new Auction();
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
