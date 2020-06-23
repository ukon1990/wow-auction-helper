import {Key} from '../game-data/Key.model';

export interface Self {
  href: string;
}

export interface Links {
  self: Self;
}

export interface Realm {
  key: Key;
  name: string;
  id: number;
  slug: string;
}

export interface Character {
  key: Key;
  name: string;
  id: number;
  realm: Realm;
}

export interface Key3 {
  href: string;
}

export interface Faction {
  key: Key3;
  name: string;
  id: number;
}

export interface Standing {
  raw: number;
  value: number;
  max: number;
  tier: number;
  name: string;
}

export interface Paragon {
  raw: number;
  value: number;
  max: number;
}

export interface Reputation {
  faction: Faction;
  standing: Standing;
  paragon: Paragon;
}

export interface CharacterReputationsGameData {
  _links: Links;
  character: Character;
  reputations: Reputation[];
}
