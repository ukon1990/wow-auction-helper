import { SharedService } from './shared.service';
import { Keys } from './keys';

export class Endpoints {
  public static readonly BNET_API = 'https://us.api.battle.net/wow/';
  public static readonly WAH_API = 'http://wah.jonaskf.net/';
  public static readonly IMAGE_PATH = 'https://render-eu.worldofwarcraft.com/';
  public static readonly IMAGE_PATH_ICONS = Endpoints.IMAGE_PATH + 'icons/56';
  // char/realm/??/??.jpg
  public static readonly IMAGE_PATH_CHARACTER = Endpoints.IMAGE_PATH + 'character';
  // https://render-eu.worldofwarcraft.com/character/draenor/217/111838681-avatar.jpg

  public static getAuctionDownloadUrl(): string {
    return `http://wowauctionshelper-env.dvsgifqqkj.eu-west-1.elasticbeanstalk.com/api/auction?url=${
        SharedService.auctionResponse.url
      }`;
  }
 // http://localhost:3000/api/auction?
  public static getBattleNetApi(query: string, region?: string): string {
    // 'assets/mock/auctions.json'
    return `https://${
      region ? (region === 'eu' ? 'eu' : 'us') : SharedService.user.region
      }.api.battle.net/wow/${
        query
      }${
        Endpoints.getBinder(query)
      }apikey=${Keys.blizzard}`;
  }

  private static getBinder(query: string) {
    return query.indexOf('?') > 0 ? '&' : '?';
  }
}
