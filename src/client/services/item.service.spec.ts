import { TestBed, inject } from '@angular/core/testing';

import { ItemService } from './item.service';
import { TestModule } from '../modules/test.module';

describe('ItemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    });
  });

  it('should be created', inject([ItemService], (service: ItemService) => {
    expect(service).toBeTruthy();
  }));
});
