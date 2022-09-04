import {CognitoJwtVerifier} from 'aws-jwt-verify';
import {AccessToken} from '../../models/user/access-token.model';
import {Group} from '../../enums/group.enum';
import {COGNITO} from '../../secrets';

export class AuthService {
  private token: AccessToken;
  private tokenRaw: string;
  private readonly cognitoPoolId = COGNITO.POOL_ID;
  // private readonly region = ENVIRONMENT_VARIABLES.TEST.APP_SYNC_REGION.toLowerCase();
  private readonly cognitoClientId = COGNITO.CLIENT_ID;
  private readonly verifier = CognitoJwtVerifier.create({
    userPoolId: this.cognitoPoolId,
    tokenUse: 'access',
    clientId: this.cognitoClientId,
  });
  private isValid = false;

  public get userId(): string {
    return this.token.sub;
  }

  constructor(headers: {[key: string]: string}) {
    this.setToken(headers);
  }

  isAdmin() {
    return this.isInGroup(Group.ADMIN);
  }

  async isInOneOfGroups(groups: Group[]): Promise<boolean> {
    const isValid = await this.getIsValid();
    const isInOneOrMore = groups.filter(async group => await this.isInGroup(group)).length > 0;
    return isValid && isInOneOrMore;
  }

  async isInGroup(group: Group): Promise<boolean> {
    if (!this.token || !this.token.groups) {
      return false;
    }
    const isValid = await this.getIsValid();
    return this.token.hasGroup(group) && isValid;
  }

  async getIsValid(): Promise<boolean> {
    try {
      const isValidTimestamp = this.token.exp >= +new Date();
      if (this.isValid && isValidTimestamp) {
        return true;
      }

      const payload = await this.verifier.verify(
        this.tokenRaw
      );

      this.isValid = !!payload;
      return !!payload;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private setToken(headers: {[key: string]: string}): boolean {
    try {
      if (headers && headers.Authorization) {
        this.tokenRaw = headers.Authorization.replace('Bearer ', '');
        const token: AccessToken = new AccessToken(this.tokenRaw);
        this.token = token;
        if (token.exp >= +new Date()) {
          return true;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  getToken(): string {
    return this.tokenRaw;
  }

  getUnauthorizedResponse() {
    return {
      status: 401,
      error: 'You are not authorized to perform this action',
    };
  }
}