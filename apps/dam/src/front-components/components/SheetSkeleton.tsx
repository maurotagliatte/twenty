import { useTheme } from 'twenty-ui/theme';

type SheetSkeletonProps = {
  variant: 'document' | 'slide';
  caption: string | null;
};

const DOCUMENT_LINE_WIDTHS = ['58%', '38%', '86%', '74%', '80%'];

export const SheetSkeleton = ({ variant, caption }: SheetSkeletonProps) => {
  const theme = useTheme();
  const bar = (width: string, height = '8px') => ({
    width,
    height,
    borderRadius: '4px',
    background: theme.background.transparent.medium,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '14% 12% 0',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {variant === 'document' ? (
        DOCUMENT_LINE_WIDTHS.map((width, index) => (
          <div key={index} style={bar(width, index === 0 ? '12px' : '8px')} />
        ))
      ) : (
        <>
          <div style={bar('70%', '14px')} />
          <div style={bar('44%')} />
          <div
            style={{
              ...bar('100%', '40%'),
              marginTop: '6px',
              borderRadius: theme.border.radius.sm,
            }}
          />
        </>
      )}
      {caption !== null && (
        <span
          style={{
            marginTop: 'auto',
            paddingBottom: '18%',
            fontSize: theme.font.size.xs,
            fontWeight: theme.font.weight.medium,
            textTransform: 'uppercase',
            color: theme.font.color.tertiary,
          }}
        >
          {caption}
        </span>
      )}
    </div>
  );
};
