import { TestBed, inject } from '@angular/core/testing';

import { CraftingService } from './crafting.service';
import { TestModule } from '../modules/test.module';

describe('CraftingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    });
  });

  it('should be created', inject([CraftingService], (service: CraftingService) => {
    expect(service).toBeTruthy();
  }));
});
