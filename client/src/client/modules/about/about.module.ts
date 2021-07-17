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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {RouterModule} from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
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
