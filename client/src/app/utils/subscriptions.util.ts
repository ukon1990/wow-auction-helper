import {Observable, Subscription} from 'rxjs';
import {EventEmitter} from '@angular/core';


export class SubscriptionsUtil {
  private list: Subscription[] = [];
  private map: Map<string, Subscription> = new Map<string, Subscription>();

  public getList(): Subscription[] {
    return this.list;
  }

  public getMap(): Map<string, Subscription> {
    return this.map;
  }

  /**
   * Adds the subscription to an array of subscriptions.
   * There are two optional parameters in the options param.
   *
   * @param emitter
   * @param fun
   * @param options {
   *   @param label Adds the subscription to the map variable, so that you can unsubscribe at that spesific event manually.
   *   @param terminateUponEvent Terminates the subscription on the first event fire
   * }
   */
  public add(
    emitter: EventEmitter<any> | Observable<any>,
    fun: Function,
    options?: {
      id?: string;
      terminateUponEvent?: boolean;
    }): Subscription {

    const s = (emitter as Observable<any>).subscribe((data?: any) => {
      if (options && options.terminateUponEvent) {
        if (s) {
          s.unsubscribe();
        }
      }

      fun(data);
    });
    this.list.push(s);

    if (options && options.id) {
      this.map.set(options.id, s);
    }

    return s;
  }

  public unsubscribe(): void {
    this.list.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
    this.list.length = 0;
  }

  public unsubscribeById(id: string) {
    if (this.map.get(id)) {
      this.map.get(id).unsubscribe();
      this.map.delete(id);
    }
  }
}