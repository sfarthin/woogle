import combineWorkers from 'combine-async-iterators';
import crawl from './crawl';
import Queue from './queue';
import { SimpleQueue, Page } from './types';

/**
 * A worker pulls URLs from the queue one-by-one and crawls it until there are no more URLS
 * in the queue (aka url = null).
 *
 * The worker is decoupled from the queue so that workers can be scaled horizontally
 * independently (see WorkerPool).
 *
 * A worker is implemented as a async iterator so that the consumer can cancel the progress
 * at any point. This allows the consumer to set hard limits or do a BFS until another
 * URL is found.
 *
 * @param queue
 */
export async function* Worker(queue: SimpleQueue): AsyncIterableIterator<Page> {
  queue.registerWorker();

  let url = await queue.dequeue();

  while (url) {
    const page = await crawl(url);

    yield page;
    queue.enqueue(page.links);

    url = await queue.dequeue();
  }

  queue.unRegisterWorker();
}

/**
 * WorkerPool allows us to crawl multiple pages at once. When a worker finishes
 * it requests the next url off the queue so that the worker load is evenly
 * distributed.
 *
 * @param queue
 * @param numWorkers
 */
export function WorkerPool(queue: SimpleQueue, numWorkers: number) {
  const workers = [...new Array(numWorkers)].map(() => Worker(queue));
  return combineWorkers(...workers);
}
