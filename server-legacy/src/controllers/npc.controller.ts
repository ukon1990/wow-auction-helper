import {PetUtil} from '../util/pet.util';
import {NpcHandler} from '../../../api/src/handlers/npc.handler';

/**
 * GET /api/pet
 */
export const postNPCS = (req, res) => {
  const body = req.body;
  NpcHandler.getByIds(body.ids)
    .then(console.log)
    .catch(console.error);
  res.send(body);
};
