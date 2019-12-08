import {Recipe} from '../modules/crafting/models/recipe';
import {SummaryUtil} from './summary.util';

fdescribe('SummaryUtil', () => {
  describe('isProfitMatch', () => {
    it('below profit margin', () => {
      const recipe = new Recipe();
      expect(SummaryUtil.isProfitMatch(recipe)).toBeFalsy();
    });

    it('below profit margin', () => {
      const recipe = new Recipe();
      recipe.cost = 30;
      recipe.roi = 50 - recipe.cost;
      expect(SummaryUtil.isProfitMatch(recipe)).toBeTruthy();
    });
  });

  describe('isProfitAndDailySoldMatch', () => {
    it('false', () => {
      const recipe = new Recipe();
      expect(SummaryUtil.isProfitAndDailySoldMatch(recipe)).toBeFalsy();
    });

    it('true', () => {
      const recipe = new Recipe();
      recipe.avgDailySold = 8;
      recipe.regionSaleRate = .20;
      expect(SummaryUtil.isProfitAndDailySoldMatch(recipe)).toBeFalsy();
    });
  });
});
