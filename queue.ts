import normalizeUrl from './normalizeUrl';
import { SimpleQueue } from './types';

/**
 * Deferred Object
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
export default function Queue(): SimpleQueue {
  let queue: string[] = [];

  // If we have more workers then we have available items in the queue
  let numWorkers = 0;
  let idleWorkers: Deferred<string>[] = [];

  // Lets keep track of what urls we looked at so we don't cycle
  let visited = new Set();

  return {
    registerWorker: () => {
      numWorkers++;
    },
    unRegisterWorker: () => {
      numWorkers--;
    },
    enqueue: async newQueuedUrls => {
      // Lets add the new urls to our queue
      // only if we havn't seen it before
      for (let url of newQueuedUrls) {
        const normalUrl = normalizeUrl(url);
        if (!visited.has(normalUrl)) {
          queue.push(normalUrl);
          visited.add(normalUrl);
        }
      }

      // Now that we have items in our queue, lets
      // trigger our idle workers
      while (idleWorkers.length && queue.length) {
        const idleCrawler = idleWorkers.shift();
        const url = queue.shift();

        if (!idleCrawler) {
          // Should never happen, but makes typescript happy
          throw new Error();
        }

        idleCrawler.resolve(url);
      }
    },
    dequeue: async () => {
      if (queue.length) {
        // If there is URLs in our queue,
        // remove the item from the front of array and return it.
        return queue.shift();
      } else {
        // If all our workers are waiting for more URLs, then we have
        // done all the crawling we need to do.
        if (numWorkers === idleWorkers.length + 1) {
          for (let defer of idleWorkers) {
            defer.resolve();
          }
          return undefined;
        }

        // If there are no URLs currently in our queue, lets defer this
        // request until more URLs come in from the other workers.
        const deferred = Defer<string>();
        idleWorkers.push(deferred);
        return deferred.promise;
      }
    }
  };
}
