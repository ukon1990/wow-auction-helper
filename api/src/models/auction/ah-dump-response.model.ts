import {GameBuildVersion} from '../../../../client/src/client/utils/game-build.util';

export interface AHDumpResponse {
    url: string;
    lastModified: number;
    gameBuild?: GameBuildVersion;
}
