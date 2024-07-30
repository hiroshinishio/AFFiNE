import {
  PreconditionStrategy,
  registerAffineCommand,
} from '@affine/core/commands';
import { mixpanel } from '@affine/core/mixpanel';
import { FindInPageService } from '@affine/core/modules/find-in-page/services/find-in-page';
import { TelemetryWorkspaceContextService } from '@affine/core/modules/telemetry/services/telemetry';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect } from 'react';

export function useRegisterFindInPageCommands() {
  const findInPage = useService(FindInPageService).findInPage;
  const toggleVisible = useCallback(() => {
    // get the selected text in page
    const selection = window.getSelection();
    const selectedText = selection?.toString();

    findInPage.toggleVisible(selectedText);
  }, [findInPage]);

  const telemetry = useService(TelemetryWorkspaceContextService);

  useEffect(() => {
    if (!environment.isDesktop) {
      return;
    }
    const unsubs: Array<() => void> = [];
    unsubs.push(
      registerAffineCommand({
        preconditionStrategy: PreconditionStrategy.Never,
        id: `editor:find-in-page`,
        keyBinding: {
          binding: '$mod+f',
        },
        icon: null,
        label: '',
        run() {
          mixpanel.track('QuickSearchOptionClick', {
            page: telemetry.getPageContext(),
            segment: telemetry.getPageContext(),
            module: telemetry.getPageContext(),
            control: 'find in page',
          });
          toggleVisible();
        },
      })
    );

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [telemetry, toggleVisible]);
}
