import {UserAuctions} from './user-auctions';
import {Character} from '../character/character';
import {Auction} from './auction';
import {AuctionItem} from './auction-item';

fdescribe('UserAuctions', () => {
  let userAuctions: UserAuctions;
  const realm1 = 'emerald dream', realm2 = 'razuvious',
    character1 = 'orange', character2 = 'Банан';

  beforeEach(() => {
    userAuctions = new UserAuctions();
  });

  describe('organizeCharacters', () => {
    it('Can organize characters from one realm', () => {
      userAuctions.organizeCharacters([
        new Character(realm1, character1)
      ]);
      expect(userAuctions.charactersMap[realm1][character1]).toBeTruthy();
    });

    it('Can organize characters from multiple realms', () => {
      userAuctions.organizeCharacters([
        new Character(realm1, character1),
        new Character(realm2, character2)
      ]);
      expect(userAuctions.charactersMap[realm1][character1]).toBeTruthy();
      expect(userAuctions.charactersMap[realm2][character2]).toBeTruthy();
    });
  });

  describe('addAuction', () => {
    beforeEach(() => {
      userAuctions.organizeCharacters([
        new Character(realm1, character1),
        new Character(realm2, character2)
      ]);
    });

    it('can add users auctions to a character', () => {
      const ai = new AuctionItem();
      ai.buyout = 100;
      userAuctions.addAuction(new Auction(
        0, 0, 100, 0, character1, realm1
      ), ai);
      expect(userAuctions.auctions.length).toBe(1);
    });

    it('can add users auctions to a character with a russian name', () => {
      const ai = new AuctionItem();
      ai.buyout = 100;
      userAuctions.addAuction(new Auction(
        0, 0, 100, 0, character2, realm2
      ), ai);
      console.log('addAuction', userAuctions);
      expect(userAuctions.auctions.length).toBe(1);
    });
  });

  describe('countUndercuttedAuctions', () => {
  });
});
