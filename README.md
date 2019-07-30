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

## Setup requirements
You need to have nodejs and @angular/cli installed on your computer as both the backend and the front-end use it. The front-end just for building the project.
* [https://nodejs.org/en/](https://nodejs.org/en/)
* [angular.io](https://angular.io/guide/quickstart)

## Front and back-end documentation
* [Front-end](src/client/client.md)
* [AWS Lambda Back-end](src/lambda/lambda.md)
* [(Depricated)Back-end](server-legacy/node-server.md)


## "Copy right"
Do as you wish with the codebase, I'm not going to sue you. Feel free to fork it and play with the code or host it on your own.
