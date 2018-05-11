import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
    MatButtonModule, MatCheckboxModule,
    MatProgressBarModule, MatInputModule,
    MatAutocompleteModule, MatToolbarModule,
    MatListModule, MatTabsModule,
    MatSidenavModule, MatPaginatorModule,
    MatSortModule, MatTableModule,
    MatCardModule, MatProgressSpinnerModule,
    MatSelectModule, MatStepperModule,
    MatExpansionModule, MatTooltipModule,
    MatSlideToggleModule
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
        MatSelectModule,
        MatStepperModule,
        MatExpansionModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatSnackBarModule
    ],
    imports: [
    ],
    declarations: []
})
export class MaterialModule { }
