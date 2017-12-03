import { TestBed, inject } from '@angular/core/testing';

import { AuctionsService } from './auctions.service';

describe('AuctionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuctionsService]
    });
  });

  it('should be created', inject([AuctionsService], (service: AuctionsService) => {
    expect(service).toBeTruthy();
  }));
});
