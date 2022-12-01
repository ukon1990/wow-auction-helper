import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from './services/auth.service';
import {LoginComponent} from './components/login/login.component';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {ConfigureMfaComponent} from './components/mfa/configure-mfa/configure-mfa.component';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {RegisterComponent} from './components/register/register.component';
import {UtilModule} from '../util/util.module';
import {
  RegistrationConfirmationComponent
} from './components/register/registration-confirmation/registration-confirmation.component';
import {ProfileComponent} from './components/profile/profile.component';
import {ShowProfileComponent} from './components/profile/show-profile.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ForgotPasswordComponent} from './components/login/forgot-password/forgot-password.component';
import {MatLegacyCheckboxModule as MatCheckboxModule} from "@angular/material/legacy-checkbox";


@NgModule({
  declarations: [
    LoginComponent,
    ConfigureMfaComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    RegistrationConfirmationComponent,
    ProfileComponent,
    ShowProfileComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatTooltipModule,
    MatDialogModule,
    UtilModule,
    FontAwesomeModule,
    MatCheckboxModule
  ],
  exports: [
    LoginComponent,
    ShowProfileComponent
  ],
  providers: [
    AuthService,
  ]
})
export class UserModule {
}