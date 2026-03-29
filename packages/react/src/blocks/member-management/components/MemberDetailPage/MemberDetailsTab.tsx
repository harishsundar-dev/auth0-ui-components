import * as React from 'react';

import { defaultMessages } from '../../MemberManagement.i18n';
import type { OrganizationMember } from '../../MemberManagement.types';

interface MemberDetailsTabProps {
  member: OrganizationMember;
}

/**
 *
 * @param root0
 */
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2 border-b border-border last:border-0">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

/**
 *
 * @param root0
 */
export function MemberDetailsTab({ member }: MemberDetailsTabProps): React.JSX.Element {
  const msgs = defaultMessages.memberDetail.details;

  const formattedLastLogin = member.last_login
    ? new Date(member.last_login).toLocaleString()
    : defaultMessages.common.never;

  return (
    <div className="flex flex-col gap-0">
      <DetailRow label={msgs.userId} value={<code className="text-xs">{member.user_id}</code>} />
      {member.name && <DetailRow label={msgs.name} value={member.name} />}
      {member.email && <DetailRow label={msgs.email} value={member.email} />}
      <DetailRow label={msgs.lastLogin} value={formattedLastLogin} />
      {member.picture && (
        <DetailRow
          label={msgs.picture}
          value={
            <img
              src={member.picture}
              alt={member.name ?? 'Profile'}
              className="size-10 rounded-full object-cover"
            />
          }
        />
      )}
    </div>
  );
}
