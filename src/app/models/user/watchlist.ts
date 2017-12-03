import { Recipe } from '../crafting/recipe';
import { Item } from '../item/item';

export class Watchlist {
    recipes: Map<number, Recipe> = new Map<number, Recipe>();
    items: Map<number, Item> = new Map<number, Item>();
    groups: any[] = ['Ungrouped'];
}
