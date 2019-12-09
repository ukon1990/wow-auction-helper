import {Zone, ZoneUtil} from './zone.util';

describe('ZoneUtil', () => {
  it('getById returns Stormsong Valley', async () => {
    const zoneId = 9042;
    const zone: Zone = await ZoneUtil.getById(zoneId);
    expect(zone.id).toBe(zoneId);
    expect(zone.name).toBe('Stormsong Valley');
  });
});
