export interface MembersEmptyStateProps {
  title: string;
  description: string;
}

export function MembersEmptyState({ title, description }: MembersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{description}</div>
    </div>
  );
}
