import { async, TestBed } from '@angular/core/testing';
import { User } from './user';
import { SharedService } from '../../services/shared.service';
import {UserUtil} from '../../utils/user/user.util';

beforeEach(() => {

});

afterEach(() => {
  Object.keys(localStorage).forEach(key => {
    delete localStorage[key];
  });
});

describe('User', () => {
  describe('import', () => {
    it('should be able to import', () => {
      UserUtil.import(JSON.stringify({
        realm: 'test-realm',
        region: 'us',
        buyoutLimit: 300
      }));

      expect(localStorage['crafting_buyout_limit']).toEqual('300');
      expect(SharedService.user.buyoutLimit).toEqual(300);
    });
  });

  describe('restore', () => {
    it('Should accept work only if just region and realm are set', () => {
      localStorage['realm'] = 'test-realm';
      localStorage['region'] = 'eu';
      UserUtil.restore();
      expect(SharedService.user.realm).toEqual('test-realm');
      expect(SharedService.user.region).toEqual('eu');
    });

    it('Has default values', () => {
      UserUtil.restore();
      expect(SharedService.user.buyoutLimit).toEqual(200);
    });

    it('Can override default values', () => {
      localStorage['crafting_buyout_limit'] = '300';
      UserUtil.restore();
      expect(SharedService.user.buyoutLimit).toEqual(300);
    });
  });

  describe('slugification of realm', () => {
    it('realm with spaces', () => {
      expect(UserUtil.slugifyString(`Emerald dream`)).toEqual('emerald-dream');
    });


    it('realm with only one word', () => {
      expect(UserUtil.slugifyString(`Draenor`)).toEqual('draenor');
    });


    it('realm with single quotes', () => {
      expect(UserUtil.slugifyString(`Ember'ahlo`)).toEqual('emberahlo');
    });


    it('realm with spaces and single quote', () => {
      expect(UserUtil.slugifyString(`Emera'ld dream`)).toEqual('emerald-dream');
    });
  });
});
