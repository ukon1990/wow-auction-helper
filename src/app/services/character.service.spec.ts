import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { CharacterService } from './character.service';

describe('CharacterService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule],
			providers: [CharacterService]
		});
	});

	it('should ...', inject([CharacterService], (service: CharacterService) => {
		expect(service).toBeTruthy();
	}));
});
