import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { renderInlineMarkdown } from './inline-markdown';

function render(text: string) {
  return renderToStaticMarkup(<p>{renderInlineMarkdown(text)}</p>);
}

describe('renderInlineMarkdown', () => {
  it('renders bold and italic markdown', () => {
    expect(render('Um **amor forte** e *bonito*.')).toBe(
      '<p>Um <strong>amor forte</strong> e <em>bonito</em>.</p>',
    );
  });

  it('supports underscore markers and nested formatting', () => {
    expect(render('__Sempre _juntos___')).toBe(
      '<p><strong>Sempre <em>juntos</em></strong></p>',
    );
  });

  it('keeps unmatched markers and HTML as plain text', () => {
    expect(render('Um *texto e <script>alert(1)</script>')).toBe(
      '<p>Um *texto e &lt;script&gt;alert(1)&lt;/script&gt;</p>',
    );
  });
});
