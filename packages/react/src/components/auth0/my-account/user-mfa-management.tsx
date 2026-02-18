/**
 * MFA management UI.
 *
 * Complete multi-factor authentication management interface for enrolling,
 * viewing, and deleting MFA factors including TOTP, SMS, Email, Push notifications,
 * and recovery codes.
 *
 * @module user-mfa-management
 *
 * @example
 * ```tsx
 * <UserMFAMgmt
 *   onEnroll={(factor) => console.log('Enrolled:', factor)}
 *   onDelete={(factor) => console.log('Deleted:', factor)}
 *   factorConfig={{
 *     otp: { enabled: true },
 *     sms: { enabled: true },
 *     email: { enabled: false },
 *   }}
 * />
 * ```
 */
import type { Authenticator } from '@auth0/universal-components-core';
import {
  FACTOR_TYPE_PUSH_NOTIFICATION,
  type MFAType,
  getComponentStyles,
  USER_MFA_SCOPES,
} from '@auth0/universal-components-core';
import * as React from 'react';
import { toast } from 'sonner';

import { DeleteFactorConfirmation } from '@/components/auth0/my-account/shared/mfa/delete-factor-confirmation';
import { MFAEmptyState } from '@/components/auth0/my-account/shared/mfa/empty-state';
import { MFAErrorState } from '@/components/auth0/my-account/shared/mfa/error-state';
import { FactorsList } from '@/components/auth0/my-account/shared/mfa/factors-list';
import { UserMFASetupForm } from '@/components/auth0/my-account/shared/mfa/user-mfa-setup-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { List, ListItem } from '@/components/ui/list';
import { Spinner } from '@/components/ui/spinner';
import { withMyAccountService } from '@/hoc/with-services';
import { useMFA } from '@/hooks/my-account/use-mfa';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { ENROLL } from '@/lib/constants/my-account/mfa/mfa-constants';
import type { CONFIRM } from '@/lib/constants/my-account/mfa/mfa-constants';
import { cn } from '@/lib/utils';
import type { UserMFAMgmtProps } from '@/types/my-account/mfa/mfa-types';

/**
 * Internal MFA management UI used by `UserMFAMgmt`.
 * Handles loading factors, enroll/delete flows, and UI state.
 *
 * @param props - Component props.
 * @param props.customMessages - Override i18n messages.
 * @param props.styling - CSS variables and class overrides.
 * @param props.hideHeader - Hide the header section.
 * @param props.showActiveOnly - Show only enrolled factors.
 * @param props.disableEnroll - Disable enroll actions.
 * @param props.disableDelete - Disable delete actions.
 * @param props.readOnly - Render in read-only mode.
 * @param props.factorConfig - Per-factor visibility/enabled config.
 * @param props.onEnroll - Called after successful enroll.
 * @param props.onDelete - Called after successful delete.
 * @param props.onFetch - Called after factors load.
 * @param props.onErrorAction - Called when actions error.
 * @param props.onBeforeAction - Called before actions; return false to cancel.
 * @param props.schema - Validation schema overrides.
 * @returns MFA management UI.
 * @internal
 */
