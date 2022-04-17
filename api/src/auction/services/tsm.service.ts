import {RealmRepository} from '../../realm/repositories/realm.repository';
import {AuctionHouse} from '../../realm/model';
import {HttpClientUtil} from '../../utils/http-client.util';
import {S3Handler} from '../../handlers/s3.handler';
import {TSM} from '@shared/models';

export class TsmService {
  private repository: RealmRepository = new RealmRepository();

  updateTSMDataForOneRealm(apiKey: string): Promise<void> {
    console.log('Checking for realms to update');
    return new Promise<void>((resolve, reject) => {
      this.repository.getHouseToUpdateTSMFor()
        .then(houses => {
          if (houses.length) {
            const house: AuctionHouse = houses[0];
            console.log(`There are ${houses.length} houses to update. Choosing the oldest dump (${house.connectedId})`);
            this.updateTSMDump(house, apiKey)
              .then(() => {
                console.log('Successfully updated ', house.connectedId);
                resolve();
              })
              .catch((error) => {
                console.error(`Could not update the house ${house.connectedId}`, error);
                reject(error);
              });
          } else {
            console.log('There are no realms to update');
            resolve();
          }
        })
        .catch(reject);
    });
  }

  updateLastTsmModified(id: number, url: string): Promise<any> {
    const tsm = {
      lastModified: +new Date(),
    };
    if (url) {
      tsm['url'] = url;
    }
    return this.repository.updateEntry(id, {
      id,
      tsm
    });
  }

  private updateTSMDump(house: AuctionHouse, key: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getAndUpload(house, key)
        .then((queryData) => {
          const url = queryData && queryData.url ? queryData.url : undefined;
          console.log('URL was', url, queryData);
          this.updateLastTsmModified(house.id, url)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  private async getAndUpload(house: AuctionHouse, key: string) {
    const url = `https://api.tradeskillmaster.com/v1/item/${house.region}/${house.realms[0].slug}?format=json&apiKey=${key
    }&fields=Id,MarketValue,HistoricalPrice,RegionMarketAvg,RegionHistoricalPrice,RegionSaleAvg,RegionAvgDailySold,RegionSaleRate`;
    return new Promise<any>((resolve, reject) => {
      new HttpClientUtil().get(url, true)
        .then(({body}) => {
          if (body.error) {
            console.error('Could not get realm API data due to error', body.error);
            reject();
            return;
          }

          const faultyItemsCount = (body as TSM[]).filter(tsm => !tsm.RegionAvgDailySold && !tsm.RegionSaleRate).length;

          if (faultyItemsCount < (body as TSM[]).length / 2) {
            new S3Handler().save(body,
              `tsm/${house.region}/${house.id}.json.gz`,
              {region: house.region, url: ''})
              .then(resolve)
              .catch(reject);
          } else {
            console.log(`Fauly realm dump count is ${faultyItemsCount} / ${(body as TSM[]).length}`);
            resolve();
          }
        });
    });
  }
}