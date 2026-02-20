import { vi } from 'vitest';

import type {
  SsoProviderEditHandlerProps,
  SsoProviderEditLogicProps,
  SsoProviderTableHandlerProps,
  SsoProviderTableLogicProps,
} from '@/types';

export const mockOnCreateProvisioning = vi.fn();
export const mockOnDeleteProvisioning = vi.fn();
export const mockOnListScimTokens = vi.fn();
export const mockOnCreateScimToken = vi.fn();
export const mockOnDeleteScimToken = vi.fn();
export const mockFetchProvisioning = vi.fn();

export const mockProvider = {
  id: 'test-provider-id',
  name: 'Test Provider',
  is_enabled: true,
  strategy: 'waad' as const,
  options: {},
};

export const SsoProvisioningProps = {
  provider: mockProvider,
  provisioningConfig: null,
  isProvisioningLoading: false,
  isProvisioningUpdating: false,
  isProvisioningDeleting: false,
  isScimTokensLoading: false,
  isScimTokenCreating: false,
  isScimTokenDeleting: false,
  onCreateProvisioning: mockOnCreateProvisioning,
  onDeleteProvisioning: mockOnDeleteProvisioning,
  onListScimTokens: mockOnListScimTokens,
  onCreateScimToken: mockOnCreateScimToken,
  onDeleteScimToken: mockOnDeleteScimToken,
  fetchProvisioning: mockFetchProvisioning,
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages: {},
};

export function createMockSsoProviderEditLogic(
  overrides: Partial<SsoProviderEditLogicProps> = {},
): SsoProviderEditLogicProps {
  return {
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    activeTab: 'sso',
    schema: undefined,
    readOnly: false,
    providerId: 'mock-provider-id',
    domains: undefined,
    hideHeader: false,
    currentStyles: { variables: {}, classes: {} },
    provider: mockProvider,
    organization: {
      name: 'Mock Org',
      branding: {
        colors: {
          primary: '',
          page_background: '',
        },
        logo_url: undefined,
      },
    },
    isLoading: false,
    isUpdating: false,
    isDeleting: false,
    isRemoving: false,
    idpConfig: {
      organization: {
        can_set_show_as_button: false,
        can_set_assign_membership_on_login: false,
      },
      strategies: {
        waad: {
          provisioning_methods: [],
          enabled_features: [],
        },
        adfs: {
          provisioning_methods: [],
          enabled_features: [],
        },
        'google-apps': {
          provisioning_methods: [],
          enabled_features: [],
        },
        oidc: {
          provisioning_methods: [],
          enabled_features: [],
        },
        samlp: {
          provisioning_methods: [],
          enabled_features: [],
        },
        okta: {
          provisioning_methods: [],
          enabled_features: [],
        },
        pingfederate: {
          provisioning_methods: [],
          enabled_features: [],
        },
      },
    },
    customMessages: {},
    backButton: undefined,
    shouldAllowDeletion: true,
    isLoadingConfig: false,
    isLoadingIdpConfig: false,
    showProvisioningTab: true,
    isProvisioningUpdating: false,
    isProvisioningDeleting: false,
    isScimTokensLoading: false,
    isScimTokenCreating: false,
    isScimTokenDeleting: false,
    isSsoAttributesSyncing: false,
    isProvisioningAttributesSyncing: false,
    hasSsoAttributeSyncWarning: false,
    hasProvisioningAttributeSyncWarning: false,
    ...overrides,
  };
}

export function createMockSsoProviderEditHandler(
  overrides: Partial<SsoProviderEditHandlerProps> = {},
): SsoProviderEditHandlerProps {
  return {
    setActiveTab: () => {},
    updateProvider: () => Promise.resolve(),
    listScimTokens: () => Promise.resolve(null),
    syncSsoAttributes: () => Promise.resolve(),
    onDeleteConfirm: () => Promise.resolve(),
    onRemoveConfirm: () => Promise.resolve(),
    handleToggleProvider: () => Promise.resolve(),
    createProvisioningAction: () => Promise.resolve(),
    deleteProvisioningAction: () => Promise.resolve(),
    createScimTokenAction: (_data) => Promise.resolve(undefined),
    deleteScimTokenAction: () => Promise.resolve(),
    syncProvisioningAttributes: () => Promise.resolve(),
    ...overrides,
  };
}

export function createMockSsoProviderTableLogic(
  overrides: Partial<SsoProviderTableLogicProps> = {},
): SsoProviderTableLogicProps {
  return {
    data: [],
    columns: [],
    isLoading: false,
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    hideHeader: false,
    readOnly: false,
    currentStyles: { variables: {}, classes: {} },
    shouldHideCreate: false,
    isViewLoading: false,
    selectedIdp: null,
    shouldAllowDeletion: false,
    showDeleteModal: false,
    showRemoveModal: false,
    organization: undefined,
    isUpdating: false,
    isUpdatingId: '',
    isDeleting: false,
    isRemoving: false,
    createAction: {
      disabled: false,
      onAfter: vi.fn(),
      onBefore: vi.fn(),
    },
    editAction: {
      disabled: false,
      onAfter: vi.fn(),
      onBefore: vi.fn(),
    },
    ...overrides,
  };
}

export function createMockSsoProviderTableHandler(
  overrides: Partial<SsoProviderTableHandlerProps> = {},
): SsoProviderTableHandlerProps {
  return {
    handleCreate: vi.fn(),
    handleEdit: vi.fn(),
    handleDelete: vi.fn(),
    handleDeleteFromOrganization: vi.fn(),
    handleToggleEnabled: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    handleRemoveConfirm: vi.fn(),
    setShowDeleteModal: vi.fn(),
    setShowRemoveModal: vi.fn(),
    setSelectedIdp: vi.fn(),
    ...overrides,
  };
}
