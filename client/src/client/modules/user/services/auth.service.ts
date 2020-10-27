import { Injectable } from '@angular/core';
import { Auth } from '@aws-amplify/auth';
import {COGNITO} from '../../../secrets';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {
    Auth.configure({
      userPoolId: COGNITO.POOL_ID,
      userPoolWebClientId: COGNITO.CLIENT_ID
    });
  }
}
