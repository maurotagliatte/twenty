import { type ReactNode } from 'react';
import { useTheme } from 'twenty-ui/theme';

type PageContainerProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export const PageContainer = ({
  title,
  subtitle,
  children,
}: PageContainerProps) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[4],
        padding: theme.spacing[4],
        boxSizing: 'border-box',
        width: '100%',
        fontFamily: theme.font.family,
        color: theme.font.color.primary,
      }}
    >
      {(title !== undefined || subtitle !== undefined) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing[1],
          }}
        >
          {title !== undefined && (
            <h2
              style={{
                margin: 0,
                fontSize: theme.font.size.xl,
                fontWeight: theme.font.weight.semiBold,
              }}
            >
              {title}
            </h2>
          )}
          {subtitle !== undefined && (
            <span
              style={{
                color: theme.font.color.tertiary,
                fontSize: theme.font.size.md,
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
