# Woogle

Woogle is a Web Crawler built in Typescript and React. Requires node 12+.

The web UI allows the user to provide a URL and a number, a limited number of pages to crawl. Each crawled page is streamed to the client 1-by-1 and displayed in a list. See arch.png.

Obviously, a persisting results in db or cache would make sense, but didn't get to it because of time constraints.

# Run web service locally

```
npm install
npm start
open http://localhost:8080/woogle
```

# Test

- Static types on server and client
- Unit tests to ensure crawler is able to follow all variations of anchor tags.
- Unit tests to ensure concurrent crawlers respect the overall limit.

```
npm test
```
