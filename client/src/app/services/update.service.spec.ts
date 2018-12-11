import { TestBed, inject } from '@angular/core/testing';

import { UpdateService } from './update.service';

describe('UpdateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateService]
    });
  });

  it('should be created', inject([UpdateService], (service: UpdateService) => {
    expect(service).toBeTruthy();
  }));
});
