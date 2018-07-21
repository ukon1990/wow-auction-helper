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
        cpArr.push(cp);
        cpArr.push(cp);
        expect(cp instanceof CustomPrice).toBeTruthy();
        expect(oldCP instanceof CustomPrice).toBeFalsy();
        expect(cpArr instanceof Array).toBeTruthy();
        expect(oldCP instanceof Array).toBeFalsy();
        const newOne = CustomPrices.convertFromOldVersion(oldCP);
        expect(newOne[0].itemID).toBe(115524);
        expect(newOne[0].price).toBe(200000);
    });
});
