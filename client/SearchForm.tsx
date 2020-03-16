import React, { useState } from 'react';

export default function SearchForm({
  search
}: {
  search: ({}: { limit: number; url: string }) => void;
}) {
  // These are the draft
  const [draftLimit, setDraftLimit] = useState(20);
  const [draftUrl, setDraftUrl] = useState('');

  return (
    <form
      style={{ padding: '20px 0' }}
      onSubmit={async e => {
        e.preventDefault();
        search({ limit: draftLimit, url: draftUrl });
      }}
    >
      <h1 style={{ paddingBottom: 10 }}>Web Crawler</h1>
      <input
        type="text"
        placeholder="Full URL"
        value={draftUrl}
        onChange={e => setDraftUrl(e.target.value)}
        style={{ fontSize: 18, width: 300, marginRight: 10 }}
      />
      <input
        type="number"
        placeholder="Limit"
        min={1}
        max={50}
        value={draftLimit}
        onChange={e => setDraftLimit(Number(e.target.value))}
        style={{ fontSize: 18, marginRight: 10 }}
      />
      <button type="submit" style={{ fontSize: 18 }}>
        Crawl
      </button>
    </form>
  );
}
