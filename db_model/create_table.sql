create table itemPriceHistoryPerDay
(
    ahId          smallint         not null,
    ahTypeId      int(4) default 0 not null,
    itemId        mediumint        not null,
    date          date             not null,
    petSpeciesId  smallint         not null,
    bonusIds      varchar(256)     not null,
    minHour01     smallint(2)      null,
    min01         bigint           null,
    avg01         bigint           null,
    max01         bigint           null,
    minQuantity01 bigint           null,
    avgQuantity01 bigint           null,
    maxQuantity01 bigint           null,
    minHour02     smallint(2)      null,
    min02         bigint           null,
    avg02         bigint           null,
    max02         bigint           null,
    minQuantity02 bigint           null,
    avgQuantity02 bigint           null,
    maxQuantity02 bigint           null,
    minHour03     smallint(2)      null,
    min03         bigint           null,
    avg03         bigint           null,
    max03         bigint           null,
    minQuantity03 bigint           null,
    avgQuantity03 bigint           null,
    maxQuantity03 bigint           null,
    minHour04     smallint(2)      null,
    min04         bigint           null,
    avg04         bigint           null,
    max04         bigint           null,
    minQuantity04 bigint           null,
    avgQuantity04 bigint           null,
    maxQuantity04 bigint           null,
    minHour05     smallint(2)      null,
    min05         bigint           null,
    avg05         bigint           null,
    max05         bigint           null,
    minQuantity05 bigint           null,
    avgQuantity05 bigint           null,
    maxQuantity05 bigint           null,
    minHour06     smallint(2)      null,
    min06         bigint           null,
    avg06         bigint           null,
    max06         bigint           null,
    minQuantity06 bigint           null,
    avgQuantity06 bigint           null,
    maxQuantity06 bigint           null,
    minHour07     smallint(2)      null,
    min07         bigint           null,
    avg07         bigint           null,
    max07         bigint           null,
    minQuantity07 bigint           null,
    avgQuantity07 bigint           null,
    maxQuantity07 bigint           null,
    minHour08     smallint(2)      null,
    min08         bigint           null,
    avg08         bigint           null,
    max08         bigint           null,
    minQuantity08 bigint           null,
    avgQuantity08 bigint           null,
    maxQuantity08 bigint           null,
    minHour09     smallint(2)      null,
    min09         bigint           null,
    avg09         bigint           null,
    max09         bigint           null,
    minQuantity09 bigint           null,
    avgQuantity09 bigint           null,
    maxQuantity09 bigint           null,
    minHour10     smallint(2)      null,
    min10         bigint           null,
    avg10         bigint           null,
    max10         bigint           null,
    minQuantity10 bigint           null,
    avgQuantity10 bigint           null,
    maxQuantity10 bigint           null,
    minHour11     smallint(2)      null,
    min11         bigint           null,
    avg11         bigint           null,
    max11         bigint           null,
    minQuantity11 bigint           null,
    avgQuantity11 bigint           null,
    maxQuantity11 bigint           null,
    minHour12     smallint(2)      null,
    min12         bigint           null,
    avg12         bigint           null,
    max12         bigint           null,
    minQuantity12 bigint           null,
    avgQuantity12 bigint           null,
    maxQuantity12 bigint           null,
    minHour13     smallint(2)      null,
    min13         bigint           null,
    avg13         bigint           null,
    max13         bigint           null,
    minQuantity13 bigint           null,
    avgQuantity13 bigint           null,
    maxQuantity13 bigint           null,
    minHour14     smallint(2)      null,
    min14         bigint           null,
    avg14         bigint           null,
    max14         bigint           null,
    minQuantity14 bigint           null,
    avgQuantity14 bigint           null,
    maxQuantity14 bigint           null,
    minHour15     smallint(2)      null,
    min15         bigint           null,
    avg15         bigint           null,
    max15         bigint           null,
    minQuantity15 bigint           null,
    avgQuantity15 bigint           null,
    maxQuantity15 bigint           null,
    minHour16     smallint(2)      null,
    min16         bigint           null,
    avg16         bigint           null,
    max16         bigint           null,
    minQuantity16 bigint           null,
    avgQuantity16 bigint           null,
    maxQuantity16 bigint           null,
    minHour17     smallint(2)      null,
    min17         bigint           null,
    avg17         bigint           null,
    max17         bigint           null,
    minQuantity17 bigint           null,
    avgQuantity17 bigint           null,
    maxQuantity17 bigint           null,
    minHour18     smallint(2)      null,
    min18         bigint           null,
    avg18         bigint           null,
    max18         bigint           null,
    minQuantity18 bigint           null,
    avgQuantity18 bigint           null,
    maxQuantity18 bigint           null,
    minHour19     smallint(2)      null,
    min19         bigint           null,
    avg19         bigint           null,
    max19         bigint           null,
    minQuantity19 bigint           null,
    avgQuantity19 bigint           null,
    maxQuantity19 bigint           null,
    minHour20     smallint(2)      null,
    min20         bigint           null,
    avg20         bigint           null,
    max20         bigint           null,
    minQuantity20 bigint           null,
    avgQuantity20 bigint           null,
    maxQuantity20 bigint           null,
    minHour21     smallint(2)      null,
    min21         bigint           null,
    avg21         bigint           null,
    max21         bigint           null,
    minQuantity21 bigint           null,
    avgQuantity21 bigint           null,
    maxQuantity21 bigint           null,
    minHour22     smallint(2)      null,
    min22         bigint           null,
    avg22         bigint           null,
    max22         bigint           null,
    minQuantity22 bigint           null,
    avgQuantity22 bigint           null,
    maxQuantity22 bigint           null,
    minHour23     smallint(2)      null,
    min23         bigint           null,
    avg23         bigint           null,
    max23         bigint           null,
    minQuantity23 bigint           null,
    avgQuantity23 bigint           null,
    maxQuantity23 bigint           null,
    minHour24     smallint(2)      null,
    min24         bigint           null,
    avg24         bigint           null,
    max24         bigint           null,
    minQuantity24 bigint           null,
    avgQuantity24 bigint           null,
    maxQuantity24 bigint           null,
    minHour25     smallint(2)      null,
    min25         bigint           null,
    avg25         bigint           null,
    max25         bigint           null,
    minQuantity25 bigint           null,
    avgQuantity25 bigint           null,
    maxQuantity25 bigint           null,
    minHour26     smallint(2)      null,
    min26         bigint           null,
    avg26         bigint           null,
    max26         bigint           null,
    minQuantity26 bigint           null,
    avgQuantity26 bigint           null,
    maxQuantity26 bigint           null,
    minHour27     smallint(2)      null,
    min27         bigint           null,
    avg27         bigint           null,
    max27         bigint           null,
    minQuantity27 bigint           null,
    avgQuantity27 bigint           null,
    maxQuantity27 bigint           null,
    minHour28     smallint(2)      null,
    min28         bigint           null,
    avg28         bigint           null,
    max28         bigint           null,
    minQuantity28 bigint           null,
    avgQuantity28 bigint           null,
    maxQuantity28 bigint           null,
    minHour29     smallint(2)      null,
    min29         bigint           null,
    avg29         bigint           null,
    max29         bigint           null,
    minQuantity29 bigint           null,
    avgQuantity29 bigint           null,
    maxQuantity29 bigint           null,
    minHour30     smallint(2)      null,
    min30         bigint           null,
    avg30         bigint           null,
    max30         bigint           null,
    minQuantity30 bigint           null,
    avgQuantity30 bigint           null,
    maxQuantity30 bigint           null,
    minHour31     smallint(2)      null,
    min31         bigint           null,
    avg31         bigint           null,
    max31         bigint           null,
    minQuantity31 bigint           null,
    avgQuantity31 bigint           null,
    maxQuantity31 bigint           null,
    primary key (ahId, ahTypeId, itemId, date, petSpeciesId, bonusIds)
)
    engine = InnoDB
    charset = utf8 partition by hash (month(`date`)) partitions 12;

