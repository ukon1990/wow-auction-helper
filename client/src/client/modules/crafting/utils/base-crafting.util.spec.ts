import {BaseCraftingUtil} from './base-crafting.util';
import {OptimisticCraftingUtil} from './optimistic-crafting.util';

fdescribe('BaseCraftingUtil', () => {
  beforeAll(
    () => {
  });

  it('Can calculate', () => {

    new OptimisticCraftingUtil().calculate([], []);
    expect(1).toBe(1);
  });
});
