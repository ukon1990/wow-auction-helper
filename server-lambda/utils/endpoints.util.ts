import {BLIZZARD} from '../secrets';
import {APIGatewayEvent} from 'aws-lambda';

export class Endpoints {
  private endpoints = {
    eu: 'https://eu.api.blizzard.com/wow/',
    us: 'https://us.api.blizzard.com/wow/',
    kr: 'https://kr.api.blizzard.com/wow/',
    tw: 'https://tw.api.blizzard.com/wow/',
    cn: 'https://gateway.battlenet.com.cn/wow/'
  };
  readonly LAMBDAS = {
    EU: {
      prod: 'https://lcrz8vcw36.execute-api.eu-west-1.amazonaws.com/prod/',
      dev: 'https://54d944z3dl.execute-api.eu-west-1.amazonaws.com/dev/'
    },
    US: {
      prod: 'https://w7r88eeid9.execute-api.us-west-1.amazonaws.com/prod/',
      dev: 'https://qbxwravpi9.execute-api.us-west-1.amazonaws.com/dev/'
    },
    KR: {
      prod: 'https://v3haq1749e.execute-api.ap-northeast-2.amazonaws.com/prod/',
      dev: 'https://fk9meeuzrl.execute-api.ap-northeast-2.amazonaws.com/dev/'
    },
    TW: {
      prod: 'https://v3haq1749e.execute-api.ap-northeast-2.amazonaws.com/prod/',
      dev: 'https://fk9meeuzrl.execute-api.ap-northeast-2.amazonaws.com/dev/'
    }
  };

  // https://render-eu.worldofwarcraft.com/character/draenor/217/111838681-avatar.jpg

  public getLambdaUrl(path: string, region: string, event: APIGatewayEvent): string {
    return `${
      this.LAMBDAS[region.toUpperCase()][event.requestContext.stage]}${path}`;
  }

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


