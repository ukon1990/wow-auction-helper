import {WoWHeadUtil} from './wowhead.util';
import {WoWHead} from '../models/item/wowhead';

describe('WoWHeadUtil', () => {
  describe('setValuesAll', () => {
    let blackrockOre: WoWHead;
    let amberblaze: WoWHead;
    let viridescentPigment: WoWHead;

    beforeAll(async () => {
      jest.setTimeout(10000);
      blackrockOre = await WoWHeadUtil.getWowHeadData(109118);
      amberblaze = await WoWHeadUtil.getWowHeadData(154123);
      viridescentPigment = await WoWHeadUtil.getWowHeadData(153669);
      jest.setTimeout(50000);
    });

    it('getExpansion', async () => {
      expect(blackrockOre.expansionId).toBe(5);
      expect(blackrockOre.patch).toBe('6.0.1.18125');
    });

    it('getDroppedBy', async () => {
      expect(blackrockOre.droppedBy.length).toBeTruthy();
      expect(amberblaze.droppedBy.length).toBeFalsy();
    });

    it('containedInObject', async () => {
      expect(blackrockOre.containedInObject.length).toBeTruthy();
    });

    it('containedInItem', async () => {
      expect(blackrockOre.containedInItem.length).toBeTruthy();
    });

    it('currencyFor', async () => {
      expect(blackrockOre.currencyFor.length).toBeTruthy();
    });

    it('soldBy', async () => {
      expect(blackrockOre.soldBy.length).toBeTruthy();
    });

    it('milledFrom', async () => {
      expect(viridescentPigment.milledFrom.length).toBeTruthy();
    });

    it('prospectedFrom', async () => {
      expect(amberblaze.prospectedFrom.length).toBeTruthy();
    });

    it('Empty if not found in body or non accepted js found', () => {
      expect(WoWHeadUtil.setValuesAll('').milledFrom).toEqual([]);
      expect(WoWHeadUtil.setValuesAll(`
      new Listview({
        template: 'item',
        id: 'prospected-from',
        name: LANG.tab_prospectedfrom,
        tabs: 'tabsRelated',
        parent: 'lkljbjkb574',
        extraCols: [Listview.extraCols.count, Listview.extraCols.percent],
        sort:['-percent', 'name'],
        computeDataFunc: Listview.funcBox.initLootTable,
              data: [{dfgjhk],
      });`).milledFrom).toEqual([]);
    });
  });
});