create index idx_date_and_house
    on itemPriceHistoryPerDay (ahId, date);

create table itemPriceHistoryPerHour
(
    ahId         smallint         not null,
    ahTypeId     int(4) default 0 not null,
    itemId       mediumint        not null,
    date         date             not null,
    petSpeciesId smallint         not null,
    bonusIds     varchar(256)     not null,
    price00      bigint           null,
    quantity00   bigint           null,
    price01      bigint           null,
    quantity01   bigint           null,
    price02      bigint           null,
    quantity02   bigint           null,
    price03      bigint           null,
    quantity03   bigint           null,
    price04      bigint           null,
    quantity04   bigint           null,
    price05      bigint           null,
    quantity05   bigint           null,
    price06      bigint           null,
    quantity06   bigint           null,
    price07      bigint           null,
    quantity07   bigint           null,
    price08      bigint           null,
    quantity08   bigint           null,
    price09      bigint           null,
    quantity09   bigint           null,
    price10      bigint           null,
    quantity10   bigint           null,
    price11      bigint           null,
    quantity11   bigint           null,
    price12      bigint           null,
    quantity12   bigint           null,
    price13      bigint           null,
    quantity13   bigint           null,
    price14      bigint           null,
    quantity14   bigint           null,
    price15      bigint           null,
    quantity15   bigint           null,
    price16      bigint           null,
    quantity16   bigint           null,
    price17      bigint           null,
    quantity17   bigint           null,
    price18      bigint           null,
    quantity18   bigint           null,
    price19      bigint           null,
    quantity19   bigint           null,
    price20      bigint           null,
    quantity20   bigint           null,
    price21      bigint           null,
    quantity21   bigint           null,
    price22      bigint           null,
    quantity22   bigint           null,
    price23      bigint           null,
    quantity23   bigint           null,
    primary key (ahId, itemId, date, petSpeciesId, bonusIds, ahTypeId)
)
    engine = InnoDB
    charset = utf8 partition by hash (to_days(`date`)) partitions 31;

