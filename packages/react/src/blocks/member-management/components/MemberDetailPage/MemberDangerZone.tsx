import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { defaultMessages } from '../../MemberManagement.i18n';

interface MemberDangerZoneProps {
  onRemoveFromOrg: () => void;
  onDeleteMember: () => void;
}

export function MemberDangerZone({
  onRemoveFromOrg,
  onDeleteMember,
}: MemberDangerZoneProps): React.JSX.Element {
  const msgs = defaultMessages.memberDetail.dangerZone;

  return (
    <div className="flex flex-col gap-4">
      <Separator />
      <h3 className="text-sm font-semibold text-destructive-foreground">{msgs.title}</h3>
      <div className="flex flex-col gap-3 rounded-xl border border-destructive/25 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{msgs.removeFromOrg}</span>
            <span className="text-xs text-muted-foreground">{msgs.removeFromOrgDescription}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onRemoveFromOrg} className="shrink-0">
            {msgs.removeFromOrg}
          </Button>
        </div>
        <Separator />
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{msgs.deleteMember}</span>
            <span className="text-xs text-muted-foreground">{msgs.deleteMemberDescription}</span>
          </div>
          <Button variant="destructive" size="sm" onClick={onDeleteMember} className="shrink-0">
            {msgs.deleteMember}
          </Button>
        </div>
      </div>
    </div>
  );
}
