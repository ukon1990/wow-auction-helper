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
    MatSlideToggleModule, MatChipsModule
} from '@angular/material';
import {ScrollDispatchModule} from '@angular/cdk/scrolling';
import {DragDropModule} from '@angular/cdk/drag-drop';

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
        MatSnackBarModule,
        MatChipsModule,
        DragDropModule,
        ScrollDispatchModule
    ],
    imports: [
    ],
    declarations: []
})
export class MaterialModule { }
