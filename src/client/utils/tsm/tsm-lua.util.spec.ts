import * as lua from 'luaparse';
import {TsmLuaUtil} from './tsm-lua.util';

fdescribe('TSMLuaUtil', () => {
  it('getCharacterDataForField', () => {
    const data = new TsmLuaUtil().processLuaData(
      `TradeSkillMasterDB = {
      ["s@HordieChar - Horde - Server@internalData@bagQuantity"] = {
      ["i:155838"] = 113
      },
      ["s@AllyChar - Alliance - Server@internalData@bagQuantity"] = {
        ["i:6948"] = 1,
        ["i:160298"] = 4,
        ["i:157022"] = 1,
      }}`);
    console.log('TSMLuaUtil.spec.getCharacterDataForField', data);
    expect(data['bagQuantity']['Server']['HordieChar'][155838].faction).toBe(1);
    expect(data['bagQuantity']['Server']['HordieChar'][155838].value).toBe(113);
    expect(data['bagQuantity']['Server']['AllyChar'][6948].faction).toBe(0);
    expect(data['bagQuantity']['Server']['AllyChar'][6948].value).toBe(1);
  });
});
