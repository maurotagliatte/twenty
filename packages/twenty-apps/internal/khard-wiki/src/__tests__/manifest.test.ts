/// <reference types="vite/client" />
import { NavigationMenuItemType, type ViewType } from 'twenty-sdk/define';
import { describe, expect, it } from 'vitest';

import {
  WIKI_HOME_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  WIKI_HOME_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_FIELDS,
  WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
  WIKI_PAGE_TREE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { WIKI_PAGE_SYSTEM_FIELDS } from 'src/constants/wiki-page-system-fields';

type Definition<TConfig> = {
  default: { success: boolean; errors: string[]; config: TConfig };
};

type FieldConfig = {
  universalIdentifier: string;
  name: string;
  type?: string;
  isSearchable?: boolean;
  objectUniversalIdentifier?: string;
  relationTargetObjectMetadataUniversalIdentifier?: string;
  relationTargetFieldMetadataUniversalIdentifier?: string;
};

type ObjectConfig = {
  universalIdentifier: string;
  nameSingular: string;
  isSearchable?: boolean;
  fields: FieldConfig[];
};

type ViewEntity = {
  universalIdentifier: string;
  fieldMetadataUniversalIdentifier?: string;
  value?: unknown;
};

type ViewConfig = {
  universalIdentifier: string;
  objectUniversalIdentifier: string;
  type?: ViewType;
  fields?: ViewEntity[];
  filters?: ViewEntity[];
  sorts?: ViewEntity[];
};

type NavigationMenuItemConfig = {
  universalIdentifier: string;
  type: NavigationMenuItemType;
  folderUniversalIdentifier?: string;
  targetObjectUniversalIdentifier?: string;
  pageLayoutUniversalIdentifier?: string;
};

type WidgetConfig = {
  universalIdentifier: string;
  type: string;
  configuration: {
    configurationType: string;
    frontComponentUniversalIdentifier?: string;
    fieldMetadataId?: string;
    fieldDisplayMode?: string;
  };
};

type TabConfig = {
  universalIdentifier: string;
  position?: number;
  widgets: WidgetConfig[];
};

type PageLayoutConfig = {
  universalIdentifier: string;
  position?: number;
  pageLayoutUniversalIdentifier?: string;
  type?: string;
  tabs?: TabConfig[];
  widgets?: WidgetConfig[];
};

type FrontComponentConfig = { universalIdentifier: string };

type RoleConfig = {
  universalIdentifier: string;
  canUpdateAllSettings?: boolean;
  canDestroyAllObjectRecords?: boolean;
  canReadAllObjectRecords?: boolean;
  objectPermissions?: {
    objectUniversalIdentifier: string;
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
const PAGE_LAYOUTS = loadConfigs(
  import.meta.glob<Definition<PageLayoutConfig>>('../page-layouts/*.ts', {
    eager: true,
  }),
);
const FRONT_COMPONENTS = loadConfigs(
  import.meta.glob<Definition<FrontComponentConfig>>(
    '../front-components/*.front-component.tsx',
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

const SYSTEM_FIELD_IDENTIFIERS = new Set<string>(
  Object.values(WIKI_PAGE_SYSTEM_FIELDS),
);

const findField = (universalIdentifier?: string) =>
  ALL_FIELDS.find((field) => field.universalIdentifier === universalIdentifier);

const ALL_WIDGETS = PAGE_LAYOUTS.flatMap(([, { config }]) => [
  ...(config.tabs ?? []).flatMap((tab) => tab.widgets),
  ...(config.widgets ?? []),
]);

describe('app definitions', () => {
  it.each([
    ...OBJECTS,
    ...FIELDS,
    ...VIEWS,
    ...NAVIGATION_MENU_ITEMS,
    ...PAGE_LAYOUTS,
    ...FRONT_COMPONENTS,
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
        ].map((entity) => entity.universalIdentifier),
      ]),
      ...NAVIGATION_MENU_ITEMS.map(
        ([, { config }]) => config.universalIdentifier,
      ),
      ...PAGE_LAYOUTS.flatMap(([, { config }]) => [
        config.universalIdentifier,
        ...(config.tabs ?? []).map((tab) => tab.universalIdentifier),
      ]),
      ...ALL_WIDGETS.map((widget) => widget.universalIdentifier),
      ...FRONT_COMPONENTS.map(([, { config }]) => config.universalIdentifier),
      ...ROLES.map(([, { config }]) => config.universalIdentifier),
    ];

    expect(new Set(identifiers).size).toBe(identifiers.length);
  });

  it('prefixes every object API name to avoid tenant collisions', () => {
    for (const [, { config }] of OBJECTS) {
      expect(config.nameSingular.startsWith('wiki')).toBe(true);
      expect(config.isSearchable).toBe(true);
    }
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

  it('models the page hierarchy as a self relation', () => {
    const parentPage = findField(WIKI_PAGE_FIELDS.parentPage);

    expect(parentPage?.relationTargetObjectMetadataUniversalIdentifier).toBe(
      WIKI_PAGE_OBJECT_UNIVERSAL_IDENTIFIER,
    );
  });

  it('keeps the body a searchable rich text field', () => {
    const body = findField(WIKI_PAGE_FIELDS.body);

    expect(body?.type).toBe('RICH_TEXT');
    expect(body?.isSearchable).toBe(true);
  });
});

describe('views', () => {
  it.each(VIEWS)(
    '%s only references fields of its object',
    (_path, { config }) => {
      const referencedFieldIdentifiers = [
        ...(config.fields ?? []),
        ...(config.filters ?? []),
        ...(config.sorts ?? []),
      ]
        .map((entity) => entity.fieldMetadataUniversalIdentifier)
        .filter(
          (identifier): identifier is string =>
            identifier !== undefined &&
            !SYSTEM_FIELD_IDENTIFIERS.has(identifier),
        );

      for (const fieldIdentifier of referencedFieldIdentifiers) {
        expect(findField(fieldIdentifier)?.objectUniversalIdentifier).toBe(
          config.objectUniversalIdentifier,
        );
      }
    },
  );
});

describe('navigation', () => {
  const entries = NAVIGATION_MENU_ITEMS.map(([, { config }]) => config).filter(
    (item) => item.type !== NavigationMenuItemType.FOLDER,
  );

  it('puts every entry inside the Wiki folder', () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.folderUniversalIdentifier).toBe(
        WIKI_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
      );
    }
  });

  it('links every object and the wiki browser from the sidebar', () => {
    const linkedObjects = entries.map(
      (entry) => entry.targetObjectUniversalIdentifier,
    );

    for (const [, { config: object }] of OBJECTS) {
      expect(linkedObjects).toContain(object.universalIdentifier);
    }
    expect(
      entries.map((entry) => entry.pageLayoutUniversalIdentifier),
    ).toContain(WIKI_HOME_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER);
  });
});

