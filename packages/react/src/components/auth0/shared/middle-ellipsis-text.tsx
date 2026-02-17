import * as React from 'react';

import { cn } from '@/lib/utils';

export interface MiddleEllipsisTextProps {
  text: string;
  className?: string;
}

// Reusable canvas context for text measurement (singleton)
let measureContext: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (!measureContext) {
    const canvas = document.createElement('canvas');
    measureContext = canvas.getContext('2d');
  }
  return measureContext;
}

/**
 * Calculates how much text fits in the available width using canvas measurement.
 * Returns truncated text with middle ellipsis if needed.
 */
function calculateTruncatedText(
  text: string,
  availableWidth: number,
  font: string,
): { truncated: string; isTruncated: boolean } {
  if (!text || availableWidth <= 0) {
    return { truncated: text, isTruncated: false };
  }

  const context = getMeasureContext();
  if (!context) {
    return { truncated: text, isTruncated: false };
  }

  context.font = font;
  const fullWidth = context.measureText(text).width;

  // If text fits, return as-is
  if (fullWidth <= availableWidth) {
    return { truncated: text, isTruncated: false };
  }

  const ellipsis = '...';
  const ellipsisWidth = context.measureText(ellipsis).width;
  const targetWidth = availableWidth - ellipsisWidth;

  if (targetWidth <= 0) {
    return { truncated: ellipsis, isTruncated: true };
  }

  // Calculate characters to show on each side (roughly equal visual weight)
  const halfTarget = targetWidth / 2;
  let leftEnd = 0;
  let rightStart = text.length;
  let leftWidth = 0;
  let rightWidth = 0;

  // Build left side character by character
  for (let i = 0; i < text.length && leftWidth < halfTarget; i++) {
    const char = text.charAt(i);
    const charWidth = context.measureText(char).width;
    if (leftWidth + charWidth <= halfTarget) {
      leftWidth += charWidth;
      leftEnd = i + 1;
    } else {
      break;
    }
  }

  // Build right side character by character
  for (let i = text.length - 1; i >= leftEnd && rightWidth < halfTarget; i--) {
    const char = text.charAt(i);
    const charWidth = context.measureText(char).width;
    if (rightWidth + charWidth <= halfTarget) {
      rightWidth += charWidth;
      rightStart = i;
    } else {
      break;
    }
  }

  const truncated = text.substring(0, leftEnd) + ellipsis + text.substring(rightStart);
  return { truncated, isTruncated: true };
}

/**
 * Component that displays text with middle ellipsis when it exceeds container width.
 * Uses canvas measureText for accurate width calculation and responds to container resize.
 *
 * Performance optimizations:
 * - Singleton canvas context for measurements
 * - Debounced resize handling to batch rapid changes
 * - CSS `contain: inline-size` for layout isolation
 * - Conditional state updates to prevent re-renders
 */
export const MiddleEllipsisText = React.memo(
  React.forwardRef<HTMLSpanElement, MiddleEllipsisTextProps>(({ text, className }, ref) => {
    const [displayText, setDisplayText] = React.useState(text);
    const [isTruncated, setIsTruncated] = React.useState(false);
    const containerRef = React.useRef<HTMLSpanElement>(null);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastWidthRef = React.useRef<number>(0);

    React.useImperativeHandle(ref, () => containerRef.current!);

    const updateTruncation = React.useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      const availableWidth = container.offsetWidth;

      // Skip if width hasn't changed (common during scroll/other DOM updates)
      if (availableWidth === lastWidthRef.current) return;
      lastWidthRef.current = availableWidth;

      const computedStyle = window.getComputedStyle(container);
      const font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

      const { truncated, isTruncated: newIsTruncated } = calculateTruncatedText(
        text,
        availableWidth,
        font,
      );

      // Only update state if values changed
      setDisplayText((prev) => (prev === truncated ? prev : truncated));
      setIsTruncated((prev) => (prev === newIsTruncated ? prev : newIsTruncated));
    }, [text]);

    // Debounced resize handler - batches rapid resize events
    const debouncedUpdate = React.useCallback(() => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      // 16ms ≈ 1 frame at 60fps, good balance of responsiveness and performance
      timeoutRef.current = setTimeout(updateTruncation, 16);
    }, [updateTruncation]);

    React.useEffect(() => {
      // Reset width cache when text changes
      lastWidthRef.current = 0;
      updateTruncation();

      const container = containerRef.current;
      if (!container) return;

      const resizeObserver = new ResizeObserver(debouncedUpdate);
      resizeObserver.observe(container);

      return () => {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        resizeObserver.disconnect();
      };
    }, [updateTruncation, debouncedUpdate]);

    return (
      <span
        ref={containerRef}
        className={cn('block min-w-0', className)}
        style={{ contain: 'inline-size' }}
        title={isTruncated ? text : undefined}
      >
        {displayText}
      </span>
    );
  }),
);
