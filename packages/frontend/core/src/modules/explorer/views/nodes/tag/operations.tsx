import {
  IconButton,
  MenuIcon,
  MenuItem,
  MenuSeparator,
  toast,
} from '@affine/component';
import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';
import { track } from '@affine/core/mixpanel';
import { FavoriteService } from '@affine/core/modules/favorite';
import { TagService } from '@affine/core/modules/tag';
import { WorkbenchService } from '@affine/core/modules/workbench';
import { useI18n } from '@affine/i18n';
import {
  DeleteIcon,
  FavoritedIcon,
  FavoriteIcon,
  PlusIcon,
  SplitViewIcon,
} from '@blocksuite/icons/rc';
import { DocsService, useLiveData, useServices } from '@toeverything/infra';
import { useCallback, useMemo } from 'react';

import type { NodeOperation } from '../../tree/types';

export const useExplorerTagNodeOperations = (
  tagId: string,
  {
    openNodeCollapsed,
  }: {
    openNodeCollapsed: () => void;
  }
): NodeOperation[] => {
  const t = useI18n();
  const { appSettings } = useAppSettingHelper();
  const { docsService, workbenchService, tagService, favoriteService } =
    useServices({
      WorkbenchService,
      TagService,
      DocsService,
      FavoriteService,
    });

  const favorite = useLiveData(
    favoriteService.favoriteList.favorite$('tag', tagId)
  );
  const tagRecord = useLiveData(tagService.tagList.tagByTagId$(tagId));

  const handleNewDoc = useCallback(() => {
    if (tagRecord) {
      const newDoc = docsService.createDoc();
      tagRecord?.tag(newDoc.id);
      track.$.navigationPanel.tags.createDoc();
      workbenchService.workbench.openDoc(newDoc.id);
      openNodeCollapsed();
    }
  }, [docsService, openNodeCollapsed, tagRecord, workbenchService.workbench]);

  const handleMoveToTrash = useCallback(() => {
    tagService.tagList.deleteTag(tagId);
    track.$.navigationPanel.tags.deleteTag();
    toast(t['com.affine.tags.delete-tags.toast']());
  }, [t, tagId, tagService.tagList]);

  const handleOpenInSplitView = useCallback(() => {
    workbenchService.workbench.openTag(tagId, {
      at: 'beside',
    });
    track.$.navigationPanel.tags.openInSplitView();
  }, [tagId, workbenchService]);

  const handleToggleFavoriteTag = useCallback(() => {
    favoriteService.favoriteList.toggle('tag', tagId);
    track.$.navigationPanel.tags.toggleFavorite({
      type: 'tag',
    });
  }, [favoriteService, tagId]);

  return useMemo(
    () => [
      {
        index: 0,
        inline: true,
        view: (
          <IconButton size="small" type="plain" onClick={handleNewDoc}>
            <PlusIcon />
          </IconButton>
        ),
      },
      ...(appSettings.enableMultiView
        ? [
            {
              index: 100,
              view: (
                <MenuItem
                  preFix={
                    <MenuIcon>
                      <SplitViewIcon />
                    </MenuIcon>
                  }
                  onClick={handleOpenInSplitView}
                >
                  {t['com.affine.workbench.split-view.page-menu-open']()}
                </MenuItem>
              ),
            },
          ]
        : []),
      ...(runtimeConfig.enableNewFavorite
        ? [
            {
              index: 199,
              view: (
                <MenuItem
                  preFix={
                    <MenuIcon>
                      {favorite ? (
                        <FavoritedIcon
                          style={{ color: 'var(--affine-primary-color)' }}
                        />
                      ) : (
                        <FavoriteIcon />
                      )}
                    </MenuIcon>
                  }
                  onClick={handleToggleFavoriteTag}
                >
                  {favorite
                    ? t['com.affine.favoritePageOperation.remove']()
                    : t['com.affine.favoritePageOperation.add']()}
                </MenuItem>
              ),
            },
          ]
        : []),
      {
        index: 9999,
        view: <MenuSeparator key="menu-separator" />,
      },
      {
        index: 10000,
        view: (
          <MenuItem
            type={'danger'}
            preFix={
              <MenuIcon>
                <DeleteIcon />
              </MenuIcon>
            }
            onClick={handleMoveToTrash}
          >
            {t['Delete']()}
          </MenuItem>
        ),
      },
    ],
    [
      appSettings.enableMultiView,
      favorite,
      handleMoveToTrash,
      handleNewDoc,
      handleOpenInSplitView,
      handleToggleFavoriteTag,
      t,
    ]
  );
};
