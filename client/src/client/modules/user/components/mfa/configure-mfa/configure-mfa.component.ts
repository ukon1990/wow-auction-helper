import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'wah-configure-mfa',
  templateUrl: './configure-mfa.component.html'
})
export class ConfigureMfaComponent implements OnInit {
  userHasMFA: boolean;
  url: string;
  verificationCode = new FormControl(null, [Validators.minLength(6)]);
  status: string;
  isLoading: boolean;

  constructor(private service: AuthService) {
  }

  ngOnInit(): void {
    this.status = 'Checking for MFA';
    this.checkForMFA();
  }

  checkForMFA() {
    this.isLoading = true;
    this.service.checkIfUserHasMFAS()
      .then(hasMFA => {
        this.status = '';
        this.isLoading = false;
        this.userHasMFA = hasMFA;
      })
      .catch(error => {
        this.isLoading = false;
        console.error(error);
      });
  }

  getQRCode() {
    this.isLoading = true;
    this.status = 'Fetching QR code';
    this.service.getMFAQRCodeForUser()
      .then(url => {
        this.status = '';
        this.isLoading = false;
        this.url = url;
      })
      .catch(error => {
        this.isLoading = false;
        console.error(error);
      });
  } //

  addMFA() {
    this.isLoading = true;
    this.status = 'Adding Multi-factor authentication';
    const code = this.verificationCode.value;
    this.service.setMFAForUser(code)
      .then(() => {
        this.isLoading = false;
        this.status = 'Successfully added Multi-factor authentication.';
      })
      .catch(console.error);
  }
}
