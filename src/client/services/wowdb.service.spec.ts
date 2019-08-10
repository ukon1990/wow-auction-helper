import { TestBed, inject } from '@angular/core/testing';

import { WowdbService } from './wowdb.service';
import { TestModule } from '../modules/test.module';

describe('WowdbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    });
  });

  it('should be created', inject([WowdbService], (service: WowdbService) => {
    expect(service).toBeTruthy();
  }));
});
