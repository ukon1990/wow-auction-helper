import {AuctionProcessorUtil} from './auction-processor.util';
import {MockLoaderUtil} from '../../../mocks/mock-loader.util';
import {environment} from '../../../../environments/environment';
import {SharedService} from '../../../services/shared.service';

fdescribe('AuctionProcessorUtil', () => {
  let auctions = [];
  let processed;

  beforeAll(() => {
    environment.test = true;
    const mockLoader = new MockLoaderUtil();
    try {
      mockLoader.setPets();
      mockLoader.setItems();
    } catch (error) {
      console.error('AuctionProcessorUtil.spec', error);
    }
    auctions = mockLoader.getFile('auctions').auctions;
  });

  describe('process', () => {
    beforeAll(() => {
      processed = AuctionProcessorUtil.process(
        auctions,
        SharedService.items,
        SharedService.pets,
        SharedService.tsm);
    });
    it('Can process auction items', () => {
      console.log('processed', processed);
      expect(processed.auctions.list.length).toBe(26);
    });

    it('Can process pets', () => {
      expect(processed.pets.list.length).toBe(1);
      expect(processed.pets.list[0].auctions.length).toBe(1);
    });
  });
});
