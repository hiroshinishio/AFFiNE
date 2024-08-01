import {
  PreconditionStrategy,
  registerAffineCommand,
} from '@affine/core/commands';
import { mixpanel } from '@affine/core/mixpanel';
import { useService } from '@toeverything/infra';
import { useEffect } from 'react';

import { NavigatorService } from '../services/navigator';

export function useRegisterNavigationCommands() {
  const navigator = useService(NavigatorService).navigator;
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
            segment: 'cmdk',
            module: 'general',
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
            segment: 'cmdk',
            module: 'general',
            control: 'go forward',
          });
          navigator.forward();
        },
      })
    );

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [navigator]);
}
