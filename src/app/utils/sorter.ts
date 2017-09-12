export class Sorter {
	keys: Key[] = [];

	addKey(key: string): void {
		this.keys[0] = new Key(key);
	}

	sort(arr: any[]): void {
		arr.sort( (a, b) => {
			for (let i = this.keys.length - 1; i >= 0; i--) {
				if (a[this.keys[i].key] === b[this.keys[i].key]) {
					continue;
				} else if (this.keys[i].desc) {
					// Logic
				} else {
					// Logic
				}
			}
			return 0;
		});
	}

	removeKey(key: string): void {
		// Logic
	}

	findKeyIndex(key: string): number {
		return 1;
	}
}

class Key {
	constructor(public key: string, public desc?: boolean) {
		if (!desc) {
			desc = true;
		}
	}
}
