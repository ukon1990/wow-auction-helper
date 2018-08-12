import { Angulartics2 } from "angulartics2";
import { HttpErrorResponse } from "@angular/common/http";
import { SharedService } from '../services/shared.service';

export class ErrorReport {
  public static sendHttpError(error: HttpErrorResponse, ga: Angulartics2): void {
    if (error.status !== 0 && error.status !== undefined) {
      ga.eventTrack.next({
        action: `${error.status} - ${error.statusText}`,
        properties: {
          category: 'Errors',
          label: `${ error.url } - ${ SharedService.user.realm }@${ SharedService.user.region }`
        },
      });
    }
  }

  public static sendError(functionName: string, error: Error, ga: Angulartics2): void {
    ga.eventTrack.next({
      action: functionName,
      properties: {
        category: 'Errors',
        label: error.message
      },
    });
  }
}
