import { async, TestBed } from '@angular/core/testing';
import { Sorter } from './sorter';

let sorter: Sorter,
	arr = [];

beforeEach(() => {
	sorter = new Sorter();
	arr = [
		{id: 1, name: 'Arch'},
		{id: 2, name: 'Aisha'},
		{id: 3, name: 'Yoghurt'},
		{id: 4, name: 'Banana'},
		{id: 5, name: 'Jonas'},
		{id: 6, name: 'Mint'}
	];
});

describe('sort', () => {
	it('should sort strings descending', () => {
		sorter.addKey('name');
		sorter.sort(arr);

		expect(arr).toBe([
			{id: 1, name: 'Arch'},
			{id: 2, name: 'Aisha'},
			{id: 3, name: 'Yoghurt'},
			{id: 4, name: 'Banana'},
			{id: 5, name: 'Jonas'},
			{id: 6, name: 'Mint'}
		]);
	});
});
