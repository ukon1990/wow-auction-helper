import {NPC} from '../models/npc.model';
import {NpcUtil} from './npc.util';
import {environment} from '../../../../environments/environment';

describe('NpcUtil', () => {

  const getBaseNPC = () => ({
    id: 10,
    name: '',
    zoneId: 1,
    coordinates: [],
    sells: [],
    drops: [],
    skinning: [],
    expansionId: 0,
    isHorde: true,
    isAlliance: false,
    minLevel: 10,
    maxLevel: 50,
    tag: '',
    type: 0,
    classification: 0,
    avgGoldDrop: 0,
  });

  const npc: NPC = getBaseNPC();
  npc.sells = [{
    id: 2,
    price: 99,
    unitPrice: 111,
    currency: 0,
    stock: 5,
    stackSize: 99
  }, {
    id: 3,
    price: 99,
    unitPrice: 111,
    currency: 0,
    stock: 5,
    stackSize: 99
  }];
  const npc2: NPC = getBaseNPC();
  npc2.id = 11;
  npc2.sells = [{
    id: 2,
    price: 99,
    unitPrice: 111,
    currency: 0,
    stock: 5,
    stackSize: 99
  }, {
    id: 393828,
    price: 99,
    unitPrice: 111,
    currency: 0,
    stock: 5,
    stackSize: 99
  }];
  describe('split', () => {
    it('Can extract soldBy', () => {
      const result = NpcUtil.split([npc, npc2]);
      expect(result.bases.length).toBe(2);
      expect(result.sells.length).toBe(3);
      expect(result.sells[0].foundOn.length).toBe(2);
      expect(result.sells[1].foundOn.length).toBe(1);
    });
  });

  describe('combine', () => {
    it('Can combine', () => {
      const split = NpcUtil.split([npc, npc2]);
      const result = NpcUtil.combine(split);
      expect(result.length).toBe(2);
      expect(result[0].sells.length).toBe(2);
    });
  });
});
