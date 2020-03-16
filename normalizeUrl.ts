import normalizeUrl from 'normalize-url';

// Used to deduplicate URLs
export default (str: string) =>
  normalizeUrl(str, {
    // Lets not duplicate pages for https/http
    forceHttps: true,
    // Lets not duplicate pages based on hash
    stripHash: true
  });
