import { type CSSProperties } from 'react';
import { type ThemeType } from 'twenty-ui/theme';

import { type RichTextStyles } from 'src/utils/rich-text/render-rich-text';

export const buildWikiBrowserStyles = (theme: ThemeType) => {
  const styles = {
    root: {
      display: 'flex',
      height: '100%',
      minHeight: 0,
      fontFamily: theme.font.family,
      fontSize: theme.font.size.md,
      color: theme.font.color.primary,
      background: theme.background.primary,
    },
    sidebar: {
      width: '300px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRight: `1px solid ${theme.border.color.light}`,
      background: theme.background.secondary,
      minHeight: 0,
    },
    sidebarHeader: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[2],
      padding: theme.spacing[3],
      borderBottom: `1px solid ${theme.border.color.light}`,
    },
    select: {
      width: '100%',
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      borderRadius: theme.border.radius.sm,
      border: `1px solid ${theme.border.color.medium}`,
      background: theme.background.primary,
      color: theme.font.color.primary,
      fontSize: theme.font.size.md,
    },
    input: {
      width: '100%',
      boxSizing: 'border-box',
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      borderRadius: theme.border.radius.sm,
      border: `1px solid ${theme.border.color.medium}`,
      background: theme.background.primary,
      color: theme.font.color.primary,
      fontSize: theme.font.size.md,
    },
    tree: {
      flex: 1,
      overflowY: 'auto',
      padding: `${theme.spacing[2]} ${theme.spacing[1]}`,
    },
    treeRow: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing[1],
      padding: `${theme.spacing[1]} ${theme.spacing[1]}`,
      borderRadius: theme.border.radius.sm,
      cursor: 'pointer',
      userSelect: 'none',
    },
    treeRowSelected: {
      background: theme.background.transparent.medium,
      fontWeight: theme.font.weight.medium,
    },
    treeToggle: {
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      border: 'none',
      background: 'transparent',
      color: theme.font.color.tertiary,
      cursor: 'pointer',
      padding: 0,
    },
    treeLabel: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
    },
    draftBadge: {
      fontSize: theme.font.size.xs,
      color: theme.font.color.tertiary,
    },
    muted: {
      color: theme.font.color.tertiary,
      padding: theme.spacing[3],
    },
    main: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
    },
    toolbar: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing[2],
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      borderBottom: `1px solid ${theme.border.color.light}`,
    },
    breadcrumb: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing[1],
      color: theme.font.color.tertiary,
      fontSize: theme.font.size.sm,
      flex: 1,
      minWidth: 0,
    },
    breadcrumbLink: {
      border: 'none',
      background: 'transparent',
      color: theme.font.color.secondary,
      cursor: 'pointer',
      padding: 0,
      fontSize: theme.font.size.sm,
    },
    reader: {
      flex: 1,
      overflowY: 'auto',
      padding: `${theme.spacing[6]} ${theme.spacing[8]}`,
    },
    article: {
      maxWidth: '760px',
      margin: '0 auto',
      lineHeight: 1.6,
    },
    title: {
      fontSize: '28px',
      fontWeight: theme.font.weight.semiBold,
      margin: `0 0 ${theme.spacing[2]} 0`,
    },
    meta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme.spacing[3],
      color: theme.font.color.tertiary,
      fontSize: theme.font.size.sm,
      marginBottom: theme.spacing[6],
    },
  } satisfies Record<string, CSSProperties>;

  const richText: RichTextStyles = {
    paragraph: { margin: `0 0 ${theme.spacing[3]} 0` },
    heading: { margin: `${theme.spacing[6]} 0 ${theme.spacing[2]} 0` },
    inlineCode: {
      fontFamily: 'monospace',
      background: theme.background.tertiary,
      borderRadius: theme.border.radius.xs,
      padding: '0 4px',
    },
    codeBlock: {
      fontFamily: 'monospace',
      background: theme.background.tertiary,
      borderRadius: theme.border.radius.sm,
      padding: theme.spacing[3],
      overflowX: 'auto',
      whiteSpace: 'pre',
    },
    blockquote: {
      margin: `0 0 ${theme.spacing[3]} 0`,
      paddingLeft: theme.spacing[3],
      borderLeft: `3px solid ${theme.border.color.medium}`,
      color: theme.font.color.secondary,
    },
    mention: {
      color: theme.font.color.primary,
      background: theme.background.transparent.light,
      borderRadius: theme.border.radius.xs,
      padding: '0 4px',
    },
    table: { borderCollapse: 'collapse', margin: `0 0 ${theme.spacing[3]} 0` },
    tableCell: {
      border: `1px solid ${theme.border.color.medium}`,
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      verticalAlign: 'top',
    },
    image: { maxWidth: '100%', borderRadius: theme.border.radius.sm },
    link: { color: theme.color.blue },
  };

  return { ...styles, richText };
};

export type WikiBrowserStyles = ReturnType<typeof buildWikiBrowserStyles>;
