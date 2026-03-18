/**
 * Custom message type definitions for org management block.
 * @module org-management-types
 * @internal
 */
import type { OrganizationDeleteMessages } from './organization-delete-types';
import type { OrganizationDetailsMessages } from './organization-details-types';

export interface OrgManagementMessages {
  header?: {
    title?: string;
  };
  list?: {
    empty_state?: {
      title?: string;
      description?: string;
      create_button_label?: string;
    };
    table?: {
      name_column?: string;
      display_name_column?: string;
      actions_column?: string;
      edit_action?: string;
      delete_action?: string;
    };
    create_button_label?: string;
    search_placeholder?: string;
  };
  create?: {
    title?: string;
    create_button_label?: string;
    cancel_button_label?: string;
    created_message?: string;
    error_message?: string;
    details?: OrganizationDetailsMessages;
  };
  edit?: {
    back_button_text?: string;
    sso_providers_tab?: string;
    domains_tab?: string;
    updated_message?: string;
    details?: OrganizationDetailsMessages;
  };
  delete?: OrganizationDeleteMessages;
}
