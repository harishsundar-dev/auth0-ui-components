import type { SharedComponentProps } from '@auth0/universal-components-core';

/**
 * Role assigned to a member
 */
export interface MemberRole {
  /** Role identifier */
  id: string;
  /** Role display name */
  name: string;
  /** Role description */
  description?: string;
}

/**
 * Organization member data structure
 */
export interface OrganizationMember {
  /** Unique user identifier */
  user_id: string;
  /** Member's email address */
  email?: string;
  /** Member's display name */
  name?: string;
  /** URL to member's profile picture */
  picture?: string;
  /** Assigned roles */
  roles: MemberRole[];
  /** ISO timestamp of last login */
  last_login?: string;
  /** ISO timestamp when member joined */
  created_at?: string;
}

/**
 * Pagination state for members list
 */
export interface MembersPagination {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  perPage: number;
  /** Total number of members */
  total: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Filter state for members list
 */
export interface MembersFilter {
  /** Search query for name/email */
  search: string;
  /** Filter by role ID */
  roleId: string | null;
}

/**
 * HTML class names that can be overridden
 */
export interface MembersListClasses {
  'MembersList-header'?: string;
  'MembersList-table'?: string;
  'MembersList-toolbar'?: string;
  'MembersList-pagination'?: string;
}

/**
 * Props for the MembersList block component
 */
export interface MembersListProps
  extends SharedComponentProps<Record<string, string>, MembersListClasses> {
  /** Callback when back button is clicked */
  onBack?: () => void;
  /** Callback when invite member is clicked */
  onInviteMember?: () => void;
  /** Callback when a member row is clicked */
  onMemberClick?: (member: OrganizationMember) => void;
  /** Callback when members are removed */
  onMembersRemoved?: (memberIds: string[]) => void;
  /** Initial page size */
  defaultPageSize?: 10 | 25 | 50 | 100;
  /** Whether to show the invitations tab */
  showInvitationsTab?: boolean;
  /** Whether to hide the header */
  hideHeader?: boolean;
}

/**
 * Return type for useMembersList hook
 */
export interface UseMembersListReturn {
  /** List of members for current page */
  members: OrganizationMember[];
  /** Available roles for filtering */
  roles: MemberRole[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Pagination state */
  pagination: MembersPagination;
  /** Filter state */
  filters: MembersFilter;
  /** Selected member IDs */
  selectedMembers: Set<string>;
  /** Actions */
  actions: {
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setSearch: (query: string) => void;
    setRoleFilter: (roleId: string | null) => void;
    resetFilters: () => void;
    selectMember: (memberId: string) => void;
    deselectMember: (memberId: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
    toggleMember: (memberId: string) => void;
    removeMembers: (memberIds: string[]) => Promise<void>;
  };
  /** Computed values */
  computed: {
    isAllSelected: boolean;
    isSomeSelected: boolean;
    selectedCount: number;
    hasFilters: boolean;
  };
}

export interface UseMembersListOptions {
  defaultPageSize?: number;
}
