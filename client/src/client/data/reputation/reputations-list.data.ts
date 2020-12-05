import {tortollanSeekers} from './bfa/tortollan-seekers.data';
import {proudmooreAdmiralty} from './bfa/proudmoore-admiralty.data';
import {orderOfEmbers} from './bfa/order-of-embers.data';
import {stormsWake} from './bfa/storms-wake.data';
import {seventhLegion} from './bfa/seventh-legion.data';
import {zandalariEmpire} from './bfa/zandalari-empire.data';
import {talanjisExpedition} from './bfa/talanjis-expedition.data';
import {voldunai} from './bfa/voldunai.data';
import {theHonorbound} from './bfa/the-honorbound.data';
import {theUnshackled} from './bfa/the-unshackeled.data';
import {wavebladeAnkoan} from './bfa/waveblade-ankoan.data';
import {rustboltResistance} from './bfa/rustbolt-resistance.data';
import {theUldumAccord} from './bfa/the-uldum-accord.data';
import {theRajani} from './bfa/the-rajani.data';
import {ReputationVendor} from '../../models/reputation.model';
import {theAscended} from './shadowlands/theAscended.data';
import {theAvowed} from './shadowlands/theAvowed.data';
import {courtOfHarvesters} from './shadowlands/courtOfHarvesters.data';
import {theWildHunt} from './shadowlands/theWildHunt.data';
import {theUndyingArmy} from './shadowlands/theUndyingArmy.data';
import {veNari} from './shadowlands/veNari.data';

export class ReputationVendorsData {
  public static bfa: ReputationVendor[] = [
    rustboltResistance,
    wavebladeAnkoan,
    theUnshackled,
    tortollanSeekers,
    proudmooreAdmiralty,
    orderOfEmbers,
    stormsWake,
    seventhLegion,
    zandalariEmpire,
    talanjisExpedition,
    voldunai,
    theHonorbound,
    theUldumAccord,
    theRajani,
  ];

  public static shadowLands: ReputationVendor[] = [
    theAscended,
    theAvowed,
    courtOfHarvesters,
    theWildHunt,
    theUndyingArmy,
    veNari,
  ];
}
