import {Profession} from './model';
import {ProfessionRepository} from './repository';

export class ProfessionService {

  static getAll(locale: string): Promise<Profession[]> {
    return new ProfessionRepository().getAllAfter(0, locale);
  }
}
