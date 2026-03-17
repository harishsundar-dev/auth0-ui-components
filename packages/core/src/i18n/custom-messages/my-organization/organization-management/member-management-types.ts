/**
 * Custom message type definitions for member management component.
 * @module member-management-types
 * @internal
 */
import type { OrganizationDetailsEditMessages } from './organization-details-edit-types';

export interface MemberManagementMessages {
  header?: {
    title?: string;
  };
  empty_state?: {
    title?: string;
    description?: string;
  };
  table?: {
    columns?: {
      name?: string;
      display_name?: string;
      actions?: string;
    };
  };
  actions?: {
    edit?: string;
  };
  tabs?: {
    details?: string;
    sso_providers?: string;
    domains?: string;
  };
  details?: OrganizationDetailsEditMessages;
}
