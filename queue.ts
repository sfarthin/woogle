import normalizeUrl from './normalizeUrl';
import { SimpleQueue } from './types';

/**
 * A "Deferred" Object
 * This is a convenient abstraction to keep track of crawlers who are waiting for a URL to dequeue.
 * See https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred
 */
type Deferred<T> = {
  promise: Promise<T>;
  resolve: (i: T | void) => void;
};

function Defer<T>(): Deferred<T> {
  let resolve;

  const promise: Promise<T> = new Promise(res => {
    resolve = res;
  });

  return {
    promise,
    // @ts-ignore is always defined, but typescript doesn't know.
    resolve
  };
}

/**
 * Using a simple in-memory Queue implementation.
 */
export default function Queue(limit: number | void): SimpleQueue {
  // This is where we store the URLs yet to be processed.
  let queue: string[] = [];

  // To determine if we have reached our limit, we keep track how many
  // URLS are dequeued.
  let numDequeued = 0;

  // We keep track of how many crawlers there are and how many are waiting
  // for a URL to dequeue. Sometimes a crawlers needs to wait for URLs to be enqeueued,
  // before one can be dequeued. If all the crawlers are waiting for an
  // dequeued item then we are done.
  let numCrawlers = 0;
  let deferredCrawlers: Deferred<string>[] = [];

  // Lets keep track of what urls we looked at so we don't cycle,
  // TODO Keeping this in-memory will create a hard limit on the amount
  // of pages we can crawl.
  let visited = new Set();

  return {
    registerCrawlers: (n = 1) => {
      numCrawlers += n;
    },
    unRegisterCrawlers: (n = 1) => {
      numCrawlers -= n;
    },
    enqueue: async newQueuedUrls => {
      // Lets add the new urls to our queue
      // only if we havn't seen it before and
      // if we havn't met our limit.
      for (let url of newQueuedUrls) {
        const normalUrl = normalizeUrl(url);
        const hasMetLimit =
          limit &&
          numDequeued - deferredCrawlers.length + queue.length >= limit;
        if (!hasMetLimit && !visited.has(normalUrl)) {
          queue.push(normalUrl);
          visited.add(normalUrl);
        }
      }

      // Now that we have URLs in our queue, lets
      // hand them off to our idle crawlers
      while (deferredCrawlers.length && queue.length) {
        const deferred = deferredCrawlers.shift();
        const url = queue.shift();

        if (!deferred) {
          // Should never happen, but makes typescript happy
          throw new Error();
        }

        deferred.resolve(url);
      }
    },
    dequeue: async () => {
      numDequeued++;

      if (queue.length) {
        // If there is URLs in our queue,
        // remove the item from the front of array and return it.
        return queue.shift();
      } else {
        // If all our crawlers are waiting for more URLs, then we have
        // done all the crawling we need to do.
        if (numCrawlers === deferredCrawlers.length + 1) {
          for (let defer of deferredCrawlers) {
            defer.resolve();
          }
          return undefined;
        }

        // If there are no URLs currently in our queue, lets defer this
        // until more URLs come in.
        const deferred = Defer<string>();
        deferredCrawlers.push(deferred);
        return deferred.promise;
      }
    }
  };
}
