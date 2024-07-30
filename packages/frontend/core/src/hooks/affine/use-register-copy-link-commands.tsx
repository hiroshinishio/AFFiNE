import {
  PreconditionStrategy,
  registerAffineCommand,
} from '@affine/core/commands';
import { useSharingUrl } from '@affine/core/hooks/affine/use-share-url';
import { mixpanel } from '@affine/core/mixpanel';
import { TelemetryWorkspaceContextService } from '@affine/core/modules/telemetry/services/telemetry';
import { useIsActiveView } from '@affine/core/modules/workbench';
import { WorkspaceFlavour } from '@affine/env/workspace';
import { useService, type WorkspaceMetadata } from '@toeverything/infra';
import { useEffect } from 'react';

export function useRegisterCopyLinkCommands({
  workspaceMeta,
  docId,
}: {
  workspaceMeta: WorkspaceMetadata;
  docId: string;
}) {
  const isActiveView = useIsActiveView();
  const workspaceId = workspaceMeta.id;
  const isCloud = workspaceMeta.flavour === WorkspaceFlavour.AFFINE_CLOUD;
  const { onClickCopyLink } = useSharingUrl({
    workspaceId,
    pageId: docId,
    urlType: 'workspace',
  });

  const telemetry = useService(TelemetryWorkspaceContextService);

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    unsubs.push(
      registerAffineCommand({
        id: `affine:share-private-link:${docId}`,
        category: 'affine:general',
        preconditionStrategy: PreconditionStrategy.Never,
        keyBinding: {
          binding: '$mod+Shift+c',
        },
        label: '',
        icon: null,
        run() {
          mixpanel.track('QuickSearchOptionClick', {
            page: telemetry.getPageContext(),
            segment: telemetry.getPageContext(),
            module: telemetry.getPageContext(),
            control: 'copy private link',
          });
          isActiveView && isCloud && onClickCopyLink();
        },
      })
    );
    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [docId, isActiveView, isCloud, onClickCopyLink, telemetry]);
}
