import { async, TestBed } from '@angular/core/testing';
import { SharedService } from '../../services/shared.service';
import { User } from '../user/user';
import { CustomPrices, CustomPrice } from './custom-price';

beforeEach(() => {
    User.restore();
});

describe('CustomPrices', () => {
    it('Should be able to convert the old version to the new one', () => {
        const cp = new CustomPrice();
        const cpArr = new Array<CustomPrice>();
        const oldCP = { '115524': 200000, '120945': 500000, '124124': 3000000, '151568': 3000000 };
        cpArr.push(cp);
        expect(cp instanceof CustomPrice).toBeTruthy();
        expect(oldCP instanceof CustomPrice).toBeFalsy();
        // CustomPrices.convertFromOldVersion();
    });
});
