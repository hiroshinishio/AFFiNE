import { IconButton } from '@affine/component';
import { mixpanel } from '@affine/core/mixpanel';
import { ExplorerTreeRoot } from '@affine/core/modules/explorer/views/tree';
import type { Tag } from '@affine/core/modules/tag';
import { TagService } from '@affine/core/modules/tag';
import { useI18n } from '@affine/i18n';
import { PlusIcon } from '@blocksuite/icons/rc';
import { useLiveData, useServices } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

import { ExplorerService } from '../../../services/explorer';
import { CollapsibleSection } from '../../layouts/collapsible-section';
import { ExplorerTagNode } from '../../nodes/tag';
import { RootEmpty } from './empty';
import * as styles from './styles.css';

export const ExplorerTags = () => {
  const { tagService, explorerService } = useServices({
    TagService,
    ExplorerService,
  });
  const explorerSection = explorerService.sections.tags;
  const collapsed = useLiveData(explorerSection.collapsed$);
  const [createdTag, setCreatedTag] = useState<Tag | null>(null);
  const tags = useLiveData(tagService.tagList.tags$);

  const t = useI18n();

  const handleCreateNewFavoriteDoc = useCallback(() => {
    const newTags = tagService.tagList.createTag(
      t['com.affine.rootAppSidebar.tags.new-tag'](),
      tagService.randomTagColor()
    );
    setCreatedTag(newTags);
    mixpanel.track('TagCreated', {
      page: 'sidebar',
      module: 'tags',
      control: 'new tag button',
    });
    explorerSection.setCollapsed(false);
  }, [explorerSection, t, tagService]);

  useEffect(() => {
    if (collapsed) setCreatedTag(null); // reset created tag to clear the renaming state
  }, [collapsed]);

  return (
    <CollapsibleSection
      name="tags"
      headerClassName={styles.draggedOverHighlight}
      title={t['com.affine.rootAppSidebar.tags']()}
      actions={
        <IconButton
          data-testid="explorer-bar-add-favorite-button"
          onClick={handleCreateNewFavoriteDoc}
          size="16"
        >
          <PlusIcon />
        </IconButton>
      }
    >
      <ExplorerTreeRoot placeholder={<RootEmpty />}>
        {tags.map(tag => (
          <ExplorerTagNode
            key={tag.id}
            tagId={tag.id}
            reorderable={false}
            location={{
              at: 'explorer:tags:list',
            }}
            defaultRenaming={createdTag?.id === tag.id}
          />
        ))}
      </ExplorerTreeRoot>
    </CollapsibleSection>
  );
};
