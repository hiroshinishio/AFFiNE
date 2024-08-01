import { DebugLogger } from '@affine/debug';

import type { CallableEventsChain, EventsUnion } from './types';

const logger = new DebugLogger('mixpanel');

interface TrackFn {
  (event: string, props: Record<string, any>): void;
}

const levels = ['page', 'segment', 'module', 'event'] as const;
export function makeTracker(trackFn: TrackFn): CallableEventsChain {
  function makeTrackerInner(level: number, info: Record<string, string>) {
    const proxy = new Proxy({} as Record<string, any>, {
      get(target, prop) {
        if (
          typeof prop !== 'string' ||
          prop === '$$typeof' /* webpack hot load reading this prop */
        ) {
          return undefined;
        }

        if (levels[level] === 'event') {
          return (arg: string | Record<string, any>) => {
            trackFn(prop, {
              ...info,
              control: prop,
              arg,
            });
          };
        } else {
          let levelProxy = target[prop];
          if (levelProxy) {
            return levelProxy;
          }

          levelProxy = makeTrackerInner(
            level + 1,
            prop === '$' ? { ...info } : { ...info, [levels[level]]: prop }
          );
          target[prop] = levelProxy;
          return levelProxy;
        }
      },
    });

    return proxy;
  }

  return makeTrackerInner(0, {}) as CallableEventsChain;
}

/**
 * listen on clicking on all subtree elements and auto track events if defined
 *
 * @example
 *
 * ```html
 * <button data-event-chain='$.cmdk.settings.quicksearch.changeLanguage' data-event-arg='cn' />
 * ```
 */
export function enableAutoTrack(root: HTMLElement, trackFn: TrackFn) {
  const listener = (e: Event) => {
    const el = e.target as HTMLElement | null;
    if (!el) {
      return;
    }
    const dataset = el.dataset;

    if (dataset['eventProps']) {
      const args: Record<string, any> = {};
      if (dataset['eventArg'] !== undefined) {
        args['arg'] = dataset['event-arg'];
      } else {
        for (const argName of Object.keys(dataset)) {
          if (argName.startsWith('eventArgs')) {
            args[argName.slice(9).toLowerCase()] = dataset[argName];
          }
        }
      }

      const props = dataset['eventProps']
        .split('.')
        .map(name => (name === '$' ? undefined : name));
      if (props.length !== levels.length) {
        logger.error('Invalid event props on element', el);
        return;
      }

      const event = props[3];

      if (!event) {
        logger.error('Invalid event props on element', el);
        return;
      }

      trackFn(event, {
        page: props[0] as any,
        segment: props[1],
        module: props[2],
        control: props[3],
        arg,
      });
    }
  };

  root.addEventListener('click', listener, {});
  return () => {
    root.removeEventListener('click', listener);
  };
}

declare module 'react' {
  //  we have to declare `T` but it's actually not used
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    'data-event-props'?: EventsUnion;
    'data-event-arg'?: string;
  }
}
