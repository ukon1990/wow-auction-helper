import {Component, Inject} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'wah-registration-confirmation',
  templateUrl: './registration-confirmation.component.html'
})
export class RegistrationConfirmationComponent {
  error: HttpErrorResponse;
  confirmationCodeError: string;
  signupConfirmation = new FormGroup({
    user: new FormControl(),
    code: new FormControl(),
  });
  destination: string;

  constructor(private service: AuthService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<RegistrationConfirmationComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    const {username, email, resend} = data;
    this.signupConfirmation.controls.user.setValue(username || email);

    if (resend) {
      this.resendConfirmationCode(data);
    }
  }

  confirmRegistration() {
    this.confirmationCodeError = undefined;
    const {code, user} = this.signupConfirmation.getRawValue();
    this.service.userConfirmation(
      user,
      code)
      .then(() => {
        this.dialogRef.close({
          success: true,
        });
      })
      .catch(error => {
        console.error(error);
        this.error = error;
        this.signupConfirmation.enable();
        this.confirmationCodeError = 'Invalid confirmation code';
      });
  }


    resendConfirmationCode(data = this.data) {
    this.destination = undefined;
    const {username, email} = data;
    this.error = undefined;
    this.service.resendConfirmationCode(username || email)
      .then(response => {
        this.destination = response.Destination;
        console.log(response);
      })
      .catch(error => {
        console.error(error);
        this.error = error;
      });
  }

  close() {
    this.dialogRef.close();
  }
}