describe('page layouts', () => {
  it('renders the wiki browser on a standalone page', () => {
    const browserLayout = PAGE_LAYOUTS.find(
      ([, { config }]) =>
        config.universalIdentifier ===
        WIKI_HOME_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
    )?.[1].config;

    expect(browserLayout?.type).toBe('STANDALONE_PAGE');
    expect(
      browserLayout?.tabs?.[0]?.widgets[0]?.configuration
        .frontComponentUniversalIdentifier,
    ).toBe(WIKI_HOME_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER);
  });

  it('pins the page tree to the left column of the wiki page', () => {
    const recordPageTabs = PAGE_LAYOUTS.map(([, { config }]) => config)
      .filter((config) => config.pageLayoutUniversalIdentifier !== undefined)
      .sort((left, right) => (left.position ?? 0) - (right.position ?? 0));

    expect(
      recordPageTabs[0]?.widgets?.[0]?.configuration
        .frontComponentUniversalIdentifier,
    ).toBe(WIKI_PAGE_TREE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER);
  });

  it('edits the page body with the native rich text editor', () => {
    const editorWidget = ALL_WIDGETS.find(
      (widget) =>
        widget.configuration.fieldMetadataId === WIKI_PAGE_FIELDS.body,
    );

    expect(editorWidget?.configuration.fieldDisplayMode).toBe('EDITOR');
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

  it('keeps the function role from reading the rest of the CRM', () => {
    const functionRole = ROLES.find(([path]) =>
      path.includes('default-function'),
    )?.[1].config;

    expect(functionRole?.canReadAllObjectRecords).toBe(false);
  });
});
