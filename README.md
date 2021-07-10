# WoW Auction Helper
## Introduction to the app
This is an Angular application that I have been developing in my spare time. The application works best when supplied with a TSM API key.

The application contains tools for making gold in World of Warcraft. It's features include:
* A dashboard
  * Displays what crafts are currently profitable to make
  * Lists items that meet a watchlist criteria and profitable crafts for those items
  * Maximize profits for Blood of Sargeras, Primal Sargerite and Primal Spirit trades
  * Semi-customizable potential deals based on bid value and market value vs min buyout price.
  * See information about other sellers.
* Crafting
  * Filter through recipes you have on your characters (added ones) or through every recipe in the database (should cover almost all in-game recipes)
* Auctions
  * Filter items and battle pets that have been spotted in the latest auction house data
  * Highlights items you have the lowest buyout for
  * View what items you have on the auction house between all characters on a realm
* Items
  * Click on any item name to get further details about that item. The application will tell you how many are in the auction house, the recipes the item is used in, what crafts make that item, a chart of buyout price over time, etc.
* Watchlist
  * Set up watchlist groups with specific rules for items, e.g. If Foxflower is below 70% of it's market value or there are more than 0 available of a specific item etc.

* TSM Addon data
  * Allows you to import the data gathered by your TSM addon. This allows you to see what items you have in your inventory, sale, purchase history etc.

## Suggested VS code pack for angular:
* Angular-Schule: Extension Pack

## Code quality
Do keep in mind that parts code in this project is getting old. The code quality might vary due to this.
So do not consider this as a project to see all the best practices. But you can get an idea about how certain 
technologies can be used.

## Architecture
### Client side
The framework used is Angular, with the Angular PWA and Angular Material packages.
In order to reduce time spent loading data from the "server"(and hosting costs), the app uses 
* IndexedDB(via [dexie](https://dexie.org/)), as a local database to store items, recipes etc on the client. 
  This is updated in the background upon start, if there is any new data available.
* Angular Progressive Web Application/PWA(Service worker) to store the app, and automatically download 
  a new version in the background if available.
  
### Server side
On the server side, the application heavily uses Amazon Web Services(AWS). This then means that you will need AWS 
experience to get it up and running correctly.

The documentation of the whole AWS part of the architecture will likely not be up to date as I will forget to do so.
Also because I don't actually expect anyone to want to set it up.

But you can still look at how I decided to solve the serverless part of this, using AWS Lambda functions. 
You could probably just as easily make something similar for Azure Functions. Parts of this code is also old, 
there is a mix of old and new structure here.

## Setup requirements
You need to have nodejs, @angular/cli, serverless, SQL(MariaDB or MySQL etc) installed on your computer as both the backend and the front-end use it. The front-end just for building the project.
* [https://nodejs.org/en/](https://nodejs.org/en/)
* [https://www.serverless.com/](https://www.serverless.com/)
* [angular.io](https://angular.io/guide/quickstart)

If you are just planning to try out the frontend part, you can set the flag for "production" to true in the environment.ts file.
Then you won't need to set up a backend.

## Front and back-end documentation
* [Front-end](client/src/client/client.md)
* [AWS Lambda Back-end](api/src/lambda.md)
* [AWS App sync Back-end (User settings)](app-sync/appSync.md)



## "Copy right"
Do as you wish with the codebase, I'm not going to sue you. Feel free to fork it and play with the code or host it on your own.
