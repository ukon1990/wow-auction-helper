declare const ga: Function;
export class Error {
    public static handle(message: string, error: Object): void {
        console.error(`${message}:`, error);

        // Reporting error to GA
        ga('send', {
            hitType: 'event',
            eventCategory: 'Error',
            eventAction: `Error: "${message}" - "${error['error']['code']}${error['error']['message']}:"`
          });
    }
}
