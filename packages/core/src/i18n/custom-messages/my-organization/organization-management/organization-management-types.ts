/**
 * Custom message type definitions for organization management component.
 * @module organization-management-types
 * @internal
 */
import type { OrganizationDetailsEditMessages } from './organization-details-edit-types';

export interface OrganizationManagementMessages extends OrganizationDetailsEditMessages {
  tabs?: {
    settings?: string;
    sso?: string;
    domains?: string;
  };
}
