import { TestBed, inject } from '@angular/core/testing';

import { RealmService } from './realm.service';
import { TestModule } from '../modules/test.module';

describe('RealmService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    });
  });

  it('should be created', inject([RealmService], (service: RealmService) => {
    expect(service).toBeTruthy();
  }));
});
