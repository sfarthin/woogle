import { RequestHandler, json, send } from 'micro';
import { guard, exact, string, number, either } from 'decoders';
import Queue from './queue';
import Worker from './worker';
import crawl from './crawl';
import db from './db';

const verifyRequestType = guard(
  exact({ url: string, limit: number, offset: number })
);

// Lets first check our noSQL db for this URL before we crawl
// it again.
const crawlWithCache = async (url: string) => {
  const cachedPage = await db.get(url);
  if (cachedPage) {
    return cachedPage;
  }

  const page = await crawl(url);
  db.add(page);

  return page;
};

const service: RequestHandler = async (req, res) => {
  // Make certain the input matches the expected request type
  const { url, offset, limit } = verifyRequestType(await json(req));

  // Lets create a queue with a limit
  const queue = Queue(offset + limit);
  queue.enqueue([url]);

  // Lets use a worker that will crawl 5 pages concurrently
  const pages = Worker(queue, crawlWithCache, 5);

  // Lets stream each page one-by-one to client via http://ndjson.org/ protocol
  res.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
  let i = 0;
  for await (let page of pages) {
    // Lets stop processing if the request is aborted.
    // @ts-ignore not in typescript type
    if (req.aborted) {
      break;
    }

    if (i >= offset) {
      res.write(JSON.stringify(page) + '\n');
    }
    i++;
  }

  res.end();
};

export default service;
