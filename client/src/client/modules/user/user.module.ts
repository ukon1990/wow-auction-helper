import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ConfigureMfaComponent } from './components/mfa/configure-mfa/configure-mfa.component';
import {MatDialogModule} from '@angular/material/dialog';
import { RegisterComponent } from './components/register/register.component';
import {UtilModule} from '../util/util.module';
import { RegistrationConfirmationComponent } from './components/register/registration-confirmation/registration-confirmation.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ShowProfileComponent } from './components/profile/show-profile.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ForgotPasswordComponent} from './components/login/forgot-password/forgot-password.component';


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
    FontAwesomeModule
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
