import { TestBed, inject } from '@angular/core/testing';

import { PetsService } from './pets.service';
import { TestModule } from '../modules/test.module';

describe('PetsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    });
  });

  it('should be created', inject([PetsService], (service: PetsService) => {
    expect(service).toBeTruthy();
  }));
});
