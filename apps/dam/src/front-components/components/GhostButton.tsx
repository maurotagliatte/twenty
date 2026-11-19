import { type ReactNode } from 'react';
import { useTheme } from 'twenty-ui/theme';

type GhostButtonProps = {
  onClick: () => void;
  children: ReactNode;
};

export const GhostButton = ({ onClick, children }: GhostButtonProps) => {
  const theme = useTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
        background: theme.background.secondary,
        border: `1px solid ${theme.border.color.medium}`,
        borderRadius: theme.border.radius.sm,
        color: theme.font.color.secondary,
        fontFamily: theme.font.family,
        fontSize: theme.font.size.md,
        fontWeight: theme.font.weight.medium,
      }}
    >
      {children}
    </button>
  );
};
