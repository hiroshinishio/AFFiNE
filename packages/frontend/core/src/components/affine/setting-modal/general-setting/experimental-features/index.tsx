import { Button, Checkbox, Loading, Switch, Tooltip } from '@affine/component';
import { SettingHeader } from '@affine/component/setting-components';
import { useAppSettingHelper } from '@affine/core/hooks/affine/use-app-setting-helper';
import { useAsyncCallback } from '@affine/core/hooks/affine-async-hooks';
import { useI18n } from '@affine/i18n';
import {
  ArrowRightSmallIcon,
  DiscordIcon,
  EmailIcon,
  GithubIcon,
} from '@blocksuite/icons/rc';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Suspense, useCallback, useState } from 'react';

import { ExperimentalFeatureArts } from './arts';
import {
  affineFeatureFlags,
  blocksuiteFeatureFlags,
  type BuildChannel,
  type FeedbackType,
} from './config';
import * as styles from './index.css';

const ExperimentalFeaturesPrompt = ({
  onConfirm,
}: {
  onConfirm: () => void;
}) => {
  const t = useI18n();
  const [checked, setChecked] = useState(false);

  const onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void = useCallback((_, checked) => {
    setChecked(checked);
  }, []);

  return (
    <div className={styles.promptRoot} data-testid="experimental-prompt">
      <div className={styles.promptTitle}>
        {t[
          'com.affine.settings.workspace.experimental-features.prompt-header'
        ]()}
      </div>
      <div className={styles.promptArt}>
        <ExperimentalFeatureArts />
      </div>
      <div className={styles.promptWarning}>
        <div className={styles.promptWarningTitle}>
          {t[
            'com.affine.settings.workspace.experimental-features.prompt-warning-title'
          ]()}
        </div>
        {t[
          'com.affine.settings.workspace.experimental-features.prompt-warning'
        ]()}
      </div>

      <div className={styles.spacer} />

      <label className={styles.promptDisclaimer}>
        <Checkbox
          checked={checked}
          onChange={onChange}
          data-testid="experimental-prompt-disclaimer"
        />
        {t[
          'com.affine.settings.workspace.experimental-features.prompt-disclaimer'
        ]()}
      </label>

      <div className={styles.promptDisclaimerConfirm}>
        <Button
          disabled={!checked}
          onClick={onConfirm}
          variant="primary"
          data-testid="experimental-confirm-button"
        >
          {t[
            'com.affine.settings.workspace.experimental-features.get-started'
          ]()}
        </Button>
      </div>
    </div>
  );
};

const FeedbackIcon = ({ type }: { type: FeedbackType }) => {
  switch (type) {
    case 'discord':
      return <DiscordIcon fontSize={16} />;
    case 'email':
      return <EmailIcon fontSize={16} />;
    case 'github':
      return <GithubIcon fontSize={16} />;
    default:
      return null;
  }
};

const feedbackLink: Record<FeedbackType, string> = {
  discord: 'https://discord.com/invite/yz6tGVsf5p',
  email: 'mailto:support@toeverything.info',
  github: 'https://github.com/toeverything/AFFiNE/issues',
};

const ExperimentalFeaturesItem = ({
  title,
  description,
  feedbackType,
  isMutating,
  checked,
  onChange,
  testId,
  restrictedPlatform,
  displayChannel,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  feedbackType?: FeedbackType;
  isMutating?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
  testId?: string;
  displayChannel?: BuildChannel[];
  restrictedPlatform?: 'client' | 'web';
}) => {
  const link = feedbackType ? feedbackLink[feedbackType] : undefined;
  const hidden =
    (displayChannel && !displayChannel.includes(runtimeConfig.appBuildType)) ||
    (restrictedPlatform &&
      ((restrictedPlatform === 'client' && !environment.isDesktop) ||
        (restrictedPlatform === 'web' && environment.isDesktop)));

  if (hidden) {
    return null;
  }

  return (
    <div className={styles.rowContainer}>
      <div className={styles.switchRow}>
        {title}
        <Switch
          checked={checked}
          onChange={onChange}
          className={isMutating ? styles.switchDisabled : ''}
          data-testid={testId}
        />
      </div>
      {!!description && (
        <Tooltip content={description}>
          <div className={styles.description}>{description}</div>
        </Tooltip>
      )}
      {!!feedbackType && (
        <a
          className={styles.feedback}
          href={link}
          target="_blank"
          rel="noreferrer"
        >
          <FeedbackIcon type={feedbackType} />
          <span>Discussion about this feature</span>
          <ArrowRightSmallIcon
            fontSize={20}
            className={styles.arrowRightIcon}
          />
        </a>
      )}
    </div>
  );
};

