import { TestBed } from '@angular/core/testing';

import { ProfessionService } from './profession.service';

describe('ProfessionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProfessionService = TestBed.get(ProfessionService);
    expect(service).toBeTruthy();
  });
});
