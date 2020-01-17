import {NPC, NPCUtil} from './npc.util';
import {environment} from '../../../client/src/environments/environment';

describe('NPCUtil', () => {
  beforeEach(() => {
    environment.test = true;
    jest.setTimeout(5000);
  });
  it('Can fetch data for mob', async () => {
    const npcId = 90517;
    const npc: NPC = await NPCUtil.getById(npcId);
    expect(npc.id).toBe(npcId);
    expect(npc.name.en_GB).toBe('Felbound Wolf');
    expect(npc.name.fr_FR).toBe('Loup gangre-lié');
    expect(npc.avgGoldDrop).toBe(6521);
    expect(npc.type).toBe(15); // Aberration
    expect(npc.classification).toBe(0);
    expect(npc.coordinates[0].x).toBe(25.4);
    expect(npc.coordinates[0].y).toBe(76.4);
    expect(npc.coordinates.length).toBe(23);
    expect(npc.expansionId).toBe(5);
    expect(npc.drops.length).toBe(182);
    const tanaanJungleTooth = npc.drops.filter(d => d.id === 128438)[0];
    // console.log(tanaanJungleTooth);
    expect(tanaanJungleTooth.id).toBe(128438);
    expect(tanaanJungleTooth.dropped).toBe(242007);
    expect(+tanaanJungleTooth.dropChance.toFixed(2)).toBe(.46);
  });

  it('Can fetch data for vendor', async () => {
    const npcId = 3313;
    const npc: NPC = await NPCUtil.getById(npcId);
    console.log(npc);
    expect(npc.id).toBe(npcId);
    expect(npc.name.en_GB).toBe('Trak\'gen');
    expect(npc.name.fr_FR).toBe('Trak\'gen');
    expect(npc.avgGoldDrop).toBe(0);
    expect(npc.type).toBe(7); // Humanoid
    expect(npc.classification).toBe(0);
    expect(npc.coordinates[0].x).toBe(53.4);
    expect(npc.coordinates[0].y).toBe(82);
    expect(npc.coordinates.length).toBe(2);
    expect(npc.expansionId).toBe(0);
    expect(npc.sells.length).toBe(16);

    const sweetNectar = npc.sells.filter(d => d.id === 1708)[0];
    expect(sweetNectar.id).toBe(1708);
    expect(sweetNectar.stackSize).toBe(5);
    expect(sweetNectar.stock).toBe(-1);
    expect(sweetNectar.price).toBe(1000);
    expect(sweetNectar.unitPrice).toBe(200);
    expect(sweetNectar.currency).toBeFalsy();
  });

  it('Can fetch data for a vendor selling with item as currency', async () => {
    const npcId = 66678;
    const npc: NPC = await NPCUtil.getById(npcId);
    expect(npc.id).toBe(npcId);
    expect(npc.name.en_GB).toBe('Krystel');
    expect(npc.zoneId).toBe(5840);
    expect(npc.coordinates[0].x).toBe(84.6);
    expect(npc.coordinates[0].y).toBe(60.4);
    expect(npc.coordinates.length).toBe(2);
    expect(npc.expansionId).toBe(4);
    expect(npc.sells.length).toBe(14);

    const blackTrilliumOre = npc.sells.filter(d => d.id === 72094)[0];
    expect(blackTrilliumOre.id).toBe(72094);
    expect(blackTrilliumOre.stackSize).toBe(5);
    expect(blackTrilliumOre.stock).toBe(-1);
    expect(blackTrilliumOre.price).toBe(1);
    expect(blackTrilliumOre.unitPrice).toBe(.2);
    expect(blackTrilliumOre.currency).toBe(76061);
  });

  it('Can fetch data for a vendor selling limited supply item', async () => {
    const npcId = 6568;
    const npc: NPC = await NPCUtil.getById(npcId);
    expect(npc.id).toBe(npcId);
    expect(npc.name.en_GB).toBe('Vizzklick');
    expect(npc.isAlliance).toBeTruthy();
    expect(npc.isHorde).toBeTruthy();
    expect(npc.minLevel).toBeFalsy();
    expect(npc.maxLevel).toBeFalsy();
    expect(npc.tag.de_DE).toBe('Schneiderbedarf');
    expect(npc.tag.en_GB).toBe('Tailoring Supplies');
    expect(npc.zoneId).toBe(440);
    expect(npc.coordinates[0].x).toBe(50.6);
    expect(npc.coordinates[0].y).toBe(28.6);
    expect(npc.coordinates.length).toBe(1);
    expect(npc.expansionId).toBe(0);
    expect(npc.sells.length).toBe(18);

    const crimsonRobePattern = npc.sells.filter(d => d.id === 7088)[0];
    expect(crimsonRobePattern.id).toBe(7088);
    expect(crimsonRobePattern.stackSize).toBe(1);
    expect(crimsonRobePattern.stock).toBe(1);
    expect(crimsonRobePattern.price).toBe(5000);
    expect(crimsonRobePattern.unitPrice).toBe(5000);
    expect(crimsonRobePattern.currency).toBeFalsy();
  });

  it('Can handle skinning', async () => {
    const npcId = 135510;
    const npc: NPC = await NPCUtil.getById(npcId);
    expect(npc.id).toBe(npcId);
    expect(npc.name.en_GB).toBe('Azuresail the Ancient');
    expect(npc.isAlliance).toBeFalsy();
    expect(npc.isHorde).toBeFalsy();
    expect(npc.minLevel).toBe(120);
    expect(npc.maxLevel).toBe(120);
    expect(npc.tag.en_GB).toBeFalsy();
    expect(npc.skinning.length).toBe(6);

    const shimmerScale = npc.skinning.filter(d => d.id === 153050)[0];
    expect(shimmerScale.id).toBe(153050);
    expect(shimmerScale.dropChance).toBe(1);
  });

  it('Can handle worth if present', async () => {
    const npcId = 152364;
    const npc: NPC = await NPCUtil.getById(npcId);
    expect(npc.id).toBe(npcId);
    expect(npc.name.en_GB).toBe('Radiance of Azshara');
    expect(npc.classification).toBe(1);
    expect(npc.minLevel).toBe(9999);
    expect(npc.maxLevel).toBe(9999);
    expect(npc.avgGoldDrop).toBe(599677);
  });

  it('Can get WOD garrison vendor', async () => {
    const npcId = 87201;
    const npc: NPC = await NPCUtil.getById(npcId);
    expect(npc.id).toBe(npcId);
    expect(npc.name.en_GB).toBe('Pyxni Pennypocket');
    for (const item of npc.sells) {
      expect(item.price).toBeTruthy();
      expect(item.currency).toBeTruthy();
      expect(item.stackSize).toBeTruthy();
    }
  });

  it('Can add missing locale', async () => {
    environment.test = false;
    jest.setTimeout(120000);
    const res = await NPCUtil.updateMissingLocale();
    expect(res.length).toBe(0);
  });
});
