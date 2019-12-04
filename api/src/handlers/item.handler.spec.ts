import {environment} from '../../../client/src/environments/environment';
import {ItemHandler} from './item.handler';
import {Item} from '../models/item/item';

describe('ItemHandler', () => {
  let originalEnvironment;
  beforeAll(() => {
    originalEnvironment = environment.test;
    environment.test = true;
  });
  afterAll(() => {
    environment.test = originalEnvironment;
  });

  it('', () => {
    expect(1).toBe(1);
  });
});
