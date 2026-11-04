import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { type ThemeType, useTheme } from 'twenty-ui/theme';

import { type PreviewTone } from 'src/front-components/utils/get-preview-tone';

type PreviewCardProps = {
  tone: PreviewTone;
  icon: IconComponent;
  title: string;
  subtitle: ReactNode;
  sheet: ReactNode;
  sheetBackground?: string;
  isStacked?: boolean;
  onOpen: () => void;
};

const toneColor = (theme: ThemeType, tone: PreviewTone, step: 3 | 4 | 11) => {
  const color =
    tone === 'gray'
      ? undefined
      : theme.color[`${tone}${step}` as keyof ThemeType['color']];

  return typeof color === 'string' ? color : theme.background.tertiary;
};

const SHEET_INSET = '12%';

export const PreviewCard = ({
  tone,
  icon: Icon,
  title,
  subtitle,
  sheet,
  sheetBackground,
  isStacked = false,
  onOpen,
}: PreviewCardProps) => {
  const theme = useTheme();
  const backdrop = toneColor(theme, tone, 3);
  const sheetStyle = {
    position: 'absolute',
    left: SHEET_INSET,
    right: SHEET_INSET,
    top: '11%',
    bottom: '-8%',
    overflow: 'hidden',
    borderRadius: theme.border.radius.md,
    border: `1px solid ${theme.border.color.light}`,
    background: sheetBackground ?? theme.background.primary,
    boxShadow: theme.boxShadow.strong,
  } as const;

  return (
    <button
      type="button"
      onClick={onOpen}
      title={title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        padding: 0,
        textAlign: 'left',
        cursor: 'pointer',
        overflow: 'hidden',
        background: theme.background.secondary,
        border: `1px solid ${theme.border.color.medium}`,
        borderRadius: theme.border.radius.md,
        color: theme.font.color.primary,
        fontFamily: theme.font.family,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10',
          overflow: 'hidden',
          background: backdrop,
          borderBottom: `1px solid ${theme.border.color.light}`,
        }}
      >
        {isStacked && (
          <div
            aria-hidden="true"
            style={{
              ...sheetStyle,
              transform: 'rotate(3deg) translate(4%, 2%)',
              background: theme.background.tertiary,
              boxShadow: 'none',
            }}
          />
        )}
        <div style={sheetStyle}>{sheet}</div>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '28%',
            background: `linear-gradient(to bottom, transparent, ${backdrop})`,
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[3],
          padding: theme.spacing[3],
          minWidth: 0,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.border.radius.md,
            background: toneColor(theme, tone, 4),
            color:
              tone === 'gray'
                ? theme.font.color.secondary
                : toneColor(theme, tone, 11),
          }}
        >
          <Icon size={18} stroke={1.6} />
        </span>
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: theme.font.size.md,
              fontWeight: theme.font.weight.medium,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[1],
              fontSize: theme.font.size.sm,
              color: theme.font.color.tertiary,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </span>
        </span>
      </div>
    </button>
  );
};
