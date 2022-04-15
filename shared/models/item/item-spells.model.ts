import { SpellModel } from '..';

export class ItemSpellsModel {
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