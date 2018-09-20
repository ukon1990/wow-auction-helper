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

### For the frontend
This project requires you to have a blizzard API key.
Your api key is stored in ``src/app/service/keys.ts`` (you need to create this file)

The file should look like this:
```
export class Keys {
    public static blizzard = 'a string with your api key';
}

```

#### Building and running the development server
While you are developing on the project, use the following command to serve the web application:
```
ng serve
```

In order to run the tests you do:
```
ng test --sm=false --code-coverage
```

For building the project for production do:
```
ng build --prod
```

### For the backend
The backend is located in the server folder. When you build the app, this is the folder the build files end up in.

In order for the backend to work, you need to create a config file here as well. It has to be located in `server/secrets/secrets.js`. You have to create this file on your own. It should look like this:
```
var databaseConn = {
	host: yourHost,
	user: yourDBUser,
	password: thePassword,
	database: theSchema
};


module.exports.apikey = 'your blizzard api key';
module.exports.databaseConn = databaseConn;
```

#### Running the server
You serve the server for development by using the following command:
```
npm run start-dev
```
This command will reload the server every time you save changes to one of it's files.

For production you should use:
```
npm start
```

#### Create table statements
##### Item table
```
CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(100) NOT NULL DEFAULT 'inv_scroll_03',
  `itemLevel` int(11) DEFAULT NULL,
  `itemClass` int(11) DEFAULT '0',
  `itemSubClass` int(11) DEFAULT '0',
  `quality` int(11) NOT NULL DEFAULT '0',
  `itemSpells` mediumtext,
  `itemSource` mediumtext,
  `buyPrice` int(20) DEFAULT '0',
  `sellPrice` int(20) DEFAULT '0',
  `itemBind` int(2) DEFAULT '0',
  `minFactionId` int(20) DEFAULT '0',
  `minReputation` int(20) DEFAULT '0',
  `isDropped` tinyint(4) NOT NULL DEFAULT '0',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

##### Pet table
```
CREATE TABLE `pets` (
  `speciesId` int(11) NOT NULL,
  `petTypeId` int(11) DEFAULT NULL,
  `creatureId` int(11) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `icon` varchar(45) DEFAULT NULL,
  `description` mediumtext,
  `source` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`speciesId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

```

##### Recipe table
```
CREATE TABLE `recipes` (
  `id` int(11) NOT NULL,
  `json` mediumtext NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

## "Copy right"
Do as you wish with the codebase, I'm not going to sue you. Feel free to fork it and play with the code or host it on your own.
