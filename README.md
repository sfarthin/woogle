# Woogle

Woogle is a Web Crawler built in Typescript and React. Requires node 12+.

The UI allows the user to provide a `URL` and a `limit`. Each crawled page is streamed to the client 1-by-1 and displayed in a list up to the `limit`. A next/back button allows the user to paginate results, each page have size `limit`.

A in-memory MongoDB is used to cache results and multiple pages are crawled at once. See below for architecture details:

![architecture diagram](https://github.com/sfarthin/woogle/blob/master/arch.png?raw=true)

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
