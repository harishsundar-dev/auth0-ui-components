/**
 * Organization management types.
 * @module organization-management-types
 */

import type {
  BlockComponentSharedProps,
  ComponentAction,
  ComponentStyling,
  OrganizationManagementMessages,
  OrganizationPrivate,
} from '@auth0/universal-components-core';

import type { OrganizationDetailsEditSchemas } from '@/types/my-organization/organization-management/organization-details-edit-types';
import type { OrganizationDetailsFormActions } from '@/types/my-organization/organization-management/organization-details-types';
import type { OrganizationDetailsClasses } from '@/types/my-organization/organization-management/organization-details-types';

export type OrganizationManagementClasses = OrganizationDetailsClasses & {
  OrganizationManagement_Tabs?: string;
};

export type OrganizationManagementTab = 'settings' | 'sso' | 'domains';

export interface OrganizationManagementProps
  extends BlockComponentSharedProps<
    OrganizationManagementMessages,
    OrganizationManagementClasses,
    OrganizationDetailsEditSchemas
  > {
  saveAction?: ComponentAction<OrganizationPrivate>;
  cancelAction?: Omit<ComponentAction<OrganizationPrivate>, 'onBefore'>;
  deleteAction?: Omit<ComponentAction<OrganizationPrivate>, 'onBefore'>;
  hideHeader?: boolean;
  defaultTab?: OrganizationManagementTab;
}

export interface UseOrganizationManagementOptions {
  deleteAction?: OrganizationManagementProps['deleteAction'];
  customMessages?: OrganizationManagementProps['customMessages'];
}

export interface UseOrganizationManagementResult {
  isDeleteModalOpen: boolean;
  isDeleting: boolean;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  handleDeleteConfirm: (
    organizationName: string,
    organization: OrganizationPrivate,
  ) => Promise<void>;
}

export interface OrganizationManagementViewProps {
  schema: OrganizationManagementProps['schema'];
  styling: ComponentStyling<OrganizationManagementClasses>;
  customMessages: OrganizationManagementProps['customMessages'];
  readOnly: OrganizationManagementProps['readOnly'];
  hideHeader: boolean;
  defaultTab: OrganizationManagementTab;
  saveAction: OrganizationManagementProps['saveAction'];
  cancelAction: OrganizationManagementProps['cancelAction'];
  deleteAction: OrganizationManagementProps['deleteAction'];
  management: UseOrganizationManagementResult;
  organization: OrganizationPrivate;
  isFetchLoading: boolean;
  formActions: OrganizationDetailsFormActions;
}
