import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';

@Injectable()
export class FileService {

  public static saveJSONToFile(json: any, filename: string): void {
    FileSaver.saveAs(
        new Blob([JSON.stringify(json)], {type: 'application/json;charset=utf-8'}),
        filename
      );
  }
}
