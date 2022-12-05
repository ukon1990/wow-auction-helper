import {NoSQLQueryUtil, RDSQueryUtil} from './query.util';

class TestModel {
  constructor(
    public id: number,
    public name: string,
    public isTrue: boolean,
    public list: any[],
    public date: any) {
  }
}

describe('RDSQueryUtil', () => {
  const util = new RDSQueryUtil<TestModel>('test_table');
  describe('insert', () => {
    it('default', () => {
      const obj = new TestModel(
        0,
        'Testing',
        false,
        ['Stuff', 'is', 'good'],
        new Date()
      );
      expect(util.insert(obj))
        .toBe(
          'INSERT INTO test_table(id,name,isTrue,list,date,timestamp) ' +
          'VALUES(0,\'Testing\',0,\'[\\\"Stuff\\\",\\\"is\\\",\\\"good\\\"]\',' + +obj.date + ',CURRENT_TIMESTAMP);'
        );
    });

    it('insert with true bool', () => {
      const obj = new TestModel(
        0,
        'Testing',
        true,
        ['Stuff', 'is', 'good'],
        new Date()
      );
      expect(util.insert(obj))
        .toBe('INSERT INTO test_table(id,name,isTrue,list,date,timestamp) ' +
          `VALUES(0,'Testing',1,'[\\\"Stuff\\\",\\\"is\\\",\\\"good\\\"]',${+obj.date},CURRENT_TIMESTAMP);`);
    });

    it('insert with undefined', () => {
      const obj = new TestModel(
        0,
        'Testing',
        true,
        ['Stuff', 'is', 'good'],
        null
      );
      expect(util.insert(obj))
        .toBe('INSERT INTO test_table(id,name,isTrue,list,date,timestamp) ' +
          `VALUES(0,'Testing',1,'[\\\"Stuff\\\",\\\"is\\\",\\\"good\\\"]',NULL,CURRENT_TIMESTAMP);`);
    });

    it('insert with object', () => {
      const obj = new TestModel(
        0,
        'Testing',
        true,
        ['Stuff', 'is', 'good'],
        {name: 'test'}
      );
      expect(util.insert(obj))
        .toBe('INSERT INTO test_table(id,name,isTrue,list,date,timestamp) ' +
          `VALUES(0,'Testing',1,'[\\\"Stuff\\\",\\\"is\\\",\\\"good\\\"]','{\\\"name\\\":\\\"test\\\"}',CURRENT_TIMESTAMP);`);
    });

    it('Can handle string arrays and date', () => {
      const list = [
        {
          ahId: 111,
          bonusIds: '1698,6652',
          ahTypeId: 0,
          petSpeciesId: -1,
          itemId: 199023,
          date: '2022-12-4',
          quantity17: 1,
          price17: 700000
        }
      ];
      const rdsUtil = new RDSQueryUtil('itemPriceHistoryPerHour');
      expect(rdsUtil.multiInsert(list)).toBe(
        'INSERT INTO itemPriceHistoryPerHour' +
        '(ahId,bonusIds,ahTypeId,petSpeciesId,itemId,date,quantity17,price17) ' +
        `VALUES(111,'1698,6652',0,-1,199023,'2022-12-4',1,700000);`
      );
    });
  });

  describe('update', () => {
    it('update', () => {
      const obj = new TestModel(
        0,
        'Testing',
        false,
        ['Stuff', 'is', 'good'],
        new Date()
      );
      expect(util.update(obj.id, obj))
        .toBe('UPDATE test_table ' +
          'SET id = 0,' +
          'name = \'Testing\',' +
          'isTrue = 0,' +
          'list = \'[\\\"Stuff\\\",\\\"is\\\",\\\"good\\\"]\',' +
          'date = ' + +obj.date + ',' +
          'timestamp = CURRENT_TIMESTAMP ' +
          'WHERE id = 0;');
    });
  });
});

describe('NoSQLQueryUtil', () => {
  describe('update', () => {
    it('does not include id', () => {
      const obj = {
        id: 1,
        name: 'example'
      };
      const params = NoSQLQueryUtil.update('test', obj, true);
      expect(params.UpdateExpression)
        .toBe('set lastModified = :lastModified, name = :name');
      expect(params.ExpressionAttributeValues[':name'])
        .toBe(obj.name);
    });
  });
});