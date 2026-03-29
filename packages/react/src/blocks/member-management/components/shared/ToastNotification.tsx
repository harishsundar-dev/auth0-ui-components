import { CheckCircleIcon, XCircleIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import type { Toast } from '../../MemberManagement.types';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

/**
 *
 * @param root0
 */
export function ToastNotification({
  toasts,
  onDismiss,
}: ToastNotificationProps): React.JSX.Element | null {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={cn(
            'flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg min-w-[280px] max-w-[400px]',
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircleIcon className="size-5 shrink-0" aria-hidden="true" />
          ) : (
            <XCircleIcon className="size-5 shrink-0" aria-hidden="true" />
          )}
          <span className="flex-1 text-sm">{toast.message}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="size-6 shrink-0"
          >
            <XIcon className="size-3" aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  );
}
