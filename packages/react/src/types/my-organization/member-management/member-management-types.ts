import type {
  Member,
  Invitation,
  MemberManagementMessages,
  BlockComponentSharedProps,
} from '@auth0/universal-components-core';

/**
 * Tab options for the member management view
 */
export type MemberManagementTab = 'members' | 'invitations';

/**
 * Classes for styling the member management component
 */
export interface MemberManagementClasses {
  root?: string;
  header?: string;
  tabs?: string;
  table?: string;
  dialog?: string;
}

/**
 * Schemas for member management validation
 */
export interface MemberManagementSchemas {
  email?: unknown;
  emails?: unknown;
  roles?: unknown;
}

/**
 * Props for the MemberManagement block component
 */
export interface MemberManagementProps
  extends BlockComponentSharedProps<
    MemberManagementMessages,
    MemberManagementClasses,
    MemberManagementSchemas
  > {
  /**
   * Initial tab to display
   * @default 'members'
   */
  defaultTab?: MemberManagementTab;

  /**
   * Maximum number of emails allowed in bulk invite
   * @default 10
   */
  maxBulkInvites?: number;

  /**
   * Callback when a member is selected for details view
   */
  onMemberSelect?: (member: Member | null) => void;

  /**
   * Callback when invitation is successfully sent
   */
  onInviteSent?: (invitation: Invitation) => void;

  /**
   * Callback when member is deleted
   */
  onMemberDeleted?: (userId: string) => void;

  /**
   * Callback when member is removed from organization
   */
  onMemberRemoved?: (userId: string) => void;

  /**
   * Enable/disable bulk selection mode
   * @default true
   */
  enableBulkActions?: boolean;

  /**
   * Number of items per page
   * @default 10
   */
  pageSize?: number;
}
