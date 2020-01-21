# WAH AWS Lambda backend service

## Setup
In order to run this project's backend you will need to create a secrets.ts file in this directory.
The secrets.ts has to look like this, with the variables set:
```.ts
export const BLIZZARD = {
  CLIENT_ID: 'client-id',
  CLIENT_SECRET: 'client-secret',
  ACCESS_TOKEN: undefined
};

export const TSM_KEY = 'tsm-api-key';

const useLocal = true;

function shouldUseLocal() {
  return useLocal && (process.env.IS_OFFLINE || process.env.IS_LOCAL);
}

export const DATABASE_CREDENTIALS = {
  database: '100680-wah',
  host: shouldUseLocal() ? '127.0.0.1' : 'your-external-database',
  user: shouldUseLocal() ? 'username' : 'username',
  password: shouldUseLocal() ? 'password' : 'password',
  port: shouldUseLocal() ? 8889 : undefined // Whatever port you use, in case of non default port
};

/*
Keep in mind that it is bad practice doing this. You should use a role with the correct policy.
But there is a lower barrier to entry, if someone wish to try to run this app.
*/
export const AWS_DETAILS = {
  ALLOWED_DOMAIN: '',
  ACCESS_KEY: 'your IAM user secret key',
  SECRET_ACCESS_KEY: 'your IAM user secret key'
};

```

You also need to install serverless by running `npm i -g serverless`. In order to deploy the lambda functions, you need to have aws-cli set up on your development computer.

Once that is done. Do `npm i` to install any dependencies and you're good to go.

### Blizzard API details
Register over at https://develop.battle.net.
Once that is done, you can get the access key by following this url with the correct client id and secret:
`https://eu.battle.net/oauth/token?grant_type=client_credentials&client_id={{bnet_client_id}}&client_secret={{bnet_client_secret}}&scope=wow.profile`

## The database
For the database model open `db_model/db_model.mwb` in MySQL Workbench.

## Running the server
You serve the server for development by using the following command:
```
npm start
```
This command will reload the server every time you save changes to one of it's files.

## Running the tests
```
npm test
```

## Deploying to AWS API Gateway and Lambda
To deploy to multiple regions, the easiest way is to just update the deploy.sh script with the regions, you wish to deploy to. And do `npm run deploy` in the terminal.
Atlernatively, if you use windows, run `serverless deploy -r eu-west-2` manually or create your own script.

This will then upload everything to AWS, and set up the API Gateway etc and output the endpoint url's.

## AWS CloudWatch events
The events that I have set for this application goes as follows:
* Auto check for new auctions every 1 minute (updateAllHouses)
* Check if there are any realms that have not been requested the past 14 days (deactivateInactiveHouses)
* Fetch TSM api data per realm for 1 per hour (updateTSMDumpData). 
A TSM key can only fetch 25 times per 24 hour period.
When you set up the event:
    1. set it to "Schedule"
    2. add "Target"
    3. select the "updateTSMDumpData" function
    4. configure input as JSON with the body: {"key": "your tsm key"}

## AWS S3 events
There are two events for S3.

One for detecting if there are new file updates, for AH dumps.

And one for when a AH dump is downloaded.

The reason for this, is that a lambda that goes through API gateway is 
limited to 30 seconds and it makes my logs cleaner I think. I then also 
have the option of reducing dedicated resources to that part of the job.

Anyways:
1. Go to AWS S3 and open the bucket(s)
2. Go to properties and then events
3. Create a new event (dump download)
    1. Use the name you wish.
    2. Set it to "put" requests, 
    3. Set the prefix to "auctions/eu/" and suffix to "dump-path.json.gz"
    4. Under "Send to" choose Lambda and locate the "auctionsDownloadAndSave" function
4. Create a new event (what to do after a dump fetch)
1. Use the name you wish.
    2. Set it to "All object create events" requests, 
    3. Set the prefix to "auctions/" and suffix to "-lastModified.json.gz"
    4. Under "Send to" choose Lambda and locate the "auctionsUpdateStaticS3Data" function