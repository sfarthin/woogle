import { useState, useEffect } from 'react';
import { Page } from '../types';

/**
 * Expect streaming body to match http://ndjson.org/.
 * This async iterator transforms the body into JS objects
 * @param reader
 */
async function* ndjson(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncIterable<Page> {
  let result;
  let buffer: string = '';
  while (!result || !result.done) {
    result = await reader.read();

    if (result.value) {
      buffer += new TextDecoder('utf-8').decode(result.value);

      const segments = buffer.split('\n');
      for (let i = 0; i < segments.length - 1; i++) {
        yield JSON.parse(segments[i]);
      }

      buffer = segments[segments.length - 1];
    }
  }

  if (buffer) {
    yield JSON.parse(buffer);
  }
}

export default function useCrawlStream({
  url,
  limit,
  offset
}: {
  url: string;
  limit: number;
  offset: number;
}): {
  pages: Page[];
  isLoading: boolean;
} {
  const [isLoading, setLoading] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    let isAborted = false;

    async function main() {
      setLoading(true);
      setPages([]);

      /**
       * Start streaming results of crawler.
       */
      try {
        let controller = new AbortController();
        const res = await fetch('/api/crawl', {
          method: 'POST',
          signal: controller.signal,
          body: JSON.stringify({ url, limit, offset })
        });

        /**
         * Update state as the new pages come in.
         */
        if (res.body) {
          const reader = ndjson(res.body.getReader());

          for await (let value of reader) {
            setPages(pages => {
              if (!isAborted) {
                return pages.concat(value);
              }
              return pages;
            });
          }
        }
      } catch (e) {
        console.error(e);
      }

      if (!isAborted) {
        setLoading(false);
      }
    }

    if (url) {
      main();
    }

    return () => {
      // Anytime we do another search while a previous one is in process,
      // We want to make sure we abort it.
      try {
        controller.abort();
        isAborted = true;
      } catch (e) {}
    };
  }, [url, limit, offset]);

  return {
    pages,
    isLoading
  };
}
