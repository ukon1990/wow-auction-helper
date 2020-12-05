import {Component, OnDestroy} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ValidatorsUtil} from '../../utils/validators.util';
import {HttpErrorResponse} from '@angular/common/http';
import {RegistrationConfirmationComponent} from './registration-confirmation/registration-confirmation.component';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Report} from '../../../../utils/report.util';
import {ErrorReport} from '../../../../utils/error-report.util';

@Component({
  selector: 'wah-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnDestroy {
  error: HttpErrorResponse;
  registerForm: FormGroup = new FormGroup({
    username: new FormControl(null, [Validators.minLength(3)]),
    email: new FormControl(null, [Validators.minLength(3), Validators.email, Validators.required]),
    password: new FormControl(null, [ValidatorsUtil.password, Validators.required]),
    confirmPassword: new FormControl(null,
      [(control) => ValidatorsUtil.confirmPassword(control, this.registerForm), Validators.required]),
  });
  sm = new SubscriptionManager();

  constructor(private service: AuthService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<RegisterComponent>) {
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  register(resend = false) {
    this.error = undefined;
    this.registerForm.disable();
    this.service.signUp(this.registerForm.getRawValue())
      .then(response => {
        console.log(response);
        const registrationDialog = this.dialog.open(RegistrationConfirmationComponent, {
          data: {
            ...this.registerForm.getRawValue(),
            resend,
          }
        });

        this.sm.add(registrationDialog.afterClosed(), result => {
          if (result && result.success) {
            const {username, email, password} = this.registerForm.getRawValue();
            Report.send('Successfully registered a new user', 'RegisterComponent');
            this.dialogRef.close({
              username: username || email,
              password,
            });
          }
          this.registerForm.enable();
          this.sm.unsubscribe();
        });
      })
      .catch(error => {
        ErrorReport.sendError('RegisterComponent.register', error);
        console.error(error);
        this.error = error;
        this.registerForm.enable();
      });
  }

  close() {
    this.dialogRef.close();
  }
}
