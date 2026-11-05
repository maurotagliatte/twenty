import { type IconComponent } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

type SectionTitleProps = {
  Icon: IconComponent;
  title: string;
};

export const SectionTitle = ({ Icon, title }: SectionTitleProps) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing[1],
        color: theme.font.color.secondary,
        fontSize: theme.font.size.sm,
        fontWeight: theme.font.weight.semiBold,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      <Icon size={14} />
      {title}
    </div>
  );
};
