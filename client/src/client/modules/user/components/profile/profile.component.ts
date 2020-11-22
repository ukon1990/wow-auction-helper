import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'wah-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: CognitoUser;
  form: FormGroup = new FormGroup({
    username: new FormControl({value: null, disabled: true}),
    email: new FormControl({value: null, disabled: true}, [Validators.email]),
    confirmEmail: new FormControl(null, [Validators.email]),
  });

  constructor(private service: AuthService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<ProfileComponent>) {
    this.user = this.service.user.value;
    this.form.setValue({
      username: this.user.getUsername(),
      email: this.user['attributes'].email,
      confirmEmail: null,
    });
  }

  ngOnInit(): void {
    console.log('User', this.user);
  }

  logout(): void {
    this.service.logOut()
      .then(() => {
        this.service.openLoginComponent.emit(true);
        this.dialogRef.close();
      })
      .catch(console.error );
  }

  close() {
    this.dialogRef.close();
  }
}
