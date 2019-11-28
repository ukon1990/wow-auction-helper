import { Spell } from '../spell';

export class ItemSpells {
    spellId: number;
    spell: Spell;
    nCharges: number;
    consumable: boolean;
    categoryId: number;
    trigger: string;
}
