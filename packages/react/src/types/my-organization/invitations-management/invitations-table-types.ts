import type {
  SharedComponentProps,
  ComponentAction,
  Invitation,
  Role,
  InvitationsTableMessages,
  InvitationCreateMessages,
  InvitationDeleteMessages,
  InvitationCreateSchemas,
  EnhancedTranslationFunction,
} from '@auth0/universal-components-core';

export type { Invitation, Role };

/* ============ Components ============ */

// HTML classNames that the user can override
export interface InvitationsTableClasses {
  'InvitationsTable-header'?: string;
  'InvitationsTable-tabs'?: string;
  'InvitationsTable-filters'?: string;
  'InvitationsTable-table'?: string;
  'InvitationsTable-createModal'?: string;
  'InvitationsTable-deleteModal'?: string;
}

// Component messages that the user can override
export interface InvitationsTableMainMessages extends InvitationsTableMessages {
  create: InvitationCreateMessages;
  delete: InvitationDeleteMessages;
}

// Validation schemas that the user can override
export interface InvitationsTableSchema {
  create?: InvitationCreateSchemas;
}

export interface InvitationsTableProps
  extends SharedComponentProps<
    InvitationsTableMainMessages,
    InvitationsTableClasses,
    InvitationsTableSchema
  > {
  hideHeader?: boolean;
  createAction?: ComponentAction<Invitation[]>;
  resendAction?: ComponentAction<Invitation>;
  deleteAction?: ComponentAction<Invitation>;
  onTabChange?: (tab: 'members' | 'invitations') => void;
  defaultTab?: 'members' | 'invitations';
  pageSize?: number;
}

/* ============ Subcomponents ============ */

export interface InvitationsTableActionsColumnProps {
  customMessages?: Partial<InvitationsTableMainMessages>;
  readOnly: boolean;
  invitation: Invitation;
  onResend: (invitation: Invitation) => void;
  onDelete: (invitation: Invitation) => void;
  isResending: boolean;
}

/* ============ Hooks ============ */

export interface UseInvitationsTableOptions {
  createAction?: InvitationsTableProps['createAction'];
  resendAction?: InvitationsTableProps['resendAction'];
  deleteAction?: InvitationsTableProps['deleteAction'];
  customMessages?: InvitationsTableProps['customMessages'];
  pageSize?: number;
}

export interface UseInvitationsTableResult extends SharedComponentProps {
  invitations: Invitation[];
  roles: Role[];
  totalInvitations: number;
  currentPage: number;
  isFetchingInvitations: boolean;
  isFetchingRoles: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isResending: boolean;
  selectedRoleFilter: string | null;
  setSelectedRoleFilter: (role: string | null) => void;
  setCurrentPage: (page: number) => void;
  fetchInvitations: () => Promise<void>;
  onCreateInvitation: (emails: string[], roles: string[]) => Promise<Invitation[] | null>;
  onResendInvitation: (invitation: Invitation) => Promise<Invitation | null>;
  onDeleteInvitation: (invitation: Invitation) => Promise<void>;
}

export interface UseInvitationsTableLogicOptions {
  t: EnhancedTranslationFunction;
  onCreateInvitation: UseInvitationsTableResult['onCreateInvitation'];
  onResendInvitation: UseInvitationsTableResult['onResendInvitation'];
  onDeleteInvitation: UseInvitationsTableResult['onDeleteInvitation'];
  fetchInvitations: UseInvitationsTableResult['fetchInvitations'];
  onTabChange?: InvitationsTableProps['onTabChange'];
  defaultTab?: InvitationsTableProps['defaultTab'];
}

export interface UseInvitationsTableLogicResult {
  // Tab state
  activeTab: 'members' | 'invitations';
  setActiveTab: (tab: 'members' | 'invitations') => void;

  // Modal state
  showCreateModal: boolean;
  showDeleteModal: boolean;
  selectedInvitation: Invitation | null;

  // State setters
  setShowCreateModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;

  // Handlers
  handleCreate: (emails: string[], roles: string[]) => Promise<void>;
  handleResend: (invitation: Invitation) => Promise<void>;
  handleDelete: (invitation: Invitation) => Promise<void>;
  handleCreateClick: () => void;
  handleResendClick: (invitation: Invitation) => void;
  handleDeleteClick: (invitation: Invitation) => void;
}
