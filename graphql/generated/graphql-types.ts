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

export type Client = {
  __typename?: 'Client';
  allowDelegatedAuthentication: Scalars['Boolean']['output'];
  allowUserSelfRegistration: Scalars['Boolean']['output'];
  clientDescription?: Maybe<Scalars['String']['output']>;
  clientId: Scalars['String']['output'];
  clientName: Scalars['String']['output'];
  clientSecret: Scalars['String']['output'];
  clientType: ClientType;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  oidcEnabled: Scalars['Boolean']['output'];
  pkceEnabled: Scalars['Boolean']['output'];
  redirectUris?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  userTokenTTLSeconds?: Maybe<Scalars['Int']['output']>;
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
  oidcEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  pkceEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  redirectUris?: InputMaybe<Array<Scalars['String']['input']>>;
  tenantId: Scalars['String']['input'];
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
  oidcEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  pkceEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  redirectUris?: InputMaybe<Array<Scalars['String']['input']>>;
  tenantId: Scalars['String']['input'];
};

export type DomainOidcClientDefinitionRel = {
  __typename?: 'DomainOIDCClientDefinitionRel';
  domain: Scalars['String']['output'];
  oidcClientDefinitionId: Scalars['String']['output'];
};

export type Group = {
  __typename?: 'Group';
  groupId: Scalars['String']['output'];
  groupName: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type GroupCreateInput = {
  groupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type GroupUpdateInput = {
  groupId: Scalars['String']['input'];
  groupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type Key = {
  __typename?: 'Key';
  e: Scalars['String']['output'];
  exp: Scalars['String']['output'];
  keyId: Scalars['String']['output'];
  keyType: Scalars['String']['output'];
  n: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  use: Scalars['String']['output'];
  x5c: Array<Scalars['String']['output']>;
};

export type KeyCreateInput = {
  e: Scalars['String']['input'];
  exp: Scalars['String']['input'];
  keyType: Scalars['String']['input'];
  n: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  use: Scalars['String']['input'];
  x5c: Array<Scalars['String']['input']>;
};

export type KeyUpdateInput = {
  e: Scalars['String']['input'];
  exp: Scalars['String']['input'];
  keyId: Scalars['String']['input'];
  keyType: Scalars['String']['input'];
  n: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  use: Scalars['String']['input'];
  x5c: Array<Scalars['String']['input']>;
};

export type LoginGroup = {
  __typename?: 'LoginGroup';
  loginGroupDescription?: Maybe<Scalars['String']['output']>;
  loginGroupId: Scalars['String']['output'];
  loginGroupName: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type LoginGroupClientRel = {
  __typename?: 'LoginGroupClientRel';
  clientId: Scalars['String']['output'];
  loginGroupId: Scalars['String']['output'];
};

export type LoginGroupCreateInput = {
  loginGroupDescription?: InputMaybe<Scalars['String']['input']>;
  loginGroupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type LoginGroupUpdateInput = {
  loginGroupDescription?: InputMaybe<Scalars['String']['input']>;
  loginGroupId: Scalars['String']['input'];
  loginGroupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type LoginGroupUserRel = {
  __typename?: 'LoginGroupUserRel';
  loginGroupId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addUserToGroup?: Maybe<UserGroupRel>;
  assignLoginGroupToClient?: Maybe<LoginGroupClientRel>;
  assignRateLimitToTenant?: Maybe<TenantRateLimitRel>;
  assignScopeToClient?: Maybe<ClientTenantScopeRel>;
  assignScopeToTenant?: Maybe<TenantScopeRel>;
  createClient?: Maybe<Client>;
  createGroup?: Maybe<Group>;
  createLoginGroup?: Maybe<LoginGroup>;
  createRateLimit?: Maybe<RateLimit>;
  createRootTenant?: Maybe<Tenant>;
  createScope?: Maybe<Scope>;
  createSigningKey?: Maybe<Key>;
  createTenant?: Maybe<Tenant>;
  deleteClient?: Maybe<Scalars['String']['output']>;
  deleteGroup: Scalars['String']['output'];
  deleteLoginGroup: Scalars['String']['output'];
  deleteRateLimit?: Maybe<Scalars['String']['output']>;
  deleteScope?: Maybe<Scalars['String']['output']>;
  deleteTenant?: Maybe<Scalars['String']['output']>;
  removeLoginGroupFromClient?: Maybe<Scalars['String']['output']>;
  removeRateLimitFromTenant?: Maybe<Scalars['String']['output']>;
  removeScopeFromClient?: Maybe<Scalars['String']['output']>;
  removeScopeFromTenant?: Maybe<Scalars['String']['output']>;
  removeUserFromGroup?: Maybe<Scalars['String']['output']>;
  updateClient?: Maybe<Client>;
  updateGroup?: Maybe<Group>;
  updateLoginGroup?: Maybe<LoginGroup>;
  updateRateLimit?: Maybe<RateLimit>;
  updateRateLimitForTenant?: Maybe<TenantRateLimitRel>;
  updateRootTenant?: Maybe<Tenant>;
  updateScope?: Maybe<Scope>;
  updateSigningKey?: Maybe<Key>;
  updateTenant?: Maybe<Tenant>;
};


export type MutationAddUserToGroupArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationAssignLoginGroupToClientArgs = {
  clientId: Scalars['String']['input'];
  loginGroupId: Scalars['String']['input'];
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


export type MutationCreateClientArgs = {
  clientInput: ClientCreateInput;
};


export type MutationCreateGroupArgs = {
  groupInput: GroupCreateInput;
};


export type MutationCreateLoginGroupArgs = {
  loginGroupInput: LoginGroupCreateInput;
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


export type MutationCreateSigningKeyArgs = {
  keyInput: KeyCreateInput;
};


export type MutationCreateTenantArgs = {
  tenantInput: TenantCreateInput;
};


export type MutationDeleteClientArgs = {
  clientId: Scalars['String']['input'];
};


export type MutationDeleteGroupArgs = {
  groupId: Scalars['String']['input'];
};


export type MutationDeleteLoginGroupArgs = {
  loginGroupId: Scalars['String']['input'];
};


export type MutationDeleteRateLimitArgs = {
  rateLimitId: Scalars['String']['input'];
};


export type MutationDeleteScopeArgs = {
  scopeId: Scalars['String']['input'];
};


export type MutationDeleteTenantArgs = {
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveLoginGroupFromClientArgs = {
  clientId: Scalars['String']['input'];
  loginGroupId: Scalars['String']['input'];
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


export type MutationUpdateClientArgs = {
  clientInput: ClientUpdateInput;
};


export type MutationUpdateGroupArgs = {
  groupInput: GroupUpdateInput;
};


export type MutationUpdateLoginGroupArgs = {
  loginGroupInput: LoginGroupUpdateInput;
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


export type MutationUpdateSigningKeyArgs = {
  keyInput: KeyUpdateInput;
};


export type MutationUpdateTenantArgs = {
  tenantInput: TenantUpdateInput;
};

export type OidcClientDefinition = {
  __typename?: 'OIDCClientDefinition';
  clientAuthType?: Maybe<ClientAuthType>;
  oidcClientDefinitionId: Scalars['String']['output'];
  oidcClientDescription?: Maybe<Scalars['String']['output']>;
  oidcClientName: Scalars['String']['output'];
  oidcClientTenantId?: Maybe<Scalars['String']['output']>;
  oidcProviderClientId: Scalars['String']['output'];
  oidcProviderClientSecret?: Maybe<Scalars['String']['output']>;
  oidcProviderWellKnownUri: Scalars['String']['output'];
  refreshTokenAllowed: Scalars['Boolean']['output'];
  usePkce: Scalars['Boolean']['output'];
};

export type OidcClientDefinitionInput = {
  clientAuthType?: InputMaybe<ClientAuthType>;
  clientId: Scalars['String']['input'];
  clientSecret?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  usePkce: Scalars['Boolean']['input'];
  wellKnownUri: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  getClientById?: Maybe<Client>;
  getClients: Array<Client>;
  getGroups: Array<Group>;
  getLoginGroupById: LoginGroup;
  getLoginGroups: Array<LoginGroup>;
  getRateLimitById?: Maybe<RateLimit>;
  getRateLimits: Array<RateLimit>;
  getRootTenant: Tenant;
  getScope: Array<Scope>;
  getScopeById?: Maybe<Scope>;
  getSigningKeyById?: Maybe<Key>;
  getSigningKeys: Array<Key>;
  getTenantById?: Maybe<Tenant>;
  getTenants: Array<Tenant>;
  getUserById?: Maybe<User>;
  getUserGroups: Array<Group>;
  getUsers: Array<User>;
};


export type QueryGetClientByIdArgs = {
  clientId: Scalars['String']['input'];
};


export type QueryGetClientsArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetLoginGroupByIdArgs = {
  loginGroupId: Scalars['String']['input'];
};


export type QueryGetLoginGroupsArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
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

export type Scope = {
  __typename?: 'Scope';
  scopeDescription?: Maybe<Scalars['String']['output']>;
  scopeId: Scalars['String']['output'];
  scopeName: Scalars['String']['output'];
};

export type ScopeCreateInput = {
  scopeDescription?: InputMaybe<Scalars['String']['input']>;
  scopeName: Scalars['String']['input'];
};

export type ScopeUpdateInput = {
  scopeDescription?: InputMaybe<Scalars['String']['input']>;
  scopeId: Scalars['String']['input'];
  scopeName: Scalars['String']['input'];
};

export type Tenant = {
  __typename?: 'Tenant';
  allowUnlimitedRate?: Maybe<Scalars['Boolean']['output']>;
  claimsSupported: Array<Scalars['String']['output']>;
  delegateAuthentication: Scalars['Boolean']['output'];
  enabled: Scalars['Boolean']['output'];
  oidcClientDefinitionId?: Maybe<Scalars['String']['output']>;
  tenantDescription?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
};

export type TenantCreateInput = {
  allowUnlimitedRate?: InputMaybe<Scalars['Boolean']['input']>;
  claimsSupported: Array<Scalars['String']['input']>;
  delegateAuthentication: Scalars['Boolean']['input'];
  delegatedOIDCClientDef?: InputMaybe<OidcClientDefinitionInput>;
  emailDomains?: InputMaybe<Array<Scalars['String']['input']>>;
  enabled: Scalars['Boolean']['input'];
  tenantDescription?: InputMaybe<Scalars['String']['input']>;
  tenantName: Scalars['String']['input'];
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
  scopeId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type TenantUpdateInput = {
  allowUnlimitedRate?: InputMaybe<Scalars['Boolean']['input']>;
  claimsSupported: Array<Scalars['String']['input']>;
  delegateAuthentication: Scalars['Boolean']['input'];
  delegatedOIDCClientDef?: InputMaybe<OidcClientDefinitionInput>;
  emailDomains?: InputMaybe<Array<Scalars['String']['input']>>;
  enabled: Scalars['Boolean']['input'];
  tenantDescription?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  tenantName: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  address?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  createdDate: Scalars['String']['output'];
  email: Scalars['String']['output'];
  externalOIDCProviderSubjectId?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  middleName?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  preferredLanguageCode?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
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
  salt: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserGroupRel = {
  __typename?: 'UserGroupRel';
  groupId: Scalars['String']['output'];
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
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Client: ResolverTypeWrapper<Client>;
  ClientAuthType: ClientAuthType;
  ClientCreateInput: ClientCreateInput;
  ClientTenantScopeRel: ResolverTypeWrapper<ClientTenantScopeRel>;
  ClientType: ClientType;
  ClientUpdateInput: ClientUpdateInput;
  DomainOIDCClientDefinitionRel: ResolverTypeWrapper<DomainOidcClientDefinitionRel>;
  Group: ResolverTypeWrapper<Group>;
  GroupCreateInput: GroupCreateInput;
  GroupUpdateInput: GroupUpdateInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Key: ResolverTypeWrapper<Key>;
  KeyCreateInput: KeyCreateInput;
  KeyUpdateInput: KeyUpdateInput;
  LoginGroup: ResolverTypeWrapper<LoginGroup>;
  LoginGroupClientRel: ResolverTypeWrapper<LoginGroupClientRel>;
  LoginGroupCreateInput: LoginGroupCreateInput;
  LoginGroupUpdateInput: LoginGroupUpdateInput;
  LoginGroupUserRel: ResolverTypeWrapper<LoginGroupUserRel>;
  Mutation: ResolverTypeWrapper<{}>;
  OIDCClientDefinition: ResolverTypeWrapper<OidcClientDefinition>;
  OIDCClientDefinitionInput: OidcClientDefinitionInput;
  Query: ResolverTypeWrapper<{}>;
  RateLimit: ResolverTypeWrapper<RateLimit>;
  RateLimitCreateInput: RateLimitCreateInput;
  RateLimitUpdateInput: RateLimitUpdateInput;
  Scope: ResolverTypeWrapper<Scope>;
  ScopeCreateInput: ScopeCreateInput;
  ScopeUpdateInput: ScopeUpdateInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Tenant: ResolverTypeWrapper<Tenant>;
  TenantCreateInput: TenantCreateInput;
  TenantRateLimitRel: ResolverTypeWrapper<TenantRateLimitRel>;
  TenantScopeRel: ResolverTypeWrapper<TenantScopeRel>;
  TenantUpdateInput: TenantUpdateInput;
  User: ResolverTypeWrapper<User>;
  UserCredential: ResolverTypeWrapper<UserCredential>;
  UserCredentialHistory: ResolverTypeWrapper<UserCredentialHistory>;
  UserGroupRel: ResolverTypeWrapper<UserGroupRel>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  Client: Client;
  ClientCreateInput: ClientCreateInput;
  ClientTenantScopeRel: ClientTenantScopeRel;
  ClientUpdateInput: ClientUpdateInput;
  DomainOIDCClientDefinitionRel: DomainOidcClientDefinitionRel;
  Group: Group;
  GroupCreateInput: GroupCreateInput;
  GroupUpdateInput: GroupUpdateInput;
  Int: Scalars['Int']['output'];
  Key: Key;
  KeyCreateInput: KeyCreateInput;
  KeyUpdateInput: KeyUpdateInput;
  LoginGroup: LoginGroup;
  LoginGroupClientRel: LoginGroupClientRel;
  LoginGroupCreateInput: LoginGroupCreateInput;
  LoginGroupUpdateInput: LoginGroupUpdateInput;
  LoginGroupUserRel: LoginGroupUserRel;
  Mutation: {};
  OIDCClientDefinition: OidcClientDefinition;
  OIDCClientDefinitionInput: OidcClientDefinitionInput;
  Query: {};
  RateLimit: RateLimit;
  RateLimitCreateInput: RateLimitCreateInput;
  RateLimitUpdateInput: RateLimitUpdateInput;
  Scope: Scope;
  ScopeCreateInput: ScopeCreateInput;
  ScopeUpdateInput: ScopeUpdateInput;
  String: Scalars['String']['output'];
  Tenant: Tenant;
  TenantCreateInput: TenantCreateInput;
  TenantRateLimitRel: TenantRateLimitRel;
  TenantScopeRel: TenantScopeRel;
  TenantUpdateInput: TenantUpdateInput;
  User: User;
  UserCredential: UserCredential;
  UserCredentialHistory: UserCredentialHistory;
  UserGroupRel: UserGroupRel;
}>;

export type ClientResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Client'] = ResolversParentTypes['Client']> = ResolversObject<{
  allowDelegatedAuthentication?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowUserSelfRegistration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  clientDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientSecret?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientType?: Resolver<ResolversTypes['ClientType'], ParentType, ContextType>;
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  oidcEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  pkceEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  redirectUris?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userTokenTTLSeconds?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ClientTenantScopeRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ClientTenantScopeRel'] = ResolversParentTypes['ClientTenantScopeRel']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DomainOidcClientDefinitionRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['DomainOIDCClientDefinitionRel'] = ResolversParentTypes['DomainOIDCClientDefinitionRel']> = ResolversObject<{
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  oidcClientDefinitionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GroupResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Group'] = ResolversParentTypes['Group']> = ResolversObject<{
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  groupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type KeyResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Key'] = ResolversParentTypes['Key']> = ResolversObject<{
  e?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  exp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  keyId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  keyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  n?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  use?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  x5c?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginGroupResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['LoginGroup'] = ResolversParentTypes['LoginGroup']> = ResolversObject<{
  loginGroupDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  loginGroupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  loginGroupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginGroupClientRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['LoginGroupClientRel'] = ResolversParentTypes['LoginGroupClientRel']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  loginGroupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginGroupUserRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['LoginGroupUserRel'] = ResolversParentTypes['LoginGroupUserRel']> = ResolversObject<{
  loginGroupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addUserToGroup?: Resolver<Maybe<ResolversTypes['UserGroupRel']>, ParentType, ContextType, RequireFields<MutationAddUserToGroupArgs, 'groupId' | 'userId'>>;
  assignLoginGroupToClient?: Resolver<Maybe<ResolversTypes['LoginGroupClientRel']>, ParentType, ContextType, RequireFields<MutationAssignLoginGroupToClientArgs, 'clientId' | 'loginGroupId'>>;
  assignRateLimitToTenant?: Resolver<Maybe<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, RequireFields<MutationAssignRateLimitToTenantArgs, 'rateLimitId' | 'tenantId'>>;
  assignScopeToClient?: Resolver<Maybe<ResolversTypes['ClientTenantScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToClientArgs, 'clientId' | 'scopeId' | 'tenantId'>>;
  assignScopeToTenant?: Resolver<Maybe<ResolversTypes['TenantScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToTenantArgs, 'scopeId' | 'tenantId'>>;
  createClient?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<MutationCreateClientArgs, 'clientInput'>>;
  createGroup?: Resolver<Maybe<ResolversTypes['Group']>, ParentType, ContextType, RequireFields<MutationCreateGroupArgs, 'groupInput'>>;
  createLoginGroup?: Resolver<Maybe<ResolversTypes['LoginGroup']>, ParentType, ContextType, RequireFields<MutationCreateLoginGroupArgs, 'loginGroupInput'>>;
  createRateLimit?: Resolver<Maybe<ResolversTypes['RateLimit']>, ParentType, ContextType, RequireFields<MutationCreateRateLimitArgs, 'rateLimitInput'>>;
  createRootTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationCreateRootTenantArgs, 'tenantInput'>>;
  createScope?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<MutationCreateScopeArgs, 'scopeInput'>>;
  createSigningKey?: Resolver<Maybe<ResolversTypes['Key']>, ParentType, ContextType, RequireFields<MutationCreateSigningKeyArgs, 'keyInput'>>;
  createTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationCreateTenantArgs, 'tenantInput'>>;
  deleteClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteClientArgs, 'clientId'>>;
  deleteGroup?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteGroupArgs, 'groupId'>>;
  deleteLoginGroup?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteLoginGroupArgs, 'loginGroupId'>>;
  deleteRateLimit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteRateLimitArgs, 'rateLimitId'>>;
  deleteScope?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteScopeArgs, 'scopeId'>>;
  deleteTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteTenantArgs, 'tenantId'>>;
  removeLoginGroupFromClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveLoginGroupFromClientArgs, 'clientId' | 'loginGroupId'>>;
  removeRateLimitFromTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveRateLimitFromTenantArgs, 'rateLimitId' | 'tenantId'>>;
  removeScopeFromClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromClientArgs, 'clientId' | 'scopeId' | 'tenantId'>>;
  removeScopeFromTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromTenantArgs, 'scopeId' | 'tenantId'>>;
  removeUserFromGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromGroupArgs, 'groupId' | 'userId'>>;
  updateClient?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<MutationUpdateClientArgs, 'clientInput'>>;
  updateGroup?: Resolver<Maybe<ResolversTypes['Group']>, ParentType, ContextType, RequireFields<MutationUpdateGroupArgs, 'groupInput'>>;
  updateLoginGroup?: Resolver<Maybe<ResolversTypes['LoginGroup']>, ParentType, ContextType, RequireFields<MutationUpdateLoginGroupArgs, 'loginGroupInput'>>;
  updateRateLimit?: Resolver<Maybe<ResolversTypes['RateLimit']>, ParentType, ContextType, RequireFields<MutationUpdateRateLimitArgs, 'rateLimitInput'>>;
  updateRateLimitForTenant?: Resolver<Maybe<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, RequireFields<MutationUpdateRateLimitForTenantArgs, 'rateLimitId' | 'tenantId'>>;
  updateRootTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationUpdateRootTenantArgs, 'tenantInput'>>;
  updateScope?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<MutationUpdateScopeArgs, 'scopeInput'>>;
  updateSigningKey?: Resolver<Maybe<ResolversTypes['Key']>, ParentType, ContextType, RequireFields<MutationUpdateSigningKeyArgs, 'keyInput'>>;
  updateTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationUpdateTenantArgs, 'tenantInput'>>;
}>;

export type OidcClientDefinitionResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['OIDCClientDefinition'] = ResolversParentTypes['OIDCClientDefinition']> = ResolversObject<{
  clientAuthType?: Resolver<Maybe<ResolversTypes['ClientAuthType']>, ParentType, ContextType>;
  oidcClientDefinitionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  oidcClientDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  oidcClientName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  oidcClientTenantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  oidcProviderClientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  oidcProviderClientSecret?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  oidcProviderWellKnownUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshTokenAllowed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  usePkce?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getClientById?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<QueryGetClientByIdArgs, 'clientId'>>;
  getClients?: Resolver<Array<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<QueryGetClientsArgs, 'tenantId'>>;
  getGroups?: Resolver<Array<ResolversTypes['Group']>, ParentType, ContextType>;
  getLoginGroupById?: Resolver<ResolversTypes['LoginGroup'], ParentType, ContextType, RequireFields<QueryGetLoginGroupByIdArgs, 'loginGroupId'>>;
  getLoginGroups?: Resolver<Array<ResolversTypes['LoginGroup']>, ParentType, ContextType, Partial<QueryGetLoginGroupsArgs>>;
  getRateLimitById?: Resolver<Maybe<ResolversTypes['RateLimit']>, ParentType, ContextType, RequireFields<QueryGetRateLimitByIdArgs, 'rateLimitId'>>;
  getRateLimits?: Resolver<Array<ResolversTypes['RateLimit']>, ParentType, ContextType, Partial<QueryGetRateLimitsArgs>>;
  getRootTenant?: Resolver<ResolversTypes['Tenant'], ParentType, ContextType>;
  getScope?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, Partial<QueryGetScopeArgs>>;
  getScopeById?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetScopeByIdArgs, 'scopeId'>>;
  getSigningKeyById?: Resolver<Maybe<ResolversTypes['Key']>, ParentType, ContextType, RequireFields<QueryGetSigningKeyByIdArgs, 'signingKeyId'>>;
  getSigningKeys?: Resolver<Array<ResolversTypes['Key']>, ParentType, ContextType, Partial<QueryGetSigningKeysArgs>>;
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

export type ScopeResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Scope'] = ResolversParentTypes['Scope']> = ResolversObject<{
  scopeDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Tenant'] = ResolversParentTypes['Tenant']> = ResolversObject<{
  allowUnlimitedRate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  claimsSupported?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  delegateAuthentication?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  oidcClientDefinitionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  countryCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  externalOIDCProviderSubjectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  middleName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  preferredLanguageCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  salt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserGroupRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserGroupRel'] = ResolversParentTypes['UserGroupRel']> = ResolversObject<{
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = OIDCContext> = ResolversObject<{
  Client?: ClientResolvers<ContextType>;
  ClientTenantScopeRel?: ClientTenantScopeRelResolvers<ContextType>;
  DomainOIDCClientDefinitionRel?: DomainOidcClientDefinitionRelResolvers<ContextType>;
  Group?: GroupResolvers<ContextType>;
  Key?: KeyResolvers<ContextType>;
  LoginGroup?: LoginGroupResolvers<ContextType>;
  LoginGroupClientRel?: LoginGroupClientRelResolvers<ContextType>;
  LoginGroupUserRel?: LoginGroupUserRelResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OIDCClientDefinition?: OidcClientDefinitionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RateLimit?: RateLimitResolvers<ContextType>;
  Scope?: ScopeResolvers<ContextType>;
  Tenant?: TenantResolvers<ContextType>;
  TenantRateLimitRel?: TenantRateLimitRelResolvers<ContextType>;
  TenantScopeRel?: TenantScopeRelResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserCredential?: UserCredentialResolvers<ContextType>;
  UserCredentialHistory?: UserCredentialHistoryResolvers<ContextType>;
  UserGroupRel?: UserGroupRelResolvers<ContextType>;
}>;



import gql from 'graphql-tag';
export const typeDefs = gql(`schema{query:Query mutation:Mutation}type Client{allowDelegatedAuthentication:Boolean!allowUserSelfRegistration:Boolean!clientDescription:String clientId:String!clientName:String!clientSecret:String!clientType:ClientType!enabled:Boolean oidcEnabled:Boolean!pkceEnabled:Boolean!redirectUris:[String!]tenantId:String!userTokenTTLSeconds:Int}enum ClientAuthType{CLIENT_SECRET_BASIC CLIENT_SECRET_JWT CLIENT_SECRET_POST NONE}input ClientCreateInput{clientDescription:String clientName:String!clientType:ClientType!enabled:Boolean oidcEnabled:Boolean pkceEnabled:Boolean redirectUris:[String!]tenantId:String!}type ClientTenantScopeRel{clientId:String!scopeId:String!tenantId:String!}enum ClientType{SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS SERVICE_ACCOUNT_ONLY USER_DELEGATED_PERMISSIONS_ONLY}input ClientUpdateInput{clientDescription:String clientId:String!clientName:String!clientType:ClientType!enabled:Boolean oidcEnabled:Boolean pkceEnabled:Boolean redirectUris:[String!]tenantId:String!}type DomainOIDCClientDefinitionRel{domain:String!oidcClientDefinitionId:String!}type Group{groupId:String!groupName:String!tenantId:String!}input GroupCreateInput{groupName:String!tenantId:String!}input GroupUpdateInput{groupId:String!groupName:String!tenantId:String!}type Key{e:String!exp:String!keyId:String!keyType:String!n:String!tenantId:String!use:String!x5c:[String!]!}input KeyCreateInput{e:String!exp:String!keyType:String!n:String!tenantId:String!use:String!x5c:[String!]!}input KeyUpdateInput{e:String!exp:String!keyId:String!keyType:String!n:String!tenantId:String!use:String!x5c:[String!]!}type LoginGroup{loginGroupDescription:String loginGroupId:String!loginGroupName:String!tenantId:String!}type LoginGroupClientRel{clientId:String!loginGroupId:String!}input LoginGroupCreateInput{loginGroupDescription:String loginGroupName:String!tenantId:String!}input LoginGroupUpdateInput{loginGroupDescription:String loginGroupId:String!loginGroupName:String!tenantId:String!}type LoginGroupUserRel{loginGroupId:String!userId:String!}type Mutation{addUserToGroup(groupId:String!userId:String!):UserGroupRel assignLoginGroupToClient(clientId:String!loginGroupId:String!):LoginGroupClientRel assignRateLimitToTenant(allowUnlimited:Boolean limit:Int rateLimitId:String!rateLimitPeriodMinutes:Int tenantId:String!):TenantRateLimitRel assignScopeToClient(clientId:String!scopeId:String!tenantId:String!):ClientTenantScopeRel assignScopeToTenant(scopeId:String!tenantId:String!):TenantScopeRel createClient(clientInput:ClientCreateInput!):Client createGroup(groupInput:GroupCreateInput!):Group createLoginGroup(loginGroupInput:LoginGroupCreateInput!):LoginGroup createRateLimit(rateLimitInput:RateLimitCreateInput!):RateLimit createRootTenant(tenantInput:TenantCreateInput!):Tenant createScope(scopeInput:ScopeCreateInput!):Scope createSigningKey(keyInput:KeyCreateInput!):Key createTenant(tenantInput:TenantCreateInput!):Tenant deleteClient(clientId:String!):String deleteGroup(groupId:String!):String!deleteLoginGroup(loginGroupId:String!):String!deleteRateLimit(rateLimitId:String!):String deleteScope(scopeId:String!):String deleteTenant(tenantId:String!):String removeLoginGroupFromClient(clientId:String!loginGroupId:String!):String removeRateLimitFromTenant(rateLimitId:String!tenantId:String!):String removeScopeFromClient(clientId:String!scopeId:String!tenantId:String!):String removeScopeFromTenant(scopeId:String!tenantId:String!):String removeUserFromGroup(groupId:String!userId:String!):String updateClient(clientInput:ClientUpdateInput!):Client updateGroup(groupInput:GroupUpdateInput!):Group updateLoginGroup(loginGroupInput:LoginGroupUpdateInput!):LoginGroup updateRateLimit(rateLimitInput:RateLimitUpdateInput!):RateLimit updateRateLimitForTenant(allowUnlimited:Boolean limit:Int rateLimitId:String!rateLimitPeriodMinutes:Int tenantId:String!):TenantRateLimitRel updateRootTenant(tenantInput:TenantUpdateInput!):Tenant updateScope(scopeInput:ScopeUpdateInput!):Scope updateSigningKey(keyInput:KeyUpdateInput!):Key updateTenant(tenantInput:TenantUpdateInput!):Tenant}type OIDCClientDefinition{clientAuthType:ClientAuthType oidcClientDefinitionId:String!oidcClientDescription:String oidcClientName:String!oidcClientTenantId:String oidcProviderClientId:String!oidcProviderClientSecret:String oidcProviderWellKnownUri:String!refreshTokenAllowed:Boolean!usePkce:Boolean!}input OIDCClientDefinitionInput{clientAuthType:ClientAuthType clientId:String!clientSecret:String tenantId:String!usePkce:Boolean!wellKnownUri:String!}type Query{getClientById(clientId:String!):Client getClients(tenantId:String!):[Client!]!getGroups:[Group!]!getLoginGroupById(loginGroupId:String!):LoginGroup!getLoginGroups(tenantId:String):[LoginGroup!]!getRateLimitById(rateLimitId:String!):RateLimit getRateLimits(tenantId:String):[RateLimit!]!getRootTenant:Tenant!getScope(tenantId:String):[Scope!]!getScopeById(scopeId:String!):Scope getSigningKeyById(signingKeyId:String!):Key getSigningKeys(tenantId:String):[Key!]!getTenantById(tenantId:String!):Tenant getTenants:[Tenant!]!getUserById(userId:String!):User getUserGroups(userId:String!):[Group!]!getUsers(tenantId:String):[User!]!}type RateLimit{rateLimitDescription:String rateLimitDomain:String!rateLimitId:String!}input RateLimitCreateInput{rateLimitDescription:String rateLimitDomain:String!}input RateLimitUpdateInput{rateLimitDescription:String rateLimitDomain:String!rateLimitId:String!}type Scope{scopeDescription:String scopeId:String!scopeName:String!}input ScopeCreateInput{scopeDescription:String scopeName:String!}input ScopeUpdateInput{scopeDescription:String scopeId:String!scopeName:String!}type Tenant{allowUnlimitedRate:Boolean claimsSupported:[String!]!delegateAuthentication:Boolean!enabled:Boolean!oidcClientDefinitionId:String tenantDescription:String tenantId:String!tenantName:String!}input TenantCreateInput{allowUnlimitedRate:Boolean claimsSupported:[String!]!delegateAuthentication:Boolean!delegatedOIDCClientDef:OIDCClientDefinitionInput emailDomains:[String!]enabled:Boolean!tenantDescription:String tenantName:String!}type TenantRateLimitRel{allowUnlimitedRate:Boolean rateLimit:Int rateLimitId:String!rateLimitPeriodMinutes:Int tenantId:String!}type TenantScopeRel{scopeId:String!tenantId:String!}input TenantUpdateInput{allowUnlimitedRate:Boolean claimsSupported:[String!]!delegateAuthentication:Boolean!delegatedOIDCClientDef:OIDCClientDefinitionInput emailDomains:[String!]enabled:Boolean!tenantDescription:String tenantId:String!tenantName:String!}type User{address:String countryCode:String createdDate:String!email:String!externalOIDCProviderSubjectId:String firstName:String!lastName:String!middleName:String phoneNumber:String preferredLanguageCode:String tenantId:String!updatedDate:String userId:String!}type UserCredential{hashedPassword:String!salt:String!userId:String!}type UserCredentialHistory{dateCreated:String!hashedPassword:String!salt:String!userId:String!}type UserGroupRel{groupId:String!userId:String!}`);