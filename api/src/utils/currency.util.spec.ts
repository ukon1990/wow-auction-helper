import {CurrencyUtil} from './currency.util';

describe('CurrencyUtil', () => {
  it('getList', async () => {
    const list = await CurrencyUtil.getList();
    console.log(list);
    expect(list.length).toBe(122);
  });
});
