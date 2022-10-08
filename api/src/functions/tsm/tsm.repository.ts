import {Authorization} from '@models/authorization.model';
import {HttpClientUtil} from '../../utils/http-client.util';
import {TsmRegionalItemStats, TsmRegions} from '@functions/tsm/tsm.model';
import {S3Handler} from '@functions/handlers/s3.handler';
import {TsmGameVersion} from '@functions/tsm/tsm.enum';

export class TsmRepository {
  private readonly http = new HttpClientUtil();
  private readonly s3 = new S3Handler();
  private authorization: Authorization;
  private tokenExpires: number;

  constructor(private apiKey: string) {
  }

  public async authorize() {
    if (this.authorization && +new Date() <= this.tokenExpires) {
      return;
    }
    try {
      await this.http.post<Authorization>(
        'https://auth.tradeskillmaster.com/oauth2/token',
        {
          client_id: 'c260f00d-1071-409a-992f-dda2e5498536',
          grant_type: 'api_token',
          scope: 'app:realm-api app:pricing-api',
          token: this.apiKey
        },
        undefined,
        {
          'Content-Type': 'application/json',
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
        }
      )
        .then(({body}) => {
          if (!body.access_token) {
            console.error('Token is missing', body);
            return;
          }
          this.authorization = body;
          this.tokenExpires = +new Date() + this.authorization.expires_in * 1000;
        });
    } catch (error) {
      throw error;
    }
  }

  public getRegionsFromAPI(): Promise<TsmRegions> {
    if (!this.authorization) {
      throw new Error('Not Authorized');
    }
    return new Promise<TsmRegions>((resolve, reject) => {
      this.http.get(
        'https://realm-api.tradeskillmaster.com/regions',
        true,
        this.getHeaders()
      )
        .then(({body}) => resolve(body))
        .catch(reject);
    });
  }

  public getRegionalFromAPI(id: number): Promise<TsmRegionalItemStats[]> {
    if (!this.authorization) {
      throw new Error('Not Authorized');
    }

    return new Promise((resolve, reject) => {
      this.http.get(
        `https://pricing-api.tradeskillmaster.com/region/${id}`,
        true,
        this.getHeaders()
      )
        .then(resolve)
        .catch(reject);
    });
  }

  private getHeaders() {
    return {Authorization: `Bearer ${this.authorization.access_token}`};
  }

  public saveToS3(gameVersion: TsmGameVersion, region: string, content: TsmRegionalItemStats[]): Promise<void> {
    return this.s3.save(
      content,
      `tsm/${region}/${gameVersion.toLowerCase()}`,
      /*
       * Storing it in EU, as that is where Il'l combine the data with the stats data
       */
      {region: 'eu'}
    );
  }
}