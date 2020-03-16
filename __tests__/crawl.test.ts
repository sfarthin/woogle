import nock from 'nock';
import crawl from '../crawl';
import Queue from '../queue';
import Worker from '../worker';

nock('https://stevefar.com')
  .persist() // <-- persist past the first request
  .defaultReplyHeaders({
    'Content-Type': 'text/html'
  })
  .get('/')
  .reply(
    200,
    `
      <title>Hello There</title>
      <a href="/page1">Page 1</a>
      <a href="//stevefar.com/page2">Page 2</a>
    
      `
  )

  .get('/page1')
  .reply(
    200,
    `
        <title>Page 1</title>
        <a href="./page3">Page 3</a>
      `
  )

  .get('/page2')
  .reply(
    200,
    `
        <title>Page 2</title>
        <a href="./page1">Page 1</a>
      `
  )

  .get('/page3')
  .reply(
    200,
    `
        <title>Page 3</title>
        <a></a>
        <a href="/page1#asdsadasd">Page 1</a>
        <a href="//stevefar.com/page2/">Page 2</a>
        <a href="https://stevefar.com">Home</a>
      `
  );

const expectedResult = [
  {
    url: 'https://stevefar.com',
    title: 'Hello There',
    links: ['https://stevefar.com/page1', 'https://stevefar.com/page2']
  },
  {
    url: 'https://stevefar.com/page1',
    title: 'Page 1',
    links: ['https://stevefar.com/page3']
  },
  {
    url: 'https://stevefar.com/page2',
    title: 'Page 2',
    links: ['https://stevefar.com/page1']
  },
  {
    url: 'https://stevefar.com/page3',
    title: 'Page 3',
    links: [
      'https://stevefar.com/page1',
      'https://stevefar.com/page2',
      'https://stevefar.com'
    ]
  }
];

test('Can find title and link for a single page', async () => {
  const page = await crawl('https://stevefar.com');

  expect(page).toEqual({
    url: 'https://stevefar.com',
    title: 'Hello There',
    links: ['https://stevefar.com/page1', 'https://stevefar.com/page2']
  });
});

/**
 * Write a crawler program that, when given a url and an integer limit, crawls the url, any links
 * on the page, any links on those pages, and so on and so forth. For each crawled url, output the
 * url and the page title. Your program should not crawl pages more than the limit.
 */
test('Stage 1 - crawl all pages', async () => {
  const queue = Queue();

  queue.enqueue(['https://stevefar.com']);

  // Create a worker iterator
  const pages = Worker(queue, crawl);

  const results = [];
  for await (let page of pages) {
    results.push(page);
  }

  expect(results).toEqual(expectedResult);
});

test('Stage 1 - hit limit', async () => {
  const queue = Queue(3);

  queue.enqueue(['https://stevefar.com']);

  // Create a worker iterator
  const pages = Worker(queue, crawl);

  const results = [];
  for await (let page of pages) {
    results.push(page);
  }

  expect(results).toEqual(expectedResult.slice(0, 3));
});

test('Stage 2 - crawl all pages', async () => {
  const queue = Queue();

  queue.enqueue(['https://stevefar.com']);

  const pages = Worker(queue, crawl, 2);

  const results = [];
  for await (let page of pages) {
    results.push(page);
  }

  expect(results).toEqual(expectedResult);
});

test('Stage 2 - hit limit', async () => {
  // Lets create a queue with a limit of 3 pages.
  const queue = Queue(3);

  queue.enqueue(['https://stevefar.com']);

  const pages = Worker(queue, crawl, 20);

  const results = [];
  for await (let page of pages) {
    results.push(page);
  }

  expect(results).toEqual(expectedResult.slice(0, 3));
});
