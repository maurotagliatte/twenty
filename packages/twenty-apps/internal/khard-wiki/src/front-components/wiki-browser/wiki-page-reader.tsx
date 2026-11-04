import { type WikiBrowserStyles } from 'src/front-components/wiki-browser/build-wiki-browser-styles';
import { type WikiPageDetail } from 'src/front-components/wiki-browser/wiki-api';
import { parseRichTextBody } from 'src/utils/rich-text/parse-rich-text-body';
import { renderRichText } from 'src/utils/rich-text/render-rich-text';

type WikiPageReaderProps = {
  page: WikiPageDetail;
  styles: WikiBrowserStyles;
  onOpenRecord: (target: {
    objectNameSingular: string;
    recordId: string;
  }) => void;
};

const formatDate = (value: string | null) =>
  value === null ? null : new Date(value).toLocaleDateString();

export const WikiPageReader = ({
  page,
  styles,
  onOpenRecord,
}: WikiPageReaderProps) => {
  const parsedBody = parseRichTextBody(page.body);
  const updatedAt = formatDate(page.updatedAt);
  const nextReviewAt = formatDate(page.nextReviewAt);

  return (
    <article style={styles.article}>
      <h1 style={styles.title}>
        {page.icon ? `${page.icon} ` : ''}
        {page.title || 'Untitled'}
      </h1>
      <div style={styles.meta}>
        <span>{page.status === 'DRAFT' ? 'Draft' : 'Published'}</span>
        {updatedAt === null ? null : <span>Updated {updatedAt}</span>}
        {nextReviewAt === null ? null : <span>Review by {nextReviewAt}</span>}
        {(page.tags ?? []).length > 0 ? (
          <span>{(page.tags ?? []).join(', ')}</span>
        ) : null}
      </div>
      {parsedBody.kind === 'empty' ? (
        <p style={styles.muted}>
          This page is empty. Use Open to edit to write it.
        </p>
      ) : (
        renderRichText(parsedBody, { styles: styles.richText, onOpenRecord })
      )}
    </article>
  );
};
