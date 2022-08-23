import {BLIZZARD} from '../secrets';
import {APIGatewayEvent} from 'aws-lambda';
import {NameSpace} from '../enums/name-space.enum';

export class Endpoints {
  static STAGE: string;

  private readonly COMMUNITY_ENDPOINT = {
    eu: 'https://eu.api.blizzard.com/wow/',
    us: 'https://us.api.blizzard.com/wow/',
    kr: 'https://kr.api.blizzard.com/wow/',
    tw: 'https://tw.api.blizzard.com/wow/',
    cn: 'https://gateway.battlenet.com.cn/wow/'
  };
  private readonly GAME_DATA_ENDPOINT = {
    eu: 'https://eu.api.blizzard.com/',
    us: 'https://us.api.blizzard.com/',
    kr: 'https://kr.api.blizzard.com/',
    tw: 'https://tw.api.blizzard.com/',
    cn: 'https://gateway.battlenet.com.cn/'
  };
  readonly LAMBDAS = {
    EU: {
      prod: 'https://dto8jvfie1.execute-api.eu-west-1.amazonaws.com/prod/',
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


  static setStage(event: APIGatewayEvent) {
    try {
      if (!event || !event.requestContext || !event.requestContext.stage) {
        this.STAGE = 'prod';
      }
      this.STAGE = event.requestContext.stage;
    } catch (e) {
      this.STAGE = 'prod';
    }
  }

  public getLambdaUrl(path: string, region: string): string {
    return `${
      this.LAMBDAS[region.toUpperCase()][Endpoints.STAGE]}${path}`;
  }

  getGameDataBase(region: string, namespaceType: NameSpace) {
    let suffix = 'data/wow/';
    if (namespaceType === NameSpace.PROFILE_RETAIL) {
      suffix = 'profile/wow/';
    }
    return (region ? this.GAME_DATA_ENDPOINT[region] : this.GAME_DATA_ENDPOINT.eu) + suffix;
  }

  getBase(region?: string): string {
    return region ? this.COMMUNITY_ENDPOINT[region] : this.COMMUNITY_ENDPOINT.eu;
  }

  getPath(query: string, region?: string, namespaceType?: NameSpace): string {
    return this.getGameDataBase(region === 'beta' ? 'us' : region, namespaceType) +
      this.addQueriesToQueries(query, region, namespaceType);
  }

  private addQueriesToQueries(query: string, region?: string, namespaceType?: NameSpace): string {
    const namespace = region ? `&namespace=${namespaceType || 'static'}-${region}` : '';
    const base = `access_token=${BLIZZARD.ACCESS_TOKEN}${namespace}`;
    if (query.indexOf('?') > -1) {
      return `${query}&${base}`;
    } else {
      return `${query}?${base}`;
    }
  }
}


