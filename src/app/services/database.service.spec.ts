import { TestBed, inject } from '@angular/core/testing';

import { DatabaseService } from './database.service';
import { TestModule } from '../modules/test.module';

describe('DatabaseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    });
  });

  it('should be created', inject([DatabaseService], (service: DatabaseService) => {
    expect(service).toBeTruthy();
  }));
});
