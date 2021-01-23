import {DatabaseUtil} from './database.util';

describe('DatabaseUtil', () => {
  it('Can query', async () => {
    const conn = new DatabaseUtil();
    const result = await conn.query('SHOW TABLES;');
    expect(result).toBe('123');
  });
});
