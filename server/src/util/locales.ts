/**
 * Sets the locale for the request, if no locale is defined, it will either use en_GB or the users browser locale if possible
 * @param {*} request
 */

export const getLocale = (request: any) => {
    // req.headers['accept-language']
  if (request.query && request.query.locale) {
    return request.query.locale;
  }
  return 'en_GB';
};