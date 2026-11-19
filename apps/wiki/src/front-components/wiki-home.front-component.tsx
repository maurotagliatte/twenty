import { useEffect, useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

import { WIKI_HOME_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWikiStyles } from 'src/front-components/shared/build-wiki-styles';
import { describeApiError } from 'src/front-components/shared/describe-api-error';
import { openWikiPage } from 'src/front-components/shared/open-wiki-page';
import { useResolveWorkspaceMemberId } from 'src/front-components/shared/use-workspace-member-id';
import {
  createWikiPage,
  findMostRecentPageId,
  listWikiSpaces,
  type WikiSpace,
} from 'src/front-components/shared/wiki-api';

type HomeState =
  | { kind: 'loading' }
  | { kind: 'no-space' }
  | { kind: 'no-page'; space: WikiSpace }
  | { kind: 'error' };

const WikiHome = () => {
  const theme = useTheme();
  const styles = useMemo(() => buildWikiStyles(theme), [theme]);
  const resolveWorkspaceMemberId = useResolveWorkspaceMemberId();
  const [state, setState] = useState<HomeState>({ kind: 'loading' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const openLatestPage = async () => {
      try {
        const pageId = await findMostRecentPageId();

        if (pageId !== null) {
          // Replace keeps the browser back button from bouncing into this redirect.
          await openWikiPage(pageId, { replace: true });

          return;
        }

        const [firstSpace] = await listWikiSpaces();

        setState(
          firstSpace === undefined
            ? { kind: 'no-space' }
            : { kind: 'no-page', space: firstSpace },
        );
      } catch (error) {
        setState({ kind: 'error' });
        await enqueueSnackbar({
          message: describeApiError(error, 'open the wiki'),
          variant: 'error',
        });
      }
    };

    void openLatestPage();
  }, []);

  const createFirstPage = async (space: WikiSpace) => {
    setIsCreating(true);

    try {
      const page = await createWikiPage({
        title: 'Welcome',
        spaceId: space.id,
        parentPageId: null,
        position: 0,
        ownerId: await resolveWorkspaceMemberId(),
      });

      await openWikiPage(page.id, { replace: true });
    } catch (error) {
      await enqueueSnackbar({
        message: describeApiError(error, 'create the page'),
        variant: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  switch (state.kind) {
    case 'loading':
      return <div style={styles.muted}>Opening the wiki…</div>;
    case 'no-space':
      return (
        <div style={styles.muted}>
          No wiki space yet. Create one from Wiki spaces in the sidebar.
        </div>
      );
    case 'no-page':
      return (
        <div style={styles.muted}>
          <p>
            {state.space.icon ? `${state.space.icon} ` : ''}
            {state.space.name || 'Untitled space'} has no pages yet.
          </p>
          <Button
            size="sm"
            variant="solid"
            color="accent"
            startIcon={<IconPlus size={14} />}
            loading={isCreating}
            onClick={() => void createFirstPage(state.space)}
          >
            Create the first page
          </Button>
        </div>
      );
    case 'error':
      return <div style={styles.muted}>The wiki could not be opened.</div>;
  }
};

export default defineFrontComponent({
  universalIdentifier: WIKI_HOME_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'wiki-home',
  description: 'Opens the most recently updated wiki page',
  component: WikiHome,
});
