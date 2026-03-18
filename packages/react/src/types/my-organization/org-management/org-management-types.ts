/**
 * OrgManagement block type definitions.
 * @module org-management-types
 */

import type {
  BlockComponentSharedProps,
  OrgManagementMessages,
  OrganizationDetailsSchemas,
  OrganizationPrivate,
} from '@auth0/universal-components-core';

import type { OrganizationDetailsClasses } from '@/types/my-organization/organization-management/organization-details-types';

/**
 * Styling class overrides for OrgManagement block.
 */
export interface OrgManagementClasses {
  OrgManagement_Container?: string;
  OrgManagement_ListCard?: string;
  OrgManagement_FormCard?: string;
  OrgManagement_Header?: string;
  OrgManagement_Table?: string;
  OrgManagement_DeleteModal?: OrganizationDetailsClasses;
}

/**
 * Schema overrides for OrgManagement block.
 */
export interface OrgManagementSchemas {
  details?: OrganizationDetailsSchemas;
}

/**
 * View state for OrgManagement block.
 */
export type OrgManagementViewState = 'list' | 'create' | 'edit';

/**
 * State for the delete confirmation modal.
 */
export interface OrgDeleteModalState {
  isOpen: boolean;
  orgId: string | null;
  orgName: string | null;
}

/**
 * Alert state for notifications.
 */
export interface OrgManagementAlertState {
  type: 'success' | 'error' | null;
  message: string | null;
}

/**
 * Props for the OrgManagement block component.
 */
export interface OrgManagementProps
  extends BlockComponentSharedProps<
    OrgManagementMessages,
    OrgManagementClasses,
    OrgManagementSchemas
  > {
  /** Callback invoked after an organization is successfully created */
  onOrgCreated?: (org: OrganizationPrivate) => void;
  /** Callback invoked after an organization is successfully updated */
  onOrgUpdated?: (org: OrganizationPrivate) => void;
  /** Callback invoked after an organization is successfully deleted */
  onOrgDeleted?: (orgId: string) => void;
}

/**
 * Options for the useOrgManagement hook.
 */
export interface UseOrgManagementOptions {
  customMessages?: OrgManagementProps['customMessages'];
  readOnly?: OrgManagementProps['readOnly'];
  onOrgCreated?: OrgManagementProps['onOrgCreated'];
  onOrgUpdated?: OrgManagementProps['onOrgUpdated'];
  onOrgDeleted?: OrgManagementProps['onOrgDeleted'];
}

/**
 * Return type of the useOrgManagement hook.
 */
export interface UseOrgManagementResult {
  /** Current view state */
  viewState: OrgManagementViewState;
  /** List of organizations */
  organizations: OrganizationPrivate[];
  /** Whether organizations are loading */
  isLoadingOrganizations: boolean;
  /** Currently selected org for edit */
  selectedOrg: OrganizationPrivate | null;
  /** Delete modal state */
  deleteModal: OrgDeleteModalState;
  /** Whether a mutation is pending */
  isMutating: boolean;
  /** Alert state */
  alertState: OrgManagementAlertState;
  /** Navigate to create view */
  onNavigateToCreate: () => void;
  /** Navigate to edit view */
  onNavigateToEdit: (org: OrganizationPrivate) => void;
  /** Navigate back to list */
  onNavigateToList: () => void;
  /** Open delete modal */
  onOpenDeleteModal: (org: OrganizationPrivate) => void;
  /** Close delete modal */
  onCloseDeleteModal: () => void;
  /** Confirm delete */
  onConfirmDelete: () => Promise<void>;
  /** Submit create form */
  onCreateOrg: (data: OrganizationPrivate) => Promise<boolean>;
  /** Submit edit form */
  onUpdateOrg: (data: OrganizationPrivate) => Promise<boolean>;
  /** Dismiss alert */
  onDismissAlert: () => void;
}

/**
 * Props for the OrgManagement view component.
 */
export interface OrgManagementViewProps {
  viewState: OrgManagementViewState;
  organizations: OrganizationPrivate[];
  isLoadingOrganizations: boolean;
  selectedOrg: OrganizationPrivate | null;
  deleteModal: OrgDeleteModalState;
  isMutating: boolean;
  alertState: OrgManagementAlertState;
  schema: OrgManagementProps['schema'];
  styling: OrgManagementProps['styling'];
  customMessages: OrgManagementProps['customMessages'];
  readOnly: boolean;
  onNavigateToCreate: () => void;
  onNavigateToEdit: (org: OrganizationPrivate) => void;
  onNavigateToList: () => void;
  onOpenDeleteModal: (org: OrganizationPrivate) => void;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => Promise<void>;
  onCreateOrg: (data: OrganizationPrivate) => Promise<boolean>;
  onUpdateOrg: (data: OrganizationPrivate) => Promise<boolean>;
  onDismissAlert: () => void;
}
