/**
 * Org create form component for OrgManagement block.
 * @module org-create-form
 * @internal
 */

import {
  getComponentStyles,
  OrganizationDetailsFactory,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { OrganizationDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/organization-details';
import { Header } from '@/components/auth0/shared/header';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  OrgManagementProps,
  OrgManagementSchemas,
} from '@/types/my-organization/org-management/org-management-types';

export interface OrgCreateFormProps {
  schema?: OrgManagementSchemas;
  customMessages?: OrgManagementProps['customMessages'];
  styling?: OrgManagementProps['styling'];
  isMutating: boolean;
  onCreateOrg: (data: OrganizationPrivate) => Promise<boolean>;
  onCancel: () => void;
}

const EMPTY_ORG = OrganizationDetailsFactory.create();

/**
 * OrgCreateForm — form for creating a new organization.
 * @param props - Component props
 * @param props.schema - Validation schema overrides
 * @param props.customMessages - Custom translation message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.isMutating - Whether a mutation is in progress
 * @param props.onCreateOrg - Callback to submit the create form
 * @param props.onCancel - Callback to cancel and go back
 * @returns JSX element
 * @internal
 */
export function OrgCreateForm({
  schema,
  customMessages,
  styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  isMutating,
  onCreateOrg,
  onCancel,
}: OrgCreateFormProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.org_management', customMessages);
  const { isDarkMode } = useTheme();

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const formActions = React.useMemo(
    () => ({
      isLoading: isMutating,
      previousAction: {
        disabled: isMutating,
        onClick: onCancel,
      },
      nextAction: {
        disabled: isMutating,
        onClick: onCreateOrg,
      },
    }),
    [isMutating, onCancel, onCreateOrg],
  );

  return (
    <div className="w-full" style={currentStyles.variables}>
      <div className="mb-8">
        <Header title={t('create.title')} />
      </div>
      <OrganizationDetails
        organization={EMPTY_ORG}
        schema={schema?.details}
        customMessages={customMessages?.create?.details}
        styling={styling}
        readOnly={false}
        formActions={formActions}
      />
    </div>
  );
}
