# WAH AWS Lambda backend service

## Setup
In order to run this project's backend you will need to create a secrets.ts file in this directory.
The secrets.ts has to look like this, with the variables set:
```.ts
export const isOffline = (process.env.IS_OFFLINE || process.env.IS_LOCAL) || process.env.NODE_ENV === 'test';

export const BLIZZARD = {
  CLIENT_ID: !isOffline ? 'your credentials here' : 'your credentials here',
  CLIENT_SECRET: !isOffline ? 'your credentials here' : 'your credentials here',
  ACCESS_TOKEN: undefined
};

const useLocal = false;

function shouldUseLocal() {
  return useLocal && (process.env.IS_OFFLINE || process.env.IS_LOCAL) || process.env.NODE_ENV === 'test';
}

export const DATABASE_CREDENTIALS = {
  READ: {
    database: 'wah',
    host: shouldUseLocal() ? '127.0.0.1' :  'your credentials here',
    user: shouldUseLocal() ? 'root' : 'your credentials here',
    password: shouldUseLocal() ? 'root' : 'your credentials here',
    port: shouldUseLocal() ? 8889 : undefined
  },
  ADMIN: {
    database: 'wah',
    host: shouldUseLocal() ? '127.0.0.1' :  'your credentials here',
    user: shouldUseLocal() ? 'root' : 'your credentials here',
    password: shouldUseLocal() ? 'root' : 'your credentials here',
    port: shouldUseLocal() ? 8889 : undefined
  },
};


/*
Keep in mind that it is bad practice doing this. You should use a role with the correct policy.
But there is a lower barrier to entry, if someone wish to try to run this app.
*/
export const AWS_DETAILS = {
  ALLOWED_DOMAIN: 'your domain',
  ACCESS_KEY: 'aws IAM user access key',
  SECRET_ACCESS_KEY: 'aws IAM user secret access key'
};
```

You also need to install serverless by running `npm i -g serverless`. In order to deploy the lambda functions, you need to have aws-cli set up on your development computer.

Once that is done. Do `npm i` to install any dependencies and you're good to go.

### Blizzard API details
Register over at https://develop.battle.net.
Once that is done, you can get the access key by following this url with the correct client id and secret:
`https://eu.battle.net/oauth/token?grant_type=client_credentials&client_id={{bnet_client_id}}&client_secret={{bnet_client_secret}}&scope=wow.profile`

## The database
For the database model open `db_model/db_model.mwb` in MySQL Workbench. This database is primarily used
for storing historical data and any static blizzard data. The static blizzard data will have to be generated into json files.

You would also need to set up to set up DynamoDB on AWS for the Auction houses and any user related data.

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
* [Once per minute] Check if there is any new auction data available (updateAllHouses)
* [Every time a status file is requested] Update when an auction house was last requested (updateLastRequested)
* [Once per minute] Check if there are any history data queries to perform (WAHInsertStatisticsData)
* [Once per minute] Update trend data (auctionsUpdateRealmTrends)
* [Once per 3 hour] Check if there are any missing items, and import them into the database (findMissingItemsAndImport)
* [0,5,10,15,20,25,30,35,40,45,50,55 * * * ? *] Delete old hourly historical data (deleteOldPriceForRealm)
  * Input: {"olderThan": 15, "period": "DAY", "table": "itemPriceHistoryPerHour"}
* [30-59 10-23 1 * ? *] Delete old daily historical data (deleteOldPriceForRealm)
  * Input:  {"olderThan": 4, "period": "MONTH", "table": "itemPriceHistoryPerDay"}
* [Once per hour] Fetch TSM api data per realm for 1 per hour (updateTSMDumpData). (Not used atm, since TSM public API is disabled)
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