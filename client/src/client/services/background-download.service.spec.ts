import { TestBed } from '@angular/core/testing';

import { BackgroundDownloadService } from './background-download.service';

describe('BackgroundDownloadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BackgroundDownloadService = TestBed.get(BackgroundDownloadService);
    expect(service).toBeTruthy();
  });
});
