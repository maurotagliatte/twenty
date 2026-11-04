/// <reference types="vite/client" />
import { NavigationMenuItemType, ViewType } from 'twenty-sdk/define';
import { describe, expect, it } from 'vitest';

import {
  DAM_ASSET_CATEGORY_OPTIONS,
  DAM_ASSET_STATUS_OPTIONS,
} from 'src/constants/dam-asset-options';
import {
  APPROVED_LIBRARY_VIEW_UNIVERSAL_IDENTIFIER,
  DAM_COLLECTION_ASSET_OBJECT_UNIVERSAL_IDENTIFIER,
  DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  REVIEW_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

type Definition<TConfig> = {
  default: { success: boolean; errors: string[]; config: TConfig };
};

type FieldConfig = {
  universalIdentifier: string;
  name: string;
  objectUniversalIdentifier?: string;
  relationTargetObjectMetadataUniversalIdentifier?: string;
  relationTargetFieldMetadataUniversalIdentifier?: string;
  options?: { value: string }[];
};

type ObjectConfig = {
  universalIdentifier: string;
  fields: FieldConfig[];
};

type ViewEntity = {
  universalIdentifier: string;
  fieldMetadataUniversalIdentifier?: string;
  fieldValue?: string;
};

type ViewConfig = {
  universalIdentifier: string;
  objectUniversalIdentifier: string;
  type?: ViewType;
  mainGroupByFieldMetadataUniversalIdentifier?: string;
  fields?: ViewEntity[];
  filters?: ViewEntity[];
  sorts?: ViewEntity[];
  groups?: ViewEntity[];
};

type NavigationMenuItemConfig = {
  universalIdentifier: string;
  type: NavigationMenuItemType;
  folderUniversalIdentifier?: string;
  targetObjectUniversalIdentifier?: string;
};

type RoleConfig = {
  universalIdentifier: string;
  canUpdateAllSettings?: boolean;
  canDestroyAllObjectRecords?: boolean;
  objectPermissions?: {
    objectUniversalIdentifier: string;
    canSoftDeleteObjectRecords?: boolean;
    canDestroyObjectRecords?: boolean;
  }[];
};

const loadConfigs = <TConfig>(
  modules: Record<string, Definition<TConfig>>,
): [string, Definition<TConfig>['default']][] =>
  Object.entries(modules).map(([path, module]) => [path, module.default]);

const OBJECTS = loadConfigs(
  import.meta.glob<Definition<ObjectConfig>>('../objects/*.object.ts', {
    eager: true,
  }),
);
const FIELDS = loadConfigs(
  import.meta.glob<Definition<FieldConfig>>('../fields/*.field.ts', {
    eager: true,
  }),
);
const VIEWS = loadConfigs(
  import.meta.glob<Definition<ViewConfig>>('../views/*.view.ts', {
    eager: true,
  }),
);
const NAVIGATION_MENU_ITEMS = loadConfigs(
  import.meta.glob<Definition<NavigationMenuItemConfig>>(
    '../navigation-menu-items/*.navigation-menu-item.ts',
    { eager: true },
  ),
);
const ROLES = loadConfigs(
  import.meta.glob<Definition<RoleConfig>>('../roles/*.role.ts', {
    eager: true,
  }),
);

const ALL_FIELDS: FieldConfig[] = [
  ...OBJECTS.flatMap(([, { config: object }]) =>
    object.fields.map((field) => ({
      ...field,
      objectUniversalIdentifier: object.universalIdentifier,
    })),
  ),
  ...FIELDS.map(([, { config }]) => config),
];

const findField = (universalIdentifier?: string) =>
  ALL_FIELDS.find((field) => field.universalIdentifier === universalIdentifier);

describe('app definitions', () => {
  it.each([
    ...OBJECTS,
    ...FIELDS,
    ...VIEWS,
    ...NAVIGATION_MENU_ITEMS,
    ...ROLES,
  ])('%s is valid', (_path, definition) => {
    expect(definition.errors).toEqual([]);
    expect(definition.success).toBe(true);
  });

  it('never reuses a universal identifier', () => {
    const identifiers = [
      ...ALL_FIELDS.map((field) => field.universalIdentifier),
      ...OBJECTS.map(([, { config }]) => config.universalIdentifier),
      ...VIEWS.flatMap(([, { config }]) => [
        config.universalIdentifier,
        ...[
          ...(config.fields ?? []),
          ...(config.filters ?? []),
          ...(config.sorts ?? []),
          ...(config.groups ?? []),
        ].map((entity) => entity.universalIdentifier),
      ]),
      ...NAVIGATION_MENU_ITEMS.map(
        ([, { config }]) => config.universalIdentifier,
      ),
      ...ROLES.map(([, { config }]) => config.universalIdentifier),
    ];

    expect(new Set(identifiers).size).toBe(identifiers.length);
  });
});

describe('relations', () => {
  const relationFields = ALL_FIELDS.filter((field) =>
    Boolean(field.relationTargetFieldMetadataUniversalIdentifier),
  );

  it.each(relationFields.map((field) => [field.name, field] as const))(
    '%s has an inverse field pointing back at it',
    (_name, field) => {
      const inverse = findField(
        field.relationTargetFieldMetadataUniversalIdentifier,
      );

      expect(inverse?.objectUniversalIdentifier).toBe(
        field.relationTargetObjectMetadataUniversalIdentifier,
      );
      expect(inverse?.relationTargetFieldMetadataUniversalIdentifier).toBe(
        field.universalIdentifier,
      );
    },
  );
});

describe('views', () => {
  it.each(VIEWS)(
    '%s only references fields of its object',
    (_path, { config }) => {
      const referencedFieldIdentifiers = [
        config.mainGroupByFieldMetadataUniversalIdentifier,
        ...[
          ...(config.fields ?? []),
          ...(config.filters ?? []),
          ...(config.sorts ?? []),
        ].map((entity) => entity.fieldMetadataUniversalIdentifier),
      ].filter(Boolean);

      for (const fieldIdentifier of referencedFieldIdentifiers) {
        expect(findField(fieldIdentifier)?.objectUniversalIdentifier).toBe(
          config.objectUniversalIdentifier,
        );
      }
    },
  );

  const findView = (universalIdentifier: string) =>
    VIEWS.find(
      ([, { config }]) => config.universalIdentifier === universalIdentifier,
    )?.[1].config;

  it('shows one review board column per asset status', () => {
    const reviewBoard = findView(REVIEW_BOARD_VIEW_UNIVERSAL_IDENTIFIER);

    expect(reviewBoard?.type).toBe(ViewType.KANBAN);
    expect(reviewBoard?.groups?.map((group) => group.fieldValue)).toEqual(
      DAM_ASSET_STATUS_OPTIONS.map((option) => option.value),
    );
  });

  it('groups the approved library by every asset category', () => {
    const approvedLibrary = findView(
      APPROVED_LIBRARY_VIEW_UNIVERSAL_IDENTIFIER,
    );

    expect(approvedLibrary?.groups?.map((group) => group.fieldValue)).toEqual(
      DAM_ASSET_CATEGORY_OPTIONS.map((option) => option.value),
    );
  });
});

describe('navigation', () => {
  it('puts every entry inside the DAM & BAM folder', () => {
    const entries = NAVIGATION_MENU_ITEMS.map(
      ([, { config }]) => config,
    ).filter((item) => item.type !== NavigationMenuItemType.FOLDER);

    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.folderUniversalIdentifier).toBe(
        DAM_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
      );
    }
  });

  it('links every user-facing object from the sidebar', () => {
    const linkedObjects = NAVIGATION_MENU_ITEMS.map(
      ([, { config }]) => config.targetObjectUniversalIdentifier,
    );

    for (const [, { config: object }] of OBJECTS) {
      if (
        object.universalIdentifier ===
        DAM_COLLECTION_ASSET_OBJECT_UNIVERSAL_IDENTIFIER
      ) {
        continue;
      }
      expect(linkedObjects).toContain(object.universalIdentifier);
    }
  });
});

describe('roles', () => {
  it.each(ROLES)(
    '%s never destroys records or edits settings',
    (_path, { config }) => {
      expect(config.canUpdateAllSettings).toBe(false);
      expect(config.canDestroyAllObjectRecords).toBe(false);
      for (const permission of config.objectPermissions ?? []) {
        expect(permission.canDestroyObjectRecords).toBe(false);
      }
    },
  );

  it('keeps deletion with brand managers', () => {
    const contributor = ROLES.find(([path]) =>
      path.includes('asset-contributor'),
    )?.[1].config;

    expect(contributor?.objectPermissions?.length).toBeGreaterThan(0);
    for (const permission of contributor?.objectPermissions ?? []) {
      expect(permission.canSoftDeleteObjectRecords).toBe(false);
    }
  });
});
