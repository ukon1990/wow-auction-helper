import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ConfigureMfaComponent } from './components/mfa/configure-mfa/configure-mfa.component';
import {MatDialogModule} from '@angular/material/dialog';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import {UtilModule} from '../util/util.module';
import { RegistrationConfirmationComponent } from './components/register/registration-confirmation/registration-confirmation.component';


@NgModule({
  declarations: [
    LoginComponent,
    ConfigureMfaComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    RegistrationConfirmationComponent
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
    UtilModule
  ],
  exports: [
    LoginComponent
  ],
  providers: [
    AuthService,
  ]
})
export class UserModule {
}
