// Single entry point for all mintlify components

// Export Provider and hooks
export { Auth0ComponentProvider } from './providers/proxy-provider';
export { useCoreClient } from '@/hooks/shared/use-core-client';

// Export View only Components
export { DomainTableView } from '@/components/auth0/my-organization/domain-table-view';
