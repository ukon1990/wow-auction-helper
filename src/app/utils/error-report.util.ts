import { Angulartics2 } from "angulartics2";
import { HttpErrorResponse } from "@angular/common/http";

export class ErrorReport {
  public static sendHttpError(error: HttpErrorResponse, ga: Angulartics2): void {
    ga.eventTrack.next({
      action: `${error.status} - ${error.statusText}`,
      properties: { category: 'Errors', label: error.url },
    });
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
