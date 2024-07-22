import { toReactNode } from '@affine/component';
import { AIChatBlockPeekViewTemplate } from '@affine/core/blocksuite/blocks/components/peek-view/chat-block-peek-view';
import { BlockElement } from '@blocksuite/block-std';
import { useLiveData, useService } from '@toeverything/infra';
import { useEffect, useMemo } from 'react';

import type { ActivePeekView } from '../entities/peek-view';
import { PeekViewService } from '../services/peek-view';
import { DocPeekPreview } from './doc-preview';
import { ImagePreviewPeekView } from './image-preview';
import {
  PeekViewModalContainer,
  type PeekViewModalContainerProps,
} from './modal-container';
import {
  DefaultPeekViewControls,
  DocPeekViewControls,
} from './peek-view-controls';

function renderPeekView({ info }: ActivePeekView) {
  console.debug('peek view info', info);
  if (info.type === 'template') {
    return toReactNode(info.template);
  }
  if (info.type === 'doc') {
    return (
      <DocPeekPreview
        mode={info.mode}
        xywh={info.xywh}
        docId={info.docId}
        blockId={info.blockId}
      />
    );
  }

  if (info.type === 'image') {
    return <ImagePreviewPeekView docId={info.docId} blockId={info.blockId} />;
  }

  if (info.type === 'ai-chat-block') {
    const template = AIChatBlockPeekViewTemplate(
      info.model.sessionId,
      info.model.messages,
      info.host
    );
    return toReactNode(template);
  }

  return null; // unreachable
}

const renderControls = ({ info }: ActivePeekView) => {
  if (info.type === 'doc') {
    return (
      <DocPeekViewControls
        mode={info.mode}
        docId={info.docId}
        blockId={info.docId}
      />
    );
  }

  if (info.type === 'image') {
    return null; // image controls are rendered in the image preview
  }

  return <DefaultPeekViewControls />;
};

const getRendererProps = (
  activePeekView?: ActivePeekView
): Partial<PeekViewModalContainerProps> | undefined => {
  if (!activePeekView) {
    return;
  }

  const preview = renderPeekView(activePeekView);
  const controls = renderControls(activePeekView);
  return {
    children: preview,
    controls,
    target:
      activePeekView?.target instanceof HTMLElement
        ? activePeekView.target
        : undefined,
    padding: activePeekView.info.type !== 'image',
    dialogFrame: activePeekView.info.type !== 'image',
  };
};

export const PeekViewManagerModal = () => {
  const peekViewEntity = useService(PeekViewService).peekView;
  const activePeekView = useLiveData(peekViewEntity.active$);
  const show = useLiveData(peekViewEntity.show$);

  const renderProps = useMemo(() => {
    if (!activePeekView) {
      return;
    }
    return getRendererProps(activePeekView);
  }, [activePeekView]);

  useEffect(() => {
    const subscription = peekViewEntity.show$.subscribe(() => {
      if (activePeekView?.target instanceof BlockElement) {
        activePeekView.target.requestUpdate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [activePeekView, peekViewEntity]);

  return (
    <PeekViewModalContainer
      {...renderProps}
      open={!!show?.value && !!renderProps}
      animation={show?.animation || 'none'}
      onOpenChange={open => {
        if (!open) {
          peekViewEntity.close();
        }
      }}
    >
      {renderProps?.children}
    </PeekViewModalContainer>
  );
};
