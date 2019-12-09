export default function generateUUID() {
  const uuIDPattern = ('' + [1e7] + -1e3 + -4e3 + -8e3 + -1e11);
  return uuIDPattern.replace(/[018]/g, (c: string) =>
    // tslint:disable-next-line:no-bitwise
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}
