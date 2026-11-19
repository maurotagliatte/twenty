import { useTheme } from 'twenty-ui/theme';

export type FilterSelectOption = { value: string; label: string };

type FilterSelectProps = {
  label: string;
  value: string | null;
  options: readonly FilterSelectOption[];
  onChange: (value: string | null) => void;
  allLabel?: string | null;
};

export const FilterSelect = ({
  label,
  value,
  options,
  onChange,
  allLabel = 'All',
}: FilterSelectProps) => {
  const theme = useTheme();

  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[1],
        minWidth: '140px',
        flex: '1 1 140px',
        color: theme.font.color.tertiary,
        fontSize: theme.font.size.xs,
        fontWeight: theme.font.weight.medium,
      }}
    >
      {label}
      <select
        value={value ?? ''}
        onChange={(event) =>
          onChange(event.target.value === '' ? null : event.target.value)
        }
        style={{
          height: '32px',
          padding: `0 ${theme.spacing[2]}`,
          background: theme.background.primary,
          border: `1px solid ${theme.border.color.medium}`,
          borderRadius: theme.border.radius.sm,
          color: theme.font.color.primary,
          fontFamily: theme.font.family,
          fontSize: theme.font.size.md,
        }}
      >
        {allLabel !== null && <option value="">{allLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
