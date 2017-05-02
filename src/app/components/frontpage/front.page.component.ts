import { Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { user, lists } from '../../utils/globals';
import { RealmService } from '../../services/realm';
import { CharacterService } from '../../services/character.service';
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'app-selector',
	templateUrl: 'front.page.component.html',
	providers: [RealmService]
})
export class FrontPageComponent implements OnInit {
	u;
	realmListEu = [];
	realmListUs = [];
	userCrafterForm: FormGroup;
	userCrafter: string;

	constructor( private formBuilder: FormBuilder, private router: Router,
			private titleService: Title, private rs: RealmService, private characterService: CharacterService) {
		this.u = user;
		this.userCrafterForm = formBuilder.group({
			'query': ''
		});
		this.titleService.setTitle('Wah - Setup');
	}

	ngOnInit(): void {
		this.rs.getRealms().subscribe(
			r => {
				this.realmListEu = r.region.eu;
				this.realmListUs = r.region.us;
			});
		if (localStorage.getItem('realm') !== null && localStorage.getItem('region') !== null) {
			this.router.navigateByUrl('/crafting');
		}
	}

	getRealms() {
		if (this.u.region === 'us') {
			return this.realmListUs['realms'] || [];
		} else {
			return this.realmListEu['realms'] || [];
		}
	}

	nextPage() {
		localStorage.setItem('region', this.u.region);
		localStorage.setItem('realm', this.u.realm);
		localStorage.setItem('character', this.u.character);
		localStorage.setItem('api_tsm', this.u.apiTsm);
		localStorage.setItem('api_wowuction', this.u.apiWoWu);
		if (this.u.apiTsm.length > 0) {
			localStorage.setItem('api_to_use', 'tsm');
		} else if (this.u.apiWoWu.length > 0) {
			localStorage.setItem('api_to_use', 'wowuction');
		} else {
			localStorage.setItem('api_to_use', 'none');
		}
		this.router.navigateByUrl('/crafting');
		location.reload();
	}

	getRealmValue(realm): void {
		this.u.realm = realm;
		console.log('realm: ' + realm);
	}

		addCrafter() {
			this.u.crafters.push(this.userCrafterForm.value['query']);
			this.userCrafterForm.value['query'] = '';
		}

		removeCrafter(index: number) {
			this.u.crafters.splice(index, 1);
		}

		getMyRecipeCount(): number {
			return lists.myRecipes.length;
		}

		getCraftersRecipes(): void {
			if (this.u.crafters.length > 0) {
				this.characterService.getCharacters().subscribe(recipes => {
					if (typeof recipes.recipes === 'object') {
						Object.keys(recipes.recipes).forEach(v => {
							lists.myRecipes.push(recipes.recipes[v]);
						});
					} else {
						lists.myRecipes = recipes.recipes;
					}
					localStorage.setItem('crafters_recipes', lists.myRecipes.toString());
				});
			}
		}
}
