import {DatabaseUtil} from '../utils/database.util';
import {HttpClientUtil} from '../utils/http-client.util';
import {S3Handler} from './s3.handler';
import {QueryUtil} from '../utils/query.util';

export class TSMHandler {
  getAndStartAllRealmsToUpdate(key: string): Promise<boolean> {
    console.log('Checking for new realms to update');
    return new Promise<boolean>((resolve, reject) => {
      new DatabaseUtil().query(`
        SELECT
          ah.id AS id,
          region,
          slug,
          tsm.lastModified AS lastModified,
          FROM_UNIXTIME(tsm.lastModified / 1000)
        FROM
          auction_houses AS ah
              LEFT OUTER JOIN
          (SELECT
              ahId, slug, name
          FROM
              auction_house_realm
          GROUP BY ahId) AS realm ON ah.id = realm.ahId
              LEFT OUTER JOIN
          tsmDump AS tsm ON tsm.id = ah.id
        WHERE
          (region = 'eu' OR region = 'us')
              AND (ah.id NOT IN (SELECT
                  id
              FROM
                  tsmDump)
              OR FROM_UNIXTIME(tsm.lastModified / 1000) < NOW() - INTERVAL 24 HOUR)
        ORDER BY lastModified ASC
        LIMIT 1;
      `)
        .then(async (rows: { id, slug, region, lastModified }[]) => {
          if (!rows.length) {
            console.log('There are no realms that need updating');
            resolve();
            return;
          }
          try {
            await this.updateRealm(rows[0].id, rows[0].region, rows[0].slug, key);
          } catch (e) {
            console.error('getAndStartAllRealmsToUpdate', e);
          }
          resolve();
        })
        .catch(reject);
    });
  }

  updateRealm(id: number, region: string, name: string, key: string): Promise<void> {
    console.log('TSMHandler.updateRealm starting', id, region, name);
    return new Promise<void>(async (resolve, reject) => {
      await this.fetchTSMDump(region, name, key)
        .then(({body}) => {
          if (body.error) {
            console.error('Could not get realm API data due to error', body.error);
            reject();
            return;
          }
          console.log('TSMHandler.updateRealm saving to s3');
          new S3Handler().save(body, `tsm/${region}/${id}.json.gz`, {region, url: ''})
            .then(async queryData => {
              this.handleUploadSuccess(id, queryData)
                .then(resolve)
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(error => {
          console.error(`Could not get TSM api data`, error);
          reject(error);
        });
    });
  }

  // Rate limit is 50 per hour
  private async fetchTSMDump(region: any, name: any, key: string) {
    const url = `https://api.tradeskillmaster.com/v1/item/${region}/${name}?format=json&apiKey=${key
    }&fields=Id,MarketValue,HistoricalPrice,RegionMarketAvg,RegionHistoricalPrice,RegionSaleAvg,RegionAvgDailySold,RegionSaleRate`;
    return new Promise<any>((resolve, reject) => {
      new HttpClientUtil().get(url, true)
        .then(resolve)
        .catch(reject);
    });
  }

  private async handleUploadSuccess(id: number, {url}: { url }) {
    console.log('TSMHandler.updateRealm saved to S3 @ URL', url);
    await new DatabaseUtil().query(`SELECT * from tsmDump where id = ${id};`)
      .then(async (rows: any[]) => {
        if (rows.length) {
          await new DatabaseUtil()
            .query(
              new QueryUtil('tsmDump', false)
                .update(id, {id, lastModified: +new Date()}))
            .catch(console.error);
        } else {
          await new DatabaseUtil()
            .query(
              new QueryUtil('tsmDump', false)
                .insert({id, url, lastModified: +new Date()}))
            .catch(console.error);
        }
      });
  }
}
