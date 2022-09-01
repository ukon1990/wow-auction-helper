import {ColumnDescription} from '@shared/models';

class CognitoUserModel {
  Username: string;
  Attributes: {Name: 'sub' | 'email_verified' | 'email', Value: string}[];
  UserCreateDate: Date;
  UserLastModifiedDate: Date;
  Enabled: boolean;
  UserStatus: string;
}

export const userColumns: ColumnDescription[] = [
  {key: 'username', title: 'Username', dataType: 'string'},
  {key: 'email', title: 'E-mail', dataType: 'string'},
  {key: 'email_verified', title: 'E-mail verified', dataType: 'checkbox'},
  {key: 'status', title: 'Status', dataType: 'string'},
  {key: 'created', title: 'Created', dataType: 'date'},
  {key: 'lastModified', title: 'Last modified', dataType: 'date'},
];

export const getUserTableData = (users: CognitoUserModel[]) => users.map(user => ({
  username: user.Username,
  status: user.UserStatus,
  email_verified: user.Attributes.filter(a => a.Name === 'email_verified')[0].Value === 'true',
  email: user.Attributes.filter(a => a.Name === 'email')[0].Value,
  sub: user.Attributes.filter(a => a.Name === 'sub')[0].Value,
  enabled: user.Enabled,
  created: user.UserCreateDate,
  lastModified: user.UserLastModifiedDate,
}));

export const getListOfUsers = (users: CognitoUserModel[], userMap: Map<string, CognitoUserModel>) => {
  const list = [];
  users.forEach(u => {
    const sub = u.Attributes.filter(a => a.Name === 'sub')[0].Value;
    userMap.set(sub, u);
  });

  userMap.forEach(u => list.push(u));

  console.log(userMap, list);
  return list;
};