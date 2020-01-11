import {SharedService} from './shared.service';
import {environment} from '../../environments/environment';

export class Endpoints {
  public static readonly TSM_API = 'https://api.tradeskillmaster.com/v1/item';
  public static readonly WAH_LOCAL_API = 'http://localhost:3000/';
  public static readonly IMAGE_PATH = 'https://render-eu.worldofwarcraft.com/';
  public static readonly IMAGE_PATH_ICONS = Endpoints.IMAGE_PATH + 'icons/56';
  // char/realm/??/??.jpg
  public static readonly IMAGE_PATH_CHARACTER = Endpoints.IMAGE_PATH + 'character';
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
  public static readonly S3_BUCKET = `https://s3-eu-west-1.amazonaws.com/wah-data`;

  static getS3URL(region: string, type: 'auctions' | 'tsm', path: string) {
    if (!region) {
      region = SharedService.user && SharedService.user.region ?
        SharedService.user.region : 'eu';
    }
    switch (region) {
      case 'eu':
        return `https://wah-data-eu.s3.eu-west-1.amazonaws.com/${type}/eu/${path}.json.gz`;
      case 'us':
        return `https://wah-data-us.s3-us-west-1.amazonaws.com/${type}/us/${path}.json.gz`;
      case 'kr':
        return `https://wah-data-as.s3.ap-northeast-2.amazonaws.com/${type}/kr/${path}.json.gz`;
      case 'tw':
        return `https://wah-data-as.s3.ap-northeast-2.amazonaws.com/${type}/tw/${path}.json.gz`;
    }
  }

  // https://render-eu.worldofwarcraft.com/character/draenor/217/111838681-avatar.jpg

  public static getLambdaUrl(path: string, region?: string): string {
    if (!environment.production) {
      return 'http://localhost:3000/' + path;
    }
    if (!region) {
      region = SharedService.user && SharedService.user.region ?
        SharedService.user.region : 'eu';
    }

    return `${Endpoints.LAMBDAS[region.toUpperCase()]}${path}`;
  }

  private static getLambdaURLForEnvironment(region: string) {
    return environment.production ? Endpoints.LAMBDAS[region.toUpperCase()] : this.WAH_LOCAL_API;
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
