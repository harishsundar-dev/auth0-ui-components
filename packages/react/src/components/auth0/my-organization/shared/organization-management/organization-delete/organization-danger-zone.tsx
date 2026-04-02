/**
 * Organization danger zone component.
 * @module organization-danger-zone
 * @internal
 */

import type {
  OrganizationDeleteMessages,
  OrganizationPrivate,
} from '@auth0/universal-components-core';
import * as React from 'react';

import { Section } from '@/components/auth0/shared/section';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslator } from '@/hooks/shared/use-translator';

interface OrganizationDangerZoneProps {
  organization: OrganizationPrivate;
  onDeleteClick: () => void;
  readOnly?: boolean;
  customMessages?: OrganizationDeleteMessages;
}

/**
 * Danger zone section showing the delete organization button.
 * @param props - Component props
 * @param props.organization - The organization object
 * @param props.onDeleteClick - Callback fired when the delete button is clicked
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns JSX element
 */
export function OrganizationDangerZone({
  organization,
  onDeleteClick,
  readOnly = false,
  customMessages = {},
}: OrganizationDangerZoneProps) {
  const { t } = useTranslator('organization_management.organization_delete', customMessages);

  return (
    <div className="space-y-6">
      <Separator />
      <Section
        title={t('title', {
          organizationName: organization.display_name || organization.name,
        })}
        description={t('description')}
      >
        <Button
          variant="destructive"
          onClick={onDeleteClick}
          disabled={readOnly}
          data-testid="delete-organization-button"
        >
          {t('delete_button_label')}
        </Button>
      </Section>
    </div>
  );
}
