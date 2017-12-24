import { TestBed, inject } from '@angular/core/testing';

import { WowdbService } from './wowdb.service';

describe('WowdbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WowdbService]
    });
  });

  it('should be created', inject([WowdbService], (service: WowdbService) => {
    expect(service).toBeTruthy();
  }));
});
