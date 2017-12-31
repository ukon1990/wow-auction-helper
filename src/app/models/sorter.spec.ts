import { async, TestBed } from '@angular/core/testing';
import { Sorter } from './sorter';

let sorter: Sorter,
  arr = [];

beforeEach(() => {
  sorter = new Sorter();
  arr = [
    { id: 1, name: 'Arch' },
    { id: 2, name: 'Aisha' },
    { id: 3, name: 'Yoghurt' },
    { id: 4, name: 'Banana' },
    { id: 5, name: 'Jonas' },
    { id: 6, name: 'Mint' }
  ];
});

describe('sort', () => {
  it('should sort strings ascending', () => {
    sorter.addKey('name');
    sorter.addKey('name');
    sorter.sort(arr);

    expect(arr).toEqual([
      { id: 2, name: 'Aisha' },
      { id: 1, name: 'Arch' },
      { id: 4, name: 'Banana' },
      { id: 5, name: 'Jonas' },
      { id: 6, name: 'Mint' },
      { id: 3, name: 'Yoghurt' }
    ]);
  });

  it('should sort strings descending', () => {
    sorter.addKey('name');
    sorter.sort(arr);

    expect(arr).toEqual([
      { id: 3, name: 'Yoghurt' },
      { id: 6, name: 'Mint' },
      { id: 5, name: 'Jonas' },
      { id: 4, name: 'Banana' },
      { id: 1, name: 'Arch' },
      { id: 2, name: 'Aisha' }
    ]);
  });

  it('should sort numbers ascending', () => {
    sorter.addKey('id');
    sorter.addKey('id');
    sorter.sort(arr);

    expect(arr).toEqual([
      { id: 1, name: 'Arch' },
      { id: 2, name: 'Aisha' },
      { id: 3, name: 'Yoghurt' },
      { id: 4, name: 'Banana' },
      { id: 5, name: 'Jonas' },
      { id: 6, name: 'Mint' }
    ]);
  });

  it('should sort numbers descending', () => {
    sorter.addKey('id');
    sorter.sort(arr);

    expect(arr).toEqual([
      { id: 6, name: 'Mint' },
      { id: 5, name: 'Jonas' },
      { id: 4, name: 'Banana' },
      { id: 3, name: 'Yoghurt' },
      { id: 2, name: 'Aisha' },
      { id: 1, name: 'Arch' }
    ]);
  });
});
