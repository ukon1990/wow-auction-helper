import {SharedService} from './shared.service';
import {Keys} from './keys';
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
  public static readonly IMAGE_PATH_CHARACTER = Endpoints.IMAGE_PATH + 'character';
  public static readonly LAMBDAS = {
    AUCTION_US: 'https://4m6c7drle0.execute-api.us-west-2.amazonaws.com/default/getAuctions'
  };

  // https://render-eu.worldofwarcraft.com/character/draenor/217/111838681-avatar.jpg

  public static getUrl(path: string): string {
    let url = `/api/${path}`;
    if (path === 'auction' && SharedService.user.region === 'us') {
      url = Endpoints.LAMBDAS.AUCTION_US;
    }
    console.log('path', url);
    return environment.production ?
      url : `${Endpoints.WAH_LOCAL_API}${path}`;
  }

  public static getUndermineUrl(): string {
    if (!SharedService.user) {
      return '';
    }

    return `https://theunderminejournal.com/#${
      SharedService.user.region}/${
      Endpoints.getRealm().slug}/`;
  }

  private static getRealm(slug?: string) {
    const fromSlug = SharedService.realms[slug],
      currentRealm = SharedService.realms[SharedService.user.realm];
    return fromSlug || currentRealm;
  }

// http://localhost:3000/api/auction?
  public static getBattleNetApi(query: string, region?: string, dontUseUserLocale?: boolean, realmSlug?: string): string {
    // 'assets/mock/auctions.json'
    const localeString = dontUseUserLocale ?
      '' : `&locale=${Endpoints.getRealm(realmSlug).locale}`;

    return `https://${
      Endpoints.getRegion(region)
      }.api.battle.net/wow/${
      query
      }${
      Endpoints.getBinder(query)
      }apikey=${Keys.blizzard}${localeString}`;
  }

  public static getRegion(region: string): string {
    return region ? (region === 'eu' ? 'eu' : 'us') : SharedService.user.region;
  }

  private static getBinder(query: string) {
    return query.indexOf('?') > 0 ? '&' : '?';
  }
}
