/**
 * Organization details edit component.
 *
 * Provides a form for editing organization details including name, display name,
 * branding settings, and organization metadata.
 *
 * @module organization-details-edit
 *
 * @example
 * ```tsx
 * <OrganizationDetailsEdit
 *   saveAction={{
 *     onBefore: () => true,
 *     onAfter: (org) => console.log('Saved:', org),
 *   }}
 *   cancelAction={{
 *     onAfter: () => navigate('/organizations'),
 *   }}
 * />
 * ```
 */

import {
  getComponentStyles,
  MY_ORGANIZATION_DETAILS_EDIT_SCOPES,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/organization-details';
import { Header } from '@/components/auth0/shared/header';
import { Spinner } from '@/components/ui/spinner';
import { withMyOrganizationService } from '@/hoc/with-services';
import { useOrganizationDetailsEdit } from '@/hooks/my-organization/use-organization-details-edit';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { OrganizationDetailsEditProps } from '@/types/my-organization/organization-management/organization-details-edit-types';

/**
 * Internal organization details edit component.
 * @param props - Component props
 * @param props.schema - Zod validation schema
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.saveAction - Configuration for the save action
 * @param props.cancelAction - Configuration for the cancel action
 * @param props.hideHeader - Whether to hide the header
 * @param props.backButton - Configuration for the back button
 * @returns JSX element
 * @internal
 */
function OrganizationDetailsEditComponent({
  schema,
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  saveAction,
  cancelAction,
  hideHeader = false,
  backButton,
}: OrganizationDetailsEditProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.organization_details_edit', customMessages);
  const { isDarkMode, theme } = useTheme();

  const {
    organization,
    isFetchLoading,
    formActions: enhancedFormActions,
  } = useOrganizationDetailsEdit({
    saveAction,
    cancelAction,
    readOnly,
    customMessages,
  });

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  if (isFetchLoading) {
    return (
      <div
        data-theme={theme || 'default'}
        style={currentStyles.variables}
        className="flex items-center justify-center min-h-96 w-full"
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div data-theme={theme || 'default'} style={currentStyles.variables} className="w-full">
      {!hideHeader && (
        <div className="mb-8">
          <Header
            title={t('header.title', {
              organizationName: organization.display_name || organization.name || '',
            })}
            backButton={
              backButton && {
                ...backButton,
                text: t('header.back_button_text'),
              }
            }
          />
        </div>
      )}

      <div className="mb-8">
        <OrganizationDetails
          organization={organization}
          schema={schema?.details}
          customMessages={customMessages.details}
          styling={styling}
          readOnly={readOnly}
          formActions={enhancedFormActions}
        />
      </div>
    </div>
  );
}

/**
 * Organization details editing form.
 *
 * A comprehensive component for editing organization details including name,
 * display name, branding, and metadata. Provides form validation, lifecycle
 * hooks for save/cancel actions, and user feedback.
 *
 * @param props - {@link OrganizationDetailsEditProps}
 * @param props.schema - Validation schema overrides
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.saveAction - Lifecycle hooks for save operation
 * @param props.cancelAction - Lifecycle hooks for cancel operation
 * @param props.hideHeader - Hide the header section
 * @param props.backButton - Back button configuration
 * @returns Organization details edit component
 *
 * @see {@link OrganizationDetailsEditProps} for full props documentation
 *
 * @example
 * ```tsx
 * <OrganizationDetailsEdit
 *   saveAction={{
 *     onBefore: () => true,
 *     onAfter: (org) => console.log('Saved:', org),
 *   }}
 *   cancelAction={{
 *     onAfter: () => navigate(-1),
 *   }}
 * />
 * ```
 */
export const OrganizationDetailsEdit: React.ComponentType<OrganizationDetailsEditProps> =
  withMyOrganizationService(OrganizationDetailsEditComponent, MY_ORGANIZATION_DETAILS_EDIT_SCOPES);
