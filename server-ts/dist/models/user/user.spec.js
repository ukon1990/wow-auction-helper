"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("./user");
const shared_service_1 = require("../../services/shared.service");
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
            user_1.User.import(JSON.stringify({
                realm: 'test-realm',
                region: 'us',
                buyoutLimit: 300
            }));
            expect(localStorage['crafting_buyout_limit']).toEqual('300');
            expect(shared_service_1.SharedService.user.buyoutLimit).toEqual(300);
        });
    });
    describe('restore', () => {
        it('Should accept work only if just region and realm are set', () => {
            localStorage['realm'] = 'test-realm';
            localStorage['region'] = 'eu';
            user_1.User.restore();
            expect(shared_service_1.SharedService.user.realm).toEqual('test-realm');
            expect(shared_service_1.SharedService.user.region).toEqual('eu');
        });
        it('Has default values', () => {
            user_1.User.restore();
            expect(shared_service_1.SharedService.user.buyoutLimit).toEqual(200);
        });
        it('Can override default values', () => {
            localStorage['crafting_buyout_limit'] = '300';
            user_1.User.restore();
            expect(shared_service_1.SharedService.user.buyoutLimit).toEqual(300);
        });
    });
    describe('slugification of realm', () => {
        it('realm with spaces', () => {
            expect(user_1.User.slugifyString(`Emerald dream`)).toEqual('emerald-dream');
        });
        it('realm with only one word', () => {
            expect(user_1.User.slugifyString(`Draenor`)).toEqual('draenor');
        });
        it('realm with single quotes', () => {
            expect(user_1.User.slugifyString(`Ember'ahlo`)).toEqual('emberahlo');
        });
        it('realm with spaces and single quote', () => {
            expect(user_1.User.slugifyString(`Emera'ld dream`)).toEqual('emerald-dream');
        });
    });
});
//# sourceMappingURL=user.spec.js.map