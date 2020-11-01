import { TestBed } from '@angular/core/testing';

import { AppSyncService } from './app-sync.service';

describe('AppSyncService', () => {
  let service: AppSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
