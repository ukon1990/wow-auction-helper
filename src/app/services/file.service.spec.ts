import { TestBed, inject } from '@angular/core/testing';

import { FileService } from './file.service';

describe('FileSaverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService]
    });
  });

  it('should be created', inject([FileService], (service: FileSaverService) => {
    expect(service).toBeTruthy();
  }));
});
