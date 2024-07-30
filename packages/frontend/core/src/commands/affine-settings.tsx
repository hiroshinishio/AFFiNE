import type { useI18n } from '@affine/i18n';
import { SettingsIcon } from '@blocksuite/icons/rc';
import type { AffineEditorContainer } from '@blocksuite/presets';
import { appSettingAtom } from '@toeverything/infra';
import type { createStore } from 'jotai';
import type { useTheme } from 'next-themes';

import type { useLanguageHelper } from '../hooks/affine/use-language-helper';
import { mixpanel } from '../mixpanel';
import { registerAffineCommand } from './registry';

export function registerAffineSettingsCommands({
  t,
  store,
  theme,
  languageHelper,
  moduleName,
}: {
  t: ReturnType<typeof useI18n>;
  store: ReturnType<typeof createStore>;
  theme: ReturnType<typeof useTheme>;
  languageHelper: ReturnType<typeof useLanguageHelper>;
  editor: AffineEditorContainer | null;
  moduleName: string;
}) {
  const unsubs: Array<() => void> = [];
  const { onLanguageChange, languagesList, currentLanguage } = languageHelper;

  // color modes
  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-color-mode-to-auto',
      label: `${t['com.affine.cmdk.affine.color-mode.to']()} ${t[
        'com.affine.themeSettings.system'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'system',
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          page: moduleName,
          segment: moduleName,
          module: moduleName,
          control: 'change colour mode to system',
        });
        theme.setTheme('system');
      },
    })
  );
  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-color-mode-to-dark',
      label: `${t['com.affine.cmdk.affine.color-mode.to']()} ${t[
        'com.affine.themeSettings.dark'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'dark',
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          page: moduleName,
          segment: moduleName,
          module: moduleName,
          control: 'change colour mode to dark',
        });
        theme.setTheme('dark');
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-color-mode-to-light',
      label: `${t['com.affine.cmdk.affine.color-mode.to']()} ${t[
        'com.affine.themeSettings.light'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'light',
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          page: moduleName,
          segment: moduleName,
          module: moduleName,
          control: 'change colour mode to light',
        });
        theme.setTheme('light');
      },
    })
  );

  // Font styles
  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-font-style-to-sans',
      label: `${t['com.affine.cmdk.affine.font-style.to']()} ${t[
        'com.affine.appearanceSettings.fontStyle.sans'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        store.get(appSettingAtom).fontStyle !== 'Sans',
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          page: moduleName,
          segment: moduleName,
          module: moduleName,
          control: 'change font style to sans',
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          fontStyle: 'Sans',
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-font-style-to-serif',
      label: `${t['com.affine.cmdk.affine.font-style.to']()} ${t[
        'com.affine.appearanceSettings.fontStyle.serif'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        store.get(appSettingAtom).fontStyle !== 'Serif',
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          page: moduleName,
          segment: moduleName,
          module: moduleName,
          control: 'change font style to serif',
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          fontStyle: 'Serif',
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: 'affine:change-font-style-to-mono',
      label: `${t['com.affine.cmdk.affine.font-style.to']()} ${t[
        'com.affine.appearanceSettings.fontStyle.mono'
      ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        store.get(appSettingAtom).fontStyle !== 'Mono',
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          page: moduleName,
          segment: moduleName,
          module: moduleName,
          control: 'change font style to mono',
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          fontStyle: 'Mono',
        }));
      },
    })
  );

  // Display Language
  languagesList.forEach(language => {
    unsubs.push(
      registerAffineCommand({
        id: `affine:change-display-language-to-${language.name}`,
        label: `${t['com.affine.cmdk.affine.display-language.to']()} ${
          language.originalName
        }`,
        category: 'affine:settings',
        icon: <SettingsIcon />,
        preconditionStrategy: () => currentLanguage?.tag !== language.tag,
        run() {
          mixpanel.track('QuickSearchOptionClick', {
            page: moduleName,
            segment: moduleName,
            module: moduleName,
            control: `change display language to ${language.name}`,
          });
          onLanguageChange(language.tag);
        },
      })
    );
  });

  // Layout Style
  unsubs.push(
    registerAffineCommand({
      id: `affine:change-client-border-style`,
      label: () => `${t['com.affine.cmdk.affine.client-border-style.to']()} ${t[
        store.get(appSettingAtom).clientBorder
          ? 'com.affine.cmdk.affine.switch-state.off'
          : 'com.affine.cmdk.affine.switch-state.on'
      ]()}
        `,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => environment.isDesktop,
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          page: moduleName,
          segment: moduleName,
          module: moduleName,
          control: `change client border style to ${
            store.get(appSettingAtom).clientBorder ? 'off' : 'on'
          }`,
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          clientBorder: !prev.clientBorder,
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: `affine:change-full-width-layout`,
      label: () =>
        `${t['com.affine.cmdk.affine.full-width-layout.to']()} ${t[
          store.get(appSettingAtom).fullWidthLayout
            ? 'com.affine.cmdk.affine.switch-state.off'
            : 'com.affine.cmdk.affine.switch-state.on'
        ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          page: moduleName,
          segment: moduleName,
          module: moduleName,
          control: `change full width layout to ${
            store.get(appSettingAtom).fullWidthLayout ? 'off' : 'on'
          }`,
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          fullWidthLayout: !prev.fullWidthLayout,
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: `affine:change-noise-background-on-the-sidebar`,
      label: () =>
        `${t[
          'com.affine.cmdk.affine.noise-background-on-the-sidebar.to'
        ]()} ${t[
          store.get(appSettingAtom).enableNoisyBackground
            ? 'com.affine.cmdk.affine.switch-state.off'
            : 'com.affine.cmdk.affine.switch-state.on'
        ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => environment.isDesktop,
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          page: moduleName,
          segment: moduleName,
          module: moduleName,
          control: `change noise background on the sidebar to ${
            store.get(appSettingAtom).enableNoisyBackground ? 'off' : 'on'
          }`,
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          enableNoisyBackground: !prev.enableNoisyBackground,
        }));
      },
    })
  );

  unsubs.push(
    registerAffineCommand({
      id: `affine:change-translucent-ui-on-the-sidebar`,
      label: () =>
        `${t['com.affine.cmdk.affine.translucent-ui-on-the-sidebar.to']()} ${t[
          store.get(appSettingAtom).enableBlurBackground
            ? 'com.affine.cmdk.affine.switch-state.off'
            : 'com.affine.cmdk.affine.switch-state.on'
        ]()}`,
      category: 'affine:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => environment.isDesktop && environment.isMacOs,
      run() {
        mixpanel.track('QuickSearchOptionClick', {
          page: moduleName,
          segment: moduleName,
          module: moduleName,
          control: `change translucent ui on the sidebar to ${
            store.get(appSettingAtom).enableBlurBackground ? 'off' : 'on'
          }`,
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          enableBlurBackground: !prev.enableBlurBackground,
        }));
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
