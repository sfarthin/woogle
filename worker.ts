import Queue from './queue';
import { SimpleQueue, Page } from './types';

/**
 * A worker allows us to crawl multiple pages concurrently until there are no more
 * URLs in the queue. While there are multiple pages being crawled at once, the
 * results are streamed out in the same order. This removes race conditions and
 * makes the result deterministic.
 *
 * It is implemented as a async iterator so that the consumer can cancel the process
 * at any point and stream the output to the client.
 *
 */
export default async function* Worker(
  queue: SimpleQueue,
  crawl: (s: string) => Promise<Page>,
  numCrawlers: number = 1
) {
  queue.registerCrawlers(numCrawlers);

  let queueIsEmpty = false;
  let crawlers: Promise<Page | void>[] = [];

  while (!queueIsEmpty || crawlers.length) {
    /**
     * Dequeue a url for each one of concurrent crawlers
     */
    while (!queueIsEmpty && crawlers.length < numCrawlers) {
      crawlers.push(
        queue.dequeue().then(url => {
          if (!url) {
            queueIsEmpty = true;
            return;
          } else {
            return crawl(url);
          }
        })
      );
    }

    /**
     * Wait for the crawler in the front of the queue to finish.
     */
    if (crawlers.length) {
      try {
        const page = await crawlers.shift();
        if (page) {
          yield page;
          queue.enqueue(page.links);
        }
      } catch (e) {
        // For now if we fail to crawl a URL, just keep going.
        console.error(e);
      }
    }
  }

  queue.unRegisterCrawlers(numCrawlers);
}
