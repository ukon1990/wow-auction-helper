import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
	MatButtonModule, MatCheckboxModule,
	MatProgressBarModule, MatInputModule,
	MatAutocompleteModule, MatToolbarModule,
	MatListModule, MatTabsModule,
	MatSidenavModule, MatPaginatorModule,
	MatSortModule, MatTableModule,
	MatCardModule, MatProgressSpinnerModule,
	MatSelectModule
} from '@angular/material';

@NgModule({
	exports: [
		CommonModule,
		BrowserAnimationsModule,
		MatButtonModule,
		MatCheckboxModule,
		MatProgressBarModule,
		MatInputModule,
		MatAutocompleteModule,
		MatToolbarModule,
		MatListModule,
		MatTabsModule,
		MatSidenavModule,
		MatPaginatorModule,
		MatSortModule,
		MatTableModule,
		MatCardModule,
		MatProgressSpinnerModule,
		MatSelectModule
	],
	imports: [
	],
	declarations: []
})
export class MaterialModule { }
