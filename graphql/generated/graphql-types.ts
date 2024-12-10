import { GraphQLResolveInfo } from 'graphql';
import { OIDCContext } from '../graphql-context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AccessRule = {
  __typename?: 'AccessRule';
  accessRuleDefinition: Scalars['String']['output'];
  accessRuleId: Scalars['String']['output'];
  scopeConstraintSchemaId: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
};

export type AccessRuleCreateInput = {
  accessRuleDefinition: Scalars['String']['input'];
  scopeConstraintSchemaId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
};

export type AccessRuleUpdateInput = {
  accessRuleDefinition: Scalars['String']['input'];
  accessRuleId: Scalars['String']['input'];
  scopeConstraintSchemaId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
};

export type AuthenticationGroup = {
  __typename?: 'AuthenticationGroup';
  authenticationGroupDescription?: Maybe<Scalars['String']['output']>;
  authenticationGroupId: Scalars['String']['output'];
  authenticationGroupName: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type AuthenticationGroupClientRel = {
  __typename?: 'AuthenticationGroupClientRel';
  authenticationGroupId: Scalars['String']['output'];
  clientId: Scalars['String']['output'];
};

export type AuthenticationGroupCreateInput = {
  authenticationGroupDescription?: InputMaybe<Scalars['String']['input']>;
  authenticationGroupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type AuthenticationGroupUpdateInput = {
  authenticationGroupDescription?: InputMaybe<Scalars['String']['input']>;
  authenticationGroupId: Scalars['String']['input'];
  authenticationGroupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type AuthenticationGroupUserRel = {
  __typename?: 'AuthenticationGroupUserRel';
  authenticationGroupId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type AuthorizationCodeData = {
  __typename?: 'AuthorizationCodeData';
  clientId: Scalars['String']['output'];
  code: Scalars['String']['output'];
  codeChallenge?: Maybe<Scalars['String']['output']>;
  codeChallengeMethod?: Maybe<Scalars['String']['output']>;
  expiresAtMs: Scalars['Float']['output'];
  redirectUri: Scalars['String']['output'];
  scope: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type Client = {
  __typename?: 'Client';
  clientDescription?: Maybe<Scalars['String']['output']>;
  clientId: Scalars['String']['output'];
  clientName: Scalars['String']['output'];
  clientSecret: Scalars['String']['output'];
  clientType: ClientType;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  maxRefreshTokenCount?: Maybe<Scalars['Int']['output']>;
  oidcEnabled: Scalars['Boolean']['output'];
  pkceEnabled: Scalars['Boolean']['output'];
  redirectUris?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  userTokenTTLSeconds: Scalars['Int']['output'];
};

export type ClientAuthHistory = {
  __typename?: 'ClientAuthHistory';
  clientId: Scalars['String']['output'];
  expiresAtSeconds: Scalars['Float']['output'];
  jti: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export enum ClientAuthType {
  ClientSecretBasic = 'CLIENT_SECRET_BASIC',
  ClientSecretJwt = 'CLIENT_SECRET_JWT',
  ClientSecretPost = 'CLIENT_SECRET_POST',
  None = 'NONE'
}

export type ClientCreateInput = {
  clientDescription?: InputMaybe<Scalars['String']['input']>;
  clientName: Scalars['String']['input'];
  clientType: ClientType;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  maxRefreshTokenCount?: InputMaybe<Scalars['Int']['input']>;
  oidcEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  pkceEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  redirectUris?: InputMaybe<Array<Scalars['String']['input']>>;
  tenantId: Scalars['String']['input'];
  userTokenTTLSeconds?: InputMaybe<Scalars['Int']['input']>;
};

export type ClientTenantScopeRel = {
  __typename?: 'ClientTenantScopeRel';
  clientId: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export enum ClientType {
  ServiceAccountAndUserDelegatedPermissions = 'SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS',
  ServiceAccountOnly = 'SERVICE_ACCOUNT_ONLY',
  UserDelegatedPermissionsOnly = 'USER_DELEGATED_PERMISSIONS_ONLY'
}

export type ClientUpdateInput = {
  clientDescription?: InputMaybe<Scalars['String']['input']>;
  clientId: Scalars['String']['input'];
  clientName: Scalars['String']['input'];
  clientType: ClientType;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  maxRefreshTokenCount?: InputMaybe<Scalars['Int']['input']>;
  oidcEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  pkceEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  redirectUris?: InputMaybe<Array<Scalars['String']['input']>>;
  tenantId: Scalars['String']['input'];
  userTokenTTLSeconds?: InputMaybe<Scalars['Int']['input']>;
};

export enum DelegatedAuthenticationConstraint {
  Exclusive = 'EXCLUSIVE',
  NotAllowed = 'NOT_ALLOWED',
  Permissive = 'PERMISSIVE'
}

export type FederatedOidcAuthorizationRel = {
  __typename?: 'FederatedOIDCAuthorizationRel';
  codeVerifier?: Maybe<Scalars['String']['output']>;
  expiresAtMs: Scalars['Float']['output'];
  federatedOIDCProviderId: Scalars['String']['output'];
  initClientId: Scalars['String']['output'];
  initCodeChallenge?: Maybe<Scalars['String']['output']>;
  initCodeChallengeMethod?: Maybe<Scalars['String']['output']>;
  initRedirectUri: Scalars['String']['output'];
  initResponseMode: Scalars['String']['output'];
  initScope: Scalars['String']['output'];
  initState: Scalars['String']['output'];
  initTenantId: Scalars['String']['output'];
  state: Scalars['String']['output'];
};

export type FederatedOidcProvider = {
  __typename?: 'FederatedOIDCProvider';
  clientAuthType?: Maybe<ClientAuthType>;
  federatedOIDCProviderClientId: Scalars['String']['output'];
  federatedOIDCProviderClientSecret?: Maybe<Scalars['String']['output']>;
  federatedOIDCProviderDescription?: Maybe<Scalars['String']['output']>;
  federatedOIDCProviderId: Scalars['String']['output'];
  federatedOIDCProviderName: Scalars['String']['output'];
  federatedOIDCProviderTenantId?: Maybe<Scalars['String']['output']>;
  federatedOIDCProviderWellKnownUri: Scalars['String']['output'];
  refreshTokenAllowed: Scalars['Boolean']['output'];
  usePkce: Scalars['Boolean']['output'];
};

export type FederatedOidcProviderCreateInput = {
  clientAuthType?: InputMaybe<ClientAuthType>;
  federatedOIDCProviderClientId: Scalars['String']['input'];
  federatedOIDCProviderClientSecret?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderDescription?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderId: Scalars['String']['input'];
  federatedOIDCProviderName: Scalars['String']['input'];
  federatedOIDCProviderTenantId?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderWellKnownUri: Scalars['String']['input'];
  refreshTokenAllowed: Scalars['Boolean']['input'];
  usePkce: Scalars['Boolean']['input'];
};

export type FederatedOidcProviderDomainRel = {
  __typename?: 'FederatedOIDCProviderDomainRel';
  domain: Scalars['String']['output'];
  federatedOIDCProviderId: Scalars['String']['output'];
};

export type FederatedOidcProviderTenantRel = {
  __typename?: 'FederatedOIDCProviderTenantRel';
  federatedOIDCProviderId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type FederatedOidcProviderUpdateInput = {
  clientAuthType?: InputMaybe<ClientAuthType>;
  federatedOIDCProviderClientId: Scalars['String']['input'];
  federatedOIDCProviderClientSecret?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderDescription?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderId: Scalars['String']['input'];
  federatedOIDCProviderName: Scalars['String']['input'];
  federatedOIDCProviderTenantId?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderWellKnownUri: Scalars['String']['input'];
  refreshTokenAllowed: Scalars['Boolean']['input'];
  usePkce: Scalars['Boolean']['input'];
};

export type Group = {
  __typename?: 'Group';
  default: Scalars['Boolean']['output'];
  groupId: Scalars['String']['output'];
  groupName: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type GroupCreateInput = {
  default: Scalars['Boolean']['input'];
  groupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type GroupScopeRel = {
  __typename?: 'GroupScopeRel';
  groupId: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type GroupUpdateInput = {
  default: Scalars['Boolean']['input'];
  groupId: Scalars['String']['input'];
  groupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export enum KeyType {
  Ec = 'EC',
  Rsa = 'RSA'
}

export type Mutation = {
  __typename?: 'Mutation';
  addDomainToTenantManagement?: Maybe<Scalars['String']['output']>;
  addUserToGroup?: Maybe<UserGroupRel>;
  assignAuthenticationGroupToClient?: Maybe<AuthenticationGroupClientRel>;
  assignFederatedOIDCProviderToDomain: FederatedOidcProviderDomainRel;
  assignFederatedOIDCProviderToTenant: FederatedOidcProviderTenantRel;
  assignRateLimitToTenant?: Maybe<TenantRateLimitRel>;
  assignScopeToClient?: Maybe<ClientTenantScopeRel>;
  assignScopeToTenant?: Maybe<TenantScopeRel>;
  createAccessRule?: Maybe<AccessRule>;
  createAuthenticationGroup?: Maybe<AuthenticationGroup>;
  createClient?: Maybe<Client>;
  createFederatedOIDCProvider?: Maybe<FederatedOidcProvider>;
  createGroup?: Maybe<Group>;
  createRateLimit?: Maybe<RateLimit>;
  createRootTenant?: Maybe<Tenant>;
  createScope?: Maybe<Scope>;
  createScopeConstraintSchema?: Maybe<ScopeConstraintSchema>;
  createSigningKey: SigningKey;
  createTenant?: Maybe<Tenant>;
  deleteAccessRule: Scalars['String']['output'];
  deleteAuthenticationGroup: Scalars['String']['output'];
  deleteClient?: Maybe<Scalars['String']['output']>;
  deleteFederatedOIDCProvider: Scalars['String']['output'];
  deleteGroup: Scalars['String']['output'];
  deleteRateLimit?: Maybe<Scalars['String']['output']>;
  deleteScope?: Maybe<Scalars['String']['output']>;
  deleteScopeConstraingSchema: Scalars['String']['output'];
  deleteSigningKey: Scalars['String']['output'];
  deleteTenant?: Maybe<Scalars['String']['output']>;
  removeAuthenticationGroupFromClient?: Maybe<Scalars['String']['output']>;
  removeDomainFromTenantManagement?: Maybe<Scalars['String']['output']>;
  removeFederatedOIDCProviderFromDomain: FederatedOidcProviderDomainRel;
  removeFederatedOIDCProviderFromTenant: FederatedOidcProviderTenantRel;
  removeRateLimitFromTenant?: Maybe<Scalars['String']['output']>;
  removeScopeFromClient?: Maybe<Scalars['String']['output']>;
  removeScopeFromTenant?: Maybe<Scalars['String']['output']>;
  removeUserFromGroup?: Maybe<Scalars['String']['output']>;
  updateAccessRule?: Maybe<AccessRule>;
  updateAuthenticationGroup?: Maybe<AuthenticationGroup>;
  updateClient?: Maybe<Client>;
  updateFederatedOIDCProvider?: Maybe<FederatedOidcProvider>;
  updateGroup?: Maybe<Group>;
  updateRateLimit?: Maybe<RateLimit>;
  updateRateLimitForTenant?: Maybe<TenantRateLimitRel>;
  updateRootTenant?: Maybe<Tenant>;
  updateScope?: Maybe<Scope>;
  updateScopeConstraintSchema?: Maybe<ScopeConstraintSchema>;
  updateTenant?: Maybe<Tenant>;
};


export type MutationAddDomainToTenantManagementArgs = {
  domain: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAddUserToGroupArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationAssignAuthenticationGroupToClientArgs = {
  authenticationGroupId: Scalars['String']['input'];
  clientId: Scalars['String']['input'];
};


export type MutationAssignFederatedOidcProviderToDomainArgs = {
  domain: Scalars['String']['input'];
  federatedOIDCProviderId: Scalars['String']['input'];
};


export type MutationAssignFederatedOidcProviderToTenantArgs = {
  federatedOIDCProviderId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAssignRateLimitToTenantArgs = {
  allowUnlimited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  rateLimitId: Scalars['String']['input'];
  rateLimitPeriodMinutes?: InputMaybe<Scalars['Int']['input']>;
  tenantId: Scalars['String']['input'];
};


export type MutationAssignScopeToClientArgs = {
  clientId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAssignScopeToTenantArgs = {
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationCreateAccessRuleArgs = {
  accessRuleInput: AccessRuleCreateInput;
};


export type MutationCreateAuthenticationGroupArgs = {
  authenticationGroupInput: AuthenticationGroupCreateInput;
};


export type MutationCreateClientArgs = {
  clientInput: ClientCreateInput;
};


export type MutationCreateFederatedOidcProviderArgs = {
  oidcProviderInput: FederatedOidcProviderCreateInput;
};


export type MutationCreateGroupArgs = {
  groupInput: GroupCreateInput;
};


export type MutationCreateRateLimitArgs = {
  rateLimitInput: RateLimitCreateInput;
};


export type MutationCreateRootTenantArgs = {
  tenantInput: TenantCreateInput;
};


export type MutationCreateScopeArgs = {
  scopeInput: ScopeCreateInput;
};


export type MutationCreateScopeConstraintSchemaArgs = {
  scopeConstraintSchemaInput: ScopeConstraintSchemaCreateInput;
};


export type MutationCreateSigningKeyArgs = {
  keyInput: SigningKeyCreateInput;
};


export type MutationCreateTenantArgs = {
  tenantInput: TenantCreateInput;
};


export type MutationDeleteAccessRuleArgs = {
  accessRuleId: Scalars['String']['input'];
};


export type MutationDeleteAuthenticationGroupArgs = {
  authenticationGroupId: Scalars['String']['input'];
};


export type MutationDeleteClientArgs = {
  clientId: Scalars['String']['input'];
};


export type MutationDeleteFederatedOidcProviderArgs = {
  federatedOIDCProviderId: Scalars['String']['input'];
};


export type MutationDeleteGroupArgs = {
  groupId: Scalars['String']['input'];
};


export type MutationDeleteRateLimitArgs = {
  rateLimitId: Scalars['String']['input'];
};


export type MutationDeleteScopeArgs = {
  scopeId: Scalars['String']['input'];
};


export type MutationDeleteScopeConstraingSchemaArgs = {
  scopeConstraintSchemaId: Scalars['String']['input'];
};


export type MutationDeleteSigningKeyArgs = {
  keyId: Scalars['String']['input'];
};


export type MutationDeleteTenantArgs = {
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveAuthenticationGroupFromClientArgs = {
  authenticationGroupId: Scalars['String']['input'];
  clientId: Scalars['String']['input'];
};


export type MutationRemoveDomainFromTenantManagementArgs = {
  domain: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveFederatedOidcProviderFromDomainArgs = {
  domain: Scalars['String']['input'];
  federatedOIDCProviderId: Scalars['String']['input'];
};


export type MutationRemoveFederatedOidcProviderFromTenantArgs = {
  federatedOIDCProviderId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveRateLimitFromTenantArgs = {
  rateLimitId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveScopeFromClientArgs = {
  clientId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveScopeFromTenantArgs = {
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveUserFromGroupArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationUpdateAccessRuleArgs = {
  accessRuleInput: AccessRuleUpdateInput;
};


export type MutationUpdateAuthenticationGroupArgs = {
  authenticationGroupInput: AuthenticationGroupUpdateInput;
};


export type MutationUpdateClientArgs = {
  clientInput: ClientUpdateInput;
};


export type MutationUpdateFederatedOidcProviderArgs = {
  oidcProviderInput: FederatedOidcProviderUpdateInput;
};


export type MutationUpdateGroupArgs = {
  groupInput: GroupUpdateInput;
};


export type MutationUpdateRateLimitArgs = {
  rateLimitInput: RateLimitUpdateInput;
};


export type MutationUpdateRateLimitForTenantArgs = {
  allowUnlimited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  rateLimitId: Scalars['String']['input'];
  rateLimitPeriodMinutes?: InputMaybe<Scalars['Int']['input']>;
  tenantId: Scalars['String']['input'];
};


export type MutationUpdateRootTenantArgs = {
  tenantInput: TenantUpdateInput;
};


export type MutationUpdateScopeArgs = {
  scopeInput: ScopeUpdateInput;
};


export type MutationUpdateScopeConstraintSchemaArgs = {
  scopeConstraintSchemaInput: ScopeConstraintSchemaUpdateInput;
};


export type MutationUpdateTenantArgs = {
  tenantInput: TenantUpdateInput;
};

export type PreAuthenticationState = {
  __typename?: 'PreAuthenticationState';
  clientId: Scalars['String']['output'];
  codeChallenge?: Maybe<Scalars['String']['output']>;
  codeChallengeMethod?: Maybe<Scalars['String']['output']>;
  expiresAtMs: Scalars['Float']['output'];
  redirectUri: Scalars['String']['output'];
  responseMode: Scalars['String']['output'];
  responseType: Scalars['String']['output'];
  scope: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  getAccessRuleById?: Maybe<AccessRule>;
  getAccessRules: Array<AccessRule>;
  getAuthenticationGroupById?: Maybe<AuthenticationGroup>;
  getAuthenticationGroups: Array<AuthenticationGroup>;
  getClientById?: Maybe<Client>;
  getClients: Array<Client>;
  getFederatedOIDCProviderById?: Maybe<FederatedOidcProvider>;
  getFederatedOIDCProviders: Array<FederatedOidcProvider>;
  getGroupById?: Maybe<Group>;
  getGroups: Array<Group>;
  getRateLimitById?: Maybe<RateLimit>;
  getRateLimits: Array<RateLimit>;
  getRootTenant: Tenant;
  getScope: Array<Scope>;
  getScopeById?: Maybe<Scope>;
  getScopeConstraintSchemaById?: Maybe<ScopeConstraintSchema>;
  getScopeConstraintSchemas: Array<ScopeConstraintSchema>;
  getSigningKeyById?: Maybe<SigningKey>;
  getSigningKeys: Array<SigningKey>;
  getTenantById?: Maybe<Tenant>;
  getTenants: Array<Tenant>;
  getUserById?: Maybe<User>;
  getUserGroups: Array<Group>;
  getUsers: Array<User>;
};


export type QueryGetAccessRuleByIdArgs = {
  accessRuleId: Scalars['String']['input'];
};


export type QueryGetAccessRulesArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAuthenticationGroupByIdArgs = {
  authenticationGroupId: Scalars['String']['input'];
};


export type QueryGetAuthenticationGroupsArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetClientByIdArgs = {
  clientId: Scalars['String']['input'];
};


export type QueryGetClientsArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetFederatedOidcProviderByIdArgs = {
  federatedOIDCProviderId: Scalars['String']['input'];
};


export type QueryGetFederatedOidcProvidersArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetGroupByIdArgs = {
  groupId: Scalars['String']['input'];
};


export type QueryGetRateLimitByIdArgs = {
  rateLimitId: Scalars['String']['input'];
};


export type QueryGetRateLimitsArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetScopeArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetScopeByIdArgs = {
  scopeId: Scalars['String']['input'];
};


export type QueryGetScopeConstraintSchemaByIdArgs = {
  scopeConstraintSchemaId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetSigningKeyByIdArgs = {
  signingKeyId: Scalars['String']['input'];
};


export type QueryGetSigningKeysArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetTenantByIdArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetUserByIdArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUserGroupsArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUsersArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};

export type RateLimit = {
  __typename?: 'RateLimit';
  rateLimitDescription?: Maybe<Scalars['String']['output']>;
  rateLimitDomain: Scalars['String']['output'];
  rateLimitId: Scalars['String']['output'];
};

export type RateLimitCreateInput = {
  rateLimitDescription?: InputMaybe<Scalars['String']['input']>;
  rateLimitDomain: Scalars['String']['input'];
};

export type RateLimitUpdateInput = {
  rateLimitDescription?: InputMaybe<Scalars['String']['input']>;
  rateLimitDomain: Scalars['String']['input'];
  rateLimitId: Scalars['String']['input'];
};

export type RefreshData = {
  __typename?: 'RefreshData';
  clientId: Scalars['String']['output'];
  refreshCount: Scalars['Int']['output'];
  refreshToken: Scalars['String']['output'];
  refreshTokenClientType: RefreshTokenClientType;
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export enum RefreshTokenClientType {
  Pkce = 'PKCE',
  SecureClient = 'SECURE_CLIENT'
}

export type Scope = {
  __typename?: 'Scope';
  scopeConstraintSchemaId?: Maybe<Scalars['String']['output']>;
  scopeDescription?: Maybe<Scalars['String']['output']>;
  scopeId: Scalars['String']['output'];
  scopeName: Scalars['String']['output'];
};

export type ScopeConstraintSchema = {
  __typename?: 'ScopeConstraintSchema';
  schema: Scalars['String']['output'];
  schemaVersion: Scalars['Int']['output'];
  scopeConstraintSchemaId: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
};

export type ScopeConstraintSchemaCreateInput = {
  schema: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
};

export type ScopeConstraintSchemaUpdateInput = {
  schema: Scalars['String']['input'];
  scopeConstraintSchemaId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
};

export type ScopeCreateInput = {
  scopeConstraintSchemaId?: InputMaybe<Scalars['String']['input']>;
  scopeDescription?: InputMaybe<Scalars['String']['input']>;
  scopeName: Scalars['String']['input'];
};

export type ScopeUpdateInput = {
  scopeConstraintSchemaId?: InputMaybe<Scalars['String']['input']>;
  scopeDescription?: InputMaybe<Scalars['String']['input']>;
  scopeId: Scalars['String']['input'];
  scopeName: Scalars['String']['input'];
};

export type SigningKey = {
  __typename?: 'SigningKey';
  certificate: Scalars['String']['output'];
  expiresAtMs: Scalars['Float']['output'];
  keyId: Scalars['String']['output'];
  keyType: KeyType;
  password?: Maybe<Scalars['String']['output']>;
  privateKey: Scalars['String']['output'];
  status: SigningKeyStatus;
  tenantId: Scalars['String']['output'];
  use: Scalars['String']['output'];
};

export type SigningKeyCreateInput = {
  certificate: Scalars['String']['input'];
  keyType: KeyType;
  password?: InputMaybe<Scalars['String']['input']>;
  privateKey: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  use: Scalars['String']['input'];
};

export enum SigningKeyStatus {
  Active = 'ACTIVE',
  Revoked = 'REVOKED'
}

export type Tenant = {
  __typename?: 'Tenant';
  allowUnlimitedRate: Scalars['Boolean']['output'];
  allowUserSelfRegistration: Scalars['Boolean']['output'];
  claimsSupported: Array<Scalars['String']['output']>;
  delegatedAuthenticationConstraint: DelegatedAuthenticationConstraint;
  enabled: Scalars['Boolean']['output'];
  federatedOIDCProviderId?: Maybe<Scalars['String']['output']>;
  markForDelete: Scalars['Boolean']['output'];
  tenantDescription?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
  tenantType: TenantType;
  verifyEmailOnSelfRegistration: Scalars['Boolean']['output'];
};

export type TenantCreateInput = {
  allowUnlimitedRate: Scalars['Boolean']['input'];
  allowUserSelfRegistration: Scalars['Boolean']['input'];
  claimsSupported: Array<Scalars['String']['input']>;
  delegatedAuthenticationConstraint: DelegatedAuthenticationConstraint;
  enabled: Scalars['Boolean']['input'];
  federatedOIDCProviderId?: InputMaybe<Scalars['String']['input']>;
  maxRefreshTokenCount?: InputMaybe<Scalars['Int']['input']>;
  tenantDescription?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  tenantName: Scalars['String']['input'];
  tenantType: TenantType;
  verifyEmailOnSelfRegistration: Scalars['Boolean']['input'];
};

export type TenantManagementDomainRel = {
  __typename?: 'TenantManagementDomainRel';
  domain: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type TenantRateLimitRel = {
  __typename?: 'TenantRateLimitRel';
  allowUnlimitedRate?: Maybe<Scalars['Boolean']['output']>;
  rateLimit?: Maybe<Scalars['Int']['output']>;
  rateLimitId: Scalars['String']['output'];
  rateLimitPeriodMinutes?: Maybe<Scalars['Int']['output']>;
  tenantId: Scalars['String']['output'];
};

export type TenantScopeRel = {
  __typename?: 'TenantScopeRel';
  accessRuleId?: Maybe<Scalars['String']['output']>;
  scopeId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export enum TenantType {
  IdentityManagement = 'IDENTITY_MANAGEMENT',
  IdentityManagementAndServices = 'IDENTITY_MANAGEMENT_AND_SERVICES',
  RootTenant = 'ROOT_TENANT',
  Services = 'SERVICES'
}

export type TenantUpdateInput = {
  allowUnlimitedRate: Scalars['Boolean']['input'];
  allowUserSelfRegistration: Scalars['Boolean']['input'];
  claimsSupported: Array<Scalars['String']['input']>;
  delegatedAuthenticationConstraint: DelegatedAuthenticationConstraint;
  enabled: Scalars['Boolean']['input'];
  federatedOIDCProviderId?: InputMaybe<Scalars['String']['input']>;
  markForDelete: Scalars['Boolean']['input'];
  maxRefreshTokenCount?: InputMaybe<Scalars['Int']['input']>;
  tenantDescription?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  tenantName: Scalars['String']['input'];
  tenantType: TenantType;
  verifyEmailOnSelfRegistration: Scalars['Boolean']['input'];
};

export enum TwoFactorAuthType {
  Email = 'EMAIL',
  Hardware = 'HARDWARE',
  None = 'NONE',
  Text = 'TEXT',
  TimeBasedOtp = 'TIME_BASED_OTP'
}

export type User = {
  __typename?: 'User';
  address?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  createdDate: Scalars['String']['output'];
  domain: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  federatedOIDCProviderSubjectId?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  middleName?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  preferredLanguageCode?: Maybe<Scalars['String']['output']>;
  twoFactorAuthType?: Maybe<TwoFactorAuthType>;
  updatedDate?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserCredential = {
  __typename?: 'UserCredential';
  hashedPassword: Scalars['String']['output'];
  salt: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserCredentialHistory = {
  __typename?: 'UserCredentialHistory';
  dateCreated: Scalars['String']['output'];
  hashedPassword: Scalars['String']['output'];
  hashingAlgorithm: Scalars['String']['output'];
  salt: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserGroupRel = {
  __typename?: 'UserGroupRel';
  groupId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserTenantRel = {
  __typename?: 'UserTenantRel';
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AccessRule: ResolverTypeWrapper<AccessRule>;
  AccessRuleCreateInput: AccessRuleCreateInput;
  AccessRuleUpdateInput: AccessRuleUpdateInput;
  AuthenticationGroup: ResolverTypeWrapper<AuthenticationGroup>;
  AuthenticationGroupClientRel: ResolverTypeWrapper<AuthenticationGroupClientRel>;
  AuthenticationGroupCreateInput: AuthenticationGroupCreateInput;
  AuthenticationGroupUpdateInput: AuthenticationGroupUpdateInput;
  AuthenticationGroupUserRel: ResolverTypeWrapper<AuthenticationGroupUserRel>;
  AuthorizationCodeData: ResolverTypeWrapper<AuthorizationCodeData>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Client: ResolverTypeWrapper<Client>;
  ClientAuthHistory: ResolverTypeWrapper<ClientAuthHistory>;
  ClientAuthType: ClientAuthType;
  ClientCreateInput: ClientCreateInput;
  ClientTenantScopeRel: ResolverTypeWrapper<ClientTenantScopeRel>;
  ClientType: ClientType;
  ClientUpdateInput: ClientUpdateInput;
  DelegatedAuthenticationConstraint: DelegatedAuthenticationConstraint;
  FederatedOIDCAuthorizationRel: ResolverTypeWrapper<FederatedOidcAuthorizationRel>;
  FederatedOIDCProvider: ResolverTypeWrapper<FederatedOidcProvider>;
  FederatedOIDCProviderCreateInput: FederatedOidcProviderCreateInput;
  FederatedOIDCProviderDomainRel: ResolverTypeWrapper<FederatedOidcProviderDomainRel>;
  FederatedOIDCProviderTenantRel: ResolverTypeWrapper<FederatedOidcProviderTenantRel>;
  FederatedOIDCProviderUpdateInput: FederatedOidcProviderUpdateInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Group: ResolverTypeWrapper<Group>;
  GroupCreateInput: GroupCreateInput;
  GroupScopeRel: ResolverTypeWrapper<GroupScopeRel>;
  GroupUpdateInput: GroupUpdateInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  KeyType: KeyType;
  Mutation: ResolverTypeWrapper<{}>;
  PreAuthenticationState: ResolverTypeWrapper<PreAuthenticationState>;
  Query: ResolverTypeWrapper<{}>;
  RateLimit: ResolverTypeWrapper<RateLimit>;
  RateLimitCreateInput: RateLimitCreateInput;
  RateLimitUpdateInput: RateLimitUpdateInput;
  RefreshData: ResolverTypeWrapper<RefreshData>;
  RefreshTokenClientType: RefreshTokenClientType;
  Scope: ResolverTypeWrapper<Scope>;
  ScopeConstraintSchema: ResolverTypeWrapper<ScopeConstraintSchema>;
  ScopeConstraintSchemaCreateInput: ScopeConstraintSchemaCreateInput;
  ScopeConstraintSchemaUpdateInput: ScopeConstraintSchemaUpdateInput;
  ScopeCreateInput: ScopeCreateInput;
  ScopeUpdateInput: ScopeUpdateInput;
  SigningKey: ResolverTypeWrapper<SigningKey>;
  SigningKeyCreateInput: SigningKeyCreateInput;
  SigningKeyStatus: SigningKeyStatus;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Tenant: ResolverTypeWrapper<Tenant>;
  TenantCreateInput: TenantCreateInput;
  TenantManagementDomainRel: ResolverTypeWrapper<TenantManagementDomainRel>;
  TenantRateLimitRel: ResolverTypeWrapper<TenantRateLimitRel>;
  TenantScopeRel: ResolverTypeWrapper<TenantScopeRel>;
  TenantType: TenantType;
  TenantUpdateInput: TenantUpdateInput;
  TwoFactorAuthType: TwoFactorAuthType;
  User: ResolverTypeWrapper<User>;
  UserCredential: ResolverTypeWrapper<UserCredential>;
  UserCredentialHistory: ResolverTypeWrapper<UserCredentialHistory>;
  UserGroupRel: ResolverTypeWrapper<UserGroupRel>;
  UserTenantRel: ResolverTypeWrapper<UserTenantRel>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AccessRule: AccessRule;
  AccessRuleCreateInput: AccessRuleCreateInput;
  AccessRuleUpdateInput: AccessRuleUpdateInput;
  AuthenticationGroup: AuthenticationGroup;
  AuthenticationGroupClientRel: AuthenticationGroupClientRel;
  AuthenticationGroupCreateInput: AuthenticationGroupCreateInput;
  AuthenticationGroupUpdateInput: AuthenticationGroupUpdateInput;
  AuthenticationGroupUserRel: AuthenticationGroupUserRel;
  AuthorizationCodeData: AuthorizationCodeData;
  Boolean: Scalars['Boolean']['output'];
  Client: Client;
  ClientAuthHistory: ClientAuthHistory;
  ClientCreateInput: ClientCreateInput;
  ClientTenantScopeRel: ClientTenantScopeRel;
  ClientUpdateInput: ClientUpdateInput;
  FederatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel;
  FederatedOIDCProvider: FederatedOidcProvider;
  FederatedOIDCProviderCreateInput: FederatedOidcProviderCreateInput;
  FederatedOIDCProviderDomainRel: FederatedOidcProviderDomainRel;
  FederatedOIDCProviderTenantRel: FederatedOidcProviderTenantRel;
  FederatedOIDCProviderUpdateInput: FederatedOidcProviderUpdateInput;
  Float: Scalars['Float']['output'];
  Group: Group;
  GroupCreateInput: GroupCreateInput;
  GroupScopeRel: GroupScopeRel;
  GroupUpdateInput: GroupUpdateInput;
  Int: Scalars['Int']['output'];
  Mutation: {};
  PreAuthenticationState: PreAuthenticationState;
  Query: {};
  RateLimit: RateLimit;
  RateLimitCreateInput: RateLimitCreateInput;
  RateLimitUpdateInput: RateLimitUpdateInput;
  RefreshData: RefreshData;
  Scope: Scope;
  ScopeConstraintSchema: ScopeConstraintSchema;
  ScopeConstraintSchemaCreateInput: ScopeConstraintSchemaCreateInput;
  ScopeConstraintSchemaUpdateInput: ScopeConstraintSchemaUpdateInput;
  ScopeCreateInput: ScopeCreateInput;
  ScopeUpdateInput: ScopeUpdateInput;
  SigningKey: SigningKey;
  SigningKeyCreateInput: SigningKeyCreateInput;
  String: Scalars['String']['output'];
  Tenant: Tenant;
  TenantCreateInput: TenantCreateInput;
  TenantManagementDomainRel: TenantManagementDomainRel;
  TenantRateLimitRel: TenantRateLimitRel;
  TenantScopeRel: TenantScopeRel;
  TenantUpdateInput: TenantUpdateInput;
  User: User;
  UserCredential: UserCredential;
  UserCredentialHistory: UserCredentialHistory;
  UserGroupRel: UserGroupRel;
  UserTenantRel: UserTenantRel;
}>;

export type AccessRuleResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AccessRule'] = ResolversParentTypes['AccessRule']> = ResolversObject<{
  accessRuleDefinition?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  accessRuleId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeConstraintSchemaId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthenticationGroupResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthenticationGroup'] = ResolversParentTypes['AuthenticationGroup']> = ResolversObject<{
  authenticationGroupDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authenticationGroupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  authenticationGroupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthenticationGroupClientRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthenticationGroupClientRel'] = ResolversParentTypes['AuthenticationGroupClientRel']> = ResolversObject<{
  authenticationGroupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthenticationGroupUserRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthenticationGroupUserRel'] = ResolversParentTypes['AuthenticationGroupUserRel']> = ResolversObject<{
  authenticationGroupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthorizationCodeDataResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthorizationCodeData'] = ResolversParentTypes['AuthorizationCodeData']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  codeChallenge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  codeChallengeMethod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  redirectUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ClientResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Client'] = ResolversParentTypes['Client']> = ResolversObject<{
  clientDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientSecret?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientType?: Resolver<ResolversTypes['ClientType'], ParentType, ContextType>;
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  maxRefreshTokenCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  oidcEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  pkceEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  redirectUris?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userTokenTTLSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ClientAuthHistoryResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ClientAuthHistory'] = ResolversParentTypes['ClientAuthHistory']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAtSeconds?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  jti?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ClientTenantScopeRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ClientTenantScopeRel'] = ResolversParentTypes['ClientTenantScopeRel']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FederatedOidcAuthorizationRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['FederatedOIDCAuthorizationRel'] = ResolversParentTypes['FederatedOIDCAuthorizationRel']> = ResolversObject<{
  codeVerifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  federatedOIDCProviderId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initClientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initCodeChallenge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  initCodeChallengeMethod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  initRedirectUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initResponseMode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initScope?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initState?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initTenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FederatedOidcProviderResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['FederatedOIDCProvider'] = ResolversParentTypes['FederatedOIDCProvider']> = ResolversObject<{
  clientAuthType?: Resolver<Maybe<ResolversTypes['ClientAuthType']>, ParentType, ContextType>;
  federatedOIDCProviderClientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  federatedOIDCProviderClientSecret?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  federatedOIDCProviderDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  federatedOIDCProviderId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  federatedOIDCProviderName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  federatedOIDCProviderTenantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  federatedOIDCProviderWellKnownUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshTokenAllowed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  usePkce?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FederatedOidcProviderDomainRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['FederatedOIDCProviderDomainRel'] = ResolversParentTypes['FederatedOIDCProviderDomainRel']> = ResolversObject<{
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  federatedOIDCProviderId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FederatedOidcProviderTenantRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['FederatedOIDCProviderTenantRel'] = ResolversParentTypes['FederatedOIDCProviderTenantRel']> = ResolversObject<{
  federatedOIDCProviderId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GroupResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Group'] = ResolversParentTypes['Group']> = ResolversObject<{
  default?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  groupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GroupScopeRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['GroupScopeRel'] = ResolversParentTypes['GroupScopeRel']> = ResolversObject<{
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addDomainToTenantManagement?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationAddDomainToTenantManagementArgs, 'domain' | 'tenantId'>>;
  addUserToGroup?: Resolver<Maybe<ResolversTypes['UserGroupRel']>, ParentType, ContextType, RequireFields<MutationAddUserToGroupArgs, 'groupId' | 'userId'>>;
  assignAuthenticationGroupToClient?: Resolver<Maybe<ResolversTypes['AuthenticationGroupClientRel']>, ParentType, ContextType, RequireFields<MutationAssignAuthenticationGroupToClientArgs, 'authenticationGroupId' | 'clientId'>>;
  assignFederatedOIDCProviderToDomain?: Resolver<ResolversTypes['FederatedOIDCProviderDomainRel'], ParentType, ContextType, RequireFields<MutationAssignFederatedOidcProviderToDomainArgs, 'domain' | 'federatedOIDCProviderId'>>;
  assignFederatedOIDCProviderToTenant?: Resolver<ResolversTypes['FederatedOIDCProviderTenantRel'], ParentType, ContextType, RequireFields<MutationAssignFederatedOidcProviderToTenantArgs, 'federatedOIDCProviderId' | 'tenantId'>>;
  assignRateLimitToTenant?: Resolver<Maybe<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, RequireFields<MutationAssignRateLimitToTenantArgs, 'rateLimitId' | 'tenantId'>>;
  assignScopeToClient?: Resolver<Maybe<ResolversTypes['ClientTenantScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToClientArgs, 'clientId' | 'scopeId' | 'tenantId'>>;
  assignScopeToTenant?: Resolver<Maybe<ResolversTypes['TenantScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToTenantArgs, 'scopeId' | 'tenantId'>>;
  createAccessRule?: Resolver<Maybe<ResolversTypes['AccessRule']>, ParentType, ContextType, RequireFields<MutationCreateAccessRuleArgs, 'accessRuleInput'>>;
  createAuthenticationGroup?: Resolver<Maybe<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, RequireFields<MutationCreateAuthenticationGroupArgs, 'authenticationGroupInput'>>;
  createClient?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<MutationCreateClientArgs, 'clientInput'>>;
  createFederatedOIDCProvider?: Resolver<Maybe<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, RequireFields<MutationCreateFederatedOidcProviderArgs, 'oidcProviderInput'>>;
  createGroup?: Resolver<Maybe<ResolversTypes['Group']>, ParentType, ContextType, RequireFields<MutationCreateGroupArgs, 'groupInput'>>;
  createRateLimit?: Resolver<Maybe<ResolversTypes['RateLimit']>, ParentType, ContextType, RequireFields<MutationCreateRateLimitArgs, 'rateLimitInput'>>;
  createRootTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationCreateRootTenantArgs, 'tenantInput'>>;
  createScope?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<MutationCreateScopeArgs, 'scopeInput'>>;
  createScopeConstraintSchema?: Resolver<Maybe<ResolversTypes['ScopeConstraintSchema']>, ParentType, ContextType, RequireFields<MutationCreateScopeConstraintSchemaArgs, 'scopeConstraintSchemaInput'>>;
  createSigningKey?: Resolver<ResolversTypes['SigningKey'], ParentType, ContextType, RequireFields<MutationCreateSigningKeyArgs, 'keyInput'>>;
  createTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationCreateTenantArgs, 'tenantInput'>>;
  deleteAccessRule?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteAccessRuleArgs, 'accessRuleId'>>;
  deleteAuthenticationGroup?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteAuthenticationGroupArgs, 'authenticationGroupId'>>;
  deleteClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteClientArgs, 'clientId'>>;
  deleteFederatedOIDCProvider?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteFederatedOidcProviderArgs, 'federatedOIDCProviderId'>>;
  deleteGroup?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteGroupArgs, 'groupId'>>;
  deleteRateLimit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteRateLimitArgs, 'rateLimitId'>>;
  deleteScope?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteScopeArgs, 'scopeId'>>;
  deleteScopeConstraingSchema?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteScopeConstraingSchemaArgs, 'scopeConstraintSchemaId'>>;
  deleteSigningKey?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteSigningKeyArgs, 'keyId'>>;
  deleteTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteTenantArgs, 'tenantId'>>;
  removeAuthenticationGroupFromClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveAuthenticationGroupFromClientArgs, 'authenticationGroupId' | 'clientId'>>;
  removeDomainFromTenantManagement?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveDomainFromTenantManagementArgs, 'domain' | 'tenantId'>>;
  removeFederatedOIDCProviderFromDomain?: Resolver<ResolversTypes['FederatedOIDCProviderDomainRel'], ParentType, ContextType, RequireFields<MutationRemoveFederatedOidcProviderFromDomainArgs, 'domain' | 'federatedOIDCProviderId'>>;
  removeFederatedOIDCProviderFromTenant?: Resolver<ResolversTypes['FederatedOIDCProviderTenantRel'], ParentType, ContextType, RequireFields<MutationRemoveFederatedOidcProviderFromTenantArgs, 'federatedOIDCProviderId' | 'tenantId'>>;
  removeRateLimitFromTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveRateLimitFromTenantArgs, 'rateLimitId' | 'tenantId'>>;
  removeScopeFromClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromClientArgs, 'clientId' | 'scopeId' | 'tenantId'>>;
  removeScopeFromTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromTenantArgs, 'scopeId' | 'tenantId'>>;
  removeUserFromGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromGroupArgs, 'groupId' | 'userId'>>;
  updateAccessRule?: Resolver<Maybe<ResolversTypes['AccessRule']>, ParentType, ContextType, RequireFields<MutationUpdateAccessRuleArgs, 'accessRuleInput'>>;
  updateAuthenticationGroup?: Resolver<Maybe<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, RequireFields<MutationUpdateAuthenticationGroupArgs, 'authenticationGroupInput'>>;
  updateClient?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<MutationUpdateClientArgs, 'clientInput'>>;
  updateFederatedOIDCProvider?: Resolver<Maybe<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, RequireFields<MutationUpdateFederatedOidcProviderArgs, 'oidcProviderInput'>>;
  updateGroup?: Resolver<Maybe<ResolversTypes['Group']>, ParentType, ContextType, RequireFields<MutationUpdateGroupArgs, 'groupInput'>>;
  updateRateLimit?: Resolver<Maybe<ResolversTypes['RateLimit']>, ParentType, ContextType, RequireFields<MutationUpdateRateLimitArgs, 'rateLimitInput'>>;
  updateRateLimitForTenant?: Resolver<Maybe<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, RequireFields<MutationUpdateRateLimitForTenantArgs, 'rateLimitId' | 'tenantId'>>;
  updateRootTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationUpdateRootTenantArgs, 'tenantInput'>>;
  updateScope?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<MutationUpdateScopeArgs, 'scopeInput'>>;
  updateScopeConstraintSchema?: Resolver<Maybe<ResolversTypes['ScopeConstraintSchema']>, ParentType, ContextType, RequireFields<MutationUpdateScopeConstraintSchemaArgs, 'scopeConstraintSchemaInput'>>;
  updateTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationUpdateTenantArgs, 'tenantInput'>>;
}>;

export type PreAuthenticationStateResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['PreAuthenticationState'] = ResolversParentTypes['PreAuthenticationState']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  codeChallenge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  codeChallengeMethod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  redirectUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  responseMode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  responseType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getAccessRuleById?: Resolver<Maybe<ResolversTypes['AccessRule']>, ParentType, ContextType, RequireFields<QueryGetAccessRuleByIdArgs, 'accessRuleId'>>;
  getAccessRules?: Resolver<Array<ResolversTypes['AccessRule']>, ParentType, ContextType, Partial<QueryGetAccessRulesArgs>>;
  getAuthenticationGroupById?: Resolver<Maybe<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, RequireFields<QueryGetAuthenticationGroupByIdArgs, 'authenticationGroupId'>>;
  getAuthenticationGroups?: Resolver<Array<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, Partial<QueryGetAuthenticationGroupsArgs>>;
  getClientById?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<QueryGetClientByIdArgs, 'clientId'>>;
  getClients?: Resolver<Array<ResolversTypes['Client']>, ParentType, ContextType, Partial<QueryGetClientsArgs>>;
  getFederatedOIDCProviderById?: Resolver<Maybe<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, RequireFields<QueryGetFederatedOidcProviderByIdArgs, 'federatedOIDCProviderId'>>;
  getFederatedOIDCProviders?: Resolver<Array<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, Partial<QueryGetFederatedOidcProvidersArgs>>;
  getGroupById?: Resolver<Maybe<ResolversTypes['Group']>, ParentType, ContextType, RequireFields<QueryGetGroupByIdArgs, 'groupId'>>;
  getGroups?: Resolver<Array<ResolversTypes['Group']>, ParentType, ContextType>;
  getRateLimitById?: Resolver<Maybe<ResolversTypes['RateLimit']>, ParentType, ContextType, RequireFields<QueryGetRateLimitByIdArgs, 'rateLimitId'>>;
  getRateLimits?: Resolver<Array<ResolversTypes['RateLimit']>, ParentType, ContextType, Partial<QueryGetRateLimitsArgs>>;
  getRootTenant?: Resolver<ResolversTypes['Tenant'], ParentType, ContextType>;
  getScope?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, Partial<QueryGetScopeArgs>>;
  getScopeById?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetScopeByIdArgs, 'scopeId'>>;
  getScopeConstraintSchemaById?: Resolver<Maybe<ResolversTypes['ScopeConstraintSchema']>, ParentType, ContextType, Partial<QueryGetScopeConstraintSchemaByIdArgs>>;
  getScopeConstraintSchemas?: Resolver<Array<ResolversTypes['ScopeConstraintSchema']>, ParentType, ContextType>;
  getSigningKeyById?: Resolver<Maybe<ResolversTypes['SigningKey']>, ParentType, ContextType, RequireFields<QueryGetSigningKeyByIdArgs, 'signingKeyId'>>;
  getSigningKeys?: Resolver<Array<ResolversTypes['SigningKey']>, ParentType, ContextType, Partial<QueryGetSigningKeysArgs>>;
  getTenantById?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<QueryGetTenantByIdArgs, 'tenantId'>>;
  getTenants?: Resolver<Array<ResolversTypes['Tenant']>, ParentType, ContextType>;
  getUserById?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserByIdArgs, 'userId'>>;
  getUserGroups?: Resolver<Array<ResolversTypes['Group']>, ParentType, ContextType, RequireFields<QueryGetUserGroupsArgs, 'userId'>>;
  getUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, Partial<QueryGetUsersArgs>>;
}>;

export type RateLimitResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['RateLimit'] = ResolversParentTypes['RateLimit']> = ResolversObject<{
  rateLimitDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rateLimitDomain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rateLimitId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RefreshDataResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['RefreshData'] = ResolversParentTypes['RefreshData']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshTokenClientType?: Resolver<ResolversTypes['RefreshTokenClientType'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ScopeResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Scope'] = ResolversParentTypes['Scope']> = ResolversObject<{
  scopeConstraintSchemaId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scopeDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ScopeConstraintSchemaResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ScopeConstraintSchema'] = ResolversParentTypes['ScopeConstraintSchema']> = ResolversObject<{
  schema?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  schemaVersion?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scopeConstraintSchemaId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SigningKeyResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SigningKey'] = ResolversParentTypes['SigningKey']> = ResolversObject<{
  certificate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  keyId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  keyType?: Resolver<ResolversTypes['KeyType'], ParentType, ContextType>;
  password?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  privateKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SigningKeyStatus'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  use?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Tenant'] = ResolversParentTypes['Tenant']> = ResolversObject<{
  allowUnlimitedRate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowUserSelfRegistration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  claimsSupported?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  delegatedAuthenticationConstraint?: Resolver<ResolversTypes['DelegatedAuthenticationConstraint'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  federatedOIDCProviderId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  markForDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tenantDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantType?: Resolver<ResolversTypes['TenantType'], ParentType, ContextType>;
  verifyEmailOnSelfRegistration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantManagementDomainRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantManagementDomainRel'] = ResolversParentTypes['TenantManagementDomainRel']> = ResolversObject<{
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantRateLimitRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantRateLimitRel'] = ResolversParentTypes['TenantRateLimitRel']> = ResolversObject<{
  allowUnlimitedRate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  rateLimit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rateLimitId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rateLimitPeriodMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantScopeRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantScopeRel'] = ResolversParentTypes['TenantScopeRel']> = ResolversObject<{
  accessRuleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  countryCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  federatedOIDCProviderSubjectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  middleName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  preferredLanguageCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twoFactorAuthType?: Resolver<Maybe<ResolversTypes['TwoFactorAuthType']>, ParentType, ContextType>;
  updatedDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserCredentialResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserCredential'] = ResolversParentTypes['UserCredential']> = ResolversObject<{
  hashedPassword?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  salt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserCredentialHistoryResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserCredentialHistory'] = ResolversParentTypes['UserCredentialHistory']> = ResolversObject<{
  dateCreated?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hashedPassword?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hashingAlgorithm?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  salt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserGroupRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserGroupRel'] = ResolversParentTypes['UserGroupRel']> = ResolversObject<{
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserTenantRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserTenantRel'] = ResolversParentTypes['UserTenantRel']> = ResolversObject<{
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = OIDCContext> = ResolversObject<{
  AccessRule?: AccessRuleResolvers<ContextType>;
  AuthenticationGroup?: AuthenticationGroupResolvers<ContextType>;
  AuthenticationGroupClientRel?: AuthenticationGroupClientRelResolvers<ContextType>;
  AuthenticationGroupUserRel?: AuthenticationGroupUserRelResolvers<ContextType>;
  AuthorizationCodeData?: AuthorizationCodeDataResolvers<ContextType>;
  Client?: ClientResolvers<ContextType>;
  ClientAuthHistory?: ClientAuthHistoryResolvers<ContextType>;
  ClientTenantScopeRel?: ClientTenantScopeRelResolvers<ContextType>;
  FederatedOIDCAuthorizationRel?: FederatedOidcAuthorizationRelResolvers<ContextType>;
  FederatedOIDCProvider?: FederatedOidcProviderResolvers<ContextType>;
  FederatedOIDCProviderDomainRel?: FederatedOidcProviderDomainRelResolvers<ContextType>;
  FederatedOIDCProviderTenantRel?: FederatedOidcProviderTenantRelResolvers<ContextType>;
  Group?: GroupResolvers<ContextType>;
  GroupScopeRel?: GroupScopeRelResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PreAuthenticationState?: PreAuthenticationStateResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RateLimit?: RateLimitResolvers<ContextType>;
  RefreshData?: RefreshDataResolvers<ContextType>;
  Scope?: ScopeResolvers<ContextType>;
  ScopeConstraintSchema?: ScopeConstraintSchemaResolvers<ContextType>;
  SigningKey?: SigningKeyResolvers<ContextType>;
  Tenant?: TenantResolvers<ContextType>;
  TenantManagementDomainRel?: TenantManagementDomainRelResolvers<ContextType>;
  TenantRateLimitRel?: TenantRateLimitRelResolvers<ContextType>;
  TenantScopeRel?: TenantScopeRelResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserCredential?: UserCredentialResolvers<ContextType>;
  UserCredentialHistory?: UserCredentialHistoryResolvers<ContextType>;
  UserGroupRel?: UserGroupRelResolvers<ContextType>;
  UserTenantRel?: UserTenantRelResolvers<ContextType>;
}>;



import gql from 'graphql-tag';
export const typeDefs = gql(`schema{query:Query mutation:Mutation}type AccessRule{accessRuleDefinition:String!accessRuleId:String!scopeConstraintSchemaId:String!scopeId:String!}input AccessRuleCreateInput{accessRuleDefinition:String!scopeConstraintSchemaId:String!scopeId:String!}input AccessRuleUpdateInput{accessRuleDefinition:String!accessRuleId:String!scopeConstraintSchemaId:String!scopeId:String!}type AuthenticationGroup{authenticationGroupDescription:String authenticationGroupId:String!authenticationGroupName:String!tenantId:String!}type AuthenticationGroupClientRel{authenticationGroupId:String!clientId:String!}input AuthenticationGroupCreateInput{authenticationGroupDescription:String authenticationGroupName:String!tenantId:String!}input AuthenticationGroupUpdateInput{authenticationGroupDescription:String authenticationGroupId:String!authenticationGroupName:String!tenantId:String!}type AuthenticationGroupUserRel{authenticationGroupId:String!userId:String!}type AuthorizationCodeData{clientId:String!code:String!codeChallenge:String codeChallengeMethod:String expiresAtMs:Float!redirectUri:String!scope:String!tenantId:String!userId:String!}type Client{clientDescription:String clientId:String!clientName:String!clientSecret:String!clientType:ClientType!enabled:Boolean maxRefreshTokenCount:Int oidcEnabled:Boolean!pkceEnabled:Boolean!redirectUris:[String!]tenantId:String!userTokenTTLSeconds:Int!}type ClientAuthHistory{clientId:String!expiresAtSeconds:Float!jti:String!tenantId:String!}enum ClientAuthType{CLIENT_SECRET_BASIC CLIENT_SECRET_JWT CLIENT_SECRET_POST NONE}input ClientCreateInput{clientDescription:String clientName:String!clientType:ClientType!enabled:Boolean maxRefreshTokenCount:Int oidcEnabled:Boolean pkceEnabled:Boolean redirectUris:[String!]tenantId:String!userTokenTTLSeconds:Int}type ClientTenantScopeRel{clientId:String!scopeId:String!tenantId:String!}enum ClientType{SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS SERVICE_ACCOUNT_ONLY USER_DELEGATED_PERMISSIONS_ONLY}input ClientUpdateInput{clientDescription:String clientId:String!clientName:String!clientType:ClientType!enabled:Boolean maxRefreshTokenCount:Int oidcEnabled:Boolean pkceEnabled:Boolean redirectUris:[String!]tenantId:String!userTokenTTLSeconds:Int}enum DelegatedAuthenticationConstraint{EXCLUSIVE NOT_ALLOWED PERMISSIVE}type FederatedOIDCAuthorizationRel{codeVerifier:String expiresAtMs:Float!federatedOIDCProviderId:String!initClientId:String!initCodeChallenge:String initCodeChallengeMethod:String initRedirectUri:String!initResponseMode:String!initScope:String!initState:String!initTenantId:String!state:String!}type FederatedOIDCProvider{clientAuthType:ClientAuthType federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderId:String!federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderWellKnownUri:String!refreshTokenAllowed:Boolean!usePkce:Boolean!}input FederatedOIDCProviderCreateInput{clientAuthType:ClientAuthType federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderId:String!federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderWellKnownUri:String!refreshTokenAllowed:Boolean!usePkce:Boolean!}type FederatedOIDCProviderDomainRel{domain:String!federatedOIDCProviderId:String!}type FederatedOIDCProviderTenantRel{federatedOIDCProviderId:String!tenantId:String!}input FederatedOIDCProviderUpdateInput{clientAuthType:ClientAuthType federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderId:String!federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderWellKnownUri:String!refreshTokenAllowed:Boolean!usePkce:Boolean!}type Group{default:Boolean!groupId:String!groupName:String!tenantId:String!}input GroupCreateInput{default:Boolean!groupName:String!tenantId:String!}type GroupScopeRel{groupId:String!scopeId:String!tenantId:String!}input GroupUpdateInput{default:Boolean!groupId:String!groupName:String!tenantId:String!}enum KeyType{EC RSA}type Mutation{addDomainToTenantManagement(domain:String!tenantId:String!):String addUserToGroup(groupId:String!userId:String!):UserGroupRel assignAuthenticationGroupToClient(authenticationGroupId:String!clientId:String!):AuthenticationGroupClientRel assignFederatedOIDCProviderToDomain(domain:String!federatedOIDCProviderId:String!):FederatedOIDCProviderDomainRel!assignFederatedOIDCProviderToTenant(federatedOIDCProviderId:String!tenantId:String!):FederatedOIDCProviderTenantRel!assignRateLimitToTenant(allowUnlimited:Boolean limit:Int rateLimitId:String!rateLimitPeriodMinutes:Int tenantId:String!):TenantRateLimitRel assignScopeToClient(clientId:String!scopeId:String!tenantId:String!):ClientTenantScopeRel assignScopeToTenant(scopeId:String!tenantId:String!):TenantScopeRel createAccessRule(accessRuleInput:AccessRuleCreateInput!):AccessRule createAuthenticationGroup(authenticationGroupInput:AuthenticationGroupCreateInput!):AuthenticationGroup createClient(clientInput:ClientCreateInput!):Client createFederatedOIDCProvider(oidcProviderInput:FederatedOIDCProviderCreateInput!):FederatedOIDCProvider createGroup(groupInput:GroupCreateInput!):Group createRateLimit(rateLimitInput:RateLimitCreateInput!):RateLimit createRootTenant(tenantInput:TenantCreateInput!):Tenant createScope(scopeInput:ScopeCreateInput!):Scope createScopeConstraintSchema(scopeConstraintSchemaInput:ScopeConstraintSchemaCreateInput!):ScopeConstraintSchema createSigningKey(keyInput:SigningKeyCreateInput!):SigningKey!createTenant(tenantInput:TenantCreateInput!):Tenant deleteAccessRule(accessRuleId:String!):String!deleteAuthenticationGroup(authenticationGroupId:String!):String!deleteClient(clientId:String!):String deleteFederatedOIDCProvider(federatedOIDCProviderId:String!):String!deleteGroup(groupId:String!):String!deleteRateLimit(rateLimitId:String!):String deleteScope(scopeId:String!):String deleteScopeConstraingSchema(scopeConstraintSchemaId:String!):String!deleteSigningKey(keyId:String!):String!deleteTenant(tenantId:String!):String removeAuthenticationGroupFromClient(authenticationGroupId:String!clientId:String!):String removeDomainFromTenantManagement(domain:String!tenantId:String!):String removeFederatedOIDCProviderFromDomain(domain:String!federatedOIDCProviderId:String!):FederatedOIDCProviderDomainRel!removeFederatedOIDCProviderFromTenant(federatedOIDCProviderId:String!tenantId:String!):FederatedOIDCProviderTenantRel!removeRateLimitFromTenant(rateLimitId:String!tenantId:String!):String removeScopeFromClient(clientId:String!scopeId:String!tenantId:String!):String removeScopeFromTenant(scopeId:String!tenantId:String!):String removeUserFromGroup(groupId:String!userId:String!):String updateAccessRule(accessRuleInput:AccessRuleUpdateInput!):AccessRule updateAuthenticationGroup(authenticationGroupInput:AuthenticationGroupUpdateInput!):AuthenticationGroup updateClient(clientInput:ClientUpdateInput!):Client updateFederatedOIDCProvider(oidcProviderInput:FederatedOIDCProviderUpdateInput!):FederatedOIDCProvider updateGroup(groupInput:GroupUpdateInput!):Group updateRateLimit(rateLimitInput:RateLimitUpdateInput!):RateLimit updateRateLimitForTenant(allowUnlimited:Boolean limit:Int rateLimitId:String!rateLimitPeriodMinutes:Int tenantId:String!):TenantRateLimitRel updateRootTenant(tenantInput:TenantUpdateInput!):Tenant updateScope(scopeInput:ScopeUpdateInput!):Scope updateScopeConstraintSchema(scopeConstraintSchemaInput:ScopeConstraintSchemaUpdateInput!):ScopeConstraintSchema updateTenant(tenantInput:TenantUpdateInput!):Tenant}type PreAuthenticationState{clientId:String!codeChallenge:String codeChallengeMethod:String expiresAtMs:Float!redirectUri:String!responseMode:String!responseType:String!scope:String!state:String tenantId:String!token:String!}type Query{getAccessRuleById(accessRuleId:String!):AccessRule getAccessRules(tenantId:String):[AccessRule!]!getAuthenticationGroupById(authenticationGroupId:String!):AuthenticationGroup getAuthenticationGroups(tenantId:String):[AuthenticationGroup!]!getClientById(clientId:String!):Client getClients(tenantId:String):[Client!]!getFederatedOIDCProviderById(federatedOIDCProviderId:String!):FederatedOIDCProvider getFederatedOIDCProviders(tenantId:String):[FederatedOIDCProvider!]!getGroupById(groupId:String!):Group getGroups:[Group!]!getRateLimitById(rateLimitId:String!):RateLimit getRateLimits(tenantId:String):[RateLimit!]!getRootTenant:Tenant!getScope(tenantId:String):[Scope!]!getScopeById(scopeId:String!):Scope getScopeConstraintSchemaById(scopeConstraintSchemaId:String):ScopeConstraintSchema getScopeConstraintSchemas:[ScopeConstraintSchema!]!getSigningKeyById(signingKeyId:String!):SigningKey getSigningKeys(tenantId:String):[SigningKey!]!getTenantById(tenantId:String!):Tenant getTenants:[Tenant!]!getUserById(userId:String!):User getUserGroups(userId:String!):[Group!]!getUsers(tenantId:String):[User!]!}type RateLimit{rateLimitDescription:String rateLimitDomain:String!rateLimitId:String!}input RateLimitCreateInput{rateLimitDescription:String rateLimitDomain:String!}input RateLimitUpdateInput{rateLimitDescription:String rateLimitDomain:String!rateLimitId:String!}type RefreshData{clientId:String!refreshCount:Int!refreshToken:String!refreshTokenClientType:RefreshTokenClientType!tenantId:String!userId:String!}enum RefreshTokenClientType{PKCE SECURE_CLIENT}type Scope{scopeConstraintSchemaId:String scopeDescription:String scopeId:String!scopeName:String!}type ScopeConstraintSchema{schema:String!schemaVersion:Int!scopeConstraintSchemaId:String!scopeId:String!}input ScopeConstraintSchemaCreateInput{schema:String!scopeId:String!}input ScopeConstraintSchemaUpdateInput{schema:String!scopeConstraintSchemaId:String!scopeId:String!}input ScopeCreateInput{scopeConstraintSchemaId:String scopeDescription:String scopeName:String!}input ScopeUpdateInput{scopeConstraintSchemaId:String scopeDescription:String scopeId:String!scopeName:String!}type SigningKey{certificate:String!expiresAtMs:Float!keyId:String!keyType:KeyType!password:String privateKey:String!status:SigningKeyStatus!tenantId:String!use:String!}input SigningKeyCreateInput{certificate:String!keyType:KeyType!password:String privateKey:String!tenantId:String!use:String!}enum SigningKeyStatus{ACTIVE REVOKED}type Tenant{allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!claimsSupported:[String!]!delegatedAuthenticationConstraint:DelegatedAuthenticationConstraint!enabled:Boolean!federatedOIDCProviderId:String markForDelete:Boolean!tenantDescription:String tenantId:String!tenantName:String!tenantType:TenantType!verifyEmailOnSelfRegistration:Boolean!}input TenantCreateInput{allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!claimsSupported:[String!]!delegatedAuthenticationConstraint:DelegatedAuthenticationConstraint!enabled:Boolean!federatedOIDCProviderId:String maxRefreshTokenCount:Int tenantDescription:String tenantId:String!tenantName:String!tenantType:TenantType!verifyEmailOnSelfRegistration:Boolean!}type TenantManagementDomainRel{domain:String!tenantId:String!}type TenantRateLimitRel{allowUnlimitedRate:Boolean rateLimit:Int rateLimitId:String!rateLimitPeriodMinutes:Int tenantId:String!}type TenantScopeRel{accessRuleId:String scopeId:String!tenantId:String!}enum TenantType{IDENTITY_MANAGEMENT IDENTITY_MANAGEMENT_AND_SERVICES ROOT_TENANT SERVICES}input TenantUpdateInput{allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!claimsSupported:[String!]!delegatedAuthenticationConstraint:DelegatedAuthenticationConstraint!enabled:Boolean!federatedOIDCProviderId:String markForDelete:Boolean!maxRefreshTokenCount:Int tenantDescription:String tenantId:String!tenantName:String!tenantType:TenantType!verifyEmailOnSelfRegistration:Boolean!}enum TwoFactorAuthType{EMAIL HARDWARE NONE TEXT TIME_BASED_OTP}type User{address:String countryCode:String createdDate:String!domain:String!email:String!emailVerified:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!middleName:String phoneNumber:String preferredLanguageCode:String twoFactorAuthType:TwoFactorAuthType updatedDate:String userId:String!}type UserCredential{hashedPassword:String!salt:String!userId:String!}type UserCredentialHistory{dateCreated:String!hashedPassword:String!hashingAlgorithm:String!salt:String!userId:String!}type UserGroupRel{groupId:String!userId:String!}type UserTenantRel{tenantId:String!userId:String!}`);