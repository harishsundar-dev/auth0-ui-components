/** @module org-management */

import { getComponentStyles } from '@auth0/universal-components-core';
import * as React from 'react';

import { OrgCreateForm } from '@/components/auth0/my-organization/shared/organization-management/org-create/org-create-form';
import { OrgDeleteModal } from '@/components/auth0/my-organization/shared/organization-management/org-delete/org-delete-modal';
import { OrgListView } from '@/components/auth0/my-organization/shared/organization-management/org-list/org-list-view';
import { OrganizationDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/organization-details';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Spinner } from '@/components/ui/spinner';
import { useOrgManagement } from '@/hooks/my-organization/use-org-management';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  OrgManagementProps,
  OrgManagementViewProps,
} from '@/types/my-organization/org-management/org-management-types';

/**
 * OrgManagement block container component.
 * @param props - Component props
 * @param props.schema - Validation schema overrides
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.onOrgCreated - Callback after org is created
 * @param props.onOrgUpdated - Callback after org is updated
 * @param props.onOrgDeleted - Callback after org is deleted
 * @returns JSX element
 * @internal
 */
function OrgManagementContainer(props: OrgManagementProps): React.JSX.Element {
  const {
    schema,
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
    onOrgCreated,
    onOrgUpdated,
    onOrgDeleted,
  } = props;

  const hookResult = useOrgManagement({
    customMessages,
    readOnly,
    onOrgCreated,
    onOrgUpdated,
    onOrgDeleted,
  });

  return (
    <OrgManagementView
      {...hookResult}
      schema={schema}
      styling={styling}
      customMessages={customMessages}
      readOnly={readOnly}
    />
  );
}

/**
 * OrgManagement view component (presentational).
 * @param props - View props
 * @returns JSX element
 * @internal
 */
function OrgManagementView({
  viewState,
  organizations,
  isLoadingOrganizations,
  selectedOrg,
  deleteModal,
  isMutating,
  alertState,
  schema,
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages = {},
  readOnly,
  onNavigateToCreate,
  onNavigateToEdit,
  onNavigateToList,
  onOpenDeleteModal,
  onCloseDeleteModal,
  onConfirmDelete,
  onCreateOrg,
  onUpdateOrg,
  onDismissAlert,
}: OrgManagementViewProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.org_management', customMessages);
  const { isDarkMode } = useTheme();

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const editFormActions = React.useMemo(
    () => ({
      isLoading: isMutating,
      previousAction: {
        disabled: isMutating || readOnly,
        onClick: onNavigateToList,
      },
      nextAction: {
        disabled: isMutating || readOnly,
        onClick: onUpdateOrg,
      },
    }),
    [isMutating, readOnly, onNavigateToList, onUpdateOrg],
  );

  return (
    <StyledScope style={currentStyles.variables}>
      <div className="w-full">
        {/* Delete confirmation modal — always rendered for accessibility */}
        <OrgDeleteModal
          isOpen={deleteModal.isOpen}
          orgName={deleteModal.orgName}
          isLoading={isMutating}
          customMessages={customMessages}
          onClose={onCloseDeleteModal}
          onConfirm={onConfirmDelete}
        />

        {/* List View */}
        {viewState === 'list' && (
          <OrgListView
            organizations={organizations}
            isLoading={isLoadingOrganizations}
            alertState={alertState}
            readOnly={readOnly}
            customMessages={customMessages}
            onNavigateToCreate={onNavigateToCreate}
            onNavigateToEdit={onNavigateToEdit}
            onOpenDeleteModal={onOpenDeleteModal}
            onDismissAlert={onDismissAlert}
          />
        )}

        {/* Create View */}
        {viewState === 'create' && (
          <OrgCreateForm
            schema={schema}
            customMessages={customMessages}
            styling={styling}
            isMutating={isMutating}
            onCreateOrg={onCreateOrg}
            onCancel={onNavigateToList}
          />
        )}

        {/* Edit View */}
        {viewState === 'edit' && selectedOrg && (
          <div className="w-full">
            <div className="mb-8">
              <Header
                title={selectedOrg.display_name || selectedOrg.name || ''}
                backButton={{
                  text: t('edit.back_button_text'),
                  onClick: onNavigateToList,
                }}
                actions={
                  !readOnly
                    ? [
                        {
                          type: 'button',
                          label: t('delete.delete_button_label'),
                          variant: 'destructive',
                          onClick: () => onOpenDeleteModal(selectedOrg),
                        },
                      ]
                    : undefined
                }
              />
            </div>

            <OrganizationDetails
              organization={selectedOrg}
              schema={schema?.details}
              customMessages={customMessages?.edit?.details}
              styling={styling}
              readOnly={readOnly}
              formActions={editFormActions}
            />
          </div>
        )}

        {/* Edit loading fallback */}
        {viewState === 'edit' && !selectedOrg && (
          <div className="flex items-center justify-center min-h-48 w-full">
            <Spinner />
          </div>
        )}
      </div>
    </StyledScope>
  );
}

/**
 * OrgManagement block — comprehensive multi-tenant organization administration component.
 *
 * Enables B2B SaaS administrators to manage organizations, including:
 * - Listing all organizations in a searchable table
 * - Creating new organizations with settings and branding configuration
 * - Editing organization details
 * - Deleting organizations with type-to-confirm safety check
 *
 * @param props - {@link OrgManagementProps}
 * @param props.schema - Validation schema overrides
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.onOrgCreated - Callback after org is created
 * @param props.onOrgUpdated - Callback after org is updated
 * @param props.onOrgDeleted - Callback after org is deleted
 * @returns Organization management block component
 *
 * @see {@link OrgManagementProps} for full props documentation
 *
 * @example
 * ```tsx
 * <OrgManagement
 *   onOrgCreated={(org) => console.log('Created:', org)}
 *   onOrgUpdated={(org) => console.log('Updated:', org)}
 *   onOrgDeleted={(id) => console.log('Deleted:', id)}
 * />
 * ```
 */
export { OrgManagementContainer as OrgManagement, OrgManagementView };
