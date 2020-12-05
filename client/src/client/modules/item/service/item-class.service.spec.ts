import { TestBed } from '@angular/core/testing';

import { ItemClassService } from './item-class.service';

describe('ItemClassService', () => {
  let service: ItemClassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemClassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
