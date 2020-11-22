import {Component, Inject, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ValidatorsUtil} from '../../../utils/validators.util';

@Component({
  selector: 'wah-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  error: HttpErrorResponse;
  forgotForm: FormGroup = new FormGroup({
    username: new FormControl(null, [Validators.minLength(3)]),
    code: new FormControl(null, [Validators.minLength(3), Validators.required]),
    password: new FormControl(null, [ValidatorsUtil.password, Validators.required]),
    confirmPassword: new FormControl(null,
      [(control) => ValidatorsUtil.confirmPassword(control, this.forgotForm), Validators.required]),
  });

  constructor(private service: AuthService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<ForgotPasswordComponent>,
              @Inject(MAT_DIALOG_DATA) public username: any) {
    if (username) {
      this.forgotForm.controls.username.setValue(username);
      this.forgotPassword(username);
    }
  }

  forgotPassword(username = this.forgotForm.getRawValue().username) {
    this.service.forgotPassword(username)
      .then(() => {
      })
      .catch(error => {
        this.error = error;
      });
  }

  verifyForgotPassword() {
    this.error = undefined;
    this.forgotForm.disable();
    const {username, password, code} = this.forgotForm.getRawValue();
    this.service.verifyForgotPassword({username, password, code} )
      .then(() => {
        this.forgotForm.enable();
        this.dialogRef.close({
          username,
          password
        });
      })
      .catch(error => {
        this.error = error;
        this.forgotForm.enable();
      });
  }

  close() {
    this.dialogRef.close();
  }
}
