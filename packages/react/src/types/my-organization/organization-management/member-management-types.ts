/**
 * Member management component types.
 * @module member-management-types
 */

import type {
  BlockComponentSharedProps,
  ComponentAction,
  OrganizationPrivate,
  MemberManagementMessages,
  ComponentStyling,
} from '@auth0/universal-components-core';

import type {
  DomainTableProps,
  DomainTableSchema,
} from '@/types/my-organization/domain-management/domain-table-types';
import type { SsoProviderTableProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';
import type { OrganizationDetailsEditSchemas } from '@/types/my-organization/organization-management/organization-details-edit-types';

/** CSS class overrides for MemberManagement component. */
export interface MemberManagementClasses {
  'MemberManagement-header'?: string;
  'MemberManagement-table'?: string;
  'MemberManagement-tabs'?: string;
  'MemberManagement-emptyState'?: string;
}

/** Schemas that can be used to override default validation schemas. */
export type MemberManagementSchemas = {
  details?: Partial<OrganizationDetailsEditSchemas>;
  domains?: Partial<DomainTableSchema>;
};

/**
 * Props for the MemberManagement block component.
 */
export interface MemberManagementProps
  extends BlockComponentSharedProps<
    MemberManagementMessages,
    MemberManagementClasses,
    MemberManagementSchemas
  > {
  /** Configuration for the save action when updating organization details. */
  saveAction?: ComponentAction<OrganizationPrivate>;
  /** Configuration for the cancel action when discarding changes. */
  cancelAction?: Omit<ComponentAction<OrganizationPrivate>, 'onBefore'>;
  /** SSO provider table action configuration. */
  ssoProviders?: Pick<
    SsoProviderTableProps,
    | 'createAction'
    | 'editAction'
    | 'deleteAction'
    | 'deleteFromOrganizationAction'
    | 'enableProviderAction'
  >;
  /** Domain table action configuration. */
  domains?: Pick<
    DomainTableProps,
    | 'createAction'
    | 'verifyAction'
    | 'deleteAction'
    | 'associateToProviderAction'
    | 'deleteFromProviderAction'
    | 'onOpenProvider'
    | 'onCreateProvider'
  >;
}

/**
 * Internal view state for the MemberManagement component.
 * @internal
 */
export type MemberManagementActiveView = 'list' | 'edit';

/**
 * Props for the MemberManagement view component.
 * @internal
 */
export interface MemberManagementViewProps {
  organization: OrganizationPrivate;
  isFetchLoading: boolean;
  view: MemberManagementActiveView;
  activeTab: string;
  styling: ComponentStyling<MemberManagementClasses>;
  customMessages: Partial<MemberManagementMessages> | undefined;
  readOnly: boolean | undefined;
  schema: Partial<MemberManagementSchemas> | undefined;
  ssoProviders: MemberManagementProps['ssoProviders'];
  domains: MemberManagementProps['domains'];
  saveAction: MemberManagementProps['saveAction'];
  cancelAction: MemberManagementProps['cancelAction'];
  onEdit: () => void;
  onBack: () => void;
  onTabChange: (tab: string) => void;
}