function UserMFAMgmtInternal({
  customMessages = {},
  styling = {
    variables: {
      common: {},
      light: {},
      dark: {},
    },
    classes: {},
  },
  hideHeader = false,
  showActiveOnly = false,
  disableEnroll = false,
  disableDelete = false,
  readOnly = false,
  factorConfig = {},
  onEnroll,
  onDelete,
  onFetch,
  onErrorAction,
  onBeforeAction,
  schema,
}: UserMFAMgmtProps): React.JSX.Element {
  const { t } = useTranslator('mfa', customMessages);
  const { loader, isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );
  const { fetchFactors, enrollMfa, deleteMfa, confirmEnrollment } = useMFA();

  const [factorsByType, setFactorsByType] = React.useState<Record<MFAType, Authenticator[]>>(
    {} as Record<MFAType, Authenticator[]>,
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeletingFactor, setIsDeletingFactor] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [enrollFactor, setEnrollFactor] = React.useState<MFAType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [factorToDelete, setFactorToDelete] = React.useState<{
    id: string;
    type: MFAType;
  } | null>(null);

  /**
   * Loads the available MFA factors from the API and updates the state.
   * This is called on initial load and when factors need to be refreshed.
   */
  const loadFactors = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const factors = await fetchFactors(showActiveOnly);
      setFactorsByType(factors as Record<MFAType, Authenticator[]>);
      onFetch?.();
    } catch (err) {
      setError(t('errors.factors_loading_error'));
    }

    setLoading(false);
  }, [fetchFactors, showActiveOnly, onFetch, onErrorAction]);

  React.useEffect(() => {
    loadFactors();
  }, []);

  /**
   * Get visible factor types based on configuration
   */
  const visibleFactorTypes = React.useMemo(() => {
    return (Object.keys(factorsByType) as MFAType[]).filter(
      (factorType) => factorConfig[factorType]?.visible !== false,
    );
  }, [factorsByType, factorConfig]);

  /**
   * Check if there are no active factors across all visible factor types
   */
  const hasNoActiveFactors = React.useMemo(() => {
    return visibleFactorTypes.every((type) => !factorsByType[type]?.some((f) => f.enrolled));
  }, [visibleFactorTypes, factorsByType]);

  /**
   * Handles the enrollment button click for a specific MFA factor.
   * Opens the enrollment dialog for the chosen factor.
   *
   * @param factor - The MFA factor type to be enrolled.
   */
  const handleEnroll = (factor: MFAType) => {
    setEnrollFactor(factor);
    setDialogOpen(true);
  };

  /**
   * Handles closing the enrollment dialog.
   * Reloads factors if closing a push notification enrollment to ensure
   * the latest enrollment state is reflected.
   */
  const handleCloseDialog = React.useCallback(() => {
    setDialogOpen(false);

    // Reload factors if closing push notification enrollment
    if (enrollFactor === FACTOR_TYPE_PUSH_NOTIFICATION) {
      loadFactors();
    }

    setEnrollFactor(null);
  }, [enrollFactor, loadFactors]);

  /**
   * Handles the initial click on the delete button for an MFA factor.
   * This function either:
   * 1. Triggers the onBeforeAction callback and proceeds with deletion if approved
   * 2. Opens a confirmation dialog if no onBeforeAction is provided
   *
   * The function prevents deletion if:
   * - Component is in readonly mode
   * - Delete action is disabled
   * - onBeforeAction returns false
   *
   * @param factorId - The unique identifier of the MFA factor to delete
   * @param factorType - The type of MFA factor being deleted (e.g., 'sms', 'email', 'otp')
   * @returns A promise that resolves when the delete action completes
   */
  const handleDeleteFactor = React.useCallback(
    async (factorId: string, factorType: MFAType) => {
      if (readOnly || disableDelete) return;

      if (onBeforeAction) {
        // If onBeforeAction exists, proceed directly
        const canProceed = await onBeforeAction('delete', factorType);
        if (!canProceed) return;
        await handleConfirmDelete(factorId);
      } else {
        setFactorToDelete({ id: factorId, type: factorType });
        setIsDeleteDialogOpen(true);
      }
    },
    [readOnly, disableDelete, onBeforeAction],
  );

  /**
   * Handles the confirmation and execution of MFA factor deletion.
   * This callback is triggered when a user confirms the deletion in the confirmation dialog
   * or when deletion is approved through onBeforeAction.
   *
   * The function:
   * 1. Deletes the MFA factor
   * 2. Reloads the factors list
   * 3. Shows success/error notifications
   * 4. Handles cleanup of dialog and loading states
   *
   * @param factorId - The unique identifier of the MFA factor to delete
   * @throws When deletion fails or factors cannot be reloaded
   */
  const handleConfirmDelete = React.useCallback(
    async (factorId: string) => {
      setIsDeletingFactor(true);

      const cleanUp = () => {
        setIsDeletingFactor(false);
        setIsDeleteDialogOpen(false);
        setFactorToDelete(null);
      };

      try {
        await deleteMfa(factorId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(t('errors.delete_factor'));
        toast.error(t('errors.delete_factor'));
        onErrorAction?.(error, 'delete');
        cleanUp();
        return;
      }

      toast.success(t('remove_factor'), {
        duration: 2000,
        onAutoClose: () => onDelete?.(),
      });

      try {
        await loadFactors();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(t('errors.factors_loading_error'));
        onErrorAction?.(error, 'delete');
      } finally {
        cleanUp();
      }
    },
    [deleteMfa, loadFactors, onDelete, onErrorAction, t],
  );

  /**
   * Handles the successful enrollment of an MFA factor.
   * Displays a success toast notification, invokes the onEnroll callback,
   * and reloads the factors list to reflect the new enrollment.
   *
   * @returns A promise that resolves when the success handling is complete.
   */
  const handleEnrollSuccess = React.useCallback(async () => {
    setDialogOpen(false);
    setEnrollFactor(null);
    try {
      toast.success(t('enroll_factor'), {
        duration: 2000,
        onAutoClose: () => {
          onEnroll?.();
        },
      });
      await loadFactors();
    } catch {
      toast.dismiss();
      toast.error(t('errors.factors_loading_error'));
    }
  }, [loadFactors, onEnroll, t]);

  /**
   * Handles errors during the enrollment or confirmation process.
   * Displays an error toast notification and invokes the onErrorAction callback.
   *
   * @param error - The error object containing the failure message.
   * @param stage - The stage of the process where the error occurred ('enroll' or 'confirm').
   */
  const handleEnrollError = React.useCallback(
    (error: Error, stage: typeof ENROLL | typeof CONFIRM) => {
      toast.error(
        `${stage === ENROLL ? t('enrollment') : t('confirmation')} ${t('errors.failed', { message: error.message })}`,
      );
      onErrorAction?.(error, stage);
    },
    [onErrorAction, t],
  );

  return (
    <div style={currentStyles.variables}>
      {loading ? (
        <div className="flex items-center justify-center py-16">{loader || <Spinner />}</div>
      ) : (
        <Card
          className={cn('py-10 px-8 sm:py-8 sm:px-6', currentStyles.classes?.['UserMFAMgmt-card'])}
        >
          <CardContent>
            {error ? (
              <MFAErrorState
                title={t('component_error_title')}
                description={t('component_error_description')}
              />
            ) : (
              <>
                {!hideHeader && (
                  <>
                    <CardTitle
                      id="mfa-management-title"
                      className="text-2xl text-(length:--font-size-heading) font-medium text-left"
                    >
                      {t('title')}
                    </CardTitle>
                    <CardDescription
                      id="mfa-management-desc"
                      className="text-sm text-(length:--font-size-paragraph) text-muted-foreground text-left"
                    >
                      {t('description')}
                    </CardDescription>
                  </>
                )}
                {showActiveOnly && hasNoActiveFactors ? (
                  <MFAEmptyState message={t('no_active_mfa')} />
                ) : (
                  <List
                    className="flex flex-col gap-0 w-full"
                    aria-labelledby="mfa-management-title"
                    aria-describedby="mfa-management-desc"
                  >
                    {visibleFactorTypes.map((factorType) => {
                      const factors = factorsByType[factorType] || [];
                      const activeFactors = factors.filter((f) => f.enrolled);
                      const isEnabledFactor = factorConfig?.[factorType]?.enabled !== false;
                      const hasActiveFactors = activeFactors.length > 0;

                      return (
                        <ListItem
                          key={factorType}
                          className={cn(
                            'w-full p-0 m-0 py-6 gap-3',
                            !isEnabledFactor && 'opacity-50 pointer-events-none',
                          )}
                          aria-disabled={!isEnabledFactor}
                          tabIndex={0}
                          aria-label={t(`${factorType}.title`)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span
                                className={cn(
                                  'break-words text-card-foreground whitespace-normal text-base text-(length:--font-size-body) font-medium',
                                )}
                                id={`factor-title-${factorType}`}
                              >
                                {t(`${factorType}.title`)}
                              </span>

                              {hasActiveFactors && (
                                <Badge
                                  variant="success"
                                  size="sm"
                                  className="shrink-0"
                                  aria-label={t('enabled')}
                                >
                                  {t('enabled')}
                                </Badge>
                              )}
                            </div>

                            {!readOnly && (
                              <Button
                                size="default"
                                variant="outline"
                                className="text-sm w-full sm:w-auto shrink-0"
                                onClick={() => handleEnroll(factorType)}
                                disabled={disableEnroll || !isEnabledFactor}
                                aria-label={t(`${factorType}.button-text`)}
                                aria-describedby={`factor-title-${factorType}`}
                              >
                                {t(`${factorType}.button-text`)}
                              </Button>
                            )}
                          </div>

                          {!hasActiveFactors && (
                            <p
                              className={cn(
                                'font-normal text-sm text-(length:--font-size-paragraph) text-muted-foreground text-left break-words',
                              )}
                              id={`factor-desc-${factorType}`}
                            >
                              {t(`${factorType}.description`)}
                            </p>
                          )}

                          {hasActiveFactors && (
                            <FactorsList
                              factors={activeFactors}
                              factorType={factorType}
                              readOnly={readOnly}
                              isEnabledFactor={isEnabledFactor}
                              onDeleteFactor={handleDeleteFactor}
                              isDeletingFactor={isDeletingFactor}
                              disableDelete={disableDelete}
                              styling={styling}
                              customMessages={customMessages}
                            />
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
      {enrollFactor && (
        <UserMFASetupForm
          open={dialogOpen}
          onClose={handleCloseDialog}
          factorType={enrollFactor}
          enrollMfa={enrollMfa}
          confirmEnrollment={confirmEnrollment}
          onSuccess={handleEnrollSuccess}
          onError={handleEnrollError}
          schema={schema}
          styling={styling}
          customMessages={customMessages}
        />
      )}
      <DeleteFactorConfirmation
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !isDeletingFactor && setIsDeleteDialogOpen(open)}
        factorToDelete={factorToDelete}
        isDeletingFactor={isDeletingFactor}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        styling={styling}
        customMessages={customMessages}
      />
    </div>
  );
}

/**
 * Multi-factor authentication management component.
 *
 * Complete MFA management interface for enrolling, viewing, and deleting authentication
 * factors. Supports TOTP authenticators, SMS, Email, Push notifications, and recovery codes.
 *
 * @param customMessages - Custom i18n message overrides
 * @param styling - CSS variables and class overrides
 * @param hideHeader - Hide the header section
 * @param showActiveOnly - Show only enrolled factors
 * @param disableEnroll - Disable enroll actions
 * @param disableDelete - Disable delete actions
 * @param readOnly - Render in read-only mode
 * @param factorConfig - Per-factor visibility/enabled configuration
 * @param onEnroll - Callback after successful enrollment
 * @param onDelete - Callback after successful deletion
 * @param onFetch - Callback after factors are loaded
 * @param onErrorAction - Callback when actions error
 * @param onBeforeAction - Callback before actions; return false to cancel
 * @param schema - Validation schema overrides
 * @returns MFA management component
 *
 * @example
 * ```tsx
 * <UserMFAMgmt
 *   onEnroll={(factor) => console.log('Enrolled:', factor)}
 *   onDelete={(factor) => console.log('Deleted:', factor)}
 *   factorConfig={{
 *     otp: { enabled: true },
 *     sms: { enabled: true },
 *     email: { enabled: false },
 *   }}
 * />
 * ```
 */
export const UserMFAMgmt = withMyAccountService(UserMFAMgmtInternal, USER_MFA_SCOPES);
