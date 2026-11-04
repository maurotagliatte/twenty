export type RichTextBody = {
  tiptap?: string | null;
  markdown?: string | null;
  blocknote?: string | null;
};

export type RichTextNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};

export type ParsedRichTextBody =
  | { kind: 'document'; document: RichTextNode }
  | { kind: 'markdown'; markdown: string }
  | { kind: 'empty' };

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isRichTextNode = (value: unknown): value is RichTextNode =>
  isPlainRecord(value) && typeof value.type === 'string';

const parseTipTapDocument = (serialized: string) => {
  try {
    const parsed: unknown = JSON.parse(serialized);

    return isRichTextNode(parsed) && parsed.type === 'doc' ? parsed : undefined;
  } catch {
    return undefined;
  }
};

// The server derives tiptap and markdown on every write; markdown only covers records written before that.
export const parseRichTextBody = (
  body: RichTextBody | null | undefined,
): ParsedRichTextBody => {
  const document =
    typeof body?.tiptap === 'string' && body.tiptap.length > 0
      ? parseTipTapDocument(body.tiptap)
      : undefined;

  if (document !== undefined && (document.content?.length ?? 0) > 0) {
    return { kind: 'document', document };
  }

  const markdown = body?.markdown?.trim();

  if (markdown !== undefined && markdown.length > 0) {
    return { kind: 'markdown', markdown };
  }

  return { kind: 'empty' };
};

export const getChildNodes = (node: RichTextNode): RichTextNode[] =>
  Array.isArray(node.content) ? node.content.filter(isRichTextNode) : [];
