import React, { useState } from 'react';
import useCrawlStream from './useCrawlStream';
import SearchResult from './SearchResult';
import SearchForm from './SearchForm';

export default function Crawler() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [url, setUrl] = useState('');
  const { isLoading, pages } = useCrawlStream({ url, offset, limit });
  const hasNext = !!pages.length; // TODO next page could be empty
  const hasPrevious = offset !== 0;

  return (
    <div style={{ marginLeft: 20 }}>
      <SearchForm
        search={({ url, limit }) => {
          setOffset(0);
          setUrl(url);
          setLimit(limit);
        }}
      />
      <div>
        {isLoading
          ? 'Searching...'
          : pages.length
          ? `Showing Results ${offset} - ${offset + limit}`
          : url
          ? 'No Results'
          : ''}
      </div>
      <div>
        {hasPrevious ? (
          <button onClick={() => setOffset(offset - limit)}>Previous</button>
        ) : null}
        {hasNext ? (
          <button onClick={() => setOffset(offset + limit)}>Next</button>
        ) : null}
      </div>
      <div>
        {pages.map(p => (
          <SearchResult key={p.url} page={p} />
        ))}
      </div>
    </div>
  );
}
