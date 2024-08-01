import { WorkspaceSubPath } from '@affine/core/shared';
import type { useI18n } from '@affine/i18n';
import { ArrowRightBigIcon } from '@blocksuite/icons/rc';
import type { DocCollection } from '@blocksuite/store';
import type { createStore } from 'jotai';

import { openSettingModalAtom, openWorkspaceListModalAtom } from '../atoms';
import type { useNavigateHelper } from '../hooks/use-navigate-helper';
import { mixpanel } from '../mixpanel';
import { registerAffineCommand } from './registry';

export function registerAffineNavigationCommands({
  t,
  store,
  docCollection,
  navigationHelper,
}: {
  t: ReturnType<typeof useI18n>;
  store: ReturnType<typeof createStore>;
  navigationHelper: ReturnType<typeof useNavigateHelper>;
  docCollection: DocCollection;
}) {
  const unsubs: Array<() => void> = [];
  unsubs.push(
    registerAffineCommand({
      id: 'affine:goto-all-pages',
      category: 'affine:navigation',
      icon: <ArrowRightBigIcon />,
      label: t['com.affine.cmdk.affine.navigation.goto-all-pages'](),
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          segment: 'cmdk',
          module: 'navigation',
          control: 'go to all docs',
        });
        navigationHelper.jumpToSubPath(docCollection.id, WorkspaceSubPath.ALL);
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:goto-collection-list',
      category: 'affine:navigation',
      icon: <ArrowRightBigIcon />,
      label: 'Go to Collection List',
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          segment: 'cmdk',
          module: 'navigation',
          control: 'go to collection list',
        });
        navigationHelper.jumpToCollections(docCollection.id);
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:goto-tag-list',
      category: 'affine:navigation',
      icon: <ArrowRightBigIcon />,
      label: 'Go to Tag List',
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          segment: 'cmdk',
          module: 'navigation',
          control: 'go to tag list',
        });
        navigationHelper.jumpToTags(docCollection.id);
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:goto-workspace',
      category: 'affine:navigation',
      icon: <ArrowRightBigIcon />,
      label: t['com.affine.cmdk.affine.navigation.goto-workspace'](),
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          segment: 'cmdk',
          module: 'navigation',
          control: 'go to workspace',
        });
        store.set(openWorkspaceListModalAtom, true);
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:open-settings',
      category: 'affine:navigation',
      icon: <ArrowRightBigIcon />,
      label: t['com.affine.cmdk.affine.navigation.open-settings'](),
      keyBinding: '$mod+,',
      run() {
        mixpanel.track('SettingsViewed', {
          // page:
          segment: 'cmdk',
        });
        mixpanel.track('QuickSearchOptionClick', {
          segment: 'cmdk',
          module: 'navigation',
          control: 'go to settings',
        });
        store.set(openSettingModalAtom, s => ({
          activeTab: 'appearance',
          open: !s.open,
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:open-account',
      category: 'affine:navigation',
      icon: <ArrowRightBigIcon />,
      label: t['com.affine.cmdk.affine.navigation.open-account-settings'](),
      run() {
        mixpanel.track('AccountSettingsViewed', {
          // page:
          segment: 'cmdk',
        });
        mixpanel.track('QuickSearchOptionClick', {
          segment: 'cmdk',
          module: 'navigation',
          control: 'go to account settings',
        });
        store.set(openSettingModalAtom, s => ({
          activeTab: 'account',
          open: !s.open,
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:goto-trash',
      category: 'affine:navigation',
      icon: <ArrowRightBigIcon />,
      label: t['com.affine.cmdk.affine.navigation.goto-trash'](),
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          segment: 'cmdk',
          module: 'navigation',
          control: 'go to trash',
        });
        navigationHelper.jumpToSubPath(
          docCollection.id,
          WorkspaceSubPath.TRASH
        );
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
