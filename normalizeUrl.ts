// Useful when you need to display, store, deduplicate, sort, compare, etc, URLs
import normalizeUrl from 'normalize-url';

export default (str: string) =>
  normalizeUrl(str, {
    // Lets not duplicate pages for https/http
    forceHttps: true,
    // Lets not duplicate pages based on hash
    stripHash: true
  });
