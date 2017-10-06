import { async, TestBed } from '@angular/core/testing';
import { Item } from './item';
import { lists, getIcon } from './globals';

lists.items[1234] = {icon: '1234_icon'};
lists.pets[99] = {icon: 'icon_pet'};

describe('getIcon', () => {
	it('auction item', () => {
		expect(
			Item.getIcon({item: 1234})
		).toBe('https://render-eu.worldofwarcraft.com/icons/56/1234_icon.jpg');
	});

	it('pet item', () => {
		expect(
			Item.getIcon({item: 1234, petSpeciesId: 99})
		).toBe('https://render-eu.worldofwarcraft.com/icons/56/icon_pet.jpg');
	});

	it('Crafting item', () => {
		expect(
			Item.getIcon({itemID: 1234})
		).toBe('https://render-eu.worldofwarcraft.com/icons/56/1234_icon.jpg');
	});

	it('Disenchatning item', () => {
		expect(
			Item.getIcon({id: 1234})
		).toBe('https://render-eu.worldofwarcraft.com/icons/56/1234_icon.jpg');
	});
});
