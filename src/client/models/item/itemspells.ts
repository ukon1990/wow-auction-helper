import { Spell } from '../spell';

export class ItemSpells {
    SpellID: number;
    spell: Spell;
    Charges: number;
    consumable: boolean;
    Cooldown: number;
    CooldownCategory: number;
    CategoryID: number;
    Trigger: number;
    Text: string;
}
