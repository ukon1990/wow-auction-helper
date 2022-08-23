import {RealmStatus} from '@shared/models';

export class AuctionHouseStatus extends RealmStatus {
  id: number;
  slug: string;
  name: string;
  connectedTo: string[];
  region: string;
  url: string;
  tsmUrl: string;
  lastModified: number;
  gameBuild: number;
  // isUpdating: number;
  // isActive: number;
  // autoUpdate: number;
  size: number;
  lowestDelay: number;
  avgDelay: number;
  highestDelay: number;
  firstRequested: number;
  lastRequested: number;


  // To check for initial load
  isInitialLoad?: boolean;
  ahTypeIsChanged?: boolean;
}