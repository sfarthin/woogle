import React from 'react';
import { Page } from '../types';

export default function SearchResult({ page }: { page: Page }) {
  return (
    <div key={page.url} style={{ margin: '10px 0' }}>
      <h4
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        <a href={page.url} target="_blank">
          {page.title || 'No Title'}
        </a>
      </h4>
      <h6 style={{ fontSize: 11, fontWeight: 'bold' }}>{page.url}</h6>
    </div>
  );
}
