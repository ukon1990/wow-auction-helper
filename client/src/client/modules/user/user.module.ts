import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService} from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';


@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
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
