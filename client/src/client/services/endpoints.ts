import {SharedService} from './shared.service';
import {environment} from '../../environments/environment';

export class Endpoints {
  public static readonly TSM_API = 'https://api.tradeskillmaster.com/v1/item';
  public static readonly BNET_API = 'https://us.api.battle.net/wow/';
  public static readonly WAH_API = 'https://wah.jonaskf.net/';
  public static readonly WAH_LOCAL_API = 'http://localhost:3000/api/';
  public static readonly WAH_NODE_API = 'https://wowauctionshelper-env.dvsgifqqkj.eu-west-1.elasticbeanstalk.com/api/';
  public static readonly IMAGE_PATH = 'https://render-eu.worldofwarcraft.com/';
  public static readonly IMAGE_PATH_ICONS = Endpoints.IMAGE_PATH + 'icons/56';
  // char/realm/??/??.jpg
  public static readonly IMAGE_PATH_CHARACTER = Endpoints.IMAGE_PATH + 'character.model.ts';
  public static readonly LAMBDAS = {
    EU: environment.production ?
      'https://lcrz8vcw36.execute-api.eu-west-1.amazonaws.com/prod/' :
      'https://54d944z3dl.execute-api.eu-west-1.amazonaws.com/dev/',
    US: environment.production ?
      'https://w7r88eeid9.execute-api.us-west-1.amazonaws.com/prod/' :
      'https://qbxwravpi9.execute-api.us-west-1.amazonaws.com/dev/',
    KR: environment.production ?
      'https://v3haq1749e.execute-api.ap-northeast-2.amazonaws.com/prod/' :
      'https://fk9meeuzrl.execute-api.ap-northeast-2.amazonaws.com/dev/',
    TW: environment.production ?
      'https://v3haq1749e.execute-api.ap-northeast-2.amazonaws.com/prod/' :
      'https://fk9meeuzrl.execute-api.ap-northeast-2.amazonaws.com/dev/'
  };

  // https://render-eu.worldofwarcraft.com/character/draenor/217/111838681-avatar.jpg

  public static getLambdaUrl(path: string, region?: string): string {
    if (!region) {
      region = SharedService.user && SharedService.user.region ?
        SharedService.user.region : 'eu';
    }

    return `${
      Endpoints.LAMBDAS[region.toUpperCase()]
      }${
      path
      }`;
  }

  public static getUrl(path: string): string {

    return environment.production ?
      `/api/${path}` : `${Endpoints.WAH_LOCAL_API}${path}`;
  }

  public static getUndermineUrl(): string {
    if (!SharedService.user) {
      return '';
    }

    return `https://theunderminejournal.com/#${
      SharedService.user.region}/${
      Endpoints.getRealm().slug}/`;
  }

  public static getRealm(slug?: string) {
    const fromSlug = SharedService.realms[slug],
      currentRealm = SharedService.realms[SharedService.user.realm];
    return fromSlug || currentRealm;
  }

  public static getRegion(region: string): string {
    return region ? region : SharedService.user.region;
  }

  private static getBinder(query: string) {
    return query.indexOf('?') > 0 ? '&' : '?';
  }
}
