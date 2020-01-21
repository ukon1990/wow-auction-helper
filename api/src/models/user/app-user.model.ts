export class AppUser {
  id: number;
  authorities: string[];
  expires: number;
  scope: string[];
  settings: any;
  registered: number;
  lastModified: number;

  constructor(private res) {
    this.id = res.user_name;
    this.authorities = res.authorities;
    this.scope = res.scope;
  }
}
