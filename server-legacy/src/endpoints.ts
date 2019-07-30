import {BLIZZARD} from './util/secrets';

export class Endpoints {
  private endpoints = {
    eu: 'https://eu.api.blizzard.com/wow/',
    us: 'https://us.api.blizzard.com/wow/',
    kr: 'https://kr.api.blizzard.com/wow/',
    tw: 'https://tw.api.blizzard.com/wow/',
    cn: 'https://gateway.battlenet.com.cn/wow/'
  };

  getBase(region?: string): string {
    return region ? this.endpoints[region] : this.endpoints.eu;
  }

  getPath(query: string, region?: string, isNotWoW?: boolean): string {
    return this.getBase(region) + this.addQueriesToQueries(query);
  }

  private addQueriesToQueries(query: string): string {
    if (query.indexOf('?') > -1) {
      return `${query}&access_token=${BLIZZARD.ACCESS_TOKEN}`;
    } else {
      return `${query}?access_token=${BLIZZARD.ACCESS_TOKEN}`;
    }
  }
}


