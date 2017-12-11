import { TestBed, inject } from '@angular/core/testing';

import { SharedService } from './shared.service';
import { TestModule } from '../modules/test.module';

describe('SharedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    });
  });

  it('should be created', inject([SharedService], (service: SharedService) => {
    expect(service).toBeTruthy();
  }));
});
