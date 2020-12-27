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
        .toBe('INSERT INTO test_table(id,name,isTrue,list,date,timestamp) ' +
          'VALUES(0,\"Testing\",0,\"[\\\"Stuff\\\",\\\"is\\\",\\\"good\\\"]\",' + +obj.date + ',CURRENT_TIMESTAMP);');
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
          'VALUES(0,\"Testing\",1,\"[\\\"Stuff\\\",\\\"is\\\",\\\"good\\\"]\",' + +obj.date + ',CURRENT_TIMESTAMP);');
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
          'VALUES(0,\"Testing\",1,\"[\\\"Stuff\\\",\\\"is\\\",\\\"good\\\"]\",null,CURRENT_TIMESTAMP);');
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
          'VALUES(0,\"Testing\",1,\"[\\\"Stuff\\\",\\\"is\\\",\\\"good\\\"]\",\"{\\\"name\\\":\\\"test\\\"}\",CURRENT_TIMESTAMP);');
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
          'name = "Testing",' +
          'isTrue = 0,' +
          'list = \"[\\\"Stuff\\\",\\\"is\\\",\\\"good\\\"]\",' +
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
