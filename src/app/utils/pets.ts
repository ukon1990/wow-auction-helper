import { lists } from './globals';
import { ItemService } from '../services/item.service';

export default class Pets {
		public static download(itemService: ItemService): Promise<any> {
		console.log('pets');
		return itemService.getPets()
			.then(p => {
				lists.isDownloading = false;
				this.buildPetArray(p);
			}).catch(error => {
				console.error('Failed at downloading pets', error);
			});

		/*
		return db.table('pets').toArray().then(pets => {
			if (pets.length > 0) {
				this.buildPetArray(pets);
				// this.downloadItems();
			} else {
				// downloadingText = 'Downloading pets';
				lists.isDownloading = true;

			}
		});*/
	}

	public static getPet(speciesId: number): any {
		if (lists.pets[speciesId]) {
			return lists.pets[speciesId];
		}
		return {name: 'Unknown pet'};
	}

	private static buildPetArray(pets) {
		const list = [];
		pets.forEach(p => {
			list[p.speciesId] = p;
		});
		lists.pets = list;
	}
}
