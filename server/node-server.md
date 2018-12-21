# WAH backend service

## Setup
In order to run this project's backend you will need to create a .env file.
The .env file in the server directory, and it has to at least have these environment variables set:
```.env

MYSQL_URI=uri
MYSQL_URI_LOCAL=uri
MYSQL_USER=db-username
MYSQL_USER_LOCAL=root
MYSQL_PASSWORD=db-password
MYSQL_PASSWORD_LOCAL=db-username
MYSQL_SCHEMA=schema-name

BLIZZARD_API_KEY=value
BLIZZARD_API_KEY_LOCAL=value

#New API data
BLIZZARD_ACCESS_TOKEN=value

BLIZZARD_CLIENT_ID=value
BLIZZARD_CLIENT_SECRET=value
```

Once that is done. Do `npm -i` to install any dependencies and you're good to go.

## The database
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

## Running the server
You serve the server for development by using the following command:
```
npm run start-dev
```
This command will reload the server every time you save changes to one of it's files.

For production you should use:
```
npm start
```