/** @module organization-management */

import {
  getComponentStyles,
  OrganizationDetailsFactory,
  createOrganizationDetailSchema,
} from '@auth0/universal-components-core';
import type {
  OrganizationPrivate,
  OrganizationDetailsFormValues,
} from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import { EllipsisVertical, Plus, CheckCircle, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { OrganizationDetails } from '@/components/auth0/my-organization/shared/organization-management/organization-details/organization-details';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TextField } from '@/components/ui/text-field';
import { useOrganizationManagement } from '@/hooks/my-organization/use-organization-management';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  CreateOrganizationFormData,
  OrgManagementAlertState,
  OrgManagementMessages,
  OrganizationManagementClient,
  OrganizationManagementProps,
  OrganizationSummary,
} from '@/types/my-organization/organization-management/organization-management-types';

// ─── Alert Components ─────────────────────────────────────────────────────────

interface OrgAlertProps {
  alertState: OrgManagementAlertState;
  customMessages?: Partial<OrgManagementMessages>;
}

/**
 * Renders a success or error alert for org management operations.
 * @param props - Component props.
 * @param props.alertState - Current alert state.
 * @param props.customMessages - Custom i18n message overrides.
 * @returns Alert element.
 * @internal
 */
function OrgAlert({ alertState, customMessages }: OrgAlertProps): React.JSX.Element | null {
  const { t } = useTranslator('organization_management.block', customMessages);

  const isSuccess = alertState.type === 'created' || alertState.type === 'saved' || alertState.type === 'deleted';

  const getMessage = (): string => {
    const orgName = alertState.orgName ?? '';
    switch (alertState.type) {
      case 'created':
        return t('alerts.created', { organizationName: orgName });
      case 'saved':
        return t('alerts.saved', { organizationName: orgName });
      case 'deleted':
        return t('alerts.deleted', { organizationName: orgName });
      case 'error':
      default:
        return t('alerts.error');
    }
  };

  return (
    <div aria-live="polite" role="status">
      <Alert variant={isSuccess ? 'success' : 'destructive'}>
        {isSuccess ? <CheckCircle aria-hidden="true" /> : <AlertCircle aria-hidden="true" />}
        <AlertTitle>{getMessage()}</AlertTitle>
      </Alert>
    </div>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  org: OrganizationSummary;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  customMessages?: Partial<OrgManagementMessages>;
}

/**
 * Delete confirmation dialog. Requires the user to type the org's machine name to confirm.
 * @param props - Component props.
 * @param props.org - Organization to delete.
 * @param props.isOpen - Whether the dialog is open.
 * @param props.onClose - Callback to close the dialog.
 * @param props.onConfirm - Callback to confirm deletion.
 * @param props.isDeleting - Whether deletion is in progress.
 * @returns Dialog element.
 * @internal
 */
function DeleteConfirmDialog({
  org,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps): React.JSX.Element {
  const [confirmationInput, setConfirmationInput] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const orgName = org.display_name ?? org.name;

  // Use translate for the delete dialog strings
  const { t: tDelete } = useTranslator('organization_management.organization_delete');

  // Reset input on open
  React.useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
      // Focus the input when dialog opens
      const timeout = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isOpen]);

  const isConfirmEnabled = confirmationInput.trim() === org.name && !isDeleting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{tDelete('modal_title', { organizationName: orgName })}</DialogTitle>
          <DialogDescription>
            {tDelete('modal_description', { organizationName: orgName })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label htmlFor="delete-confirm-input" className="text-sm font-medium">
            {tDelete('organization_name_field_label')}
          </label>
          <TextField
            id="delete-confirm-input"
            ref={inputRef}
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder={tDelete('organization_name_field_placeholder')}
            aria-describedby="delete-confirm-hint"
            disabled={isDeleting}
          />
          <p id="delete-confirm-hint" className="text-sm text-muted-foreground">
            {tDelete('organization_name_field_error', { organizationName: org.name })}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {tDelete('cancel_button_label')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!isConfirmEnabled}
            aria-disabled={!isConfirmEnabled}
          >
            {isDeleting ? (
              <Spinner size="sm" colorScheme="primary" aria-hidden="true" />
            ) : null}
            {tDelete('delete_button_label')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Org Table Empty State ────────────────────────────────────────────────────

interface OrgTableEmptyStateProps {
  showCreateButton: boolean;
  onCreateClick: () => void;
  customMessages?: Partial<OrgManagementMessages>;
}

/**
 * Empty state for the org table when no organizations exist.
 * @param props - Component props.
 * @param props.showCreateButton - Whether to show the Create Organization CTA.
 * @param props.onCreateClick - Callback when Create Organization is clicked.
 * @param props.customMessages - Custom i18n message overrides.
 * @returns Empty state element.
 * @internal
 */
function OrgTableEmptyState({
  showCreateButton,
  onCreateClick,
  customMessages,
}: OrgTableEmptyStateProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.block', customMessages);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <p className="text-muted-foreground text-sm">{t('table.empty_state')}</p>
      {showCreateButton && (
        <Button variant="primary" onClick={onCreateClick}>
          <Plus aria-hidden="true" />
          {t('table.create_button')}
        </Button>
      )}
    </div>
  );
}

// ─── Org Table ────────────────────────────────────────────────────────────────

interface OrgTableProps {
  organizations: OrganizationSummary[];
  isLoading: boolean;
  searchQuery: string;
  showCreateButton: boolean;
  showDeleteAction: boolean;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
  onEditClick: (org: OrganizationSummary) => void;
  onDeleteClick: (org: OrganizationSummary) => void;
  customMessages?: Partial<OrgManagementMessages>;
}

/**
 * Organization table with search, toolbar, and row actions.
 * @param props - Component props.
 * @param props.organizations - Filtered list of organizations to display.
 * @param props.isLoading - Whether data is loading.
 * @param props.searchQuery - Current search query.
 * @param props.showCreateButton - Whether to show the Create Organization button.
 * @param props.showDeleteAction - Whether to show the Delete action in row menus.
 * @param props.onSearchChange - Callback when search input changes.
 * @param props.onCreateClick - Callback when Create Organization is clicked.
 * @param props.onEditClick - Callback when Edit is selected for a row.
 * @param props.onDeleteClick - Callback when Delete is selected for a row.
 * @param props.customMessages - Custom i18n message overrides.
 * @returns Table element.
 * @internal
 */
function OrgTable({
  organizations,
  isLoading,
  searchQuery,
  showCreateButton,
  showDeleteAction,
  onSearchChange,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  customMessages,
}: OrgTableProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.block', customMessages);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between gap-4">
        <TextField
          placeholder={t('table.search_placeholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={t('table.search_placeholder')}
          className="max-w-64"
        />
        {showCreateButton && (
          <Button variant="primary" onClick={onCreateClick} size="sm">
            <Plus aria-hidden="true" />
            {t('table.create_button')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-48">
          <Spinner />
        </div>
      ) : organizations.length === 0 && !searchQuery ? (
        <OrgTableEmptyState
          showCreateButton={showCreateButton}
          onCreateClick={onCreateClick}
          customMessages={customMessages}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow disableHover>
              <TableHead>{t('table.columns.name')}</TableHead>
              <TableHead>{t('table.columns.identifier')}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.length === 0 ? (
              <TableRow disableHover>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  {t('table.empty_state')}
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <OrgTableRow
                  key={org.id}
                  org={org}
                  showDeleteAction={showDeleteAction}
                  onEditClick={onEditClick}
                  onDeleteClick={onDeleteClick}
                  customMessages={customMessages}
                />
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ─── Org Table Row ────────────────────────────────────────────────────────────

interface OrgTableRowProps {
  org: OrganizationSummary;
  showDeleteAction: boolean;
  onEditClick: (org: OrganizationSummary) => void;
  onDeleteClick: (org: OrganizationSummary) => void;
  customMessages?: Partial<OrgManagementMessages>;
}

/**
 * A single row in the org table with a context menu exposing Edit and Delete actions.
 * @param props - Component props.
 * @param props.org - The organization to render.
 * @param props.showDeleteAction - Whether to show the Delete action.
 * @param props.onEditClick - Callback when Edit is selected.
 * @param props.onDeleteClick - Callback when Delete is selected.
 * @param props.customMessages - Custom i18n message overrides.
 * @returns Table row element.
 * @internal
 */
function OrgTableRow({
  org,
  showDeleteAction,
  onEditClick,
  onDeleteClick,
  customMessages,
}: OrgTableRowProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.block', customMessages);

  return (
    <TableRow>
      <TableCell className="font-medium">{org.display_name ?? org.name}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{org.name}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            variant="ghost"
            size="icon"
            aria-label={`${t('table.row_actions.edit')} ${org.display_name ?? org.name}`}
          >
            <EllipsisVertical aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditClick(org)}>
              {t('table.row_actions.edit')}
            </DropdownMenuItem>
            {showDeleteAction && (
              <DropdownMenuItem
                onClick={() => onDeleteClick(org)}
                className="text-destructive focus:text-destructive"
              >
                {t('table.row_actions.delete')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// ─── Org Create Form ──────────────────────────────────────────────────────────

interface OrgCreateFormProps {
  onBack: () => void;
  onCreated: (org: OrganizationSummary) => void;
  client: OrganizationManagementClient;
  customMessages?: Partial<OrgManagementMessages>;
}

/**
 * Create Organization form with name, display name, and branding fields.
 * @param props - Component props.
 * @param props.onBack - Callback to navigate back to the table.
 * @param props.onCreated - Callback when an org is successfully created.
 * @param props.client - Organization API client.
 * @param props.customMessages - Custom i18n message overrides.
 * @returns Create form element.
 * @internal
 */
function OrgCreateForm({
  onBack,
  onCreated,
  client,
  customMessages,
}: OrgCreateFormProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.block', customMessages);
  const { t: tDetails } = useTranslator('organization_management.organization_details', customMessages);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const schema = React.useMemo(
    () =>
      createOrganizationDetailSchema({
        name: { errorMessage: tDetails('sections.settings.fields.name.error') },
        displayName: { errorMessage: tDetails('sections.settings.fields.display_name.error') },
        primaryColor: { errorMessage: tDetails('sections.branding.fields.primary_color.error') },
        logoURL: { errorMessage: tDetails('sections.branding.fields.logo.error') },
        backgroundColor: {
          errorMessage: tDetails('sections.branding.fields.page_background_color.error'),
        },
      }),
    [tDetails],
  );

  const form = useForm<OrganizationDetailsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      display_name: '',
      branding: {
        logo_url: '',
        colors: {
          primary: '#ffffff',
          page_background: '#000000',
        },
      },
    },
  });

  const onSubmit = async (values: OrganizationDetailsFormValues) => {
    setIsSubmitting(true);
    try {
      const data: CreateOrganizationFormData = {
        name: values.name ?? '',
        display_name: values.display_name ?? '',
        branding: values.branding,
      };
      const created = await client.organizations.create(data);
      onCreated(created);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft aria-hidden="true" />
          {t('create.back_button')}
        </Button>
        <h1 className="text-2xl font-semibold">{t('create.title')}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Name field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="create-org-name">
                      {tDetails('sections.settings.fields.name.label')}
                    </FormLabel>
                    <FormControl>
                      <TextField
                        id="create-org-name"
                        placeholder={tDetails('sections.settings.fields.name.placeholder')}
                        error={Boolean(form.formState.errors.name)}
                        aria-invalid={Boolean(form.formState.errors.name)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage role="alert" />
                    <FormDescription>
                      {tDetails('sections.settings.fields.name.helper_text')}
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Display Name field */}
              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="create-org-display-name">
                      {tDetails('sections.settings.fields.display_name.label')}
                    </FormLabel>
                    <FormControl>
                      <TextField
                        id="create-org-display-name"
                        placeholder={tDetails('sections.settings.fields.display_name.placeholder')}
                        error={Boolean(form.formState.errors.display_name)}
                        aria-invalid={Boolean(form.formState.errors.display_name)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage role="alert" />
                    <FormDescription>
                      {tDetails('sections.settings.fields.display_name.helper_text')}
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Logo URL */}
              <FormField
                control={form.control}
                name="branding.logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="create-org-logo">
                      {tDetails('sections.branding.fields.logo.label')}
                    </FormLabel>
                    <FormControl>
                      <TextField
                        id="create-org-logo"
                        error={Boolean(form.formState.errors.branding?.logo_url)}
                        aria-invalid={Boolean(form.formState.errors.branding?.logo_url)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage role="alert" />
                    <FormDescription>
                      {tDetails('sections.branding.fields.logo.helper_text')}
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Primary Color */}
              <FormField
                control={form.control}
                name="branding.colors.primary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="create-org-primary-color">
                      {tDetails('sections.branding.fields.primary_color.label')}
                    </FormLabel>
                    <FormControl>
                      <TextField
                        id="create-org-primary-color"
                        error={Boolean(form.formState.errors.branding?.colors?.primary)}
                        aria-invalid={Boolean(form.formState.errors.branding?.colors?.primary)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage role="alert" />
                    <FormDescription>
                      {tDetails('sections.branding.fields.primary_color.helper_text')}
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Background Color */}
              <FormField
                control={form.control}
                name="branding.colors.page_background"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="create-org-bg-color">
                      {tDetails('sections.branding.fields.page_background_color.label')}
                    </FormLabel>
                    <FormControl>
                      <TextField
                        id="create-org-bg-color"
                        error={Boolean(form.formState.errors.branding?.colors?.page_background)}
                        aria-invalid={Boolean(
                          form.formState.errors.branding?.colors?.page_background,
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage role="alert" />
                    <FormDescription>
                      {tDetails('sections.branding.fields.page_background_color.helper_text')}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
              {t('create.cancel_button')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || (!form.formState.isValid && form.formState.isSubmitted)}
            >
              {isSubmitting ? (
                <Spinner size="sm" colorScheme="foreground" aria-hidden="true" />
              ) : null}
              {t('create.submit_button')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// ─── Org Details Edit View ────────────────────────────────────────────────────

interface OrgDetailsViewProps {
  org: OrganizationSummary;
  client: OrganizationManagementClient;
  showDeleteAction: boolean;
  onBack: () => void;
  onSaved: (orgName: string) => void;
  onRequestDelete: (org: OrganizationSummary) => void;
  customMessages?: Partial<OrgManagementMessages>;
}

/**
 * Organization details edit view. Fetches full org details and renders an editable form.
 * @param props - Component props.
 * @param props.org - The org summary to load and display.
 * @param props.client - Organization API client.
 * @param props.showDeleteAction - Whether to show the Delete button.
 * @param props.onBack - Callback to navigate back to the table.
 * @param props.onSaved - Callback when org is successfully saved.
 * @param props.onRequestDelete - Callback when Delete is requested.
 * @param props.customMessages - Custom i18n message overrides.
 * @returns Details edit view element.
 * @internal
 */
function OrgDetailsView({
  org,
  client,
  showDeleteAction,
  onBack,
  onSaved,
  onRequestDelete,
  customMessages,
}: OrgDetailsViewProps): React.JSX.Element {
  const { t: tEdit } = useTranslator('organization_management.organization_details_edit', customMessages);
  const [orgDetails, setOrgDetails] = React.useState<OrganizationPrivate | null>(null);
  const [isFetchLoading, setIsFetchLoading] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchDetails = async () => {
      setIsFetchLoading(true);
      try {
        const details = await client.organizationDetails.get(org.id, {
          abortSignal: controller.signal,
        });
        setOrgDetails(details);
      } catch (error) {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          setOrgDetails(OrganizationDetailsFactory.create());
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsFetchLoading(false);
        }
      }
    };

    void fetchDetails();
    return () => controller.abort();
  }, [client, org.id]);

  const handleSave = React.useCallback(
    async (data: OrganizationPrivate): Promise<boolean> => {
      try {
        const updated = await client.organizationDetails.update(org.id, data);
        setOrgDetails(updated);
        onSaved(updated.display_name ?? updated.name ?? org.display_name ?? org.name);
        return true;
      } catch {
        return false;
      }
    },
    [client, org.id, org.display_name, org.name, onSaved],
  );

  if (isFetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-96 w-full">
        <Spinner />
      </div>
    );
  }

  const organization = orgDetails ?? OrganizationDetailsFactory.create();
  const orgName = organization.display_name || organization.name || org.display_name || org.name;

  return (
    <div className="w-full">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
            <ArrowLeft aria-hidden="true" />
            {tEdit('header.back_button_text')}
          </Button>
          <h1 className="text-2xl font-semibold">{tEdit('header.title', { organizationName: orgName })}</h1>
        </div>
        {showDeleteAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRequestDelete(org)}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        )}
      </div>

      <OrganizationDetails
        organization={organization}
        formActions={{
          isLoading: false,
          nextAction: {
            disabled: false,
            onClick: handleSave,
          },
        }}
      />
    </div>
  );
}

// ─── Main Block Component ─────────────────────────────────────────────────────

/**
 * OrganizationManagement block — a multi-screen admin dashboard for managing
 * organizations. Covers the complete CRUD lifecycle: list, create, edit, and delete.
 *
 * @param props - {@link OrganizationManagementProps}
 * @param props.variant - Block variant (`v1` = read/edit only; `v2` = full CRUD)
 * @param props.client - Organization API client providing list/create/delete/get/update
 * @param props.customMessages - Custom i18n message overrides
 * @param props.className - Optional CSS class name
 * @returns OrganizationManagement block element.
 *
 * @example
 * ```tsx
 * <OrganizationManagement
 *   variant="v2"
 *   client={{
 *     organizations: { list, create, delete: deleteOrg },
 *     organizationDetails: { get, update },
 *   }}
 * />
 * ```
 */
function OrganizationManagement({
  variant = 'v2',
  client,
  customMessages = {},
  className,
}: OrganizationManagementProps): React.JSX.Element {
  const isV2 = variant === 'v2';

  const {
    activeView,
    selectedOrg,
    deleteTarget,
    alertState,
    filteredOrganizations,
    isListLoading,
    isDeleting,
    searchQuery,
    onSearchChange,
    onNavigateToCreate,
    onNavigateToDetails,
    onNavigateToTable,
    onRequestDelete,
    onCancelDelete,
    onConfirmDelete,
    onOrgCreated,
    onOrgSaved,
  } = useOrganizationManagement(client, variant);

  const { isDarkMode } = useTheme();
  const styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  };
  const currentStyles = React.useMemo(() => getComponentStyles(styling, isDarkMode), [isDarkMode]);

  return (
    <StyledScope style={currentStyles.variables}>
      <div className={cn('w-full space-y-4', className)}>
        {/* Persistent alert live region */}
        {alertState ? (
          <OrgAlert alertState={alertState} customMessages={customMessages} />
        ) : (
          // Keep the aria-live region in the DOM even when empty
          <div aria-live="polite" role="status" className="sr-only" />
        )}

        {/* Table View */}
        {activeView === 'table' && (
          <OrgTable
            organizations={filteredOrganizations}
            isLoading={isListLoading}
            searchQuery={searchQuery}
            showCreateButton={isV2}
            showDeleteAction={isV2}
            onSearchChange={onSearchChange}
            onCreateClick={onNavigateToCreate}
            onEditClick={onNavigateToDetails}
            onDeleteClick={onRequestDelete}
            customMessages={customMessages}
          />
        )}

        {/* Create View */}
        {activeView === 'create' && isV2 && (
          <OrgCreateForm
            onBack={onNavigateToTable}
            onCreated={onOrgCreated}
            client={client}
            customMessages={customMessages}
          />
        )}

        {/* Details / Edit View */}
        {activeView === 'details' && selectedOrg && (
          <OrgDetailsView
            org={selectedOrg}
            client={client}
            showDeleteAction={isV2}
            onBack={onNavigateToTable}
            onSaved={onOrgSaved}
            onRequestDelete={onRequestDelete}
            customMessages={customMessages}
          />
        )}

        {/* Delete Confirm Dialog */}
        {deleteTarget && (
          <DeleteConfirmDialog
            org={deleteTarget}
            isOpen={!!deleteTarget}
            onClose={onCancelDelete}
            onConfirm={onConfirmDelete}
            isDeleting={isDeleting}
            customMessages={customMessages}
          />
        )}
      </div>
    </StyledScope>
  );
}

export { OrganizationManagement };
