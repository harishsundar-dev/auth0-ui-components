import type {
  BulkInviteFormData,
  Invitation,
  OrganizationRole,
  SharedComponentProps,
  SingleInviteFormData,
} from '@auth0/universal-components-core';

/**
 * Styling classes for InviteMember components
 */
export interface InviteMemberClasses {
  InviteMember_Dialog?: string;
  InviteMember_Form?: string;
  InviteMember_EmailInput?: string;
  InviteMember_RoleSelector?: string;
  InviteMember_SubmitButton?: string;
  InviteMember_CancelButton?: string;
}

/**
 * Custom messages for InviteMember component
 */
export interface InviteMemberMessages {
  'inviteMember.title'?: string;
  'inviteMember.description'?: string;
  'inviteMember.trigger.button'?: string;
  'inviteMember.mode.single'?: string;
  'inviteMember.mode.bulk'?: string;
  'inviteMember.form.email.label'?: string;
  'inviteMember.form.email.placeholder'?: string;
  'inviteMember.form.email.error.required'?: string;
  'inviteMember.form.email.error.invalid'?: string;
  'inviteMember.form.emails.label'?: string;
  'inviteMember.form.emails.placeholder'?: string;
  'inviteMember.form.emails.hint'?: string;
  'inviteMember.form.emails.error.required'?: string;
  'inviteMember.form.emails.error.invalid'?: string;
  'inviteMember.form.emails.error.tooMany'?: string;
  'inviteMember.form.roles.label'?: string;
  'inviteMember.form.roles.placeholder'?: string;
  'inviteMember.form.roles.empty'?: string;
  'inviteMember.form.roles.loading'?: string;
  'inviteMember.form.submit'?: string;
  'inviteMember.form.submit_bulk'?: string;
  'inviteMember.form.cancel'?: string;
  'inviteMember.success.title'?: string;
  'inviteMember.success.title_bulk'?: string;
  'inviteMember.success.message'?: string;
  'inviteMember.success.message_bulk'?: string;
  'inviteMember.success.close'?: string;
  'inviteMember.error.generic'?: string;
  'inviteMember.error.duplicate'?: string;
  'inviteMember.error.memberExists'?: string;
  'inviteMember.roleSelector.selectAll'?: string;
  'inviteMember.roleSelector.clearAll'?: string;
  'inviteMember.roleSelector.selected'?: string;
}

/**
 * Props for the InviteMember block component
 */
export interface InviteMemberProps
  extends SharedComponentProps<InviteMemberMessages, InviteMemberClasses> {
  /** Organization ID for the invitations */
  organizationId: string;
  /** Callback fired when invitation is sent successfully */
  onInviteSent?: (invitation: Invitation | Invitation[]) => void;
  /** Callback fired on invitation error */
  onError?: (error: Error) => void;
  /** Default invite mode */
  defaultMode?: 'single' | 'bulk';
  /** Maximum number of bulk invites allowed */
  maxBulkInvites?: number;
}

/**
 * Props for the InviteMemberDialog component
 */
export interface InviteMemberDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Callback to close dialog */
  onClose: () => void;
  /** Organization ID */
  organizationId: string;
  /** Available roles for selection */
  roles: OrganizationRole[];
  /** Loading state for roles */
  isLoadingRoles: boolean;
  /** Current invite mode */
  mode: 'single' | 'bulk';
  /** Callback to change mode */
  onModeChange: (mode: 'single' | 'bulk') => void;
  /** Callback when form is submitted */
  onSubmit: (data: SingleInviteFormData | BulkInviteFormData) => Promise<void>;
  /** Whether submission is in progress */
  isSubmitting: boolean;
  /** Submission error if any */
  error?: Error | null;
  /** Custom messages for translations */
  customMessages?: Partial<InviteMemberMessages>;
  /** Styling classes */
  classes?: Partial<InviteMemberClasses>;
  /** Max bulk invites */
  maxBulkInvites: number;
}

/**
 * Props for the RoleSelector component
 */
export interface RoleSelectorProps {
  /** Available roles */
  roles: OrganizationRole[];
  /** Currently selected role IDs */
  selectedRoles: string[];
  /** Callback when selection changes */
  onChange: (roleIds: string[]) => void;
  /** Whether selector is disabled */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Custom messages */
  customMessages?: Partial<InviteMemberMessages>;
  /** CSS class name */
  className?: string;
}

/**
 * Props for Single Invite Form
 */
export interface SingleInviteFormProps {
  /** Form submit handler */
  onSubmit: (data: SingleInviteFormData) => void;
  /** Available roles */
  roles: OrganizationRole[];
  /** Loading state for roles */
  isLoadingRoles: boolean;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Custom messages */
  customMessages?: Partial<InviteMemberMessages>;
  /** CSS classes */
  classes?: Partial<InviteMemberClasses>;
}

/**
 * Props for Bulk Invite Form
 */
export interface BulkInviteFormProps {
  /** Form submit handler */
  onSubmit: (data: BulkInviteFormData) => void;
  /** Available roles */
  roles: OrganizationRole[];
  /** Loading state for roles */
  isLoadingRoles: boolean;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Maximum bulk invites */
  maxBulkInvites: number;
  /** Custom messages */
  customMessages?: Partial<InviteMemberMessages>;
  /** CSS classes */
  classes?: Partial<InviteMemberClasses>;
}

/**
 * Return type for useInviteMember hook
 */
export interface UseInviteMemberReturn {
  /** Send a single invitation */
  sendInvitation: (data: SingleInviteFormData) => Promise<Invitation>;
  /** Send bulk invitations */
  sendBulkInvitations: (data: BulkInviteFormData) => Promise<Invitation[]>;
  /** Whether a mutation is in progress */
  isSubmitting: boolean;
  /** Last error from mutation */
  error: Error | null;
  /** Reset error state */
  resetError: () => void;
}

/**
 * Return type for useOrganizationRoles hook
 */
export interface UseOrganizationRolesReturn {
  /** Available roles */
  roles: OrganizationRole[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch roles */
  refetch: () => void;
}
