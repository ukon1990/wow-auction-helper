import {Faction} from "./faction.model";
import {Standing} from "./standing.model";
import {Paragon} from "./paragon.model";

export interface Reputation {
  faction: Faction;
  standing: Standing;
  paragon: Paragon;
}