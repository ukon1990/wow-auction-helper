import {Zone, ZoneUtil} from './zone.util';
import {environment} from '../../../client/src/environments/environment';

describe('ZoneUtil', () => {
  beforeAll(() => {
    environment.test = true;
  });
  it('getById returns Stormsong Valley and type = Zone territory = Contested', async () => {
    const zoneId = 9042;
    const zone: Zone = await ZoneUtil.getById(zoneId);
    expect(zone.id).toBe(zoneId);
    expect(zone.name.en_GB).toBe('Stormsong Valley');
    expect(zone.territoryId).toBe(1); // Contested
    expect(zone.typeId).toBe(0); // Zone
    expect(zone.parentName).toBeFalsy();
    expect(zone.minLevel).toBe(35);
    expect(zone.maxLevel).toBe(50);
  });

  it('getById returns Baradin hold and type = World PvP territory = Contested', async () => {
    const zoneId = 5095;
    const zone: Zone = await ZoneUtil.getById(zoneId);
    expect(zone.id).toBe(zoneId);
    expect(zone.name.en_GB).toBe('Tol Barad');
    expect(zone.territoryId).toBe(3); // World PvP
    expect(zone.typeId).toBe(0); // Zone
    expect(zone.parentName).toBeFalsy();
    expect(zone.minLevel).toBe(85);
    expect(zone.maxLevel).toBe(undefined);
  });

  it('getById returns Baradin hold and type = Raid territory = Contested', async () => {
    const zoneId = 5600;
    const zone: Zone = await ZoneUtil.getById(zoneId);
    expect(zone.id).toBe(zoneId);
    expect(zone.name.en_GB).toBe('Baradin Hold');
    expect(zone.territoryId).toBe(2); // Contested
    expect(zone.typeId).toBe(3); // Raid
    expect(zone.parentName).toBe('Tol Barad');
    expect(zone.minLevel).toBe(85);
    expect(zone.maxLevel).toBe(undefined);
  });

  it('getById returns Deadmines and type = Dungeon territory = Alliance', async () => {
    const zoneId = 1581;
    const zone: Zone = await ZoneUtil.getById(zoneId);
    expect(zone.id).toBe(zoneId);
    expect(zone.name.en_GB).toBe('The Deadmines');
    expect(zone.territoryId).toBe(0); // Alliance
    expect(zone.typeId).toBe(2); // Dungeon
    expect(zone.parentName).toBe('Westfall');
    expect(zone.minLevel).toBe(15);
    expect(zone.maxLevel).toBe(25);
  });

  it('getById returns Orgrimmar and type = Zone territory = Horde', async () => {
    const zoneId = 1637;
    const zone: Zone = await ZoneUtil.getById(zoneId);
    console.log(zone);
    expect(zone.id).toBe(zoneId);
    expect(zone.name.en_GB).toBe('Orgrimmar');
    expect(zone.territoryId).toBe(1); // Horde
    expect(zone.typeId).toBe(1); // City
    expect(zone.parentName).toBe('Durotar');
    expect(zone.minLevel).toBe(1);
    expect(zone.maxLevel).toBe(120);
  });

  it('getById returns Deadmines and type = Dungeon territory = Alliance', async () => {
    const zoneId = 3457;
    const zone: Zone = await ZoneUtil.getById(zoneId);
    expect(zone.id).toBe(zoneId);
    expect(zone.name.en_GB).toBe('Karazhan');
    expect(zone.territoryId).toBe(2); // Contested
    expect(zone.typeId).toBe(3); // Raid
    expect(zone.parentName).toBe('Deadwind Pass');
    expect(zone.minLevel).toBe(70);
    expect(zone.maxLevel).toBeFalsy();
  });
});
