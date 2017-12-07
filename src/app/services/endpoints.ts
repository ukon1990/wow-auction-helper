import { SharedService } from './shared.service';
import { Keys } from './keys';

export class Endpoints {
    public static readonly BNET_API = 'https://us.api.battle.net/wow/';
    public static readonly IMAGE_PATH = 'https://render-eu.worldofwarcraft.com/';
    public static readonly IMAGE_PATH_ICONS = Endpoints.IMAGE_PATH + 'icons/56';
    // char/realm/??/??.jpg
    public static readonly IMAGE_PATH_CHARACTER = Endpoints.IMAGE_PATH + 'character';
    // https://render-eu.worldofwarcraft.com/character/draenor/217/111838681-avatar.jpg

    public static getBattleNetApi(query: string, region?: string): string {
        return `https://${
            region ? (region === 'eu' ? 'eu' : 'us') : SharedService.user.region
        }.api.battle.net/wow/${query}&apikey=${Keys.blizzard}`;
    }
}
