export interface Login {
  username: string;
  password: string;
}

export interface Register extends Login {
  email: string;
  confirmPassword: string;
}

export interface ForgotPassword extends Login {
  code: string;
}
