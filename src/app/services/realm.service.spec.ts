import { TestBed, inject } from '@angular/core/testing';

import { RealmService } from './realm.service';

describe('RealmService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RealmService]
    });
  });

  it('should be created', inject([RealmService], (service: RealmService) => {
    expect(service).toBeTruthy();
  }));
});
