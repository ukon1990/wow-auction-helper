import { db, lists } from './globals';
import { ItemService } from '../services/item';
export default class Pets {
		public static download(itemService: ItemService): Promise<any> {
		console.log('pets');
		return itemService.getPets()
			.then(p => {
				lists.isDownloading = false;
				this.buildPetArray(p);
			}, error => {
				// this.downloadingText = '';
				console.log('Unable to download pets:', error);
				lists.isDownloading = false;
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
		return lists.pets[speciesId];
	}

	private static buildPetArray(pets) {
		const list = [];
		pets.forEach(p => {
			list[p.speciesId] = p;
		});
		lists.pets = list;
	}
}