create index idx_date_and_house
    on itemPriceHistoryPerHour (ahId, date);

create table items
(
    id                   int                                      not null
        primary key,
    name                 varchar(100)                             not null,
    icon                 varchar(100) default 'inv_scroll_03'     not null,
    itemLevel            int                                      null,
    itemClass            int          default 0                   null,
    itemSubClass         int          default 0                   null,
    quality              int          default 0                   not null,
    itemSpells           mediumtext                               null,
    itemSource           mediumtext                               null,
    buyPrice             int          default 0                   null,
    sellPrice            int          default 0                   null,
    itemBind             int          default 0                   null,
    minFactionId         int          default 0                   null,
    minReputation        int          default 0                   null,
    isDropped            tinyint      default 0                   not null,
    timestamp            timestamp    default current_timestamp() null on update current_timestamp(),
    expansionId          int          default -1                  null,
    stackable            int          default 1                   null,
    bonusStats           mediumtext                               null,
    bonusSummary         mediumtext                               null,
    isAuctionable        tinyint                                  null,
    nameDescriptionColor varchar(10)                              null,
    upgradable           tinyint                                  null,
    availableContexts    mediumtext                               null,
    bonusLists           mediumtext                               null,
    inventoryType        int                                      null,
    equippable           tinyint                                  null,
    maxDurability        int                                      null,
    baseArmor            int                                      null,
    armor                int                                      null,
    displayInfoId        int                                      null,
    requiredLevel        int                                      null,
    description          varchar(256)                             null,
    requiredSkill        int                                      null,
    requiredSkillRank    int                                      null,
    context              varchar(56)                              null,
    weaponInfo           mediumtext                               null,
    maxCount             int                                      null,
    requiredAbility      mediumtext                               null,
    socketInfo           mediumtext                               null,
    hasSockets           tinyint                                  null,
    gemInfo              mediumtext                               null,
    containerSlots       int                                      null,
    azeriteClassPowers   mediumtext                               null,
    allowableClasses     mediumtext                               null,
    nameDescription      varchar(56)                              null,
    boundZone            mediumtext                               null,
    patch                varchar(45)                              null
)
    engine = InnoDB
    charset = utf8;

