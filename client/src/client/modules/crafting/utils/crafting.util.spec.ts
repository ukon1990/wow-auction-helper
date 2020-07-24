import {SharedService} from '../../../services/shared.service';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {CraftingUtil} from './crafting.util';
import {TSM} from '../../auction/models/tsm.model';
import {Recipe} from '../models/recipe';
import {MockLoaderUtil} from '../../../mocks/mock-loader.util';
import {CraftingService} from '../../../services/crafting.service';
import {TsmService} from '../../tsm/tsm.service';
import {Reagent} from '../models/reagent';
import {TestBed} from '@angular/core/testing';
import {AuctionsService} from '../../../services/auctions.service';

describe('CraftingUtil', () => {
  let service: AuctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuctionsService);
  });
  beforeAll(() => {
    new MockLoaderUtil().initBaseData();
    const recipe = new Recipe();

    CraftingService.list.next([]);
    const ai1 = new AuctionItem();
    ai1.buyout = 20;
    service.mapped.value.set('' + 10, ai1);
    const ai2 = new AuctionItem();
    ai2.buyout = 10;
    service.mapped.value.set('' + 11, ai2);
    const ai3 = new AuctionItem();
    ai3.buyout = 30;
    service.mapped.value.set('' + 12, ai3);
    const ai4 = new AuctionItem();
    ai4.buyout = 10;
    service.mapped.value.set('' + 20, ai4);

    TsmService.mapped.value.set(20, {MarketValue: 100} as TSM);

    recipe.id = 1;
    recipe.itemID = 10;
    recipe.name = 'test recipe';
    recipe.professionId = 1;
    recipe.minCount = 1;
    recipe.maxCount = 1;
    recipe.reagents = [];
    CraftingService.list.next([recipe]);
  });

  describe('Should be able to calculate cost', () => {
    it('for one reagent', () => {
      CraftingService.list.value[0].reagents
        .push(new Reagent(11, 3));
      CraftingUtil.calculateCost();
      expect(CraftingService.list.value[0].cost).toEqual(30);
      expect(CraftingService.list.value[0].roi).toEqual(-10);
    });

    it('for several reagents', () => {
      CraftingService.list.value[0].reagents
        .push(new Reagent(11, 3));
      CraftingService.list.value[0].reagents
        .push(new Reagent(12, 10));
      CraftingUtil.calculateCost();

      expect(CraftingService.list.value[0].cost).toEqual(330);
      expect(CraftingService.list.value[0].roi).toEqual(-310);
    });

    it('if some items aren\'t at AH', () => {
      CraftingService.list.value[0].reagents
        .push(new Reagent(1, 3));
      CraftingService.list.value[0].reagents
        .push(new Reagent(12, 10));
      CraftingUtil.calculateCost();

      expect(CraftingService.list.value[0].cost).toEqual(300);
      expect(CraftingService.list.value[0].roi).toEqual(-280);
    });

    it('if some items aren\'t at AH and use market value instead.', () => {
      // logic
      SharedService.user.apiToUse = 'tsm';
    });

    it('The item is above set limit, so use market value instead.', () => {
      // Buyout is 200% of MV
      SharedService.user.buyoutLimit = 200;
      SharedService.user.apiToUse = 'tsm';

      CraftingService.list.value[0].reagents.push(
        new Reagent(20, 3));
      CraftingService.list.value[0].reagents.push(
        new Reagent(12, 10));

      // 100
      TsmService.mapped.value.get(20).MarketValue = 15;
      CraftingUtil.calculateCost();
      expect(CraftingService.list.value[0].cost).toEqual(180);
    });

    it('if some items aren\'t at AH and use avg sold for value instead.', () => {
      SharedService.user.apiToUse = 'tsm';
    });
  });

  describe('Disenchant crafting', () => {
  });
});
