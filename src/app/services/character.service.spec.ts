import { TestBed, inject } from '@angular/core/testing';

import { CharacterService } from './character.service';

describe('CharacterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CharacterService]
    });
  });

  it('should ...', inject([CharacterService], (service: CharacterService) => {
    expect(service).toBeTruthy();
  }));
});
