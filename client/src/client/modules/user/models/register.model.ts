import {Login} from './login.model';

export interface Register extends Login {
  username: string;
  email: string;
  confirmPassword: string;
}
