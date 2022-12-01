import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyPaginatorModule as MatPaginatorModule} from '@angular/material/legacy-paginator';
import {MatLegacyProgressBarModule as MatProgressBarModule} from '@angular/material/legacy-progress-bar';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatLegacySlideToggleModule as MatSlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {MatSortModule} from '@angular/material/sort';
import {MatStepperModule} from '@angular/material/stepper';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatSnackBarModule} from '@angular/material/snack-bar';

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
        MatChipsModule,
        DragDropModule,
        ScrollingModule,
        MatSnackBarModule,
    ],
    imports: [
    ],
    declarations: []
})
export class MaterialModule { }