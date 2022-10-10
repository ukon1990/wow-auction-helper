export interface Authorization {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}