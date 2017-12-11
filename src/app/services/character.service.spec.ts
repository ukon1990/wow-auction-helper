import { TestBed, inject } from '@angular/core/testing';

import { CharacterService } from './character.service';
import { TestModule } from '../modules/test.module';

describe('CharacterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    });
  });

  it('should be created', inject([CharacterService], (service: CharacterService) => {
    expect(service).toBeTruthy();
  }));
});
