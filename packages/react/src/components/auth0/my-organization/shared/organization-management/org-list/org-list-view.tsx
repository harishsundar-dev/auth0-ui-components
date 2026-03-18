/**
 * OrgListView sub-component for OrgManagement block.
 * @module org-list-view
 * @internal
 */

import type { OrganizationPrivate } from '@auth0/universal-components-core';
import { Building2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import * as React from 'react';

import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Header } from '@/components/auth0/shared/header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  OrgManagementAlertState,
  OrgManagementProps,
} from '@/types/my-organization/org-management/org-management-types';

export interface OrgListViewProps {
  organizations: OrganizationPrivate[];
  isLoading: boolean;
  alertState: OrgManagementAlertState;
  readOnly: boolean;
  customMessages: OrgManagementProps['customMessages'];
  className?: string;
  onNavigateToCreate: () => void;
  onNavigateToEdit: (org: OrganizationPrivate) => void;
  onOpenDeleteModal: (org: OrganizationPrivate) => void;
  onDismissAlert: () => void;
}

/**
 * OrgListView — displays the list of organizations with action controls.
 * @param props - Component props
 * @param props.organizations - List of organizations to display
 * @param props.isLoading - Whether organizations are loading
 * @param props.alertState - Current alert notification state
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.customMessages - Custom translation message overrides
 * @param props.className - Optional CSS class name
 * @param props.onNavigateToCreate - Callback to navigate to create view
 * @param props.onNavigateToEdit - Callback to navigate to edit view
 * @param props.onOpenDeleteModal - Callback to open delete modal
 * @param props.onDismissAlert - Callback to dismiss the alert
 * @returns JSX element
 * @internal
 */
export function OrgListView({
  organizations,
  isLoading,
  alertState,
  readOnly,
  customMessages,
  className,
  onNavigateToCreate,
  onNavigateToEdit,
  onOpenDeleteModal,
  onDismissAlert,
}: OrgListViewProps): React.JSX.Element {
  const { t } = useTranslator('organization_management.org_management', customMessages);

  const columns = React.useMemo((): Column<OrganizationPrivate>[] => {
    return [
      {
        type: 'text',
        title: t('list.table.name_column'),
        accessorKey: 'name',
        enableSorting: true,
      },
      {
        type: 'text',
        title: t('list.table.display_name_column'),
        accessorKey: 'display_name',
        enableSorting: true,
      },
      {
        type: 'custom',
        title: t('list.table.actions_column'),
        accessorKey: 'id',
        render: (org) => (
          <OrgActionsMenu
            org={org}
            readOnly={readOnly}
            editLabel={t('list.table.edit_action')}
            deleteLabel={t('list.table.delete_action')}
            onEdit={onNavigateToEdit}
            onDelete={onOpenDeleteModal}
          />
        ),
      },
    ];
  }, [t, readOnly, onNavigateToEdit, onOpenDeleteModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-48 w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {alertState.type && (
        <Alert variant={alertState.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          <AlertDescription className="flex items-center justify-between">
            <span>{alertState.message}</span>
            <Button variant="ghost" size="sm" onClick={onDismissAlert} className="ml-2 h-auto p-0">
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <Header
          title={t('header.title')}
          actions={
            !readOnly
              ? [
                  {
                    type: 'button',
                    label: t('list.create_button_label'),
                    variant: 'primary',
                    onClick: onNavigateToCreate,
                  },
                ]
              : undefined
          }
        />
      </div>

      {organizations.length === 0 ? (
        <OrgEmptyState
          title={t('list.empty_state.title')}
          description={t('list.empty_state.description')}
          createLabel={t('list.empty_state.create_button_label')}
          readOnly={readOnly}
          onCreate={onNavigateToCreate}
        />
      ) : (
        <DataTable data={organizations} columns={columns} />
      )}
    </div>
  );
}

// ===== Internal sub-components =====

interface OrgEmptyStateProps {
  title: string;
  description: string;
  createLabel: string;
  readOnly: boolean;
  onCreate: () => void;
}

/**
 * OrgEmptyState — empty state for organization list.
 * @param props - Component props
 * @param props.title - Empty state title
 * @param props.description - Empty state description
 * @param props.createLabel - Label for the create button
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.onCreate - Callback to create an organization
 * @returns JSX element
 * @internal
 */
function OrgEmptyState({
  title,
  description,
  createLabel,
  readOnly,
  onCreate,
}: OrgEmptyStateProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-48 py-12 text-center border rounded-lg">
      <Building2 className="w-12 h-12 text-muted-foreground mb-4" aria-hidden="true" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {!readOnly && (
        <Button variant="primary" onClick={onCreate}>
          {createLabel}
        </Button>
      )}
    </div>
  );
}

interface OrgActionsMenuProps {
  org: OrganizationPrivate;
  readOnly: boolean;
  editLabel: string;
  deleteLabel: string;
  onEdit: (org: OrganizationPrivate) => void;
  onDelete: (org: OrganizationPrivate) => void;
}

/**
 * OrgActionsMenu — row-level action menu for organization table.
 * @param props - Component props
 * @param props.org - Organization data
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.editLabel - Label for edit action
 * @param props.deleteLabel - Label for delete action
 * @param props.onEdit - Callback to edit the organization
 * @param props.onDelete - Callback to delete the organization
 * @returns JSX element
 * @internal
 */
function OrgActionsMenu({
  org,
  readOnly,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: OrgActionsMenuProps): React.JSX.Element {
  if (readOnly) {
    return (
      <Button variant="ghost" size="icon" onClick={() => onEdit(org)} aria-label={editLabel}>
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${editLabel} / ${deleteLabel}`}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(org)}>
          <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
          {editLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(org)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
