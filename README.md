# WoW Auction Helper
## Introduction to the app
This is a Angular application that I've been developing on my spare time. The application is designed with an assumption that you supply it with a TSM API key. But it will work without one (but more useful with it).

It contains some tools for gold making in World of Warcraft. Some of it's features include:
* A dashboard
  * with crafts that are currently profitable to craft if should
  * the items that meets your watchlist criteria, and profitable crafts for those items.
  * The item you should trade your Blood of Sargeras, Primal Sargerite and Primal spirit for the most gold yield.
  * and other potential deals
* Crafting
  * You can filter through recipes you have on one of your characters (added ones) or through every recipe in the database (should cover almost all in-game recipes)
* Auctions
  * You can filter for for both items and battle pets that have been spotted in the latest AH data.
  * An item will be highlighted if you've got the lowest buyout for that item
  * You can see what items you have at the AH across your characters for a specific realm.
* Items
  * You can click on any item name, and get further details about that item. Such as how many are at AH, the recipes it is used in, what crafts can make the item. A chart over the live auctions buyout per item etc etc.
* Watchlist
  * You can set up watchlist groups, where you define rules for items to show up in the dashboard. e.g. If Foxflower is below 70% of it's market value. Or there are more than 0 available of a specific item etc.

## Suggested VS code pack for angular:
* Angular-Schule: Extension Pack

## Setup requirements
First of all you need to have nodejs and @angular/cli installed on your computer. Both the backend and the front-end use it. The front-end just for building the project.
* [https://nodejs.org/en/](https://nodejs.org/en/)
* [angular.io](https://angular.io/guide/quickstart)

## Front and back-end documentation
* [Front-end](client/client.md)
* [Back-end](server/node-server.md)


## "Copy right"
Do as you wish with the codebase, I'm not going to sue you. Feel free to fork it and play with the code or host it on your own.
