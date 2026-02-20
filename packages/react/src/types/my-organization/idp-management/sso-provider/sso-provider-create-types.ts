/**
 * SSO provider create types.
 * @module sso-provider-create-types
 */

import type {
  SharedComponentProps,
  ProviderSelectMessages,
  ProviderDetailsMessages,
  IdpStrategy,
  ProviderSelectionFormValues,
  IdentityProvider,
  ProviderConfigureMessages,
  ProviderConfigureFieldsMessages,
  SsoProviderCreateMessages,
  ProviderDetailsFormValues,
  ProviderConfigureFormValues,
  SsoProviderFormValues,
  SsoProviderSchema,
  ComponentAction,
  BackButton,
  CreateIdentityProviderRequestContentPrivate,
} from '@auth0/universal-components-core';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { IdpConfig } from '@/types/my-organization/config/config-idp-types';

/** Form mode for provider configuration. */
export type FormMode = 'create' | 'edit';

/** CSS classes for SsoProviderCreate. */
export interface SsoProviderCreateClasses {
  'SsoProviderCreate-header'?: string;
  'SsoProviderCreate-wizard'?: string;
  'ProviderSelect-root'?: string;
  'ProviderDetails-root'?: string;
  'ProviderConfigure-root'?: string;
}

/** Props for ProviderSelect component. */
export interface ProviderSelectProps
  extends SharedComponentProps<ProviderSelectMessages, SsoProviderCreateClasses> {
  isLoading: boolean;
  strategyList: IdpStrategy[];
  onClickStrategy: (strategy: IdpStrategy) => void;
  selectedStrategy?: IdpStrategy | null;
  form?: UseFormReturn<ProviderSelectionFormValues>;
  className?: string;
}

/** Props for ProviderDetails component. */
export interface ProviderDetailsProps
  extends SharedComponentProps<ProviderDetailsMessages, SsoProviderCreateClasses> {
  initialData?: Partial<ProviderDetailsFormValues>;
  className?: string;
  hideHeader?: boolean;
  mode: 'edit' | 'create';
  onFormDirty?: (isDirty: boolean) => void;
}

/** Props for ProviderConfigure component. */
export interface ProviderConfigureProps
  extends SharedComponentProps<ProviderConfigureMessages, SsoProviderCreateClasses> {
  className?: string;
  isLoading: boolean;
  strategy: IdpStrategy;
  initialData?: Partial<ProviderConfigureFormValues>;
  idpConfig: IdpConfig | null;
}

export interface ProviderConfigureFieldsProps
  extends SharedComponentProps<ProviderConfigureFieldsMessages, SsoProviderCreateClasses> {
  strategy: IdpStrategy;
  initialData?: Partial<ProviderConfigureFormValues>;
  className?: string;
  onFormDirty?: (isDirty: boolean) => void;
  idpConfig: IdpConfig | null;
  mode?: FormMode;
}

export interface SsoProviderCreateBackButton extends Omit<BackButton, 'onClick'> {
  icon?: LucideIcon;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
export interface SsoProviderCreateProps
  extends SharedComponentProps<
    SsoProviderCreateMessages,
    SsoProviderCreateClasses,
    SsoProviderSchema
  > {
  createAction: ComponentAction<CreateIdentityProviderRequestContentPrivate, IdentityProvider>;
  backButton?: SsoProviderCreateBackButton;
  onPrevious?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
  onNext?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
}

export interface UseSsoProviderCreateOptions {
  createAction?: SsoProviderCreateProps['createAction'];
  customMessages?: SsoProviderCreateProps['customMessages'];
}
