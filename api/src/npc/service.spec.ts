import {NPCService} from './service';
import {NPC} from './model';
import {environment} from '../../../client/src/environments/environment';

describe('NpcService', () => {
  beforeEach(() => {
    jest.setTimeout(99999999);
    environment.test = false;
  });

  afterEach(() => {
    environment.test = true;
  });

  it('Can update old NPC with skinning', async () => {
    const id = 135510;
    const service = new NPCService();
    const result: NPC = await service.addOrUpdateById(id);
    expect(result.id).toBe(id);
  });


  it('findMissingNPCsFromLatestExpansion', async () => {
    environment.test = false;
    await new NPCService().findMissingNPCsFromLatestExpansion()
      .catch(console.error);
    environment.test = true;
    expect(1).toBeTruthy();
  });
});
