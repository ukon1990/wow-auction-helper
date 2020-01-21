import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../service/auth.service';
import {UserService} from '../../service/user.service';

@Component({
  selector: 'wah-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private userService: UserService) {
  }

  ngOnInit() {
  }

  login(): void {
    this.authService.authRequest();
  }

  getUserInfo(): void {
    this.userService.getUserInfo()
      .catch(console.error);
  }
}
