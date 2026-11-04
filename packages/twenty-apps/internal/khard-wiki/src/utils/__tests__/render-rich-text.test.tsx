import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  parseRichTextBody,
  type RichTextNode,
} from 'src/utils/rich-text/parse-rich-text-body';
import { renderRichText } from 'src/utils/rich-text/render-rich-text';

const documentBody = (content: RichTextNode[]) => ({
  tiptap: JSON.stringify({ type: 'doc', attrs: { schemaVersion: 1 }, content }),
  markdown: 'ignored when tiptap is present',
});

const renderBody = (content: RichTextNode[]) =>
  renderToStaticMarkup(
    <>{renderRichText(parseRichTextBody(documentBody(content)))}</>,
  );

const paragraph = (...content: RichTextNode[]): RichTextNode => ({
  type: 'paragraph',
  content,
});

const text = (value: string, marks?: RichTextNode['marks']): RichTextNode => ({
  type: 'text',
  text: value,
  marks,
});

describe('parseRichTextBody', () => {
  it('prefers the tiptap document', () => {
    expect(parseRichTextBody(documentBody([paragraph(text('Hi'))])).kind).toBe(
      'document',
    );
  });

  it('falls back to markdown when tiptap is missing or broken', () => {
    expect(
      parseRichTextBody({ tiptap: '{not json', markdown: '# Title' }),
    ).toEqual({ kind: 'markdown', markdown: '# Title' });
  });

  it('reports an empty body', () => {
    expect(parseRichTextBody(null).kind).toBe('empty');
    expect(
      parseRichTextBody({
        tiptap: JSON.stringify({ type: 'doc', content: [] }),
      }).kind,
    ).toBe('empty');
  });
});

describe('renderRichText', () => {
  it('renders headings below the page title and inline marks', () => {
    const html = renderBody([
      { type: 'heading', attrs: { level: 1 }, content: [text('Intro')] },
      paragraph(
        text('bold', [{ type: 'bold' }]),
        text(' and '),
        text('code', [{ type: 'code' }]),
      ),
    ]);

    expect(html).toContain('<h2>Intro</h2>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<code>code</code>');
  });

  it('renders lists, task items, tables and code blocks', () => {
    const html = renderBody([
      {
        type: 'bulletList',
        content: [{ type: 'listItem', content: [paragraph(text('one'))] }],
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [paragraph(text('done'))],
          },
        ],
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              { type: 'tableHeader', content: [paragraph(text('Col'))] },
            ],
          },
        ],
      },
      { type: 'codeBlock', content: [text('const a = 1;')] },
    ]);

    expect(html).toContain('<ul><li><p>one</p></li></ul>');
    expect(html).toContain('☑');
    expect(html).toContain('<th><p>Col</p></th>');
    expect(html).toContain('<pre><code>const a = 1;</code></pre>');
  });

  it('escapes text instead of injecting markup', () => {
    const html = renderBody([paragraph(text('<script>alert(1)</script>'))]);

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('never renders raw html nodes', () => {
    const html = renderBody([
      { type: 'html', attrs: { html: '<img src=x onerror=alert(1)>' } },
      {
        type: 'htmlDocument',
        content: [text('<iframe src="https://evil.test"></iframe>')],
      },
      paragraph(text('kept')),
    ]);

    expect(html).toBe('<p>kept</p>');
  });

  it('drops unsafe link and image urls', () => {
    const html = renderBody([
      paragraph(
        text('bad', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }]),
        text('good', [
          { type: 'link', attrs: { href: 'https://example.com/a' } },
        ]),
      ),
      { type: 'image', attrs: { src: 'data:text/html,<script>1</script>' } },
      {
        type: 'image',
        attrs: { src: 'https://example.com/a.png', alt: 'chart' },
      },
    ]);

    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('data:');
    expect(html).toContain(
      '<a href="https://example.com/a" target="_blank" rel="noopener noreferrer">good</a>',
    );
    expect(html).toContain(
      '<img src="https://example.com/a.png" alt="chart"/>',
    );
  });

  it('ignores attributes it does not know about', () => {
    const html = renderBody([
      {
        type: 'paragraph',
        attrs: { onclick: 'alert(1)', style: 'position:fixed' },
        content: [text('plain')],
      },
    ]);

    expect(html).toBe('<p>plain</p>');
  });

  it('opens mentioned records through the callback only for valid targets', () => {
    const onOpenRecord = vi.fn();
    const mentionedRecordId = '3f2b8a3e-1c1d-4f2a-9a55-0d6f7f2a9b10';
    const parsed = parseRichTextBody(
      documentBody([
        paragraph({
          type: 'mentionTag',
          attrs: {
            recordId: mentionedRecordId,
            objectNameSingular: 'wikiPage',
            label: 'Onboarding',
          },
        }),
        paragraph({
          type: 'mentionTag',
          attrs: {
            recordId: 'not-a-uuid',
            objectNameSingular: 'wikiPage',
            label: 'Broken',
          },
        }),
      ]),
    );

    const html = renderToStaticMarkup(
      <>{renderRichText(parsed, { onOpenRecord })}</>,
    );

    expect(html).toContain('role="link"');
    expect(html).toContain('@Onboarding');
    expect(html).toContain('<span>@Broken</span>');
  });

  it('renders legacy markdown as escaped text', () => {
    const html = renderToStaticMarkup(
      <>
        {renderRichText(
          parseRichTextBody({ markdown: 'First <b>para</b>\n\nSecond' }),
        )}
      </>,
    );

    expect(html).toContain('First &lt;b&gt;para&lt;/b&gt;');
    expect(html.match(/<p /g)?.length).toBe(2);
  });
});
