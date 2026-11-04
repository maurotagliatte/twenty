import { useTheme } from 'twenty-ui/theme';

import { AssetCard } from 'src/front-components/components/AssetCard';
import { GhostButton } from 'src/front-components/components/GhostButton';
import { StateMessage } from 'src/front-components/components/StateMessage';
import { type DamAssetCard } from 'src/front-components/types/dam-asset.types';

type AssetGridProps = {
  assets: DamAssetCard[];
  isLoading: boolean;
  hasNextPage: boolean;
  errorMessage: string | null;
  emptyMessage: string;
  onLoadMore: () => void;
  onRetry: () => void;
};

export const AssetGrid = ({
  assets,
  isLoading,
  hasNextPage,
  errorMessage,
  emptyMessage,
  onLoadMore,
  onRetry,
}: AssetGridProps) => {
  const theme = useTheme();

  if (errorMessage !== null && assets.length === 0) {
    return (
      <StateMessage message={`Could not load assets: ${errorMessage}`}>
        <GhostButton onClick={onRetry}>Retry</GhostButton>
      </StateMessage>
    );
  }

  if (!isLoading && assets.length === 0) {
    return <StateMessage message={emptyMessage} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[4],
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: theme.spacing[3],
        }}
      >
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: theme.spacing[2],
          color: theme.font.color.tertiary,
          fontSize: theme.font.size.sm,
        }}
      >
        {isLoading && <span>Loading assets…</span>}
        {!isLoading && errorMessage !== null && (
          <GhostButton onClick={onLoadMore}>Retry loading more</GhostButton>
        )}
        {!isLoading && errorMessage === null && hasNextPage && (
          <GhostButton onClick={onLoadMore}>Load more</GhostButton>
        )}
        {!isLoading && !hasNextPage && (
          <span>
            {assets.length} {assets.length === 1 ? 'asset' : 'assets'}
          </span>
        )}
      </div>
    </div>
  );
};
