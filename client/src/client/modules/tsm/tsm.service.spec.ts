import { TestBed } from '@angular/core/testing';

import { TsmService } from './tsm.service';

describe('TsmService', () => {
  let service: TsmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TsmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
