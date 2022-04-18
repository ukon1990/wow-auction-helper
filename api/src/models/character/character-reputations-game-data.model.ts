import {Key, Reputation} from '../../shared/models';

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

export interface CharacterReputationsGameData {
  _links: Links;
  character: Character;
  reputations: Reputation[];
}