import {safeifyString} from '../util/string.util';
import {Pet} from '../models/pet';
import {getLocale} from '../util/locale.util';

export class PetQuery {
  public static selectAllForTimestampWithLocale(req: any): string {
    let query = `
      SELECT p.speciesId, petTypeId, creatureId, ${getLocale(req)} as name, icon, description, source, timestamp
      FROM pets as p, pet_name_locale as l
      WHERE l.speciesId = p.speciesId`;
    if (req.body.timestamp) {
      query += `
    AND timestamp > "${req.body.timestamp}"`;
    }
    return query + `
    ORDER BY timestamp desc;`;
  }

  static getPetBySpeciesId(req: any): string {
    return `SELECT *
            FROM pets
    WHERE speciesId = ${ req.params.id }`;
  }

  static insertInto(pet: Pet) {
    return `INSERT INTO pets (speciesId, petTypeId, creatureId,
                    name, icon, description, source)
                    VALUES (
                      ${pet.speciesId},
                      ${pet.petTypeId},
                      ${pet.creatureId},
                      "${safeifyString(pet.name)}",
                      "${pet.icon}",
                      "${safeifyString(pet.description)}",
                      "${safeifyString(pet.source)}");`;
  }

  static updatePet(pet: Pet): string {
    return `UPDATE pets
          SET
            petTypeId = ${pet.petTypeId},
            creatureId = ${pet.creatureId},
            name = "${safeifyString(pet.name)}",
            icon = "${pet.icon}",
            description = "${safeifyString(pet.description)}",
            source = "${safeifyString(pet.source)}"
          WHERE speciesId = ${pet.speciesId};`;
  }
}
