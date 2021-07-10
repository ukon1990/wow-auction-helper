#WAH client
## Setup
This project requires you to have node.js and angular CLI installed.
To install the angular CLI simply type `npm i -g @angular/cli` in the terminal/CMD.
When that is done, run `npm i` in the client directory to install all the packages.

In order for login to work, you need to set up the secrets file, and place it in `clients/src/client/secrets.ts`:
```.ts
export const USE_LOCAL_BACKEND = false;

export const COGNITO = {
  POOL_ID: 'your AWS Cognito pool',
  CLIENT_ID: 'your AWS Cognito pool id',
};
// App sync
export const APP_SYNC = {
  aws_appsync_graphqlEndpoint: 'https://<replace with id>.appsync-api.<replace with region>.amazonaws.com/graphql',
  aws_project_region: 'your AWS region',
};
```

You can keep USE_LOCAL_BACKEND set to false and set production to true, as that would not require you to set up the backend.

## Updating Angular
To update angular, simply type `ng update` into the terminal while in the client directory.
Then just paste all the available updates into the terminal.

#### Building and running the development server
While you are developing on the project, use the following command to serve the web application:
```
npm start
```

In order to run the tests you do:
```
ng test --sm=false --code-coverage
```

For building the project for production do:
```
ng build --prod
```