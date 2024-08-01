/**
 * @vitest-environment happy-dom
 */
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { enableAutoTrack, makeTracker } from '../auto';

describe('callable events chain', () => {
  const call = vi.fn();
  const track = makeTracker(call);

  beforeEach(() => {
    call.mockClear();
  });

  test('should call track with event and props', () => {
    track.allDocs.header.actions.createDoc();

    expect(call).toBeCalledWith('createDoc', {
      page: 'allDocs',
      segment: 'header',
      module: 'actions',
    });
  });

  test('should be able to override props', () => {
    track.allDocs.header.actions.createDoc({ page: 'doc' });

    expect(call).toBeCalledWith('createDoc', {
      page: 'doc',
      segment: 'header',
      module: 'actions',
    });
  });

  test('should be able to append custom props', () => {
    track.allDocs.header.actions.createDoc({ custom: 'prop' });

    expect(call).toBeCalledWith('createDoc', {
      page: 'allDocs',
      segment: 'header',
      module: 'actions',
      custom: 'prop',
    });
  });

  test('should be able to ignore matrix named with placeholder `$`', () => {
    track.$.navigationPanel.$.createDoc();
    //    ^ page            ^ module are empty

    expect(call).toBeCalledWith('createDoc', {
      segment: 'navigationPanel',
    });
  });
});

describe('auto track with dom dataset', () => {
  const root = document.createElement('div');
  const call = vi.fn();
  beforeAll(() => {
    call.mockReset();
    root.innerHTML = '';
    return enableAutoTrack(root, call);
  });

  test('should ignore if data-event-props not set', () => {
    const nonTrackBtn = document.createElement('button');
    root.append(nonTrackBtn);

    nonTrackBtn.click();

    expect(call).not.toBeCalled();
  });

  test('should track event with props', () => {
    const btn = document.createElement('button');
    btn.dataset.eventProps = 'allDocs.header.actions.createDoc';
    root.append(btn);

    btn.click();

    expect(call).toBeCalledWith('createDoc', {
      page: 'allDocs',
      segment: 'header',
      module: 'actions',
    });
  });

  test('should track event with single', () => {
    const btn = document.createElement('button');
    btn.dataset.eventProps = 'allDocs.header.actions.createDoc';
    btn.dataset.eventArg = 'test';
    root.append(btn);

    btn.click();

    expect(call).toBeCalledWith('createDoc', {
      page: 'allDocs',
      segment: 'header',
      module: 'actions',
      arg: 'test',
    });
  });

  test('should track event with multiple args', () => {
    const btn = document.createElement('button');
    btn.dataset.eventProps = 'allDocs.header.actions.createDoc';
    btn.dataset.eventArgsFoo = 'bar';
    btn.dataset.eventArgsBaz = 'qux';
    root.append(btn);

    btn.click();

    expect(call).toBeCalledWith('createDoc', {
      page: 'allDocs',
      segment: 'header',
      module: 'actions',
      foo: 'bar',
      baz: 'qux',
    });
  });
});