create table item_name_locale
(
    id    int          not null,
    en_GB varchar(100) null,
    en_US varchar(100) null,
    de_DE varchar(100) null,
    es_ES varchar(100) null,
    es_MX varchar(100) null,
    fr_FR varchar(100) null,
    it_IT varchar(100) null,
    pl_PL varchar(100) null,
    pt_PT varchar(100) null,
    pt_BR varchar(100) null,
    ru_RU varchar(100) null,
    ko_KR varchar(100) null,
    zh_TW varchar(100) null,
    constraint id_UNIQUE
        unique (id),
    constraint fk_items_locale_items
        foreign key (id) references items (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_items_locale_items_idx
    on item_name_locale (id);

create table itemsClassic
(
    id                   int                                      not null
        primary key,
    name                 varchar(100)                             not null,
    icon                 varchar(100) default 'inv_scroll_03'     not null,
    itemLevel            int                                      null,
    itemClass            int          default 0                   null,
    itemSubClass         int          default 0                   null,
    quality              int          default 0                   not null,
    itemSpells           mediumtext                               null,
    itemSource           mediumtext                               null,
    buyPrice             int          default 0                   null,
    sellPrice            int          default 0                   null,
    itemBind             int          default 0                   null,
    minFactionId         int          default 0                   null,
    minReputation        int          default 0                   null,
    isDropped            tinyint      default 0                   not null,
    timestamp            timestamp    default current_timestamp() null on update current_timestamp(),
    expansionId          int          default -1                  null,
    stackable            int          default 1                   null,
    bonusStats           mediumtext                               null,
    bonusSummary         mediumtext                               null,
    isAuctionable        tinyint                                  null,
    nameDescriptionColor varchar(10)                              null,
    upgradable           tinyint                                  null,
    availableContexts    mediumtext                               null,
    bonusLists           mediumtext                               null,
    inventoryType        int                                      null,
    equippable           tinyint                                  null,
    maxDurability        int                                      null,
    baseArmor            int                                      null,
    armor                int                                      null,
    displayInfoId        int                                      null,
    requiredLevel        int                                      null,
    description          varchar(256)                             null,
    requiredSkill        int                                      null,
    requiredSkillRank    int                                      null,
    context              varchar(56)                              null,
    weaponInfo           mediumtext                               null,
    maxCount             int                                      null,
    requiredAbility      mediumtext                               null,
    socketInfo           mediumtext                               null,
    hasSockets           tinyint                                  null,
    gemInfo              mediumtext                               null,
    containerSlots       int                                      null,
    azeriteClassPowers   mediumtext                               null,
    allowableClasses     mediumtext                               null,
    nameDescription      varchar(56)                              null,
    boundZone            mediumtext                               null,
    patch                varchar(45)                              null,
    classicPhase         int(2)       default 0                   null
)
    engine = InnoDB
    charset = utf8;

create table itemClassic_name_locale
(
    id    int          not null,
    en_GB varchar(100) null,
    en_US varchar(100) null,
    de_DE varchar(100) null,
    es_ES varchar(100) null,
    es_MX varchar(100) null,
    fr_FR varchar(100) null,
    it_IT varchar(100) null,
    pl_PL varchar(100) null,
    pt_PT varchar(100) null,
    pt_BR varchar(100) null,
    ru_RU varchar(100) null,
    ko_KR varchar(100) null,
    zh_TW varchar(100) null,
    constraint id_UNIQUE
        unique (id),
    constraint fk_items_locale_itemsClassic
        foreign key (id) references itemsClassic (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_itemClassic_name_locale_items_idx
    on itemClassic_name_locale (id);

create table pets
(
    speciesId   int                                   not null
        primary key,
    petTypeId   int                                   null,
    creatureId  int                                   null,
    name        varchar(45)                           null,
    icon        varchar(45)                           null,
    description mediumtext                            null,
    source      varchar(255)                          null,
    timestamp   timestamp default current_timestamp() null
)
    engine = InnoDB
    charset = utf8;

create table pet_name_locale
(
    speciesId int          not null,
    en_GB     varchar(100) null,
    en_US     varchar(100) null,
    de_DE     varchar(100) null,
    es_ES     varchar(100) null,
    es_MX     varchar(100) null,
    fr_FR     varchar(100) null,
    it_IT     varchar(100) null,
    pl_PL     varchar(100) null,
    pt_PT     varchar(100) null,
    pt_BR     varchar(100) null,
    ru_RU     varchar(100) null,
    ko_KR     varchar(100) null,
    zh_TW     varchar(100) null,
    constraint speciesId_UNIQUE
        unique (speciesId),
    constraint fk_pet_name_locale_pets1
        foreign key (speciesId) references pets (speciesId)
)
    engine = InnoDB
    charset = utf8;

create index fk_pet_name_locale_pets1_idx
    on pet_name_locale (speciesId);

create table professions
(
    id        int                                   not null
        primary key,
    icon      varchar(128)                          null,
    type      varchar(45)                           null,
    timestamp timestamp default current_timestamp() null
)
    engine = InnoDB
    charset = utf8;

create table professionSkillTiers
(
    id           int not null
        primary key,
    professionId int not null,
    min          int null,
    max          int null,
    constraint fk_professionSkillTiers_professions1
        foreign key (professionId) references professions (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_professionSkillTiers_professions1_idx
    on professionSkillTiers (professionId);

create table professionSkillTiersName
(
    id    int          not null,
    en_GB varchar(512) null,
    en_US varchar(512) null,
    de_DE varchar(512) null,
    es_ES varchar(512) null,
    es_MX varchar(512) null,
    fr_FR varchar(512) null,
    it_IT varchar(512) null,
    pl_PL varchar(512) null,
    pt_PT varchar(512) null,
    pt_BR varchar(512) null,
    ru_RU varchar(512) null,
    ko_KR varchar(512) null,
    zh_TW varchar(512) null,
    zh_CN varchar(512) null,
    constraint fk_professionSkillTiersName_professionSkillTiers1
        foreign key (id) references professionSkillTiers (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_professionSkillTiersName_professionSkillTiers1_idx
    on professionSkillTiersName (id);

alter table professionSkillTiersName
    add primary key (id);

create table professionsDescription
(
    id    int          not null,
    en_GB varchar(512) null,
    en_US varchar(512) null,
    de_DE varchar(512) null,
    es_ES varchar(512) null,
    es_MX varchar(512) null,
    fr_FR varchar(512) null,
    it_IT varchar(512) null,
    pl_PL varchar(512) null,
    pt_PT varchar(512) null,
    pt_BR varchar(512) null,
    ru_RU varchar(512) null,
    ko_KR varchar(512) null,
    zh_TW varchar(512) null,
    zh_CN varchar(512) null,
    constraint fk_professionsName_professions10
        foreign key (id) references professions (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_professionsName_professions1_idx
    on professionsDescription (id);

alter table professionsDescription
    add primary key (id);

create table professionsName
(
    id    int          not null,
    en_GB varchar(512) null,
    en_US varchar(512) null,
    de_DE varchar(512) null,
    es_ES varchar(512) null,
    es_MX varchar(512) null,
    fr_FR varchar(512) null,
    it_IT varchar(512) null,
    pl_PL varchar(512) null,
    pt_PT varchar(512) null,
    pt_BR varchar(512) null,
    ru_RU varchar(512) null,
    ko_KR varchar(512) null,
    zh_TW varchar(512) null,
    zh_CN varchar(512) null,
    constraint fk_professionsName_professions1
        foreign key (id) references professions (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_professionsName_professions1_idx
    on professionsName (id);

alter table professionsName
    add primary key (id);

create table recipes
(
    id                    int                                   not null
        primary key,
    icon                  varchar(128)                          null,
    `rank`                int                                   null,
    craftedItemId         int                                   null,
    hordeCraftedItemId    int                                   null,
    allianceCraftedItemId int                                   null,
    minCount              int       default 1                   not null,
    maxCount              int                                   null,
    procRate              float     default 1                   null,
    timestamp             timestamp default current_timestamp() not null,
    professionSkillTierId int                                   null,
    type                  varchar(128)                          null,
    constraint fk_recipes_new_professionSkillTiers1
        foreign key (professionSkillTierId) references professionSkillTiers (id)
)
    engine = InnoDB
    charset = utf8;

create table reagents
(
    recipeId   int                  not null,
    itemId     int                  not null,
    quantity   int                  not null,
    isOptional tinyint(1) default 0 not null,
    primary key (recipeId, itemId),
    constraint fk_reagent_recipe1
        foreign key (recipeId) references recipes (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_reagent_recipe1_idx
    on reagents (recipeId);

create index fk_recipes_new_professionSkillTiers1_idx
    on recipes (professionSkillTierId);

create table recipesBonusId
(
    bonusId  int not null,
    recipeId int not null,
    primary key (bonusId, recipeId),
    constraint fk_recipes_has_bonus_id
        foreign key (recipeId) references recipes (id)
)
    engine = InnoDB
    charset = utf8;

create table recipesClassic
(
    id                    int                                   not null
        primary key,
    spellId               int                                   not null,
    name                  varchar(512)                          null,
    icon                  varchar(128)                          null,
    `rank`                int                                   null,
    craftedItemId         int                                   null,
    hordeCraftedItemId    int                                   null,
    allianceCraftedItemId int                                   null,
    minCount              int       default 1                   not null,
    maxCount              int                                   null,
    procRate              float     default 1                   null,
    timestamp             timestamp default current_timestamp() not null,
    professionId          int                                   null,
    professionSkillTierId int                                   null,
    type                  varchar(128)                          null,
    constraint fk_recipesClassic_new_professionSkillTiers
        foreign key (professionSkillTierId) references professionSkillTiers (id),
    constraint fk_recipesClassic_profession
        foreign key (professionId) references professions (id)
)
    engine = InnoDB
    charset = utf8;

create table reagentsClassic
(
    recipeId   int                  not null,
    itemId     int                  not null,
    quantity   int                  not null,
    isOptional tinyint(1) default 0 not null,
    primary key (recipeId, itemId),
    constraint fk_reagentClassic_recipeClassic_classic
        foreign key (recipeId) references recipesClassic (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_reagent_recipe1_idx
    on reagentsClassic (recipeId);

create index fk_recipesClassic_new_professionSkillTiers1_idx
    on recipesClassic (professionSkillTierId);

create index fk_recipesClassic_profession_idx
    on recipesClassic (professionId);

create table recipesClassicName
(
    id    int          not null,
    en_GB varchar(512) null,
    en_US varchar(512) null,
    de_DE varchar(512) null,
    es_ES varchar(512) null,
    es_MX varchar(512) null,
    fr_FR varchar(512) null,
    it_IT varchar(512) null,
    pl_PL varchar(512) null,
    pt_PT varchar(512) null,
    pt_BR varchar(512) null,
    ru_RU varchar(512) null,
    ko_KR varchar(512) null,
    zh_TW varchar(512) null,
    zh_CN varchar(512) null,
    constraint fk_recipesClassicName_recipe
        foreign key (id) references recipesClassic (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_recipesClassicName_recipesClassicName_idx
    on recipesClassicName (id);

alter table recipesClassicName
    add primary key (id);

create table recipesDescription
(
    id    int          not null,
    en_GB varchar(512) null,
    en_US varchar(512) null,
    de_DE varchar(512) null,
    es_ES varchar(512) null,
    es_MX varchar(512) null,
    fr_FR varchar(512) null,
    it_IT varchar(512) null,
    pl_PL varchar(512) null,
    pt_PT varchar(512) null,
    pt_BR varchar(512) null,
    ru_RU varchar(512) null,
    ko_KR varchar(512) null,
    zh_TW varchar(512) null,
    zh_CN varchar(512) null,
    constraint fk_recipeName_recipe0
        foreign key (id) references recipes (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_recipeName_recipe_idx
    on recipesDescription (id);

alter table recipesDescription
    add primary key (id);

create table recipesModifiedCraftingSlot
(
    id        int not null,
    recipeId  int not null,
    sortOrder int not null,
    primary key (id, recipeId),
    constraint idx_recipes_modified_crafting_slot_recipe_id
        foreign key (recipeId) references recipes (id)
)
    engine = InnoDB
    charset = utf8;

create index idx_recipes_modified_crafting_slot_recipe_id_idx
    on recipesModifiedCraftingSlot (recipeId);

create table recipesName
(
    id    int          not null,
    en_GB varchar(512) null,
    en_US varchar(512) null,
    de_DE varchar(512) null,
    es_ES varchar(512) null,
    es_MX varchar(512) null,
    fr_FR varchar(512) null,
    it_IT varchar(512) null,
    pl_PL varchar(512) null,
    pt_PT varchar(512) null,
    pt_BR varchar(512) null,
    ru_RU varchar(512) null,
    ko_KR varchar(512) null,
    zh_TW varchar(512) null,
    zh_CN varchar(512) null,
    constraint fk_recipeName_recipe
        foreign key (id) references recipes (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_recipeName_recipe_idx
    on recipesName (id);

alter table recipesName
    add primary key (id);

create table zoneTerritory
(
    id    int          not null
        primary key,
    en_GB varchar(100) not null,
    en_US varchar(100) not null,
    de_DE varchar(100) not null,
    es_ES varchar(100) not null,
    es_MX varchar(100) not null,
    fr_FR varchar(100) not null,
    it_IT varchar(100) not null,
    pl_PL varchar(100) not null,
    pt_PT varchar(100) not null,
    pt_BR varchar(100) not null,
    ru_RU varchar(100) not null,
    ko_KR varchar(100) not null,
    zh_TW varchar(100) not null
)
    engine = InnoDB
    charset = utf8;

create table zoneType
(
    id    int          not null
        primary key,
    en_GB varchar(100) not null,
    en_US varchar(100) not null,
    de_DE varchar(100) not null,
    es_ES varchar(100) not null,
    es_MX varchar(100) not null,
    fr_FR varchar(100) not null,
    it_IT varchar(100) not null,
    pl_PL varchar(100) not null,
    pt_PT varchar(100) not null,
    pt_BR varchar(100) not null,
    ru_RU varchar(100) not null,
    ko_KR varchar(100) not null,
    zh_TW varchar(100) not null
)
    engine = InnoDB
    charset = utf8;

create table zone
(
    id          int                                   not null
        primary key,
    territoryId int                                   not null,
    typeId      int                                   not null,
    parentId    int                                   null,
    minLevel    varchar(45)                           not null,
    maxLevel    varchar(45)                           not null,
    timestamp   timestamp default current_timestamp() not null on update current_timestamp(),
    constraint fk_zone_territory10
        foreign key (territoryId) references zoneTerritory (id),
    constraint fk_zone_zone10
        foreign key (parentId) references zone (id),
    constraint fk_zone_zoneType10
        foreign key (typeId) references zoneType (id)
)
    engine = InnoDB
    charset = utf8;

create table npc
(
    id          int                                   not null
        primary key,
    isAlliance  tinyint   default 0                   not null,
    isHorde     tinyint   default 0                   not null,
    minLevel    int                                   null,
    maxLevel    int                                   null,
    zoneId      int                                   null,
    expansionId int       default -1                  not null,
    patch       varchar(45)                           null,
    timestamp   timestamp default current_timestamp() not null on update current_timestamp(),
    constraint fk_npc_zone1
        foreign key (zoneId) references zone (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_npc_zone1_idx
    on npc (zoneId);

create table npcCoordinates
(
    id        int                                   not null,
    x         double                                not null,
    y         double                                not null,
    timestamp timestamp default current_timestamp() not null on update current_timestamp(),
    primary key (id, x, y),
    constraint fk_npcCoordinates_npc1
        foreign key (id) references npc (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_npcCoordinates_npc1_idx
    on npcCoordinates (id);

create table npcDrops
(
    id         int                                   not null,
    npcId      int                                   not null,
    dropped    int                                   not null,
    outOf      int                                   not null,
    dropChance float                                 not null,
    timestamp  timestamp default current_timestamp() not null on update current_timestamp(),
    constraint fk_items_has_npc_npc2
        foreign key (npcId) references npc (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_items_has_npc_npc2_idx
    on npcDrops (npcId);

create table npcName
(
    id    int          not null
        primary key,
    en_GB varchar(100) not null,
    en_US varchar(100) not null,
    de_DE varchar(100) not null,
    es_ES varchar(100) not null,
    es_MX varchar(100) not null,
    fr_FR varchar(100) not null,
    it_IT varchar(100) not null,
    pl_PL varchar(100) not null,
    pt_PT varchar(100) not null,
    pt_BR varchar(100) not null,
    ru_RU varchar(100) not null,
    ko_KR varchar(100) not null,
    zh_TW varchar(100) not null,
    constraint fk_npcName_npc1
        foreign key (id) references npc (id)
)
    engine = InnoDB
    charset = utf8;

create table npcSells
(
    id        int                                   not null,
    npcId     int                                   not null,
    standing  int                                   null,
    stock     int                                   not null,
    price     int                                   not null,
    unitPrice int                                   not null,
    stackSize int                                   not null,
    currency  int                                   null,
    timestamp timestamp default current_timestamp() not null on update current_timestamp(),
    primary key (id, npcId),
    constraint fk_items_has_npc_npc1
        foreign key (npcId) references npc (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_items_has_npc_npc1_idx
    on npcSells (npcId);

create table npcSkins
(
    id         int                                   not null,
    npcId      int                                   not null,
    dropped    int                                   null,
    outOf      int                                   null,
    dropChance float                                 null,
    timestamp  timestamp default current_timestamp() null on update current_timestamp(),
    primary key (id, npcId),
    constraint fk_skinns_has_npc
        foreign key (npcId) references npc (id)
)
    engine = InnoDB
    charset = utf8;

create table npcTag
(
    id    int          not null
        primary key,
    en_GB varchar(100) not null,
    en_US varchar(100) not null,
    de_DE varchar(100) not null,
    es_ES varchar(100) not null,
    es_MX varchar(100) not null,
    fr_FR varchar(100) not null,
    it_IT varchar(100) not null,
    pl_PL varchar(100) not null,
    pt_PT varchar(100) not null,
    pt_BR varchar(100) not null,
    ru_RU varchar(100) not null,
    ko_KR varchar(100) not null,
    zh_TW varchar(100) not null,
    constraint fk_npcTag_npc1
        foreign key (id) references npc (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_zone_territory1_idx
    on zone (territoryId);

create index fk_zone_zone1_idx
    on zone (parentId);

create index fk_zone_zoneType1_idx
    on zone (typeId);

create table zoneName
(
    id    int          not null,
    en_GB varchar(100) not null,
    en_US varchar(100) not null,
    de_DE varchar(100) not null,
    es_ES varchar(100) not null,
    es_MX varchar(100) not null,
    fr_FR varchar(100) not null,
    it_IT varchar(100) not null,
    pl_PL varchar(100) not null,
    pt_PT varchar(100) not null,
    pt_BR varchar(100) not null,
    ru_RU varchar(100) not null,
    ko_KR varchar(100) not null,
    zh_TW varchar(100) not null,
    constraint fk_zoneName_zone1
        foreign key (id) references zone (id)
)
    engine = InnoDB
    charset = utf8;

create index fk_zoneName_zone1_idx
    on zoneName (id);

alter table zoneName
    add primary key (id);