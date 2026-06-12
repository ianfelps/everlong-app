import React, { type ReactNode } from 'react';

const MARKDOWN_MARKERS = ['**', '__', '*', '_'] as const;

function findClosingMarker(text: string, marker: string, start: number) {
  let index = start;

  while (index < text.length) {
    const closingIndex = text.indexOf(marker, index);

    if (closingIndex === -1) return -1;

    let markerIndex = closingIndex;

    if (marker.length === 2) {
      let markerRunEnd = closingIndex + marker.length;

      while (text[markerRunEnd] === marker[0]) markerRunEnd += 1;
      markerIndex = markerRunEnd - marker.length;
    }

    if (markerIndex > start && text[markerIndex - 1] !== '\\') return markerIndex;

    index = closingIndex + marker.length;
  }

  return -1;
}

export function renderInlineMarkdown(text: string, keyPrefix = 'markdown'): ReactNode[] {
  const nodes: ReactNode[] = [];
  let plainTextStart = 0;
  let index = 0;

  while (index < text.length) {
    const marker = MARKDOWN_MARKERS.find((candidate) => text.startsWith(candidate, index));

    if (!marker || (index > 0 && text[index - 1] === '\\')) {
      index += 1;
      continue;
    }

    const contentStart = index + marker.length;
    const closingIndex = findClosingMarker(text, marker, contentStart);

    if (closingIndex === -1 || closingIndex === contentStart) {
      index += marker.length;
      continue;
    }

    if (plainTextStart < index) nodes.push(text.slice(plainTextStart, index));

    const content = renderInlineMarkdown(
      text.slice(contentStart, closingIndex),
      `${keyPrefix}-${nodes.length}`,
    );
    const key = `${keyPrefix}-${nodes.length}`;

    nodes.push(
      marker.length === 2 ? (
        <strong key={key}>{content}</strong>
      ) : (
        <em key={key}>{content}</em>
      ),
    );

    index = closingIndex + marker.length;
    plainTextStart = index;
  }

  if (plainTextStart < text.length) nodes.push(text.slice(plainTextStart));

  return nodes;
}
