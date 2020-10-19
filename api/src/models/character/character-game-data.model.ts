export interface Self {
  href: string;
}

export interface Links {
  self: Self;
}

export interface Gender {
  type: string;
  name: string;
}

export interface Faction {
  type: string;
  name: string;
}

export interface Key {
  href: string;
}

export interface Race {
  key: Key;
  name: string;
  id: number;
}

export interface Key2 {
  href: string;
}

export interface CharacterClass {
  key: Key2;
  name: string;
  id: number;
}

export interface Key3 {
  href: string;
}

export interface ActiveSpec {
  key: Key3;
  name: string;
  id: number;
}

export interface Key4 {
  href: string;
}

export interface Realm {
  key: Key4;
  name: string;
  id: number;
  slug: string;
}

export interface Key5 {
  href: string;
}

export interface Key6 {
  href: string;
}

export interface Realm2 {
  key: Key6;
  name: string;
  id: number;
  slug: string;
}

export interface Faction2 {
  type: string;
  name: string;
}

export interface Guild {
  key: Key5;
  name: string;
  id: number;
  realm: Realm2;
  faction: Faction2;
}

export interface Achievements {
  href: string;
}

export interface Titles {
  href: string;
}

export interface PvpSummary {
  href: string;
}

export interface Encounters {
  href: string;
}

export interface CharacterGameDataMedia {
  _links: {
    self: {
      href: string;
    };
  };
  character: {
    key: Key;
    name: string;
    id: number;
    realm: {
      key: Key;
      name: string;
      id: number;
      slug: string;
    };
  };
  assets: {
    key: string;
    value: string;
  }[];
}

export interface Specializations {
  href: string;
}

export interface Statistics {
  href: string;
}

export interface MythicKeystoneProfile {
  href: string;
}

export interface Equipment {
  href: string;
}

export interface Appearance {
  href: string;
}

export interface Collections {
  href: string;
}

export interface Key7 {
  href: string;
}

export interface ActiveTitle {
  key: Key7;
  name: string;
  id: number;
  display_string: string;
}

export interface Reputations {
  href: string;
}

export interface Quests {
  href: string;
}

export interface AchievementsStatistics {
  href: string;
}

export interface CharacterGameData {
  _links: Links;
  id: number;
  name: string;
  gender: Gender;
  faction: Faction;
  race: Race;
  character_class: CharacterClass;
  active_spec: ActiveSpec;
  realm: Realm;
  guild: Guild;
  level: number;
  experience: number;
  achievement_points: number;
  achievements: Achievements;
  titles: Titles;
  pvp_summary: PvpSummary;
  encounters: Encounters;
  media: CharacterGameDataMedia;
  last_login_timestamp: number;
  average_item_level: number;
  equipped_item_level: number;
  specializations: Specializations;
  statistics: Statistics;
  mythic_keystone_profile: MythicKeystoneProfile;
  equipment: Equipment;
  appearance: Appearance;
  collections: Collections;
  active_title: ActiveTitle;
  reputations: Reputations;
  quests: Quests;
  achievements_statistics: AchievementsStatistics;
}
