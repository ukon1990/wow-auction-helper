import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AboutComponent} from './components/about.component';
import {TechnologyComponent} from './components/technology.component';
import {NewsComponent} from './components/news/news.component';
import {IssuesComponent} from './components/issues/issues.component';
import {ContributorsComponent} from './components/contributors/contributors.component';
import {ChangelogComponent} from './components/changelog/changelog.component';
import {AboutWhatIsComponent} from './components/about-what-is/about-what-is.component';
import {AboutPrivacyComponent} from './components/about-privacy/about-privacy.component';
import {AboutDataComponent} from './components/about-data/about-data.component';
import {AboutCraftingComponent} from './components/about-crafting/about-crafting.component';
import {GithubService} from './services/github.service';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import {RouterModule} from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {UtilModule} from '../util/util.module';

@NgModule({
  declarations: [
    AboutComponent,
    TechnologyComponent,
    NewsComponent,
    IssuesComponent,
    ContributorsComponent,
    ChangelogComponent,
    AboutWhatIsComponent,
    AboutPrivacyComponent,
    AboutDataComponent,
    AboutCraftingComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatExpansionModule,
    MatChipsModule,
    MatListModule,
    MatCheckboxModule,
    FontAwesomeModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    UtilModule
  ],
  exports: [
    AboutWhatIsComponent,
    AboutPrivacyComponent,
    NewsComponent,
    ChangelogComponent
  ],
  providers: [GithubService]
})
export class AboutModule {
}
