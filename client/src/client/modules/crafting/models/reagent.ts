import {Recipe} from './recipe';
import {Reagent as APIReagent} from '../../../../../../api/src/recipe/model';

export class Reagent extends APIReagent {
  name: string;
  dropped: boolean;
  intermediateEligible?: boolean;
  recipe?: Recipe;
  avgPrice?: number;
  intermediateCount = 0;

  constructor(private itemId?: number, private quantityNeeded?: number) {
    super();
    this.id = itemId;
    this.quantity = quantityNeeded;
  }
}
