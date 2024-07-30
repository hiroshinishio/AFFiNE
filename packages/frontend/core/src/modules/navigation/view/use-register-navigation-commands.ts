import {
  PreconditionStrategy,
  registerAffineCommand,
} from '@affine/core/commands';
import { mixpanel } from '@affine/core/mixpanel';
import { useService } from '@toeverything/infra';
import { useEffect } from 'react';

import { TelemetryWorkspaceContextService } from '../../telemetry/services/telemetry';
import { NavigatorService } from '../services/navigator';

export function useRegisterNavigationCommands() {
  const navigator = useService(NavigatorService).navigator;
  const telemetry = useService(TelemetryWorkspaceContextService);
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    unsubs.push(
      registerAffineCommand({
        id: 'affine:shortcut-history-go-back',
        category: 'affine:general',
        preconditionStrategy: PreconditionStrategy.Never,
        icon: 'none',
        label: 'go back',
        keyBinding: {
          binding: '$mod+[',
        },
        run() {
          mixpanel.track('QuickSearchOptionClick', {
            page: telemetry.getPageContext(),
            segment: telemetry.getPageContext(),
            module: telemetry.getPageContext(),
            control: 'go back',
          });
          navigator.back();
        },
      })
    );
    unsubs.push(
      registerAffineCommand({
        id: 'affine:shortcut-history-go-forward',
        category: 'affine:general',
        preconditionStrategy: PreconditionStrategy.Never,
        icon: 'none',
        label: 'go forward',
        keyBinding: {
          binding: '$mod+]',
        },
        run() {
          mixpanel.track('QuickSearchOptionClick', {
            page: telemetry.getPageContext(),
            segment: telemetry.getPageContext(),
            module: telemetry.getPageContext(),
            control: 'go forward',
          });
          navigator.forward();
        },
      })
    );

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [navigator, telemetry]);
}
