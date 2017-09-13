/**
 * This test is created for testing the functions in a isolated manner.
 * To see if it works in a "clean" environment.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { AppModule } from '../../app.module';

import { CraftingComponent } from './crafting.component';
import { calcCost, user, lists, getPet, db } from '../../utils/globals';
import { testObjects } from '../../utils/testdata';


// TODO: DO them tests!
describe('CraftingComponent', () => {
	let component: CraftingComponent;
	let fixture: ComponentFixture<CraftingComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				AppModule
			],
			providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CraftingComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('should be able to calculate', () => {
		const recipe = {cost: 0};
		// component.calculateCosts(recipe);
		expect(recipe.cost).toEqual(5000);
	});
});
