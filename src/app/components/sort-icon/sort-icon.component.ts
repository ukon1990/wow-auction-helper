import { Component, Input } from '@angular/core';
import { Key } from '../../utils/sorter';

@Component({
	selector: 'app-sort-icon',
	templateUrl: './sort-icon.component.html'
})
export class SortIconComponent {
	@Input() key: Key;
}
