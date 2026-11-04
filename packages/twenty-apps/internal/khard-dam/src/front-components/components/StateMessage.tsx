import { type ReactNode } from 'react';
import { useTheme } from 'twenty-ui/theme';

type StateMessageProps = {
  message: string;
  children?: ReactNode;
};

export const StateMessage = ({ message, children }: StateMessageProps) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing[3],
        padding: theme.spacing[10],
        color: theme.font.color.tertiary,
        fontSize: theme.font.size.md,
        textAlign: 'center',
      }}
    >
      <span>{message}</span>
      {children}
    </div>
  );
};
