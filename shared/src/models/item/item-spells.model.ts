import { SpellModel } from '../index';

export class ItemSpells {
    SpellID: number;
    spell: SpellModel;
    Charges: number;
    consumable: boolean;
    Cooldown: number;
    CooldownCategory: number;
    CategoryID: number;
    Trigger: number;
    Text: string;
}