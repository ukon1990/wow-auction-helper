import { TestBed, inject } from '@angular/core/testing';

import { CraftingService } from './crafting.service';

describe('CraftingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CraftingService]
    });
  });

  it('should be created', inject([CraftingService], (service: CraftingService) => {
    expect(service).toBeTruthy();
  }));
});
