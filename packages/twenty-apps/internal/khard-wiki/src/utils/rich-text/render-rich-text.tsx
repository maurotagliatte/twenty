import { type CSSProperties, Fragment, type ReactNode } from 'react';

import {
  getChildNodes,
  type ParsedRichTextBody,
  type RichTextNode,
} from 'src/utils/rich-text/parse-rich-text-body';
import {
  isObjectNameSingular,
  isUuid,
  toSafeImageUrl,
  toSafeLinkUrl,
} from 'src/utils/rich-text/safe-url';

export type RichTextStyles = Partial<
  Record<
    | 'paragraph'
    | 'heading'
    | 'inlineCode'
    | 'codeBlock'
    | 'blockquote'
    | 'mention'
    | 'table'
    | 'tableCell'
    | 'image'
    | 'link'
    | 'taskItem',
    CSSProperties
  >
>;

export type RenderRichTextOptions = {
  styles?: RichTextStyles;
  onOpenRecord?: (target: {
    objectNameSingular: string;
    recordId: string;
  }) => void;
};

const MAX_NESTING_DEPTH = 48;

// Raw HTML and template-only nodes are never rendered: the component must not become an HTML injection vector.
const SKIPPED_NODE_TYPES = new Set([
  'html',
  'htmlDocument',
  'variableTag',
  'skillTag',
  'button',
]);

type HeadingTag = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

// The page title is the h1, so body headings start one level below it.
const toHeadingTag = (level: unknown): HeadingTag => {
  const numericLevel = typeof level === 'number' ? level : 1;
  const clampedLevel = Math.min(Math.max(Math.round(numericLevel) + 1, 2), 6);

  return `h${clampedLevel}` as HeadingTag;
};

const readString = (value: unknown) =>
  typeof value === 'string' ? value : undefined;

const renderText = (
  node: RichTextNode,
  key: string,
  options: RenderRichTextOptions,
): ReactNode => {
  let rendered: ReactNode = node.text ?? '';

  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case 'bold':
        rendered = <strong>{rendered}</strong>;
        break;
      case 'italic':
        rendered = <em>{rendered}</em>;
        break;
      case 'underline':
        rendered = <u>{rendered}</u>;
        break;
      case 'strike':
        rendered = <s>{rendered}</s>;
        break;
      case 'code':
        rendered = <code style={options.styles?.inlineCode}>{rendered}</code>;
        break;
      case 'link': {
        const href = toSafeLinkUrl(mark.attrs?.href);

        if (href !== undefined) {
          rendered = (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={options.styles?.link}
            >
              {rendered}
            </a>
          );
        }
        break;
      }
      default:
        break;
    }
  }

  return <Fragment key={key}>{rendered}</Fragment>;
};

const renderMention = (
  node: RichTextNode,
  key: string,
  options: RenderRichTextOptions,
): ReactNode => {
  const label = readString(node.attrs?.label) ?? '';
  const recordId = node.attrs?.recordId;
  const objectNameSingular = node.attrs?.objectNameSingular;
  const onOpenRecord = options.onOpenRecord;

  if (
    onOpenRecord === undefined ||
    !isUuid(recordId) ||
    !isObjectNameSingular(objectNameSingular)
  ) {
    return (
      <span key={key} style={options.styles?.mention}>
        @{label}
      </span>
    );
  }

  return (
    <span
      key={key}
      role="link"
      tabIndex={0}
      style={{ ...options.styles?.mention, cursor: 'pointer' }}
      onClick={() => onOpenRecord({ objectNameSingular, recordId })}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onOpenRecord({ objectNameSingular, recordId });
        }
      }}
    >
      @{label}
    </span>
  );
};