const SplitViewSettingRow = () => {
  const { appSettings, updateSettings } = useAppSettingHelper();

  const onToggle = useCallback(
    (checked: boolean) => {
      updateSettings('enableMultiView', checked);
    },
    [updateSettings]
  );
  const multiViewFlagConfig = affineFeatureFlags['enableMultiView'];

  if (!multiViewFlagConfig) {
    return null;
  }

  return (
    <ExperimentalFeaturesItem
      title={multiViewFlagConfig.displayName}
      description={multiViewFlagConfig.description}
      displayChannel={multiViewFlagConfig.displayChannel}
      restrictedPlatform={multiViewFlagConfig.restrictedPlatform}
      feedbackType={multiViewFlagConfig.feedbackType}
      checked={appSettings.enableMultiView}
      onChange={onToggle}
    />
  );
};

const OutlineViewerSettingRow = () => {
  const { appSettings, updateSettings } = useAppSettingHelper();

  const onToggle = useCallback(
    (checked: boolean) => {
      updateSettings('enableOutlineViewer', checked);
    },
    [updateSettings]
  );

  const outlineViewerFlagConfig = affineFeatureFlags['enableOutlineViewer'];

  if (!outlineViewerFlagConfig) {
    return null;
  }

  return (
    <ExperimentalFeaturesItem
      title={outlineViewerFlagConfig.displayName}
      description={outlineViewerFlagConfig.description}
      displayChannel={outlineViewerFlagConfig.displayChannel}
      restrictedPlatform={outlineViewerFlagConfig.restrictedPlatform}
      feedbackType={outlineViewerFlagConfig.feedbackType}
      checked={appSettings.enableOutlineViewer}
      onChange={onToggle}
      testId="outline-viewer-switch"
    />
  );
};

const BlocksuiteFeatureFlagSettings = () => {
  const { appSettings, updateSettings } = useAppSettingHelper();
  const toggleSetting = useCallback(
    (flag: keyof BlockSuiteFlags, checked: boolean) => {
      updateSettings('editorFlags', {
        ...appSettings.editorFlags,
        [flag]: checked,
      });
    },
    [appSettings.editorFlags, updateSettings]
  );

  type EditorFlag = keyof typeof appSettings.editorFlags;

  return (
    <>
      {Object.entries(blocksuiteFeatureFlags).map(([key, value]) => (
        <ExperimentalFeaturesItem
          key={key}
          title={'Block Suite: ' + value.displayName}
          description={value.description}
          feedbackType={value.feedbackType}
          displayChannel={value.displayChannel}
          restrictedPlatform={value.restrictedPlatform}
          checked={!!appSettings.editorFlags?.[key as EditorFlag]}
          onChange={checked =>
            toggleSetting(key as keyof BlockSuiteFlags, checked)
          }
        />
      ))}
    </>
  );
};

const ExperimentalFeaturesMain = () => {
  const t = useI18n();

  return (
    <>
      <SettingHeader
        title={t[
          'com.affine.settings.workspace.experimental-features.header.plugins'
        ]()}
      />
      <div
        className={styles.settingsContainer}
        data-testid="experimental-settings"
      >
        <SplitViewSettingRow />
        <BlocksuiteFeatureFlagSettings />
        <OutlineViewerSettingRow />
      </div>
    </>
  );
};

// TODO(@Peng): save to workspace meta instead?
const experimentalFeaturesDisclaimerAtom = atomWithStorage(
  'affine:experimental-features-disclaimer',
  false
);

export const ExperimentalFeatures = () => {
  const [enabled, setEnabled] = useAtom(experimentalFeaturesDisclaimerAtom);
  const handleConfirm = useAsyncCallback(async () => {
    setEnabled(true);
  }, [setEnabled]);
  if (!enabled) {
    return <ExperimentalFeaturesPrompt onConfirm={handleConfirm} />;
  } else {
    return (
      <Suspense fallback={<Loading />}>
        <ExperimentalFeaturesMain />
      </Suspense>
    );
  }
};
