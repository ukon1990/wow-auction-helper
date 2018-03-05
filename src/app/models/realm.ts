import { SharedService } from '../services/shared.service';
import { User } from './user/user';

export class Realm {
  type: string;
  population: string;
  queue: boolean;
  status: boolean;
  name: string;
  slug: string;
  battlegroup: string;
  locale: string; // de_DE, en_GB
  timezone: string; // Europe/Paris
  connected_realms: Array<string> = new Array<string>();

  public static gatherRealms(): void {
    const tmpMap: Map<string, Realm> = new Map<string, Realm>();
    SharedService.userRealms = new Array<Realm>();

    SharedService.user.characters.forEach(character => {
      if (!tmpMap[character.realm]) {
        const realm = SharedService.realms[User.slugifyString(character.realm)];
        tmpMap[character.realm] = realm;
      }
    });

    Object.keys(tmpMap).forEach(key =>
      SharedService.userRealms.push(tmpMap[key]));
  }
}
