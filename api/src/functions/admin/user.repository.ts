import {CognitoIdentityServiceProvider} from 'aws-sdk';
import {AdminGetUserResponse, UserType} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import {COGNITO} from '../../secrets';

export class UserRepository {
  private provider: CognitoIdentityServiceProvider;
  private userPoolId = COGNITO.POOL_ID;

  constructor() {
    this.provider = new CognitoIdentityServiceProvider({
      region: 'eu-west-1'
    });
  }

  getAll(): Promise<any> {
    return this.provider.listUsers({UserPoolId: this.userPoolId}).promise();
  }

  getById(id: string): Promise<UserType> {
    return new Promise<UserType>((resolve, reject) => {
      this.provider.listUsers({
        Filter: `sub="${id}"`,
        UserPoolId: this.userPoolId
      }).promise()
        .then((result: CognitoIdentityServiceProvider.ListUsersResponse) => {
          const user = (result.Users || [])[0];
          resolve(user);
        })
        .catch(reject);
    });
  }

  getByUsername(username: string): Promise<AdminGetUserResponse> {
    return new Promise<AdminGetUserResponse>((resolve, reject) => {
      this.provider.adminGetUser({
        Username: username,
        UserPoolId: this.userPoolId
      }).promise()
        .then((result: AdminGetUserResponse) => {
          resolve(result);
        })
        .catch(reject);
    });
  }

  addUserToGroup(username: string, groupName: string): Promise<AdminGetUserResponse> {
    return new Promise<AdminGetUserResponse>((resolve, reject) => {
      this.provider.adminAddUserToGroup({
        Username: username,
        GroupName: groupName,
        UserPoolId: this.userPoolId
      }).promise()
        .then((result: any) => {
          resolve(result);
        })
        .catch(reject);
    });
  }
}