const renderNode = (
  node: RichTextNode,
  key: string,
  depth: number,
  options: RenderRichTextOptions,
): ReactNode => {
  if (depth > MAX_NESTING_DEPTH || SKIPPED_NODE_TYPES.has(node.type)) {
    return null;
  }

  const children = () =>
    getChildNodes(node).map((child, index) =>
      renderNode(child, `${key}.${index}`, depth + 1, options),
    );
  const styles = options.styles;

  switch (node.type) {
    case 'doc':
    case 'section':
    case 'column':
      return <Fragment key={key}>{children()}</Fragment>;
    case 'columns':
      return (
        <div key={key} style={{ display: 'flex', gap: '16px' }}>
          {getChildNodes(node).map((child, index) => (
            <div key={`${key}.${index}`} style={{ flex: 1, minWidth: 0 }}>
              {renderNode(child, `${key}.${index}.c`, depth + 1, options)}
            </div>
          ))}
        </div>
      );
    case 'paragraph':
      return (
        <p key={key} style={styles?.paragraph}>
          {children()}
        </p>
      );
    case 'heading': {
      const HeadingTagName = toHeadingTag(node.attrs?.level);

      return (
        <HeadingTagName key={key} style={styles?.heading}>
          {children()}
        </HeadingTagName>
      );
    }
    case 'text':
      return renderText(node, key, options);
    case 'hardBreak':
      return <br key={key} />;
    case 'mentionTag':
      return renderMention(node, key, options);
    case 'bulletList':
      return <ul key={key}>{children()}</ul>;
    case 'orderedList': {
      const start = node.attrs?.start;

      return (
        <ol key={key} start={typeof start === 'number' ? start : undefined}>
          {children()}
        </ol>
      );
    }
    case 'listItem':
      return <li key={key}>{children()}</li>;
    case 'taskList':
      return (
        <ul key={key} style={{ listStyle: 'none', paddingLeft: '4px' }}>
          {children()}
        </ul>
      );
    case 'taskItem':
      return (
        <li key={key} style={styles?.taskItem}>
          <span aria-hidden="true">
            {node.attrs?.checked === true ? '☑' : '☐'}
          </span>{' '}
          <span>{children()}</span>
        </li>
      );
    case 'blockquote':
      return (
        <blockquote key={key} style={styles?.blockquote}>
          {children()}
        </blockquote>
      );
    case 'toggle': {
      const [summaryNode, ...detailNodes] = getChildNodes(node);

      return (
        <details key={key}>
          <summary>
            {summaryNode === undefined
              ? null
              : getChildNodes(summaryNode).map((child, index) =>
                  renderNode(child, `${key}.s.${index}`, depth + 1, options),
                )}
          </summary>
          {detailNodes.map((child, index) =>
            renderNode(child, `${key}.d.${index}`, depth + 1, options),
          )}
        </details>
      );
    }
    case 'codeBlock':
      return (
        <pre key={key} style={styles?.codeBlock}>
          <code>
            {getChildNodes(node)
              .map((child) => child.text ?? '')
              .join('')}
          </code>
        </pre>
      );
    case 'divider':
      return <hr key={key} />;
    case 'image': {
      const source = toSafeImageUrl(node.attrs?.src);

      if (source === undefined) {
        return null;
      }

      return (
        <img
          key={key}
          src={source}
          alt={readString(node.attrs?.alt) ?? ''}
          style={styles?.image}
        />
      );
    }
    case 'file': {
      const href = toSafeLinkUrl(node.attrs?.url);
      const name = readString(node.attrs?.name) ?? 'Attachment';

      return (
        <p key={key} style={styles?.paragraph}>
          {href === undefined ? (
            name
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={styles?.link}
            >
              {name}
            </a>
          )}
        </p>
      );
    }
    case 'table':
      return (
        <table key={key} style={styles?.table}>
          <tbody>{children()}</tbody>
        </table>
      );
    case 'tableRow':
      return <tr key={key}>{children()}</tr>;
    case 'tableHeader':
      return (
        <th key={key} style={styles?.tableCell}>
          {children()}
        </th>
      );
    case 'tableCell':
      return (
        <td key={key} style={styles?.tableCell}>
          {children()}
        </td>
      );
    default:
      return <Fragment key={key}>{children()}</Fragment>;
  }
};

const renderMarkdownAsText = (
  markdown: string,
  options: RenderRichTextOptions,
): ReactNode =>
  markdown.split(/\n{2,}/).map((paragraph, index) => (
    <p
      key={`md.${index}`}
      style={{ ...options.styles?.paragraph, whiteSpace: 'pre-wrap' }}
    >
      {paragraph}
    </p>
  ));

export const renderRichText = (
  parsedBody: ParsedRichTextBody,
  options: RenderRichTextOptions = {},
): ReactNode => {
  switch (parsedBody.kind) {
    case 'document':
      return renderNode(parsedBody.document, 'n', 0, options);
    case 'markdown':
      return renderMarkdownAsText(parsedBody.markdown, options);
    case 'empty':
      return null;
  }
};
