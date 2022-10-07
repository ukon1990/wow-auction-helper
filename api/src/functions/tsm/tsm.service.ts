import {TsmRepository} from '@functions/tsm/tsm.repository';
import {TsmGameVersion, TsmRegionName} from '@functions/tsm/tsm.enum';
import {TsmRegionSimplified} from "@functions/tsm/tsm.model";
import {TextUtil} from "@ukon1990/js-utilities";


export class TsmService {
  private repository: TsmRepository;

  constructor(apiKey: string) {
    this.repository = new TsmRepository(apiKey);
  }

  private getRegions(): Promise<TsmRegionSimplified[]> {
    return new Promise((resolve, reject) => {
      this.repository.getRegionsFromAPI()
        .then(regions => resolve(regions.items.filter(region => {
          if (region.gameVersion === TsmGameVersion.Wrath) {
            return true;
          }
          return region.gameVersion === TsmGameVersion.Retail;
        }).map(({
                  regionId,
                  name,
                  gameVersion,
                  lastModified,
                }) => ({
          regionId,
          lastModified,
          gameVersion: gameVersion === TsmGameVersion.Retail ?
            // I do not intend on supporting any other than the current "Classic" for now
            TsmGameVersion.Retail : TsmGameVersion.Classic,
          region: this.getRegionShort(name),
        }))))
        .catch(reject);
    });
  }

  private getRegionShort(name: string) {
    let region;

    if (TextUtil.contains(name, TsmRegionName.Europe)) {
      region = 'eu';
    }
    if (TextUtil.contains(name, TsmRegionName.Korea)) {
      region = 'kr';
    }
    if (TextUtil.contains(name, TsmRegionName.Korea)) {
      region = 'kr';
    }
    if (TextUtil.contains(name, TsmRegionName.Taiwan)) {
      region = 'tw';
    }
    if (TextUtil.contains(name, TsmRegionName.North_America)) {
      region = 'us';
    }
    return region;
  }

  public updateAllRegions(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const start = +new Date();
      try {
        await this.repository.authorize();
        const regions = await this.getRegions();
        console.log(`Found ${regions.length} regions.`);

        for (const region of regions) {
          const regionStart = +new Date();
          console.log('Starting to update', region);
          const data = await this.repository.getRegionalFromAPI(region.regionId);
          await this.repository.saveToS3(region.gameVersion, region.region, data);
          console.log(
            `Successfully updated ${region.region}/${region.regionId
            } in ${+new Date() - regionStart} ms`
          );
        }
        console.log(`Doen updating in ${+new Date() - start} ms`);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}