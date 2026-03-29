/**
 * Organization management block type definitions.
 * @module organization-management-types
 */

import type { OrganizationPrivate } from '@auth0/universal-components-core';

/** The active view within the OrganizationManagement block. */
export type OrgManagementActiveView = 'table' | 'create' | 'details';

/** Alert type for org management operations. */
export type OrgManagementAlertType = 'created' | 'saved' | 'deleted' | 'error';

/** The variant controlling available features. */
export type OrgManagementVariant = 'v1' | 'v2';

/** Alert payload for org management operations. */
export interface OrgManagementAlertState {
  type: OrgManagementAlertType;
  orgName?: string;
}

/**
 * Summary of an organization (for the list view).
 */
export interface OrganizationSummary {
  id: string;
  name: string;
  display_name?: string;
}

/**
 * Data required to create a new organization.
 */
export interface CreateOrganizationFormData {
  name: string;
  display_name: string;
  branding?: {
    logo_url?: string;
    colors?: {
      primary?: string;
      page_background?: string;
    };
  };
}

/**
 * Client interface for organization management operations.
 * Consumers must supply this to the OrganizationManagement block.
 */
export interface OrganizationManagementClient {
  organizations: {
    /** List all organizations. */
    list: (options?: { abortSignal?: AbortSignal }) => Promise<OrganizationSummary[]>;
    /** Create a new organization. */
    create: (data: CreateOrganizationFormData) => Promise<OrganizationSummary>;
    /** Delete an organization by ID. */
    delete: (orgId: string) => Promise<void>;
  };
  organizationDetails: {
    /** Fetch full details for a specific organization. */
    get: (
      orgId: string,
      options?: { abortSignal?: AbortSignal },
    ) => Promise<OrganizationPrivate>;
    /** Update details for a specific organization. */
    update: (orgId: string, data: OrganizationPrivate) => Promise<OrganizationPrivate>;
  };
}

/**
 * Custom i18n message overrides for the organization management block.
 */
export interface OrgManagementMessages {
  table?: {
    title?: string;
    empty_state?: string;
    create_button?: string;
    search_placeholder?: string;
    columns?: {
      name?: string;
      identifier?: string;
    };
    row_actions?: {
      edit?: string;
      delete?: string;
    };
  };
  create?: {
    title?: string;
    back_button?: string;
    submit_button?: string;
    cancel_button?: string;
  };
  alerts?: {
    created?: string;
    saved?: string;
    deleted?: string;
    error?: string;
  };
}

/**
 * Props for the OrganizationManagement block.
 */
export interface OrganizationManagementProps {
  /**
   * Variant controlling available features.
   * - `v1`: read/edit only (no create, no delete)
   * - `v2`: full CRUD including create and delete
   * @defaultValue 'v2'
   */
  variant?: OrgManagementVariant;
  /** Client for organization API operations. */
  client: OrganizationManagementClient;
  /** Custom i18n message overrides. */
  customMessages?: Partial<OrgManagementMessages>;
  /** Optional CSS class name applied to the root element. */
  className?: string;
}

/**
 * Return value of the useOrganizationManagement hook.
 */
export interface UseOrganizationManagementResult {
  activeView: OrgManagementActiveView;
  selectedOrg: OrganizationSummary | null;
  deleteTarget: OrganizationSummary | null;
  alertState: OrgManagementAlertState | null;
  organizations: OrganizationSummary[];
  isListLoading: boolean;
  isDeleting: boolean;
  searchQuery: string;
  filteredOrganizations: OrganizationSummary[];
  onSearchChange: (query: string) => void;
  onNavigateToCreate: () => void;
  onNavigateToDetails: (org: OrganizationSummary) => void;
  onNavigateToTable: () => void;
  onRequestDelete: (org: OrganizationSummary) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => Promise<void>;
  onOrgCreated: (org: OrganizationSummary) => void;
  onOrgSaved: (orgName: string) => void;
}
