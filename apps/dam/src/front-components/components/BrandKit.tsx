import {
  IconColorSwatch,
  IconMessageCircle,
  IconPhoto,
  IconTypography,
  IconWorld,
} from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { AssetGrid } from 'src/front-components/components/AssetGrid';
import { AssetThumbnail } from 'src/front-components/components/AssetThumbnail';
import { FilterSelect } from 'src/front-components/components/FilterSelect';
import { PageContainer } from 'src/front-components/components/PageContainer';
import { SectionTitle } from 'src/front-components/components/SectionTitle';
import { StateMessage } from 'src/front-components/components/StateMessage';
import { useBrandKit } from 'src/front-components/hooks/use-brand-kit';
import { useNamedRecords } from 'src/front-components/hooks/use-named-records';
import { usePaginatedAssets } from 'src/front-components/hooks/use-paginated-assets';
import { usePickedRecordId } from 'src/front-components/hooks/use-picked-record-id';
import {
  buildDamAssetFilter,
  buildDamAssetOrderBy,
} from 'src/front-components/utils/build-dam-asset-filter';
import { fetchDamAssetPage } from 'src/front-components/utils/fetch-dam-records';
import { getFilePreview } from 'src/front-components/utils/get-file-preview';
import {
  parseBrandColors,
  parseBrandFonts,
} from 'src/front-components/utils/parse-brand-kit';

export const BrandKit = () => {
  const theme = useTheme();
  const { records: brands, isLoading: areBrandsLoading } =
    useNamedRecords('damBrands');
  const {
    recordId: brandId,
    isRecordContext,
    pickRecordId,
  } = usePickedRecordId({
    storageKey: 'dam-bam:brand-kit:brand-id',
    records: brands,
  });
  const { brandKit, isLoading, errorMessage } = useBrandKit(brandId);

  const filter = buildDamAssetFilter({
    brandId,
    status: 'APPROVED',
    category: null,
    kind: null,
    tag: null,
    searchText: '',
    sortDirection: 'DESC',
  });
  const orderBy = buildDamAssetOrderBy('DESC');
  const approvedAssets = usePaginatedAssets(
    brandId === null
      ? null
      : ({ client, after, includeBrand }) =>
          fetchDamAssetPage({ client, filter, orderBy, after, includeBrand }),
    brandId ?? '',
  );

  const colors = parseBrandColors(brandKit?.colors);
  const fonts = parseBrandFonts(brandKit?.fonts);
  const logoPreview = getFilePreview(brandKit?.logo);

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    background: theme.background.primary,
    border: `1px solid ${theme.border.color.medium}`,
    borderRadius: theme.border.radius.md,
    minWidth: 0,
  } as const;

  const picker = !isRecordContext && (
    <div style={{ maxWidth: '320px' }}>
      <FilterSelect
        label="Brand"
        value={brandId}
        options={brands.map((brand) => ({
          value: brand.id,
          label: brand.name,
        }))}
        allLabel={null}
        onChange={pickRecordId}
      />
    </div>
  );

  if (!areBrandsLoading && brandId === null) {
    return (
      <PageContainer>
        <StateMessage message="No brands yet. Create one from the Brands view to see its kit here." />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={isRecordContext ? undefined : brandKit?.name}>
      {picker}
      {errorMessage !== null && (
        <StateMessage message={`Could not load the brand: ${errorMessage}`} />
      )}
      {!isLoading && errorMessage === null && brandKit === null && (
        <StateMessage message="This brand is not available to you." />
      )}
      {brandKit !== null && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: theme.spacing[3],
          }}
        >
          <div style={cardStyle}>
            <SectionTitle Icon={IconPhoto} title="Primary logo" />
            <div
              style={{
                height: '160px',
                background: theme.background.tertiary,
                borderRadius: theme.border.radius.sm,
                overflow: 'hidden',
              }}
            >
              <AssetThumbnail
                preview={logoPreview}
                alt={`${brandKit.name} logo`}
              />
            </div>
            {brandKit.websiteUrl !== null && (
              <a
                href={brandKit.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[1],
                  color: theme.font.color.secondary,
                  fontSize: theme.font.size.sm,
                  textDecoration: 'none',
                }}
              >
                <IconWorld size={14} />
                {brandKit.websiteUrl}
              </a>
            )}
          </div>
          <div style={cardStyle}>
            <SectionTitle Icon={IconColorSwatch} title="Colors" />
            {colors.length === 0 && (
              <span style={{ color: theme.font.color.tertiary }}>
                No colors defined.
              </span>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                gap: theme.spacing[2],
              }}
            >
              {colors.map((color, index) => (
                <div
                  key={`${color.label}-${index}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing[1],
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      height: '48px',
                      borderRadius: theme.border.radius.sm,
                      border: `1px solid ${theme.border.color.medium}`,
                      background: color.hex ?? theme.background.tertiary,
                    }}
                  />
                  <span
                    style={{
                      fontSize: theme.font.size.sm,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {color.label}
                  </span>
                  {color.hex !== null && color.hex !== color.label && (
                    <span
                      style={{
                        fontSize: theme.font.size.xs,
                        color: theme.font.color.tertiary,
                      }}
                    >
                      {color.hex}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <SectionTitle Icon={IconTypography} title="Fonts" />
            {fonts.length === 0 && (
              <span style={{ color: theme.font.color.tertiary }}>
                No fonts defined.
              </span>
            )}
            {fonts.map((font, index) => (
              <div
                key={`${font.family}-${index}`}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <span
                  style={{
                    fontFamily: `"${font.family}", ${theme.font.family}`,
                    fontSize: theme.font.size.xl,
                  }}
                >
                  {font.family}
                </span>
                {font.role !== null && (
                  <span
                    style={{
                      fontSize: theme.font.size.sm,
                      color: theme.font.color.tertiary,
                    }}
                  >
                    {font.role}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={cardStyle}>
            <SectionTitle Icon={IconMessageCircle} title="Tone of voice" />
            <span
              style={{
                whiteSpace: 'pre-wrap',
                color:
                  brandKit.toneOfVoice === null
                    ? theme.font.color.tertiary
                    : theme.font.color.primary,
              }}
            >
              {brandKit.toneOfVoice ?? 'No tone of voice defined.'}
            </span>
          </div>
        </div>
      )}
      {brandKit !== null && (
        <>
          <SectionTitle Icon={IconPhoto} title="Approved assets" />
          <AssetGrid
            assets={approvedAssets.assets}
            isLoading={approvedAssets.isLoading}
            hasNextPage={approvedAssets.hasNextPage}
            errorMessage={approvedAssets.errorMessage}
            emptyMessage="This brand has no approved assets yet."
            onLoadMore={approvedAssets.loadMore}
            onRetry={approvedAssets.reload}
          />
        </>
      )}
    </PageContainer>
  );
};
