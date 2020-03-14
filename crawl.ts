// Fast, flexible & lean implementation of core jQuery designed specifically for the server.
import cheerio from 'cheerio';

// A light-weight module that brings window.fetch to Node.js
import fetch from 'node-fetch';

// The url.resolve() method resolves full url from relative url.
import { resolve as resolveUrl } from 'url';
import { createWatchCompilerHost } from 'typescript';
import normalizeUrl from './normalizeUrl';
import { Page } from './types';

/**
 * This method crawls a single page. It will work within browser or within Node.js
 *
 * @param url The URL we will crawl
 * @returns url, title if exists and list of links.
 */
export default async function crawl(_url: string): Promise<Page> {
  const url = normalizeUrl(_url);

  const res = await fetch(url, {
    // Lets give each page a max of 5 seconds to load.
    timeout: 5000
  });

  // Throw errors for broken links
  if (res.status < 200 && res.status > 299) {
    throw new Error('non-2xx response to HTTP request');
  }

  // Throw errors for non-HTML pages.
  if (res.headers.get('content-type') === 'text/html') {
    throw new Error('not an HTML page');
  }

  // Now that we know we have successful HTML page,
  // We can run "jQuery"-like queries to get our title
  // and links
  const $ = cheerio.load(await res.text());

  const title = $('title').text() || null;

  const links: string[] = $('a')
    // Transform this set of anchor tags into a JS array
    .toArray()
    // Get the href attribute for each anchor tag
    .map(el => $(el).attr('href') || '')
    // remove any anchor tags that are empty
    .filter(t => t)
    // get full URL from relative href. aka "/page" => "http://domain/page"
    .map(href => normalizeUrl(resolveUrl(url, href)));

  return {
    url,
    title,
    links
  };
}
