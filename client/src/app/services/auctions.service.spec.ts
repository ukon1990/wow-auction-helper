import { TestBed, inject } from '@angular/core/testing';

import { AuctionsService } from './auctions.service';
import { TestModule } from '../modules/test.module';

describe('AuctionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    });
  });

  it('should be created', inject([AuctionsService], (service: AuctionsService) => {
    expect(service).toBeTruthy();
  }));
});
