import {GameBuildVersion} from '../../shared/enum';

export interface AHDumpResponse {
    url: string;
    lastModified: number;
    gameBuild?: GameBuildVersion;
}