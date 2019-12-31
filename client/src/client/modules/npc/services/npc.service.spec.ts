import { TestBed } from '@angular/core/testing';

import { NpcService } from './npc.service';

describe('NpcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NpcService = TestBed.get(NpcService);
    expect(service).toBeTruthy();
  });
});
