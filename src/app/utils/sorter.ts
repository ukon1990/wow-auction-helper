export class Sorter {
	keys: Key[] = [];

	addKey(key: string, descending?: boolean): void {
		if (this.findKeyIndex(key) > -1) {
			this.keys[this.findKeyIndex(key)].desc = !this.keys[this.findKeyIndex(key)].desc;
		} else {
			this.keys = [];
			this.keys.push(new Key(key, descending));
		}
	}

	sort(arr: any[]): void {
		arr.sort( (a, b) => {
			for (let i = this.keys.length - 1; i >= 0; i--) {
				if (a[this.keys[i].key] === b[this.keys[i].key]) {
					continue;
				}

				if (this.keys[i].desc) {
					if (this.isString(a, i)) {
						return b[this.keys[i].key].localeCompare(a[this.keys[i].key]);
					} else {
						return a[this.keys[i].key] < b[this.keys[i].key] ? 1 : -1;
					}
				} else {
					if (this.isString(a, i)) {
						return a[this.keys[i].key].localeCompare(b[this.keys[i].key]);
					} else {
						return a[this.keys[i].key] > b[this.keys[i].key] ? 1 : -1;
					}
				}
			}
			return 0;
		});
	}

	private isString(object: Object, index): boolean {
		return typeof object[this.keys[index].key] === 'string';
	}

	removeKey(key: string): void {
		// Logic
	}

	findKeyIndex(key: string): number {
		this.keys.forEach( (k, i) => {
			if (key === k.key) {
				return i;
			}
		});
		return -1;
	}
}

class Key {
	constructor(public key: string, public desc?: boolean) {
		if (!desc) {
			desc = true;
		}
	}
}
