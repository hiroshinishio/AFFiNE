import clsx from 'clsx';
import type {
  CSSProperties,
  HTMLAttributes,
  MouseEvent,
  ReactElement,
} from 'react';
import { cloneElement, forwardRef, useCallback } from 'react';

import { Loading } from '../loading';
import { Tooltip, type TooltipProps } from '../tooltip';
import * as styles from './button.css';

export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'plain'
  | 'error'
  | 'success'
  | 'custom';
export type ButtonSize = 'default' | 'large' | 'extraLarge' | 'custom';

export interface ButtonProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'type' | 'prefix'> {
  /**
   * Preset color scheme
   * @default 'secondary'
   */
  variant?: ButtonType;
  disabled?: boolean;
  /**
   * By default, the button is `inline-flex`, set to `true` to make it `flex`
   * @default false
   */
  block?: boolean;
  /**
   * Preset size, will be overridden by `style` or `className`
   * @default 'default'
   */
  size?: ButtonSize;
  /**
   * Will show a loading spinner at `prefix` position
   */
  loading?: boolean;

  /**
   * By default, it is considered as an icon with preset size and color,
   * can be overridden by `prefixClassName` and `prefixStyle`.
   *
   * If `loading` is true, will be replaced by a spinner.(`prefixClassName` and `prefixStyle` still work)
   * */
  prefix?: ReactElement;
  prefixClassName?: string;
  prefixStyle?: CSSProperties;
  contentClassName?: string;
  contentStyle?: CSSProperties;

  /**
   * By default, it is considered as an icon with preset size and color,
   * can be overridden by `suffixClassName` and `suffixStyle`.
   * */
  suffix?: ReactElement;
  suffixClassName?: string;
  suffixStyle?: CSSProperties;

  tooltip?: TooltipProps['content'];
  tooltipShortcut?: TooltipProps['shortcut'];
  tooltipOptions?: Partial<Omit<TooltipProps, 'content' | 'shortcut'>>;
}

const IconSlot = ({
  icon,
  loading,
  className,
  ...attrs
}: {
  icon?: ReactElement;
  loading?: boolean;
} & HTMLAttributes<HTMLElement>) => {
  const showLoadingHere = loading !== undefined;
  const visible = icon || loading;
  return visible ? (
    <div className={clsx(styles.icon, className)} {...attrs}>
      {showLoadingHere && loading ? <Loading size="100%" /> : null}
      {icon && !loading
        ? cloneElement(icon, {
            width: '100%',
            height: '100%',
            ...icon.props,
          })
        : null}
    </div>
  ) : null;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'default',
      children,
      disabled,
      block,
      loading,
      className,

      prefix,
      prefixClassName,
      prefixStyle,
      suffix,
      suffixClassName,
      suffixStyle,
      contentClassName,
      contentStyle,

      tooltip,
      tooltipShortcut,
      tooltipOptions,
      onClick,

      ...otherProps
    },
    ref
  ) => {
    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return;
        onClick?.(e);
      },
      [disabled, loading, onClick]
    );

    return (
      <Tooltip content={tooltip} shortcut={tooltipShortcut} {...tooltipOptions}>
        <button
          {...otherProps}
          ref={ref}
          className={clsx(styles.button, className)}
          data-loading={loading || undefined}
          data-block={block || undefined}
          disabled={disabled}
          data-disabled={disabled || undefined}
          data-size={size}
          data-variant={variant}
          onClick={handleClick}
        >
          <IconSlot
            icon={prefix}
            loading={loading}
            className={prefixClassName}
            style={prefixStyle}
          />
          {children ? (
            <span
              className={clsx(styles.content, contentClassName)}
              style={contentStyle}
            >
              {children}
            </span>
          ) : null}
          <IconSlot
            icon={suffix}
            className={suffixClassName}
            style={suffixStyle}
          />
        </button>
      </Tooltip>
    );
  }
);
Button.displayName = 'Button';
export default Button;
