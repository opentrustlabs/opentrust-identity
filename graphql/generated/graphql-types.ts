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
  accessrulename: Scalars['String']['output'];
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

export type AnonymousUserConfigInput = {
  defaultcountrycode?: InputMaybe<Scalars['String']['input']>;
  defaultlangugecode?: InputMaybe<Scalars['String']['input']>;
  groupids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  scopeids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tokenttlseconds: Scalars['Int']['input'];
};

export type AnonymousUserConfiguration = {
  __typename?: 'AnonymousUserConfiguration';
  defaultcountrycode?: Maybe<Scalars['String']['output']>;
  defaultlangugecode?: Maybe<Scalars['String']['output']>;
  groupids?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  scopeids?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tenantId: Scalars['String']['output'];
  tokenttlseconds: Scalars['Int']['output'];
};

export type AuthenticationGroup = {
  __typename?: 'AuthenticationGroup';
  authenticationGroupDescription?: Maybe<Scalars['String']['output']>;
  authenticationGroupId: Scalars['String']['output'];
  authenticationGroupName: Scalars['String']['output'];
  defaultGroup: Scalars['Boolean']['output'];
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
  defaultGroup: Scalars['Boolean']['input'];
  tenantId: Scalars['String']['input'];
};

export type AuthenticationGroupUpdateInput = {
  authenticationGroupDescription?: InputMaybe<Scalars['String']['input']>;
  authenticationGroupId: Scalars['String']['input'];
  authenticationGroupName: Scalars['String']['input'];
  defaultGroup: Scalars['Boolean']['input'];
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

export type AuthorizationGroup = {
  __typename?: 'AuthorizationGroup';
  default: Scalars['Boolean']['output'];
  groupId: Scalars['String']['output'];
  groupName: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type AuthorizationGroupCreateInput = {
  default: Scalars['Boolean']['input'];
  groupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type AuthorizationGroupScopeRel = {
  __typename?: 'AuthorizationGroupScopeRel';
  accessruleid?: Maybe<Scalars['String']['output']>;
  groupId: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type AuthorizationGroupUpdateInput = {
  default: Scalars['Boolean']['input'];
  groupId: Scalars['String']['input'];
  groupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type AuthorizationGroupUserRel = {
  __typename?: 'AuthorizationGroupUserRel';
  groupId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type ChangeEvent = {
  __typename?: 'ChangeEvent';
  changeEventClass: Scalars['String']['output'];
  changeEventClassId?: Maybe<Scalars['String']['output']>;
  changeEventId: Scalars['String']['output'];
  changeEventType: Scalars['String']['output'];
  changeEventTypeId?: Maybe<Scalars['String']['output']>;
  changeTimestamp: Scalars['Float']['output'];
  changedById: Scalars['String']['output'];
  data: Scalars['String']['output'];
  keyId: Scalars['String']['output'];
  objectid: Scalars['String']['output'];
  objecttype: Scalars['String']['output'];
  signature: Scalars['String']['output'];
};

export type Client = {
  __typename?: 'Client';
  clientDescription?: Maybe<Scalars['String']['output']>;
  clientId: Scalars['String']['output'];
  clientName: Scalars['String']['output'];
  clientSecret: Scalars['String']['output'];
  clientTokenTTLSeconds?: Maybe<Scalars['Int']['output']>;
  clientType: Scalars['String']['output'];
  clienttypeid?: Maybe<Scalars['String']['output']>;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  maxRefreshTokenCount?: Maybe<Scalars['Int']['output']>;
  oidcEnabled: Scalars['Boolean']['output'];
  pkceEnabled: Scalars['Boolean']['output'];
  redirectUris?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  userTokenTTLSeconds?: Maybe<Scalars['Int']['output']>;
};

export type ClientAuthHistory = {
  __typename?: 'ClientAuthHistory';
  clientId: Scalars['String']['output'];
  expiresAtSeconds: Scalars['Float']['output'];
  jti: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type ClientCreateInput = {
  clientDescription?: InputMaybe<Scalars['String']['input']>;
  clientName: Scalars['String']['input'];
  clientTokenTTLSeconds?: InputMaybe<Scalars['Int']['input']>;
  clientType: Scalars['String']['input'];
  clienttypeid?: InputMaybe<Scalars['String']['input']>;
  contactInput: Array<ContactInput>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  maxRefreshTokenCount?: InputMaybe<Scalars['Int']['input']>;
  oidcEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  pkceEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  redirectUris?: InputMaybe<Array<Scalars['String']['input']>>;
  tenantId: Scalars['String']['input'];
  userTokenTTLSeconds?: InputMaybe<Scalars['Int']['input']>;
};

export type ClientScopeRel = {
  __typename?: 'ClientScopeRel';
  accessruleid?: Maybe<Scalars['String']['output']>;
  clientId: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type ClientUpdateInput = {
  clientDescription?: InputMaybe<Scalars['String']['input']>;
  clientId: Scalars['String']['input'];
  clientName: Scalars['String']['input'];
  clientTokenTTLSeconds?: InputMaybe<Scalars['Int']['input']>;
  clientType: Scalars['String']['input'];
  clienttypeid?: InputMaybe<Scalars['String']['input']>;
  contactInput: Array<ContactInput>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  maxRefreshTokenCount?: InputMaybe<Scalars['Int']['input']>;
  oidcEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  pkceEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  redirectUris?: InputMaybe<Array<Scalars['String']['input']>>;
  tenantId: Scalars['String']['input'];
  userTokenTTLSeconds?: InputMaybe<Scalars['Int']['input']>;
};

export type Contact = {
  __typename?: 'Contact';
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  objectid: Scalars['String']['output'];
  objecttype: Scalars['String']['output'];
  userid?: Maybe<Scalars['String']['output']>;
};

export type ContactInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  userid?: InputMaybe<Scalars['String']['input']>;
};

export type ErrorActionHandler = {
  __typename?: 'ErrorActionHandler';
  errorCode: Scalars['String']['output'];
  errorMessage: Scalars['String']['output'];
};

export type FederatedOidcAuthorizationRel = {
  __typename?: 'FederatedOIDCAuthorizationRel';
  codeVerifier?: Maybe<Scalars['String']['output']>;
  codechallengemethod?: Maybe<Scalars['String']['output']>;
  expiresAtMs: Scalars['Float']['output'];
  federatedOIDCProviderId: Scalars['String']['output'];
  initClientId: Scalars['String']['output'];
  initCodeChallenge?: Maybe<Scalars['String']['output']>;
  initCodeChallengeMethod?: Maybe<Scalars['String']['output']>;
  initRedirectUri: Scalars['String']['output'];
  initResponseMode: Scalars['String']['output'];
  initResponseType: Scalars['String']['output'];
  initScope: Scalars['String']['output'];
  initState: Scalars['String']['output'];
  initTenantId: Scalars['String']['output'];
  returnUri?: Maybe<Scalars['String']['output']>;
  state: Scalars['String']['output'];
};

export type FederatedOidcProvider = {
  __typename?: 'FederatedOIDCProvider';
  clientAuthType: Scalars['String']['output'];
  clientauthtypeid?: Maybe<Scalars['String']['output']>;
  federatedOIDCProviderClientId: Scalars['String']['output'];
  federatedOIDCProviderClientSecret?: Maybe<Scalars['String']['output']>;
  federatedOIDCProviderDescription?: Maybe<Scalars['String']['output']>;
  federatedOIDCProviderId: Scalars['String']['output'];
  federatedOIDCProviderName: Scalars['String']['output'];
  federatedOIDCProviderTenantId?: Maybe<Scalars['String']['output']>;
  federatedOIDCProviderType: Scalars['String']['output'];
  federatedOIDCProviderWellKnownUri: Scalars['String']['output'];
  federatedoidcprovidertypeid?: Maybe<Scalars['String']['output']>;
  refreshTokenAllowed: Scalars['Boolean']['output'];
  scopes: Array<Scalars['String']['output']>;
  socialLoginDisplayName?: Maybe<Scalars['String']['output']>;
  socialLoginIcon?: Maybe<Scalars['String']['output']>;
  usePkce: Scalars['Boolean']['output'];
};

export type FederatedOidcProviderCreateInput = {
  clientAuthType: Scalars['String']['input'];
  clientauthtypeid?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderClientId: Scalars['String']['input'];
  federatedOIDCProviderClientSecret?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderDescription?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderId: Scalars['String']['input'];
  federatedOIDCProviderName: Scalars['String']['input'];
  federatedOIDCProviderTenantId?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderType: Scalars['String']['input'];
  federatedOIDCProviderWellKnownUri: Scalars['String']['input'];
  federatedoidcprovidertypeid?: InputMaybe<Scalars['String']['input']>;
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
  clientAuthType: Scalars['String']['input'];
  clientauthtypeid?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderClientId: Scalars['String']['input'];
  federatedOIDCProviderClientSecret?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderDescription?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderId: Scalars['String']['input'];
  federatedOIDCProviderName: Scalars['String']['input'];
  federatedOIDCProviderTenantId?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderType: Scalars['String']['input'];
  federatedOIDCProviderWellKnownUri: Scalars['String']['input'];
  federatedoidcprovidertypeid?: InputMaybe<Scalars['String']['input']>;
  refreshTokenAllowed: Scalars['Boolean']['input'];
  usePkce: Scalars['Boolean']['input'];
};

export type FooterLink = {
  __typename?: 'FooterLink';
  footerlinkid: Scalars['String']['output'];
  linktext: Scalars['String']['output'];
  tenantid: Scalars['String']['output'];
  uri: Scalars['String']['output'];
};

export enum LoginAuthenticationHandlerAction {
  Authenticated = 'AUTHENTICATED',
  Error = 'ERROR',
  SecondFactorInput = 'SECOND_FACTOR_INPUT'
}

export type LoginAuthenticationHandlerResponse = {
  __typename?: 'LoginAuthenticationHandlerResponse';
  errorActionHandler?: Maybe<ErrorActionHandler>;
  secondFactorType?: Maybe<SecondFactorType>;
  status: LoginAuthenticationHandlerAction;
  successConfig?: Maybe<LoginAuthenticationSuccessConfig>;
};

export type LoginAuthenticationSuccessConfig = {
  __typename?: 'LoginAuthenticationSuccessConfig';
  code: Scalars['String']['output'];
  redirectUri: Scalars['String']['output'];
  responseMode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
};

export type LoginFailurePolicy = {
  __typename?: 'LoginFailurePolicy';
  failureThreshold: Scalars['Int']['output'];
  initBackoffDurationMinutes?: Maybe<Scalars['Int']['output']>;
  loginFailurePolicyType: Scalars['String']['output'];
  loginfailurepolicytypeid?: Maybe<Scalars['String']['output']>;
  numberOfBackoffCyclesBeforeLocking?: Maybe<Scalars['Int']['output']>;
  numberOfPauseCyclesBeforeLocking?: Maybe<Scalars['Int']['output']>;
  pauseDurationMinutes?: Maybe<Scalars['Int']['output']>;
  tenantId: Scalars['String']['output'];
};

export type LoginFailurePolicyInput = {
  failureThreshold: Scalars['Int']['input'];
  initBackoffDurationMinutes?: InputMaybe<Scalars['Int']['input']>;
  loginFailurePolicyType: Scalars['String']['input'];
  loginfailurepolicytypeid?: InputMaybe<Scalars['String']['input']>;
  numberOfBackoffCyclesBeforeLocking?: InputMaybe<Scalars['Int']['input']>;
  numberOfPauseCyclesBeforeLocking?: InputMaybe<Scalars['Int']['input']>;
  pauseDurationMinutes?: InputMaybe<Scalars['Int']['input']>;
  tenantId: Scalars['String']['input'];
};

export enum LoginUserNameHandlerAction {
  EnterPassword = 'ENTER_PASSWORD',
  Error = 'ERROR',
  OidcRedirect = 'OIDC_REDIRECT'
}

export type LoginUserNameHandlerResponse = {
  __typename?: 'LoginUserNameHandlerResponse';
  action: LoginUserNameHandlerAction;
  errorActionHandler?: Maybe<ErrorActionHandler>;
  oidcRedirectActionHandlerConfig?: Maybe<OidcRedirectActionHandlerConfig>;
};

export type LookaheadItem = {
  __typename?: 'LookaheadItem';
  displayValue: Scalars['String']['output'];
  id: Scalars['String']['output'];
  matchingString?: Maybe<Scalars['String']['output']>;
};

export type LookaheadResult = {
  __typename?: 'LookaheadResult';
  category: Scalars['String']['output'];
  resultList?: Maybe<Array<Maybe<LookaheadItem>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addDomainToTenantManagement?: Maybe<Scalars['String']['output']>;
  addDomainToTenantRestrictedAuthentication?: Maybe<Scalars['String']['output']>;
  addUserToAuthenticationGroup?: Maybe<AuthenticationGroupUserRel>;
  addUserToAuthorizationGroup?: Maybe<AuthorizationGroupUserRel>;
  assignAuthenticationGroupToClient?: Maybe<AuthenticationGroupClientRel>;
  assignFederatedOIDCProviderToDomain: FederatedOidcProviderDomainRel;
  assignFederatedOIDCProviderToTenant: FederatedOidcProviderTenantRel;
  assignRateLimitToTenant?: Maybe<TenantRateLimitRel>;
  assignScopeToAuthorizationGroup?: Maybe<AuthorizationGroupScopeRel>;
  assignScopeToClient?: Maybe<ClientScopeRel>;
  assignScopeToTenant?: Maybe<TenantScopeRel>;
  assignScopeToUser?: Maybe<UserScopeRel>;
  createAccessRule?: Maybe<AccessRule>;
  createAuthenticationGroup?: Maybe<AuthenticationGroup>;
  createAuthorizationGroup?: Maybe<AuthorizationGroup>;
  createClient?: Maybe<Client>;
  createFederatedOIDCProvider?: Maybe<FederatedOidcProvider>;
  createLoginFailurePolicy: LoginFailurePolicy;
  createRateLimit?: Maybe<RateLimit>;
  createRootTenant?: Maybe<Tenant>;
  createScope?: Maybe<Scope>;
  createScopeConstraintSchema?: Maybe<ScopeConstraintSchema>;
  createSigningKey: SigningKey;
  createTenant?: Maybe<Tenant>;
  createUser: User;
  deleteAccessRule: Scalars['String']['output'];
  deleteAuthenticationGroup: Scalars['String']['output'];
  deleteAuthorizationGroup: Scalars['String']['output'];
  deleteClient?: Maybe<Scalars['String']['output']>;
  deleteFederatedOIDCProvider: Scalars['String']['output'];
  deleteRateLimit?: Maybe<Scalars['String']['output']>;
  deleteSchedulerLock: Scalars['String']['output'];
  deleteScope?: Maybe<Scalars['String']['output']>;
  deleteScopeConstraingSchema: Scalars['String']['output'];
  deleteSigningKey: Scalars['String']['output'];
  deleteTenant?: Maybe<Scalars['String']['output']>;
  login: LoginAuthenticationHandlerResponse;
  logout?: Maybe<Scalars['String']['output']>;
  removeAuthenticationGroupFromClient?: Maybe<Scalars['String']['output']>;
  removeDomainFromTenantManagement?: Maybe<Scalars['String']['output']>;
  removeDomainFromTenantRestrictedAuthentication?: Maybe<Scalars['String']['output']>;
  removeFederatedOIDCProviderFromDomain: FederatedOidcProviderDomainRel;
  removeFederatedOIDCProviderFromTenant: FederatedOidcProviderTenantRel;
  removeRateLimitFromTenant?: Maybe<Scalars['String']['output']>;
  removeScopeFromAuthorizationGroup?: Maybe<Scalars['String']['output']>;
  removeScopeFromClient?: Maybe<Scalars['String']['output']>;
  removeScopeFromTenant?: Maybe<Scalars['String']['output']>;
  removeScopeFromUser?: Maybe<Scalars['String']['output']>;
  removeUserFromAuthenticationGroup?: Maybe<Scalars['String']['output']>;
  removeUserFromAuthorizationGroup?: Maybe<Scalars['String']['output']>;
  updateAccessRule?: Maybe<AccessRule>;
  updateAuthenticationGroup?: Maybe<AuthenticationGroup>;
  updateAuthorizationGroup?: Maybe<AuthorizationGroup>;
  updateClient?: Maybe<Client>;
  updateFederatedOIDCProvider?: Maybe<FederatedOidcProvider>;
  updateLoginFailurePolicy: LoginFailurePolicy;
  updateRateLimit?: Maybe<RateLimit>;
  updateRateLimitForTenant?: Maybe<TenantRateLimitRel>;
  updateRootTenant?: Maybe<Tenant>;
  updateScope?: Maybe<Scope>;
  updateScopeConstraintSchema?: Maybe<ScopeConstraintSchema>;
  updateSigningKey: SigningKey;
  updateTenant?: Maybe<Tenant>;
  updateUser: User;
};


export type MutationAddDomainToTenantManagementArgs = {
  domain: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAddDomainToTenantRestrictedAuthenticationArgs = {
  domain: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAddUserToAuthenticationGroupArgs = {
  authenticationGroupId?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationAddUserToAuthorizationGroupArgs = {
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


export type MutationAssignScopeToAuthorizationGroupArgs = {
  accessRuleId?: InputMaybe<Scalars['String']['input']>;
  groupId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
};


export type MutationAssignScopeToClientArgs = {
  accessRuleId?: InputMaybe<Scalars['String']['input']>;
  clientId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAssignScopeToTenantArgs = {
  accessRuleId?: InputMaybe<Scalars['String']['input']>;
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAssignScopeToUserArgs = {
  accessRuleId?: InputMaybe<Scalars['String']['input']>;
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationCreateAccessRuleArgs = {
  accessRuleInput: AccessRuleCreateInput;
};


export type MutationCreateAuthenticationGroupArgs = {
  authenticationGroupInput: AuthenticationGroupCreateInput;
};


export type MutationCreateAuthorizationGroupArgs = {
  groupInput: AuthorizationGroupCreateInput;
};


export type MutationCreateClientArgs = {
  clientInput: ClientCreateInput;
};


export type MutationCreateFederatedOidcProviderArgs = {
  oidcProviderInput: FederatedOidcProviderCreateInput;
};


export type MutationCreateLoginFailurePolicyArgs = {
  loginFailurePolicyInput: LoginFailurePolicyInput;
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


export type MutationCreateUserArgs = {
  userInput: UserCreateInput;
};


export type MutationDeleteAccessRuleArgs = {
  accessRuleId: Scalars['String']['input'];
};


export type MutationDeleteAuthenticationGroupArgs = {
  authenticationGroupId: Scalars['String']['input'];
};


export type MutationDeleteAuthorizationGroupArgs = {
  groupId: Scalars['String']['input'];
};


export type MutationDeleteClientArgs = {
  clientId: Scalars['String']['input'];
};


export type MutationDeleteFederatedOidcProviderArgs = {
  federatedOIDCProviderId: Scalars['String']['input'];
};


export type MutationDeleteRateLimitArgs = {
  rateLimitId: Scalars['String']['input'];
};


export type MutationDeleteSchedulerLockArgs = {
  instanceId: Scalars['String']['input'];
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


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationLogoutArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRemoveAuthenticationGroupFromClientArgs = {
  authenticationGroupId: Scalars['String']['input'];
  clientId: Scalars['String']['input'];
};


export type MutationRemoveDomainFromTenantManagementArgs = {
  domain: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveDomainFromTenantRestrictedAuthenticationArgs = {
  domain: Scalars['String']['input'];
  tenantId?: InputMaybe<Scalars['String']['input']>;
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


export type MutationRemoveScopeFromAuthorizationGroupArgs = {
  groupId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
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


export type MutationRemoveScopeFromUserArgs = {
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveUserFromAuthenticationGroupArgs = {
  authenticationGroupId?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationRemoveUserFromAuthorizationGroupArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationUpdateAccessRuleArgs = {
  accessRuleInput: AccessRuleUpdateInput;
};


export type MutationUpdateAuthenticationGroupArgs = {
  authenticationGroupInput: AuthenticationGroupUpdateInput;
};


export type MutationUpdateAuthorizationGroupArgs = {
  groupInput: AuthorizationGroupUpdateInput;
};


export type MutationUpdateClientArgs = {
  clientInput: ClientUpdateInput;
};


export type MutationUpdateFederatedOidcProviderArgs = {
  oidcProviderInput: FederatedOidcProviderUpdateInput;
};


export type MutationUpdateLoginFailurePolicyArgs = {
  loginFailurePolicyInput: LoginFailurePolicyInput;
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


export type MutationUpdateSigningKeyArgs = {
  keyInput: SigningKeyUpdateInput;
};


export type MutationUpdateTenantArgs = {
  tenantInput: TenantUpdateInput;
};


export type MutationUpdateUserArgs = {
  userInput: UserUpdateInput;
};

export type OidcRedirectActionHandlerConfig = {
  __typename?: 'OIDCRedirectActionHandlerConfig';
  clientId: Scalars['String']['output'];
  codeChallenge?: Maybe<Scalars['String']['output']>;
  codeChallengeMethod?: Maybe<Scalars['String']['output']>;
  redirectUri: Scalars['String']['output'];
  responseMode: Scalars['String']['output'];
  responseType: Scalars['String']['output'];
  scope?: Maybe<Scalars['String']['output']>;
  state: Scalars['String']['output'];
};

export type PasswordConfigInput = {
  allowMfa: Scalars['Boolean']['input'];
  mfaTypesAllowed?: InputMaybe<Scalars['String']['input']>;
  mfaTypesRequired?: InputMaybe<Scalars['String']['input']>;
  passwordHashingAlgorithm: Scalars['String']['input'];
  passwordMaxLength: Scalars['Int']['input'];
  passwordMinLength: Scalars['Int']['input'];
  requireLowerCase: Scalars['Boolean']['input'];
  requireMfa: Scalars['Boolean']['input'];
  requireNumbers: Scalars['Boolean']['input'];
  requireSpecialCharacters: Scalars['Boolean']['input'];
  requireUpperCase: Scalars['Boolean']['input'];
  specialCharactersAllowed?: InputMaybe<Scalars['String']['input']>;
};

export type PortalUserProfile = {
  __typename?: 'PortalUserProfile';
  address?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  domain: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  enabled: Scalars['Boolean']['output'];
  federatedOIDCProviderSubjectId?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  locked: Scalars['Boolean']['output'];
  managementAccessTenantId?: Maybe<Scalars['String']['output']>;
  middleName?: Maybe<Scalars['String']['output']>;
  nameOrder: Scalars['String']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  preferredLanguageCode?: Maybe<Scalars['String']['output']>;
  scope: Array<Scope>;
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
  twoFactorAuthType?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
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
  getAnonymousUserConfiguration?: Maybe<AnonymousUserConfiguration>;
  getAuthenticationGroupById?: Maybe<AuthenticationGroup>;
  getAuthenticationGroups: Array<AuthenticationGroup>;
  getAuthorizationGroupById?: Maybe<AuthorizationGroup>;
  getAuthorizationGroupScopes: Array<Scope>;
  getAuthorizationGroups: Array<AuthorizationGroup>;
  getChangeEvents: Array<ChangeEvent>;
  getClientById?: Maybe<Client>;
  getClientScopes: Array<Scope>;
  getClients: Array<Client>;
  getDomainsForTenantAuthentication?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  getDomainsForTenantManagement?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  getFederatedOIDCProviderById?: Maybe<FederatedOidcProvider>;
  getFederatedOIDCProviders: Array<FederatedOidcProvider>;
  getLegacyUserMigrationConfiguration?: Maybe<TenantLegacyUserMigrationConfig>;
  getLoginFailurePolicy: LoginFailurePolicy;
  getLoginUserNameHandler: LoginUserNameHandlerResponse;
  getRateLimitById?: Maybe<RateLimit>;
  getRateLimits: Array<RateLimit>;
  getRootTenant: Tenant;
  getSchedulerLocks?: Maybe<Array<Maybe<SchedulerLock>>>;
  getScope: Array<Scope>;
  getScopeById?: Maybe<Scope>;
  getScopeConstraintSchemaById?: Maybe<ScopeConstraintSchema>;
  getScopeConstraintSchemas: Array<ScopeConstraintSchema>;
  getSigningKeyById?: Maybe<SigningKey>;
  getSigningKeys: Array<SigningKey>;
  getSocialOIDCProviders: Array<FederatedOidcProvider>;
  getTenantById?: Maybe<Tenant>;
  getTenantLookAndFeel?: Maybe<TenantLookAndFeel>;
  getTenantMetaData?: Maybe<TenantMetaData>;
  getTenants: Array<Tenant>;
  getUserAuthorizationGroups: Array<AuthorizationGroup>;
  getUserById?: Maybe<User>;
  getUserScopes: Array<Scope>;
  getUsers: Array<User>;
  lookahead?: Maybe<Array<Maybe<LookaheadResult>>>;
  me?: Maybe<PortalUserProfile>;
  search: SearchResults;
};


export type QueryGetAccessRuleByIdArgs = {
  accessRuleId: Scalars['String']['input'];
};


export type QueryGetAccessRulesArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAnonymousUserConfigurationArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetAuthenticationGroupByIdArgs = {
  authenticationGroupId: Scalars['String']['input'];
};


export type QueryGetAuthenticationGroupsArgs = {
  clientId?: InputMaybe<Scalars['String']['input']>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAuthorizationGroupByIdArgs = {
  groupId: Scalars['String']['input'];
};


export type QueryGetAuthorizationGroupScopesArgs = {
  groupId: Scalars['String']['input'];
};


export type QueryGetAuthorizationGroupsArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetChangeEventsArgs = {
  objectId: Scalars['String']['input'];
};


export type QueryGetClientByIdArgs = {
  clientId: Scalars['String']['input'];
};


export type QueryGetClientScopesArgs = {
  clientId: Scalars['String']['input'];
};


export type QueryGetClientsArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetDomainsForTenantAuthenticationArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetDomainsForTenantManagementArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetFederatedOidcProviderByIdArgs = {
  federatedOIDCProviderId: Scalars['String']['input'];
};


export type QueryGetFederatedOidcProvidersArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetLegacyUserMigrationConfigurationArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetLoginUserNameHandlerArgs = {
  preauthToken?: InputMaybe<Scalars['String']['input']>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
  username: Scalars['String']['input'];
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


export type QueryGetSocialOidcProvidersArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetTenantByIdArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetTenantLookAndFeelArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetTenantMetaDataArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetUserAuthorizationGroupsArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUserByIdArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUserScopesArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUsersArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLookaheadArgs = {
  term: Scalars['String']['input'];
};


export type QuerySearchArgs = {
  searchInput: SearchInput;
};

export type RateLimit = {
  __typename?: 'RateLimit';
  ratelimitid: Scalars['String']['output'];
  ratelimitname: Scalars['String']['output'];
  servicegroupid: Scalars['String']['output'];
};

export type RateLimitCreateInput = {
  rateLimitDescription?: InputMaybe<Scalars['String']['input']>;
  rateLimitDomain: Scalars['String']['input'];
};

export type RateLimitServiceGroup = {
  __typename?: 'RateLimitServiceGroup';
  scopeids: Array<Scalars['String']['output']>;
  servicegroupdescription?: Maybe<Scalars['String']['output']>;
  servicegroupid: Scalars['String']['output'];
  servicegroupname: Scalars['String']['output'];
};

export type RateLimitUpdateInput = {
  rateLimitDescription?: InputMaybe<Scalars['String']['input']>;
  rateLimitDomain: Scalars['String']['input'];
  rateLimitId: Scalars['String']['input'];
};

export type RefreshData = {
  __typename?: 'RefreshData';
  clientId: Scalars['String']['output'];
  redirecturi: Scalars['String']['output'];
  refreshCount: Scalars['Int']['output'];
  refreshToken: Scalars['String']['output'];
  refreshTokenClientType: Scalars['String']['output'];
  refreshtokenclienttypeid?: Maybe<Scalars['String']['output']>;
  scope: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type SchedulerLock = {
  __typename?: 'SchedulerLock';
  lockExpiresAtMS: Scalars['Float']['output'];
  lockInstanceId: Scalars['String']['output'];
  lockName: Scalars['String']['output'];
  lockStartTimeMS: Scalars['Float']['output'];
};

export type Scope = {
  __typename?: 'Scope';
  scopeDescription: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
  scopeName: Scalars['String']['output'];
  scopeUse: Scalars['String']['output'];
};

export type ScopeConstraintSchema = {
  __typename?: 'ScopeConstraintSchema';
  schemaVersion: Scalars['Int']['output'];
  scopeConstraintSchemaId: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
  scopeconstraintschema: Scalars['String']['output'];
  scopeconstraintschemaname: Scalars['String']['output'];
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
  scopeDescription: Scalars['String']['input'];
  scopeName: Scalars['String']['input'];
};

export type ScopeUpdateInput = {
  scopeConstraintSchemaId?: InputMaybe<Scalars['String']['input']>;
  scopeDescription: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
  scopeName: Scalars['String']['input'];
};

export type SearchFilterInput = {
  objectType: SearchFilterInputObjectType;
  objectValue: Scalars['String']['input'];
};

export enum SearchFilterInputObjectType {
  AuthenticationGroupId = 'AUTHENTICATION_GROUP_ID',
  AuthorizationGroupId = 'AUTHORIZATION_GROUP_ID',
  ClientId = 'CLIENT_ID',
  TenantId = 'TENANT_ID',
  UserId = 'USER_ID'
}

export type SearchInput = {
  filters?: InputMaybe<Array<InputMaybe<SearchFilterInput>>>;
  page: Scalars['Int']['input'];
  perPage: Scalars['Int']['input'];
  resultType?: InputMaybe<SearchResultType>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  term?: InputMaybe<Scalars['String']['input']>;
};

export type SearchResultItem = {
  __typename?: 'SearchResultItem';
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  objectId: Scalars['String']['output'];
  objectType: SearchResultType;
  owningClientId?: Maybe<Scalars['String']['output']>;
  owningTenantId?: Maybe<Scalars['String']['output']>;
  subType?: Maybe<Scalars['String']['output']>;
  subTypeKey?: Maybe<Scalars['String']['output']>;
};

export enum SearchResultType {
  AccessControl = 'ACCESS_CONTROL',
  AuthenticationGroup = 'AUTHENTICATION_GROUP',
  AuthorizationGroup = 'AUTHORIZATION_GROUP',
  Client = 'CLIENT',
  Key = 'KEY',
  OidcProvider = 'OIDC_PROVIDER',
  RateLimit = 'RATE_LIMIT',
  Tenant = 'TENANT',
  User = 'USER'
}

export type SearchResults = {
  __typename?: 'SearchResults';
  endTime: Scalars['Float']['output'];
  page: Scalars['Int']['output'];
  perPage: Scalars['Int']['output'];
  resultList: Array<SearchResultItem>;
  startTime: Scalars['Float']['output'];
  took: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum SecondFactorType {
  Email = 'EMAIL',
  SecurityKey = 'SECURITY_KEY',
  Sms = 'SMS',
  Totp = 'TOTP'
}

export type SigningKey = {
  __typename?: 'SigningKey';
  certificate?: Maybe<Scalars['String']['output']>;
  expiresAtMs: Scalars['Float']['output'];
  keyId: Scalars['String']['output'];
  keyName: Scalars['String']['output'];
  keyType: Scalars['String']['output'];
  keyTypeId?: Maybe<Scalars['String']['output']>;
  keyUse: Scalars['String']['output'];
  password?: Maybe<Scalars['String']['output']>;
  privateKeyPkcs8: Scalars['String']['output'];
  publicKey?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  statusId?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
};

export type SigningKeyCreateInput = {
  certificate?: InputMaybe<Scalars['String']['input']>;
  expiresAtMs?: InputMaybe<Scalars['Float']['input']>;
  keyName: Scalars['String']['input'];
  keyType: Scalars['String']['input'];
  keyTypeId?: InputMaybe<Scalars['String']['input']>;
  keyUse: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  privateKeyPkcs8: Scalars['String']['input'];
  publicKey?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
};

export type SigningKeyUpdateInput = {
  keyId: Scalars['String']['input'];
  keyName?: InputMaybe<Scalars['String']['input']>;
  keyUse?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
};

export type SocialOidcProviderTenantRel = {
  __typename?: 'SocialOIDCProviderTenantRel';
  federatedOIDCProviderId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type SuccessfulLoginResponse = {
  __typename?: 'SuccessfulLoginResponse';
  challenge?: Maybe<Scalars['String']['output']>;
  mfaEnabled: Scalars['Boolean']['output'];
  mfaType?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type Tenant = {
  __typename?: 'Tenant';
  allowAnonymousUsers: Scalars['Boolean']['output'];
  allowForgotPassword: Scalars['Boolean']['output'];
  allowLoginByPhoneNumber: Scalars['Boolean']['output'];
  allowSocialLogin: Scalars['Boolean']['output'];
  allowUnlimitedRate: Scalars['Boolean']['output'];
  allowUserSelfRegistration: Scalars['Boolean']['output'];
  claimsSupported: Array<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  federatedAuthenticationConstraint: Scalars['String']['output'];
  federatedauthenticationconstraintid?: Maybe<Scalars['String']['output']>;
  markForDelete: Scalars['Boolean']['output'];
  migrateLegacyUsers: Scalars['Boolean']['output'];
  tenantDescription?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
  tenantType: Scalars['String']['output'];
  tenanttypeid?: Maybe<Scalars['String']['output']>;
  verifyEmailOnSelfRegistration: Scalars['Boolean']['output'];
};

export type TenantCreateInput = {
  allowAnonymousUsers: Scalars['Boolean']['input'];
  allowForgotPassword: Scalars['Boolean']['input'];
  allowLoginByPhoneNumber: Scalars['Boolean']['input'];
  allowSocialLogin: Scalars['Boolean']['input'];
  allowUnlimitedRate: Scalars['Boolean']['input'];
  allowUserSelfRegistration: Scalars['Boolean']['input'];
  anonymousUserConfigInput?: InputMaybe<AnonymousUserConfigInput>;
  claimsSupported: Array<Scalars['String']['input']>;
  contactInput: Array<ContactInput>;
  enabled: Scalars['Boolean']['input'];
  federatedAuthenticationConstraint: Scalars['String']['input'];
  migrateLegacyUsers: Scalars['Boolean']['input'];
  passwordConfigInput?: InputMaybe<PasswordConfigInput>;
  tenantDescription?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  tenantName: Scalars['String']['input'];
  tenantType: Scalars['String']['input'];
  verifyEmailOnSelfRegistration: Scalars['Boolean']['input'];
};

export type TenantLegacyUserMigrationConfig = {
  __typename?: 'TenantLegacyUserMigrationConfig';
  authenticationUri: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userProfileUri: Scalars['String']['output'];
  usernameCheckUri: Scalars['String']['output'];
};

export type TenantLookAndFeel = {
  __typename?: 'TenantLookAndFeel';
  adminheaderbackgroundcolor?: Maybe<Scalars['String']['output']>;
  adminheadertext?: Maybe<Scalars['String']['output']>;
  adminheadertextcolor?: Maybe<Scalars['String']['output']>;
  adminlogo?: Maybe<Scalars['String']['output']>;
  authenticationheaderbackgroundcolor?: Maybe<Scalars['String']['output']>;
  authenticationheadertext?: Maybe<Scalars['String']['output']>;
  authenticationheadertextcolor?: Maybe<Scalars['String']['output']>;
  authenticationlogo?: Maybe<Scalars['String']['output']>;
  footerlinks?: Maybe<Array<Maybe<FooterLink>>>;
  tenantid: Scalars['String']['output'];
};

export type TenantManagementDomainRel = {
  __typename?: 'TenantManagementDomainRel';
  domain: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type TenantMetaData = {
  __typename?: 'TenantMetaData';
  tenant: Tenant;
  tenantLookAndFeel?: Maybe<TenantLookAndFeel>;
};

export type TenantPasswordConfig = {
  __typename?: 'TenantPasswordConfig';
  allowMfa: Scalars['Boolean']['output'];
  mfaTypesAllowed?: Maybe<Scalars['String']['output']>;
  mfaTypesRequired?: Maybe<Scalars['String']['output']>;
  passwordHashingAlgorithm: Scalars['String']['output'];
  passwordMaxLength: Scalars['Int']['output'];
  passwordMinLength: Scalars['Int']['output'];
  requireLowerCase: Scalars['Boolean']['output'];
  requireMfa: Scalars['Boolean']['output'];
  requireNumbers: Scalars['Boolean']['output'];
  requireSpecialCharacters: Scalars['Boolean']['output'];
  requireUpperCase: Scalars['Boolean']['output'];
  specialCharactersAllowed?: Maybe<Scalars['String']['output']>;
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

export type TenantRestrictedAuthenticationDomainRel = {
  __typename?: 'TenantRestrictedAuthenticationDomainRel';
  domain: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type TenantScopeRel = {
  __typename?: 'TenantScopeRel';
  accessRuleId?: Maybe<Scalars['String']['output']>;
  scopeId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type TenantUpdateInput = {
  allowAnonymousUsers: Scalars['Boolean']['input'];
  allowForgotPassword: Scalars['Boolean']['input'];
  allowLoginByPhoneNumber: Scalars['Boolean']['input'];
  allowSocialLogin: Scalars['Boolean']['input'];
  allowUnlimitedRate: Scalars['Boolean']['input'];
  allowUserSelfRegistration: Scalars['Boolean']['input'];
  anonymousUserConfigInput?: InputMaybe<AnonymousUserConfigInput>;
  claimsSupported: Array<Scalars['String']['input']>;
  contactInput: Array<ContactInput>;
  enabled: Scalars['Boolean']['input'];
  federatedAuthenticationConstraint: Scalars['String']['input'];
  markForDelete: Scalars['Boolean']['input'];
  migrateLegacyUsers: Scalars['Boolean']['input'];
  passwordConfigInput?: InputMaybe<PasswordConfigInput>;
  tenantDescription?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  tenantName: Scalars['String']['input'];
  tenantType: Scalars['String']['input'];
  verifyEmailOnSelfRegistration: Scalars['Boolean']['input'];
};

export type User = {
  __typename?: 'User';
  address?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  domain: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  enabled: Scalars['Boolean']['output'];
  federatedOIDCProviderSubjectId?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  locked: Scalars['Boolean']['output'];
  middleName?: Maybe<Scalars['String']['output']>;
  nameOrder: Scalars['String']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  preferredLanguageCode?: Maybe<Scalars['String']['output']>;
  twoFactorAuthType?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserCreateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  countryCode?: InputMaybe<Scalars['String']['input']>;
  domain: Scalars['String']['input'];
  email: Scalars['String']['input'];
  emailVerified: Scalars['Boolean']['input'];
  enabled: Scalars['Boolean']['input'];
  federatedOIDCProviderSubjectId?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  locked: Scalars['Boolean']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
  nameOrder: Scalars['String']['input'];
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  preferredLanguageCode?: InputMaybe<Scalars['String']['input']>;
  twoFactorAuthType?: InputMaybe<Scalars['String']['input']>;
};

export type UserCredential = {
  __typename?: 'UserCredential';
  dateCreated: Scalars['String']['output'];
  hashedPassword: Scalars['String']['output'];
  hashingAlgorithm: Scalars['String']['output'];
  salt: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserFailedLoginAttempts = {
  __typename?: 'UserFailedLoginAttempts';
  failureAtMS: Scalars['Float']['output'];
  userId: Scalars['String']['output'];
};

export type UserScopeRel = {
  __typename?: 'UserScopeRel';
  accessruleid?: Maybe<Scalars['String']['output']>;
  scopeid: Scalars['String']['output'];
  tenantid: Scalars['String']['output'];
  userid: Scalars['String']['output'];
};

export type UserTenantRel = {
  __typename?: 'UserTenantRel';
  enabled: Scalars['Boolean']['output'];
  relType: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserUpdateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  countryCode?: InputMaybe<Scalars['String']['input']>;
  domain: Scalars['String']['input'];
  email: Scalars['String']['input'];
  emailVerified: Scalars['Boolean']['input'];
  enabled: Scalars['Boolean']['input'];
  federatedOIDCProviderSubjectId?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  locked: Scalars['Boolean']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
  nameOrder: Scalars['String']['input'];
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  preferredLanguageCode?: InputMaybe<Scalars['String']['input']>;
  twoFactorAuthType?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
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
  AnonymousUserConfigInput: AnonymousUserConfigInput;
  AnonymousUserConfiguration: ResolverTypeWrapper<AnonymousUserConfiguration>;
  AuthenticationGroup: ResolverTypeWrapper<AuthenticationGroup>;
  AuthenticationGroupClientRel: ResolverTypeWrapper<AuthenticationGroupClientRel>;
  AuthenticationGroupCreateInput: AuthenticationGroupCreateInput;
  AuthenticationGroupUpdateInput: AuthenticationGroupUpdateInput;
  AuthenticationGroupUserRel: ResolverTypeWrapper<AuthenticationGroupUserRel>;
  AuthorizationCodeData: ResolverTypeWrapper<AuthorizationCodeData>;
  AuthorizationGroup: ResolverTypeWrapper<AuthorizationGroup>;
  AuthorizationGroupCreateInput: AuthorizationGroupCreateInput;
  AuthorizationGroupScopeRel: ResolverTypeWrapper<AuthorizationGroupScopeRel>;
  AuthorizationGroupUpdateInput: AuthorizationGroupUpdateInput;
  AuthorizationGroupUserRel: ResolverTypeWrapper<AuthorizationGroupUserRel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ChangeEvent: ResolverTypeWrapper<ChangeEvent>;
  Client: ResolverTypeWrapper<Client>;
  ClientAuthHistory: ResolverTypeWrapper<ClientAuthHistory>;
  ClientCreateInput: ClientCreateInput;
  ClientScopeRel: ResolverTypeWrapper<ClientScopeRel>;
  ClientUpdateInput: ClientUpdateInput;
  Contact: ResolverTypeWrapper<Contact>;
  ContactInput: ContactInput;
  ErrorActionHandler: ResolverTypeWrapper<ErrorActionHandler>;
  FederatedOIDCAuthorizationRel: ResolverTypeWrapper<FederatedOidcAuthorizationRel>;
  FederatedOIDCProvider: ResolverTypeWrapper<FederatedOidcProvider>;
  FederatedOIDCProviderCreateInput: FederatedOidcProviderCreateInput;
  FederatedOIDCProviderDomainRel: ResolverTypeWrapper<FederatedOidcProviderDomainRel>;
  FederatedOIDCProviderTenantRel: ResolverTypeWrapper<FederatedOidcProviderTenantRel>;
  FederatedOIDCProviderUpdateInput: FederatedOidcProviderUpdateInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FooterLink: ResolverTypeWrapper<FooterLink>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LoginAuthenticationHandlerAction: LoginAuthenticationHandlerAction;
  LoginAuthenticationHandlerResponse: ResolverTypeWrapper<LoginAuthenticationHandlerResponse>;
  LoginAuthenticationSuccessConfig: ResolverTypeWrapper<LoginAuthenticationSuccessConfig>;
  LoginFailurePolicy: ResolverTypeWrapper<LoginFailurePolicy>;
  LoginFailurePolicyInput: LoginFailurePolicyInput;
  LoginUserNameHandlerAction: LoginUserNameHandlerAction;
  LoginUserNameHandlerResponse: ResolverTypeWrapper<LoginUserNameHandlerResponse>;
  LookaheadItem: ResolverTypeWrapper<LookaheadItem>;
  LookaheadResult: ResolverTypeWrapper<LookaheadResult>;
  Mutation: ResolverTypeWrapper<{}>;
  OIDCRedirectActionHandlerConfig: ResolverTypeWrapper<OidcRedirectActionHandlerConfig>;
  PasswordConfigInput: PasswordConfigInput;
  PortalUserProfile: ResolverTypeWrapper<PortalUserProfile>;
  PreAuthenticationState: ResolverTypeWrapper<PreAuthenticationState>;
  Query: ResolverTypeWrapper<{}>;
  RateLimit: ResolverTypeWrapper<RateLimit>;
  RateLimitCreateInput: RateLimitCreateInput;
  RateLimitServiceGroup: ResolverTypeWrapper<RateLimitServiceGroup>;
  RateLimitUpdateInput: RateLimitUpdateInput;
  RefreshData: ResolverTypeWrapper<RefreshData>;
  SchedulerLock: ResolverTypeWrapper<SchedulerLock>;
  Scope: ResolverTypeWrapper<Scope>;
  ScopeConstraintSchema: ResolverTypeWrapper<ScopeConstraintSchema>;
  ScopeConstraintSchemaCreateInput: ScopeConstraintSchemaCreateInput;
  ScopeConstraintSchemaUpdateInput: ScopeConstraintSchemaUpdateInput;
  ScopeCreateInput: ScopeCreateInput;
  ScopeUpdateInput: ScopeUpdateInput;
  SearchFilterInput: SearchFilterInput;
  SearchFilterInputObjectType: SearchFilterInputObjectType;
  SearchInput: SearchInput;
  SearchResultItem: ResolverTypeWrapper<SearchResultItem>;
  SearchResultType: SearchResultType;
  SearchResults: ResolverTypeWrapper<SearchResults>;
  SecondFactorType: SecondFactorType;
  SigningKey: ResolverTypeWrapper<SigningKey>;
  SigningKeyCreateInput: SigningKeyCreateInput;
  SigningKeyUpdateInput: SigningKeyUpdateInput;
  SocialOIDCProviderTenantRel: ResolverTypeWrapper<SocialOidcProviderTenantRel>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SuccessfulLoginResponse: ResolverTypeWrapper<SuccessfulLoginResponse>;
  Tenant: ResolverTypeWrapper<Tenant>;
  TenantCreateInput: TenantCreateInput;
  TenantLegacyUserMigrationConfig: ResolverTypeWrapper<TenantLegacyUserMigrationConfig>;
  TenantLookAndFeel: ResolverTypeWrapper<TenantLookAndFeel>;
  TenantManagementDomainRel: ResolverTypeWrapper<TenantManagementDomainRel>;
  TenantMetaData: ResolverTypeWrapper<TenantMetaData>;
  TenantPasswordConfig: ResolverTypeWrapper<TenantPasswordConfig>;
  TenantRateLimitRel: ResolverTypeWrapper<TenantRateLimitRel>;
  TenantRestrictedAuthenticationDomainRel: ResolverTypeWrapper<TenantRestrictedAuthenticationDomainRel>;
  TenantScopeRel: ResolverTypeWrapper<TenantScopeRel>;
  TenantUpdateInput: TenantUpdateInput;
  User: ResolverTypeWrapper<User>;
  UserCreateInput: UserCreateInput;
  UserCredential: ResolverTypeWrapper<UserCredential>;
  UserFailedLoginAttempts: ResolverTypeWrapper<UserFailedLoginAttempts>;
  UserScopeRel: ResolverTypeWrapper<UserScopeRel>;
  UserTenantRel: ResolverTypeWrapper<UserTenantRel>;
  UserUpdateInput: UserUpdateInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AccessRule: AccessRule;
  AccessRuleCreateInput: AccessRuleCreateInput;
  AccessRuleUpdateInput: AccessRuleUpdateInput;
  AnonymousUserConfigInput: AnonymousUserConfigInput;
  AnonymousUserConfiguration: AnonymousUserConfiguration;
  AuthenticationGroup: AuthenticationGroup;
  AuthenticationGroupClientRel: AuthenticationGroupClientRel;
  AuthenticationGroupCreateInput: AuthenticationGroupCreateInput;
  AuthenticationGroupUpdateInput: AuthenticationGroupUpdateInput;
  AuthenticationGroupUserRel: AuthenticationGroupUserRel;
  AuthorizationCodeData: AuthorizationCodeData;
  AuthorizationGroup: AuthorizationGroup;
  AuthorizationGroupCreateInput: AuthorizationGroupCreateInput;
  AuthorizationGroupScopeRel: AuthorizationGroupScopeRel;
  AuthorizationGroupUpdateInput: AuthorizationGroupUpdateInput;
  AuthorizationGroupUserRel: AuthorizationGroupUserRel;
  Boolean: Scalars['Boolean']['output'];
  ChangeEvent: ChangeEvent;
  Client: Client;
  ClientAuthHistory: ClientAuthHistory;
  ClientCreateInput: ClientCreateInput;
  ClientScopeRel: ClientScopeRel;
  ClientUpdateInput: ClientUpdateInput;
  Contact: Contact;
  ContactInput: ContactInput;
  ErrorActionHandler: ErrorActionHandler;
  FederatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel;
  FederatedOIDCProvider: FederatedOidcProvider;
  FederatedOIDCProviderCreateInput: FederatedOidcProviderCreateInput;
  FederatedOIDCProviderDomainRel: FederatedOidcProviderDomainRel;
  FederatedOIDCProviderTenantRel: FederatedOidcProviderTenantRel;
  FederatedOIDCProviderUpdateInput: FederatedOidcProviderUpdateInput;
  Float: Scalars['Float']['output'];
  FooterLink: FooterLink;
  Int: Scalars['Int']['output'];
  LoginAuthenticationHandlerResponse: LoginAuthenticationHandlerResponse;
  LoginAuthenticationSuccessConfig: LoginAuthenticationSuccessConfig;
  LoginFailurePolicy: LoginFailurePolicy;
  LoginFailurePolicyInput: LoginFailurePolicyInput;
  LoginUserNameHandlerResponse: LoginUserNameHandlerResponse;
  LookaheadItem: LookaheadItem;
  LookaheadResult: LookaheadResult;
  Mutation: {};
  OIDCRedirectActionHandlerConfig: OidcRedirectActionHandlerConfig;
  PasswordConfigInput: PasswordConfigInput;
  PortalUserProfile: PortalUserProfile;
  PreAuthenticationState: PreAuthenticationState;
  Query: {};
  RateLimit: RateLimit;
  RateLimitCreateInput: RateLimitCreateInput;
  RateLimitServiceGroup: RateLimitServiceGroup;
  RateLimitUpdateInput: RateLimitUpdateInput;
  RefreshData: RefreshData;
  SchedulerLock: SchedulerLock;
  Scope: Scope;
  ScopeConstraintSchema: ScopeConstraintSchema;
  ScopeConstraintSchemaCreateInput: ScopeConstraintSchemaCreateInput;
  ScopeConstraintSchemaUpdateInput: ScopeConstraintSchemaUpdateInput;
  ScopeCreateInput: ScopeCreateInput;
  ScopeUpdateInput: ScopeUpdateInput;
  SearchFilterInput: SearchFilterInput;
  SearchInput: SearchInput;
  SearchResultItem: SearchResultItem;
  SearchResults: SearchResults;
  SigningKey: SigningKey;
  SigningKeyCreateInput: SigningKeyCreateInput;
  SigningKeyUpdateInput: SigningKeyUpdateInput;
  SocialOIDCProviderTenantRel: SocialOidcProviderTenantRel;
  String: Scalars['String']['output'];
  SuccessfulLoginResponse: SuccessfulLoginResponse;
  Tenant: Tenant;
  TenantCreateInput: TenantCreateInput;
  TenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig;
  TenantLookAndFeel: TenantLookAndFeel;
  TenantManagementDomainRel: TenantManagementDomainRel;
  TenantMetaData: TenantMetaData;
  TenantPasswordConfig: TenantPasswordConfig;
  TenantRateLimitRel: TenantRateLimitRel;
  TenantRestrictedAuthenticationDomainRel: TenantRestrictedAuthenticationDomainRel;
  TenantScopeRel: TenantScopeRel;
  TenantUpdateInput: TenantUpdateInput;
  User: User;
  UserCreateInput: UserCreateInput;
  UserCredential: UserCredential;
  UserFailedLoginAttempts: UserFailedLoginAttempts;
  UserScopeRel: UserScopeRel;
  UserTenantRel: UserTenantRel;
  UserUpdateInput: UserUpdateInput;
}>;

export type AccessRuleResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AccessRule'] = ResolversParentTypes['AccessRule']> = ResolversObject<{
  accessRuleDefinition?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  accessRuleId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  accessrulename?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeConstraintSchemaId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AnonymousUserConfigurationResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AnonymousUserConfiguration'] = ResolversParentTypes['AnonymousUserConfiguration']> = ResolversObject<{
  defaultcountrycode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  defaultlangugecode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  groupids?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  scopeids?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tokenttlseconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthenticationGroupResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthenticationGroup'] = ResolversParentTypes['AuthenticationGroup']> = ResolversObject<{
  authenticationGroupDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authenticationGroupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  authenticationGroupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  defaultGroup?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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

export type AuthorizationGroupResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthorizationGroup'] = ResolversParentTypes['AuthorizationGroup']> = ResolversObject<{
  default?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  groupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthorizationGroupScopeRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthorizationGroupScopeRel'] = ResolversParentTypes['AuthorizationGroupScopeRel']> = ResolversObject<{
  accessruleid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthorizationGroupUserRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthorizationGroupUserRel'] = ResolversParentTypes['AuthorizationGroupUserRel']> = ResolversObject<{
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ChangeEventResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ChangeEvent'] = ResolversParentTypes['ChangeEvent']> = ResolversObject<{
  changeEventClass?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  changeEventClassId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  changeEventId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  changeEventType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  changeEventTypeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  changeTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  changedById?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  data?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  keyId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objecttype?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  signature?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ClientResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Client'] = ResolversParentTypes['Client']> = ResolversObject<{
  clientDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientSecret?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientTokenTTLSeconds?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  clientType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clienttypeid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  maxRefreshTokenCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  oidcEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  pkceEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  redirectUris?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userTokenTTLSeconds?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ClientAuthHistoryResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ClientAuthHistory'] = ResolversParentTypes['ClientAuthHistory']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAtSeconds?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  jti?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ClientScopeRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ClientScopeRel'] = ResolversParentTypes['ClientScopeRel']> = ResolversObject<{
  accessruleid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Contact'] = ResolversParentTypes['Contact']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objecttype?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ErrorActionHandlerResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ErrorActionHandler'] = ResolversParentTypes['ErrorActionHandler']> = ResolversObject<{
  errorCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  errorMessage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FederatedOidcAuthorizationRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['FederatedOIDCAuthorizationRel'] = ResolversParentTypes['FederatedOIDCAuthorizationRel']> = ResolversObject<{
  codeVerifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  codechallengemethod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  federatedOIDCProviderId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initClientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initCodeChallenge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  initCodeChallengeMethod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  initRedirectUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initResponseMode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initResponseType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initScope?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initState?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initTenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  returnUri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FederatedOidcProviderResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['FederatedOIDCProvider'] = ResolversParentTypes['FederatedOIDCProvider']> = ResolversObject<{
  clientAuthType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientauthtypeid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  federatedOIDCProviderClientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  federatedOIDCProviderClientSecret?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  federatedOIDCProviderDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  federatedOIDCProviderId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  federatedOIDCProviderName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  federatedOIDCProviderTenantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  federatedOIDCProviderType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  federatedOIDCProviderWellKnownUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  federatedoidcprovidertypeid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refreshTokenAllowed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  scopes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  socialLoginDisplayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  socialLoginIcon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type FooterLinkResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['FooterLink'] = ResolversParentTypes['FooterLink']> = ResolversObject<{
  footerlinkid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  linktext?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginAuthenticationHandlerResponseResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['LoginAuthenticationHandlerResponse'] = ResolversParentTypes['LoginAuthenticationHandlerResponse']> = ResolversObject<{
  errorActionHandler?: Resolver<Maybe<ResolversTypes['ErrorActionHandler']>, ParentType, ContextType>;
  secondFactorType?: Resolver<Maybe<ResolversTypes['SecondFactorType']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['LoginAuthenticationHandlerAction'], ParentType, ContextType>;
  successConfig?: Resolver<Maybe<ResolversTypes['LoginAuthenticationSuccessConfig']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginAuthenticationSuccessConfigResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['LoginAuthenticationSuccessConfig'] = ResolversParentTypes['LoginAuthenticationSuccessConfig']> = ResolversObject<{
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  redirectUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  responseMode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginFailurePolicyResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['LoginFailurePolicy'] = ResolversParentTypes['LoginFailurePolicy']> = ResolversObject<{
  failureThreshold?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  initBackoffDurationMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  loginFailurePolicyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  loginfailurepolicytypeid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  numberOfBackoffCyclesBeforeLocking?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  numberOfPauseCyclesBeforeLocking?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pauseDurationMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginUserNameHandlerResponseResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['LoginUserNameHandlerResponse'] = ResolversParentTypes['LoginUserNameHandlerResponse']> = ResolversObject<{
  action?: Resolver<ResolversTypes['LoginUserNameHandlerAction'], ParentType, ContextType>;
  errorActionHandler?: Resolver<Maybe<ResolversTypes['ErrorActionHandler']>, ParentType, ContextType>;
  oidcRedirectActionHandlerConfig?: Resolver<Maybe<ResolversTypes['OIDCRedirectActionHandlerConfig']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LookaheadItemResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['LookaheadItem'] = ResolversParentTypes['LookaheadItem']> = ResolversObject<{
  displayValue?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  matchingString?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LookaheadResultResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['LookaheadResult'] = ResolversParentTypes['LookaheadResult']> = ResolversObject<{
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resultList?: Resolver<Maybe<Array<Maybe<ResolversTypes['LookaheadItem']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addDomainToTenantManagement?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationAddDomainToTenantManagementArgs, 'domain' | 'tenantId'>>;
  addDomainToTenantRestrictedAuthentication?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationAddDomainToTenantRestrictedAuthenticationArgs, 'domain' | 'tenantId'>>;
  addUserToAuthenticationGroup?: Resolver<Maybe<ResolversTypes['AuthenticationGroupUserRel']>, ParentType, ContextType, RequireFields<MutationAddUserToAuthenticationGroupArgs, 'userId'>>;
  addUserToAuthorizationGroup?: Resolver<Maybe<ResolversTypes['AuthorizationGroupUserRel']>, ParentType, ContextType, RequireFields<MutationAddUserToAuthorizationGroupArgs, 'groupId' | 'userId'>>;
  assignAuthenticationGroupToClient?: Resolver<Maybe<ResolversTypes['AuthenticationGroupClientRel']>, ParentType, ContextType, RequireFields<MutationAssignAuthenticationGroupToClientArgs, 'authenticationGroupId' | 'clientId'>>;
  assignFederatedOIDCProviderToDomain?: Resolver<ResolversTypes['FederatedOIDCProviderDomainRel'], ParentType, ContextType, RequireFields<MutationAssignFederatedOidcProviderToDomainArgs, 'domain' | 'federatedOIDCProviderId'>>;
  assignFederatedOIDCProviderToTenant?: Resolver<ResolversTypes['FederatedOIDCProviderTenantRel'], ParentType, ContextType, RequireFields<MutationAssignFederatedOidcProviderToTenantArgs, 'federatedOIDCProviderId' | 'tenantId'>>;
  assignRateLimitToTenant?: Resolver<Maybe<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, RequireFields<MutationAssignRateLimitToTenantArgs, 'rateLimitId' | 'tenantId'>>;
  assignScopeToAuthorizationGroup?: Resolver<Maybe<ResolversTypes['AuthorizationGroupScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToAuthorizationGroupArgs, 'groupId' | 'scopeId'>>;
  assignScopeToClient?: Resolver<Maybe<ResolversTypes['ClientScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToClientArgs, 'clientId' | 'scopeId' | 'tenantId'>>;
  assignScopeToTenant?: Resolver<Maybe<ResolversTypes['TenantScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToTenantArgs, 'scopeId' | 'tenantId'>>;
  assignScopeToUser?: Resolver<Maybe<ResolversTypes['UserScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToUserArgs, 'scopeId' | 'tenantId' | 'userId'>>;
  createAccessRule?: Resolver<Maybe<ResolversTypes['AccessRule']>, ParentType, ContextType, RequireFields<MutationCreateAccessRuleArgs, 'accessRuleInput'>>;
  createAuthenticationGroup?: Resolver<Maybe<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, RequireFields<MutationCreateAuthenticationGroupArgs, 'authenticationGroupInput'>>;
  createAuthorizationGroup?: Resolver<Maybe<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, RequireFields<MutationCreateAuthorizationGroupArgs, 'groupInput'>>;
  createClient?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<MutationCreateClientArgs, 'clientInput'>>;
  createFederatedOIDCProvider?: Resolver<Maybe<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, RequireFields<MutationCreateFederatedOidcProviderArgs, 'oidcProviderInput'>>;
  createLoginFailurePolicy?: Resolver<ResolversTypes['LoginFailurePolicy'], ParentType, ContextType, RequireFields<MutationCreateLoginFailurePolicyArgs, 'loginFailurePolicyInput'>>;
  createRateLimit?: Resolver<Maybe<ResolversTypes['RateLimit']>, ParentType, ContextType, RequireFields<MutationCreateRateLimitArgs, 'rateLimitInput'>>;
  createRootTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationCreateRootTenantArgs, 'tenantInput'>>;
  createScope?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<MutationCreateScopeArgs, 'scopeInput'>>;
  createScopeConstraintSchema?: Resolver<Maybe<ResolversTypes['ScopeConstraintSchema']>, ParentType, ContextType, RequireFields<MutationCreateScopeConstraintSchemaArgs, 'scopeConstraintSchemaInput'>>;
  createSigningKey?: Resolver<ResolversTypes['SigningKey'], ParentType, ContextType, RequireFields<MutationCreateSigningKeyArgs, 'keyInput'>>;
  createTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationCreateTenantArgs, 'tenantInput'>>;
  createUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'userInput'>>;
  deleteAccessRule?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteAccessRuleArgs, 'accessRuleId'>>;
  deleteAuthenticationGroup?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteAuthenticationGroupArgs, 'authenticationGroupId'>>;
  deleteAuthorizationGroup?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteAuthorizationGroupArgs, 'groupId'>>;
  deleteClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteClientArgs, 'clientId'>>;
  deleteFederatedOIDCProvider?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteFederatedOidcProviderArgs, 'federatedOIDCProviderId'>>;
  deleteRateLimit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteRateLimitArgs, 'rateLimitId'>>;
  deleteSchedulerLock?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteSchedulerLockArgs, 'instanceId'>>;
  deleteScope?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteScopeArgs, 'scopeId'>>;
  deleteScopeConstraingSchema?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteScopeConstraingSchemaArgs, 'scopeConstraintSchemaId'>>;
  deleteSigningKey?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteSigningKeyArgs, 'keyId'>>;
  deleteTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteTenantArgs, 'tenantId'>>;
  login?: Resolver<ResolversTypes['LoginAuthenticationHandlerResponse'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'password' | 'username'>>;
  logout?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, Partial<MutationLogoutArgs>>;
  removeAuthenticationGroupFromClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveAuthenticationGroupFromClientArgs, 'authenticationGroupId' | 'clientId'>>;
  removeDomainFromTenantManagement?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveDomainFromTenantManagementArgs, 'domain' | 'tenantId'>>;
  removeDomainFromTenantRestrictedAuthentication?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveDomainFromTenantRestrictedAuthenticationArgs, 'domain'>>;
  removeFederatedOIDCProviderFromDomain?: Resolver<ResolversTypes['FederatedOIDCProviderDomainRel'], ParentType, ContextType, RequireFields<MutationRemoveFederatedOidcProviderFromDomainArgs, 'domain' | 'federatedOIDCProviderId'>>;
  removeFederatedOIDCProviderFromTenant?: Resolver<ResolversTypes['FederatedOIDCProviderTenantRel'], ParentType, ContextType, RequireFields<MutationRemoveFederatedOidcProviderFromTenantArgs, 'federatedOIDCProviderId' | 'tenantId'>>;
  removeRateLimitFromTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveRateLimitFromTenantArgs, 'rateLimitId' | 'tenantId'>>;
  removeScopeFromAuthorizationGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromAuthorizationGroupArgs, 'groupId' | 'scopeId'>>;
  removeScopeFromClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromClientArgs, 'clientId' | 'scopeId' | 'tenantId'>>;
  removeScopeFromTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromTenantArgs, 'scopeId' | 'tenantId'>>;
  removeScopeFromUser?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromUserArgs, 'scopeId' | 'tenantId' | 'userId'>>;
  removeUserFromAuthenticationGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromAuthenticationGroupArgs, 'userId'>>;
  removeUserFromAuthorizationGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromAuthorizationGroupArgs, 'groupId' | 'userId'>>;
  updateAccessRule?: Resolver<Maybe<ResolversTypes['AccessRule']>, ParentType, ContextType, RequireFields<MutationUpdateAccessRuleArgs, 'accessRuleInput'>>;
  updateAuthenticationGroup?: Resolver<Maybe<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, RequireFields<MutationUpdateAuthenticationGroupArgs, 'authenticationGroupInput'>>;
  updateAuthorizationGroup?: Resolver<Maybe<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, RequireFields<MutationUpdateAuthorizationGroupArgs, 'groupInput'>>;
  updateClient?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<MutationUpdateClientArgs, 'clientInput'>>;
  updateFederatedOIDCProvider?: Resolver<Maybe<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, RequireFields<MutationUpdateFederatedOidcProviderArgs, 'oidcProviderInput'>>;
  updateLoginFailurePolicy?: Resolver<ResolversTypes['LoginFailurePolicy'], ParentType, ContextType, RequireFields<MutationUpdateLoginFailurePolicyArgs, 'loginFailurePolicyInput'>>;
  updateRateLimit?: Resolver<Maybe<ResolversTypes['RateLimit']>, ParentType, ContextType, RequireFields<MutationUpdateRateLimitArgs, 'rateLimitInput'>>;
  updateRateLimitForTenant?: Resolver<Maybe<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, RequireFields<MutationUpdateRateLimitForTenantArgs, 'rateLimitId' | 'tenantId'>>;
  updateRootTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationUpdateRootTenantArgs, 'tenantInput'>>;
  updateScope?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<MutationUpdateScopeArgs, 'scopeInput'>>;
  updateScopeConstraintSchema?: Resolver<Maybe<ResolversTypes['ScopeConstraintSchema']>, ParentType, ContextType, RequireFields<MutationUpdateScopeConstraintSchemaArgs, 'scopeConstraintSchemaInput'>>;
  updateSigningKey?: Resolver<ResolversTypes['SigningKey'], ParentType, ContextType, RequireFields<MutationUpdateSigningKeyArgs, 'keyInput'>>;
  updateTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationUpdateTenantArgs, 'tenantInput'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'userInput'>>;
}>;

export type OidcRedirectActionHandlerConfigResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['OIDCRedirectActionHandlerConfig'] = ResolversParentTypes['OIDCRedirectActionHandlerConfig']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  codeChallenge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  codeChallengeMethod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  redirectUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  responseMode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  responseType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scope?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PortalUserProfileResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['PortalUserProfile'] = ResolversParentTypes['PortalUserProfile']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  countryCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  federatedOIDCProviderSubjectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  managementAccessTenantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  middleName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nameOrder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  preferredLanguageCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scope?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  twoFactorAuthType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  getAnonymousUserConfiguration?: Resolver<Maybe<ResolversTypes['AnonymousUserConfiguration']>, ParentType, ContextType, RequireFields<QueryGetAnonymousUserConfigurationArgs, 'tenantId'>>;
  getAuthenticationGroupById?: Resolver<Maybe<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, RequireFields<QueryGetAuthenticationGroupByIdArgs, 'authenticationGroupId'>>;
  getAuthenticationGroups?: Resolver<Array<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, Partial<QueryGetAuthenticationGroupsArgs>>;
  getAuthorizationGroupById?: Resolver<Maybe<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, RequireFields<QueryGetAuthorizationGroupByIdArgs, 'groupId'>>;
  getAuthorizationGroupScopes?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetAuthorizationGroupScopesArgs, 'groupId'>>;
  getAuthorizationGroups?: Resolver<Array<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, Partial<QueryGetAuthorizationGroupsArgs>>;
  getChangeEvents?: Resolver<Array<ResolversTypes['ChangeEvent']>, ParentType, ContextType, RequireFields<QueryGetChangeEventsArgs, 'objectId'>>;
  getClientById?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<QueryGetClientByIdArgs, 'clientId'>>;
  getClientScopes?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetClientScopesArgs, 'clientId'>>;
  getClients?: Resolver<Array<ResolversTypes['Client']>, ParentType, ContextType, Partial<QueryGetClientsArgs>>;
  getDomainsForTenantAuthentication?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType, RequireFields<QueryGetDomainsForTenantAuthenticationArgs, 'tenantId'>>;
  getDomainsForTenantManagement?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType, RequireFields<QueryGetDomainsForTenantManagementArgs, 'tenantId'>>;
  getFederatedOIDCProviderById?: Resolver<Maybe<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, RequireFields<QueryGetFederatedOidcProviderByIdArgs, 'federatedOIDCProviderId'>>;
  getFederatedOIDCProviders?: Resolver<Array<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, Partial<QueryGetFederatedOidcProvidersArgs>>;
  getLegacyUserMigrationConfiguration?: Resolver<Maybe<ResolversTypes['TenantLegacyUserMigrationConfig']>, ParentType, ContextType, RequireFields<QueryGetLegacyUserMigrationConfigurationArgs, 'tenantId'>>;
  getLoginFailurePolicy?: Resolver<ResolversTypes['LoginFailurePolicy'], ParentType, ContextType>;
  getLoginUserNameHandler?: Resolver<ResolversTypes['LoginUserNameHandlerResponse'], ParentType, ContextType, RequireFields<QueryGetLoginUserNameHandlerArgs, 'username'>>;
  getRateLimitById?: Resolver<Maybe<ResolversTypes['RateLimit']>, ParentType, ContextType, RequireFields<QueryGetRateLimitByIdArgs, 'rateLimitId'>>;
  getRateLimits?: Resolver<Array<ResolversTypes['RateLimit']>, ParentType, ContextType, Partial<QueryGetRateLimitsArgs>>;
  getRootTenant?: Resolver<ResolversTypes['Tenant'], ParentType, ContextType>;
  getSchedulerLocks?: Resolver<Maybe<Array<Maybe<ResolversTypes['SchedulerLock']>>>, ParentType, ContextType>;
  getScope?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, Partial<QueryGetScopeArgs>>;
  getScopeById?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetScopeByIdArgs, 'scopeId'>>;
  getScopeConstraintSchemaById?: Resolver<Maybe<ResolversTypes['ScopeConstraintSchema']>, ParentType, ContextType, Partial<QueryGetScopeConstraintSchemaByIdArgs>>;
  getScopeConstraintSchemas?: Resolver<Array<ResolversTypes['ScopeConstraintSchema']>, ParentType, ContextType>;
  getSigningKeyById?: Resolver<Maybe<ResolversTypes['SigningKey']>, ParentType, ContextType, RequireFields<QueryGetSigningKeyByIdArgs, 'signingKeyId'>>;
  getSigningKeys?: Resolver<Array<ResolversTypes['SigningKey']>, ParentType, ContextType, Partial<QueryGetSigningKeysArgs>>;
  getSocialOIDCProviders?: Resolver<Array<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, Partial<QueryGetSocialOidcProvidersArgs>>;
  getTenantById?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<QueryGetTenantByIdArgs, 'tenantId'>>;
  getTenantLookAndFeel?: Resolver<Maybe<ResolversTypes['TenantLookAndFeel']>, ParentType, ContextType, RequireFields<QueryGetTenantLookAndFeelArgs, 'tenantId'>>;
  getTenantMetaData?: Resolver<Maybe<ResolversTypes['TenantMetaData']>, ParentType, ContextType, RequireFields<QueryGetTenantMetaDataArgs, 'tenantId'>>;
  getTenants?: Resolver<Array<ResolversTypes['Tenant']>, ParentType, ContextType>;
  getUserAuthorizationGroups?: Resolver<Array<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, RequireFields<QueryGetUserAuthorizationGroupsArgs, 'userId'>>;
  getUserById?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserByIdArgs, 'userId'>>;
  getUserScopes?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetUserScopesArgs, 'userId'>>;
  getUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, Partial<QueryGetUsersArgs>>;
  lookahead?: Resolver<Maybe<Array<Maybe<ResolversTypes['LookaheadResult']>>>, ParentType, ContextType, RequireFields<QueryLookaheadArgs, 'term'>>;
  me?: Resolver<Maybe<ResolversTypes['PortalUserProfile']>, ParentType, ContextType>;
  search?: Resolver<ResolversTypes['SearchResults'], ParentType, ContextType, RequireFields<QuerySearchArgs, 'searchInput'>>;
}>;

export type RateLimitResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['RateLimit'] = ResolversParentTypes['RateLimit']> = ResolversObject<{
  ratelimitid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ratelimitname?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  servicegroupid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RateLimitServiceGroupResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['RateLimitServiceGroup'] = ResolversParentTypes['RateLimitServiceGroup']> = ResolversObject<{
  scopeids?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  servicegroupdescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  servicegroupid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  servicegroupname?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RefreshDataResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['RefreshData'] = ResolversParentTypes['RefreshData']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  redirecturi?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshTokenClientType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshtokenclienttypeid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SchedulerLockResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SchedulerLock'] = ResolversParentTypes['SchedulerLock']> = ResolversObject<{
  lockExpiresAtMS?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  lockInstanceId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lockName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lockStartTimeMS?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ScopeResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Scope'] = ResolversParentTypes['Scope']> = ResolversObject<{
  scopeDescription?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeUse?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ScopeConstraintSchemaResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ScopeConstraintSchema'] = ResolversParentTypes['ScopeConstraintSchema']> = ResolversObject<{
  schemaVersion?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scopeConstraintSchemaId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeconstraintschema?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeconstraintschemaname?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SearchResultItemResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SearchResultItem'] = ResolversParentTypes['SearchResultItem']> = ResolversObject<{
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectType?: Resolver<ResolversTypes['SearchResultType'], ParentType, ContextType>;
  owningClientId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  owningTenantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subTypeKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SearchResultsResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SearchResults'] = ResolversParentTypes['SearchResults']> = ResolversObject<{
  endTime?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  perPage?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  resultList?: Resolver<Array<ResolversTypes['SearchResultItem']>, ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  took?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SigningKeyResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SigningKey'] = ResolversParentTypes['SigningKey']> = ResolversObject<{
  certificate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  keyId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  keyName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  keyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  keyTypeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  keyUse?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  password?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  privateKeyPkcs8?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  publicKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SocialOidcProviderTenantRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SocialOIDCProviderTenantRel'] = ResolversParentTypes['SocialOIDCProviderTenantRel']> = ResolversObject<{
  federatedOIDCProviderId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SuccessfulLoginResponseResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SuccessfulLoginResponse'] = ResolversParentTypes['SuccessfulLoginResponse']> = ResolversObject<{
  challenge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mfaEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  mfaType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Tenant'] = ResolversParentTypes['Tenant']> = ResolversObject<{
  allowAnonymousUsers?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowForgotPassword?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowLoginByPhoneNumber?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowSocialLogin?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowUnlimitedRate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowUserSelfRegistration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  claimsSupported?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  federatedAuthenticationConstraint?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  federatedauthenticationconstraintid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  markForDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  migrateLegacyUsers?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tenantDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenanttypeid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  verifyEmailOnSelfRegistration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantLegacyUserMigrationConfigResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantLegacyUserMigrationConfig'] = ResolversParentTypes['TenantLegacyUserMigrationConfig']> = ResolversObject<{
  authenticationUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userProfileUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  usernameCheckUri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantLookAndFeelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantLookAndFeel'] = ResolversParentTypes['TenantLookAndFeel']> = ResolversObject<{
  adminheaderbackgroundcolor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adminheadertext?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adminheadertextcolor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adminlogo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authenticationheaderbackgroundcolor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authenticationheadertext?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authenticationheadertextcolor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authenticationlogo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  footerlinks?: Resolver<Maybe<Array<Maybe<ResolversTypes['FooterLink']>>>, ParentType, ContextType>;
  tenantid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantManagementDomainRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantManagementDomainRel'] = ResolversParentTypes['TenantManagementDomainRel']> = ResolversObject<{
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantMetaDataResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantMetaData'] = ResolversParentTypes['TenantMetaData']> = ResolversObject<{
  tenant?: Resolver<ResolversTypes['Tenant'], ParentType, ContextType>;
  tenantLookAndFeel?: Resolver<Maybe<ResolversTypes['TenantLookAndFeel']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantPasswordConfigResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantPasswordConfig'] = ResolversParentTypes['TenantPasswordConfig']> = ResolversObject<{
  allowMfa?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  mfaTypesAllowed?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mfaTypesRequired?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  passwordHashingAlgorithm?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  passwordMaxLength?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  passwordMinLength?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  requireLowerCase?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  requireMfa?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  requireNumbers?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  requireSpecialCharacters?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  requireUpperCase?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  specialCharactersAllowed?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type TenantRestrictedAuthenticationDomainRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantRestrictedAuthenticationDomainRel'] = ResolversParentTypes['TenantRestrictedAuthenticationDomainRel']> = ResolversObject<{
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  federatedOIDCProviderSubjectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  middleName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nameOrder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  preferredLanguageCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twoFactorAuthType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserCredentialResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserCredential'] = ResolversParentTypes['UserCredential']> = ResolversObject<{
  dateCreated?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hashedPassword?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hashingAlgorithm?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  salt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserFailedLoginAttemptsResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserFailedLoginAttempts'] = ResolversParentTypes['UserFailedLoginAttempts']> = ResolversObject<{
  failureAtMS?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserScopeRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserScopeRel'] = ResolversParentTypes['UserScopeRel']> = ResolversObject<{
  accessruleid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scopeid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserTenantRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserTenantRel'] = ResolversParentTypes['UserTenantRel']> = ResolversObject<{
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  relType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = OIDCContext> = ResolversObject<{
  AccessRule?: AccessRuleResolvers<ContextType>;
  AnonymousUserConfiguration?: AnonymousUserConfigurationResolvers<ContextType>;
  AuthenticationGroup?: AuthenticationGroupResolvers<ContextType>;
  AuthenticationGroupClientRel?: AuthenticationGroupClientRelResolvers<ContextType>;
  AuthenticationGroupUserRel?: AuthenticationGroupUserRelResolvers<ContextType>;
  AuthorizationCodeData?: AuthorizationCodeDataResolvers<ContextType>;
  AuthorizationGroup?: AuthorizationGroupResolvers<ContextType>;
  AuthorizationGroupScopeRel?: AuthorizationGroupScopeRelResolvers<ContextType>;
  AuthorizationGroupUserRel?: AuthorizationGroupUserRelResolvers<ContextType>;
  ChangeEvent?: ChangeEventResolvers<ContextType>;
  Client?: ClientResolvers<ContextType>;
  ClientAuthHistory?: ClientAuthHistoryResolvers<ContextType>;
  ClientScopeRel?: ClientScopeRelResolvers<ContextType>;
  Contact?: ContactResolvers<ContextType>;
  ErrorActionHandler?: ErrorActionHandlerResolvers<ContextType>;
  FederatedOIDCAuthorizationRel?: FederatedOidcAuthorizationRelResolvers<ContextType>;
  FederatedOIDCProvider?: FederatedOidcProviderResolvers<ContextType>;
  FederatedOIDCProviderDomainRel?: FederatedOidcProviderDomainRelResolvers<ContextType>;
  FederatedOIDCProviderTenantRel?: FederatedOidcProviderTenantRelResolvers<ContextType>;
  FooterLink?: FooterLinkResolvers<ContextType>;
  LoginAuthenticationHandlerResponse?: LoginAuthenticationHandlerResponseResolvers<ContextType>;
  LoginAuthenticationSuccessConfig?: LoginAuthenticationSuccessConfigResolvers<ContextType>;
  LoginFailurePolicy?: LoginFailurePolicyResolvers<ContextType>;
  LoginUserNameHandlerResponse?: LoginUserNameHandlerResponseResolvers<ContextType>;
  LookaheadItem?: LookaheadItemResolvers<ContextType>;
  LookaheadResult?: LookaheadResultResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OIDCRedirectActionHandlerConfig?: OidcRedirectActionHandlerConfigResolvers<ContextType>;
  PortalUserProfile?: PortalUserProfileResolvers<ContextType>;
  PreAuthenticationState?: PreAuthenticationStateResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RateLimit?: RateLimitResolvers<ContextType>;
  RateLimitServiceGroup?: RateLimitServiceGroupResolvers<ContextType>;
  RefreshData?: RefreshDataResolvers<ContextType>;
  SchedulerLock?: SchedulerLockResolvers<ContextType>;
  Scope?: ScopeResolvers<ContextType>;
  ScopeConstraintSchema?: ScopeConstraintSchemaResolvers<ContextType>;
  SearchResultItem?: SearchResultItemResolvers<ContextType>;
  SearchResults?: SearchResultsResolvers<ContextType>;
  SigningKey?: SigningKeyResolvers<ContextType>;
  SocialOIDCProviderTenantRel?: SocialOidcProviderTenantRelResolvers<ContextType>;
  SuccessfulLoginResponse?: SuccessfulLoginResponseResolvers<ContextType>;
  Tenant?: TenantResolvers<ContextType>;
  TenantLegacyUserMigrationConfig?: TenantLegacyUserMigrationConfigResolvers<ContextType>;
  TenantLookAndFeel?: TenantLookAndFeelResolvers<ContextType>;
  TenantManagementDomainRel?: TenantManagementDomainRelResolvers<ContextType>;
  TenantMetaData?: TenantMetaDataResolvers<ContextType>;
  TenantPasswordConfig?: TenantPasswordConfigResolvers<ContextType>;
  TenantRateLimitRel?: TenantRateLimitRelResolvers<ContextType>;
  TenantRestrictedAuthenticationDomainRel?: TenantRestrictedAuthenticationDomainRelResolvers<ContextType>;
  TenantScopeRel?: TenantScopeRelResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserCredential?: UserCredentialResolvers<ContextType>;
  UserFailedLoginAttempts?: UserFailedLoginAttemptsResolvers<ContextType>;
  UserScopeRel?: UserScopeRelResolvers<ContextType>;
  UserTenantRel?: UserTenantRelResolvers<ContextType>;
}>;



import gql from 'graphql-tag';
export const typeDefs = gql(`schema{query:Query mutation:Mutation}type AccessRule{accessRuleDefinition:String!accessRuleId:String!accessrulename:String!scopeConstraintSchemaId:String!scopeId:String!}input AccessRuleCreateInput{accessRuleDefinition:String!scopeConstraintSchemaId:String!scopeId:String!}input AccessRuleUpdateInput{accessRuleDefinition:String!accessRuleId:String!scopeConstraintSchemaId:String!scopeId:String!}input AnonymousUserConfigInput{defaultcountrycode:String defaultlangugecode:String groupids:[String]scopeids:[String]tokenttlseconds:Int!}type AnonymousUserConfiguration{defaultcountrycode:String defaultlangugecode:String groupids:[String]scopeids:[String]tenantId:String!tokenttlseconds:Int!}type AuthenticationGroup{authenticationGroupDescription:String authenticationGroupId:String!authenticationGroupName:String!defaultGroup:Boolean!tenantId:String!}type AuthenticationGroupClientRel{authenticationGroupId:String!clientId:String!}input AuthenticationGroupCreateInput{authenticationGroupDescription:String authenticationGroupName:String!defaultGroup:Boolean!tenantId:String!}input AuthenticationGroupUpdateInput{authenticationGroupDescription:String authenticationGroupId:String!authenticationGroupName:String!defaultGroup:Boolean!tenantId:String!}type AuthenticationGroupUserRel{authenticationGroupId:String!userId:String!}type AuthorizationCodeData{clientId:String!code:String!codeChallenge:String codeChallengeMethod:String expiresAtMs:Float!redirectUri:String!scope:String!tenantId:String!userId:String!}type AuthorizationGroup{default:Boolean!groupId:String!groupName:String!tenantId:String!}input AuthorizationGroupCreateInput{default:Boolean!groupName:String!tenantId:String!}type AuthorizationGroupScopeRel{accessruleid:String groupId:String!scopeId:String!tenantId:String!}input AuthorizationGroupUpdateInput{default:Boolean!groupId:String!groupName:String!tenantId:String!}type AuthorizationGroupUserRel{groupId:String!userId:String!}type ChangeEvent{changeEventClass:String!changeEventClassId:String changeEventId:String!changeEventType:String!changeEventTypeId:String changeTimestamp:Float!changedById:String!data:String!keyId:String!objectid:String!objecttype:String!signature:String!}type Client{clientDescription:String clientId:String!clientName:String!clientSecret:String!clientTokenTTLSeconds:Int clientType:String!clienttypeid:String enabled:Boolean maxRefreshTokenCount:Int oidcEnabled:Boolean!pkceEnabled:Boolean!redirectUris:[String!]tenantId:String!userTokenTTLSeconds:Int}type ClientAuthHistory{clientId:String!expiresAtSeconds:Float!jti:String!tenantId:String!}input ClientCreateInput{clientDescription:String clientName:String!clientTokenTTLSeconds:Int clientType:String!clienttypeid:String contactInput:[ContactInput!]!enabled:Boolean maxRefreshTokenCount:Int oidcEnabled:Boolean pkceEnabled:Boolean redirectUris:[String!]tenantId:String!userTokenTTLSeconds:Int}type ClientScopeRel{accessruleid:String clientId:String!scopeId:String!tenantId:String!}input ClientUpdateInput{clientDescription:String clientId:String!clientName:String!clientTokenTTLSeconds:Int clientType:String!clienttypeid:String contactInput:[ContactInput!]!enabled:Boolean maxRefreshTokenCount:Int oidcEnabled:Boolean pkceEnabled:Boolean redirectUris:[String!]tenantId:String!userTokenTTLSeconds:Int}type Contact{email:String!name:String!objectid:String!objecttype:String!userid:String}input ContactInput{email:String!name:String!userid:String}type ErrorActionHandler{errorCode:String!errorMessage:String!}type FederatedOIDCAuthorizationRel{codeVerifier:String codechallengemethod:String expiresAtMs:Float!federatedOIDCProviderId:String!initClientId:String!initCodeChallenge:String initCodeChallengeMethod:String initRedirectUri:String!initResponseMode:String!initResponseType:String!initScope:String!initState:String!initTenantId:String!returnUri:String state:String!}type FederatedOIDCProvider{clientAuthType:String!clientauthtypeid:String federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderId:String!federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderType:String!federatedOIDCProviderWellKnownUri:String!federatedoidcprovidertypeid:String refreshTokenAllowed:Boolean!scopes:[String!]!socialLoginDisplayName:String socialLoginIcon:String usePkce:Boolean!}input FederatedOIDCProviderCreateInput{clientAuthType:String!clientauthtypeid:String federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderId:String!federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderType:String!federatedOIDCProviderWellKnownUri:String!federatedoidcprovidertypeid:String refreshTokenAllowed:Boolean!usePkce:Boolean!}type FederatedOIDCProviderDomainRel{domain:String!federatedOIDCProviderId:String!}type FederatedOIDCProviderTenantRel{federatedOIDCProviderId:String!tenantId:String!}input FederatedOIDCProviderUpdateInput{clientAuthType:String!clientauthtypeid:String federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderId:String!federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderType:String!federatedOIDCProviderWellKnownUri:String!federatedoidcprovidertypeid:String refreshTokenAllowed:Boolean!usePkce:Boolean!}type FooterLink{footerlinkid:String!linktext:String!tenantid:String!uri:String!}enum LoginAuthenticationHandlerAction{AUTHENTICATED ERROR SECOND_FACTOR_INPUT}type LoginAuthenticationHandlerResponse{errorActionHandler:ErrorActionHandler secondFactorType:SecondFactorType status:LoginAuthenticationHandlerAction!successConfig:LoginAuthenticationSuccessConfig}type LoginAuthenticationSuccessConfig{code:String!redirectUri:String!responseMode:String state:String}type LoginFailurePolicy{failureThreshold:Int!initBackoffDurationMinutes:Int loginFailurePolicyType:String!loginfailurepolicytypeid:String numberOfBackoffCyclesBeforeLocking:Int numberOfPauseCyclesBeforeLocking:Int pauseDurationMinutes:Int tenantId:String!}input LoginFailurePolicyInput{failureThreshold:Int!initBackoffDurationMinutes:Int loginFailurePolicyType:String!loginfailurepolicytypeid:String numberOfBackoffCyclesBeforeLocking:Int numberOfPauseCyclesBeforeLocking:Int pauseDurationMinutes:Int tenantId:String!}enum LoginUserNameHandlerAction{ENTER_PASSWORD ERROR OIDC_REDIRECT}type LoginUserNameHandlerResponse{action:LoginUserNameHandlerAction!errorActionHandler:ErrorActionHandler oidcRedirectActionHandlerConfig:OIDCRedirectActionHandlerConfig}type LookaheadItem{displayValue:String!id:String!matchingString:String}type LookaheadResult{category:String!resultList:[LookaheadItem]}type Mutation{addDomainToTenantManagement(domain:String!tenantId:String!):String addDomainToTenantRestrictedAuthentication(domain:String!tenantId:String!):String addUserToAuthenticationGroup(authenticationGroupId:String userId:String!):AuthenticationGroupUserRel addUserToAuthorizationGroup(groupId:String!userId:String!):AuthorizationGroupUserRel assignAuthenticationGroupToClient(authenticationGroupId:String!clientId:String!):AuthenticationGroupClientRel assignFederatedOIDCProviderToDomain(domain:String!federatedOIDCProviderId:String!):FederatedOIDCProviderDomainRel!assignFederatedOIDCProviderToTenant(federatedOIDCProviderId:String!tenantId:String!):FederatedOIDCProviderTenantRel!assignRateLimitToTenant(allowUnlimited:Boolean limit:Int rateLimitId:String!rateLimitPeriodMinutes:Int tenantId:String!):TenantRateLimitRel assignScopeToAuthorizationGroup(accessRuleId:String groupId:String!scopeId:String!):AuthorizationGroupScopeRel assignScopeToClient(accessRuleId:String clientId:String!scopeId:String!tenantId:String!):ClientScopeRel assignScopeToTenant(accessRuleId:String scopeId:String!tenantId:String!):TenantScopeRel assignScopeToUser(accessRuleId:String scopeId:String!tenantId:String!userId:String!):UserScopeRel createAccessRule(accessRuleInput:AccessRuleCreateInput!):AccessRule createAuthenticationGroup(authenticationGroupInput:AuthenticationGroupCreateInput!):AuthenticationGroup createAuthorizationGroup(groupInput:AuthorizationGroupCreateInput!):AuthorizationGroup createClient(clientInput:ClientCreateInput!):Client createFederatedOIDCProvider(oidcProviderInput:FederatedOIDCProviderCreateInput!):FederatedOIDCProvider createLoginFailurePolicy(loginFailurePolicyInput:LoginFailurePolicyInput!):LoginFailurePolicy!createRateLimit(rateLimitInput:RateLimitCreateInput!):RateLimit createRootTenant(tenantInput:TenantCreateInput!):Tenant createScope(scopeInput:ScopeCreateInput!):Scope createScopeConstraintSchema(scopeConstraintSchemaInput:ScopeConstraintSchemaCreateInput!):ScopeConstraintSchema createSigningKey(keyInput:SigningKeyCreateInput!):SigningKey!createTenant(tenantInput:TenantCreateInput!):Tenant createUser(userInput:UserCreateInput!):User!deleteAccessRule(accessRuleId:String!):String!deleteAuthenticationGroup(authenticationGroupId:String!):String!deleteAuthorizationGroup(groupId:String!):String!deleteClient(clientId:String!):String deleteFederatedOIDCProvider(federatedOIDCProviderId:String!):String!deleteRateLimit(rateLimitId:String!):String deleteSchedulerLock(instanceId:String!):String!deleteScope(scopeId:String!):String deleteScopeConstraingSchema(scopeConstraintSchemaId:String!):String!deleteSigningKey(keyId:String!):String!deleteTenant(tenantId:String!):String login(password:String!username:String!):LoginAuthenticationHandlerResponse!logout(userId:String):String removeAuthenticationGroupFromClient(authenticationGroupId:String!clientId:String!):String removeDomainFromTenantManagement(domain:String!tenantId:String!):String removeDomainFromTenantRestrictedAuthentication(domain:String!tenantId:String):String removeFederatedOIDCProviderFromDomain(domain:String!federatedOIDCProviderId:String!):FederatedOIDCProviderDomainRel!removeFederatedOIDCProviderFromTenant(federatedOIDCProviderId:String!tenantId:String!):FederatedOIDCProviderTenantRel!removeRateLimitFromTenant(rateLimitId:String!tenantId:String!):String removeScopeFromAuthorizationGroup(groupId:String!scopeId:String!):String removeScopeFromClient(clientId:String!scopeId:String!tenantId:String!):String removeScopeFromTenant(scopeId:String!tenantId:String!):String removeScopeFromUser(scopeId:String!tenantId:String!userId:String!):String removeUserFromAuthenticationGroup(authenticationGroupId:String userId:String!):String removeUserFromAuthorizationGroup(groupId:String!userId:String!):String updateAccessRule(accessRuleInput:AccessRuleUpdateInput!):AccessRule updateAuthenticationGroup(authenticationGroupInput:AuthenticationGroupUpdateInput!):AuthenticationGroup updateAuthorizationGroup(groupInput:AuthorizationGroupUpdateInput!):AuthorizationGroup updateClient(clientInput:ClientUpdateInput!):Client updateFederatedOIDCProvider(oidcProviderInput:FederatedOIDCProviderUpdateInput!):FederatedOIDCProvider updateLoginFailurePolicy(loginFailurePolicyInput:LoginFailurePolicyInput!):LoginFailurePolicy!updateRateLimit(rateLimitInput:RateLimitUpdateInput!):RateLimit updateRateLimitForTenant(allowUnlimited:Boolean limit:Int rateLimitId:String!rateLimitPeriodMinutes:Int tenantId:String!):TenantRateLimitRel updateRootTenant(tenantInput:TenantUpdateInput!):Tenant updateScope(scopeInput:ScopeUpdateInput!):Scope updateScopeConstraintSchema(scopeConstraintSchemaInput:ScopeConstraintSchemaUpdateInput!):ScopeConstraintSchema updateSigningKey(keyInput:SigningKeyUpdateInput!):SigningKey!updateTenant(tenantInput:TenantUpdateInput!):Tenant updateUser(userInput:UserUpdateInput!):User!}type OIDCRedirectActionHandlerConfig{clientId:String!codeChallenge:String codeChallengeMethod:String redirectUri:String!responseMode:String!responseType:String!scope:String state:String!}input PasswordConfigInput{allowMfa:Boolean!mfaTypesAllowed:String mfaTypesRequired:String passwordHashingAlgorithm:String!passwordMaxLength:Int!passwordMinLength:Int!requireLowerCase:Boolean!requireMfa:Boolean!requireNumbers:Boolean!requireSpecialCharacters:Boolean!requireUpperCase:Boolean!specialCharactersAllowed:String}type PortalUserProfile{address:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!managementAccessTenantId:String middleName:String nameOrder:String!phoneNumber:String preferredLanguageCode:String scope:[Scope!]!tenantId:String!tenantName:String!twoFactorAuthType:String userId:String!}type PreAuthenticationState{clientId:String!codeChallenge:String codeChallengeMethod:String expiresAtMs:Float!redirectUri:String!responseMode:String!responseType:String!scope:String!state:String tenantId:String!token:String!}type Query{getAccessRuleById(accessRuleId:String!):AccessRule getAccessRules(tenantId:String):[AccessRule!]!getAnonymousUserConfiguration(tenantId:String!):AnonymousUserConfiguration getAuthenticationGroupById(authenticationGroupId:String!):AuthenticationGroup getAuthenticationGroups(clientId:String tenantId:String userId:String):[AuthenticationGroup!]!getAuthorizationGroupById(groupId:String!):AuthorizationGroup getAuthorizationGroupScopes(groupId:String!):[Scope!]!getAuthorizationGroups(tenantId:String):[AuthorizationGroup!]!getChangeEvents(objectId:String!):[ChangeEvent!]!getClientById(clientId:String!):Client getClientScopes(clientId:String!):[Scope!]!getClients(tenantId:String):[Client!]!getDomainsForTenantAuthentication(tenantId:String!):[String]getDomainsForTenantManagement(tenantId:String!):[String]getFederatedOIDCProviderById(federatedOIDCProviderId:String!):FederatedOIDCProvider getFederatedOIDCProviders(tenantId:String):[FederatedOIDCProvider!]!getLegacyUserMigrationConfiguration(tenantId:String!):TenantLegacyUserMigrationConfig getLoginFailurePolicy:LoginFailurePolicy!getLoginUserNameHandler(preauthToken:String tenantId:String username:String!):LoginUserNameHandlerResponse!getRateLimitById(rateLimitId:String!):RateLimit getRateLimits(tenantId:String):[RateLimit!]!getRootTenant:Tenant!getSchedulerLocks:[SchedulerLock]getScope(tenantId:String):[Scope!]!getScopeById(scopeId:String!):Scope getScopeConstraintSchemaById(scopeConstraintSchemaId:String):ScopeConstraintSchema getScopeConstraintSchemas:[ScopeConstraintSchema!]!getSigningKeyById(signingKeyId:String!):SigningKey getSigningKeys(tenantId:String):[SigningKey!]!getSocialOIDCProviders(tenantId:String):[FederatedOIDCProvider!]!getTenantById(tenantId:String!):Tenant getTenantLookAndFeel(tenantId:String!):TenantLookAndFeel getTenantMetaData(tenantId:String!):TenantMetaData getTenants:[Tenant!]!getUserAuthorizationGroups(userId:String!):[AuthorizationGroup!]!getUserById(userId:String!):User getUserScopes(userId:String!):[Scope!]!getUsers(tenantId:String):[User!]!lookahead(term:String!):[LookaheadResult]me:PortalUserProfile search(searchInput:SearchInput!):SearchResults!}type RateLimit{ratelimitid:String!ratelimitname:String!servicegroupid:String!}input RateLimitCreateInput{rateLimitDescription:String rateLimitDomain:String!}type RateLimitServiceGroup{scopeids:[String!]!servicegroupdescription:String servicegroupid:String!servicegroupname:String!}input RateLimitUpdateInput{rateLimitDescription:String rateLimitDomain:String!rateLimitId:String!}type RefreshData{clientId:String!redirecturi:String!refreshCount:Int!refreshToken:String!refreshTokenClientType:String!refreshtokenclienttypeid:String scope:String!tenantId:String!userId:String!}type SchedulerLock{lockExpiresAtMS:Float!lockInstanceId:String!lockName:String!lockStartTimeMS:Float!}type Scope{scopeDescription:String!scopeId:String!scopeName:String!scopeUse:String!}type ScopeConstraintSchema{schemaVersion:Int!scopeConstraintSchemaId:String!scopeId:String!scopeconstraintschema:String!scopeconstraintschemaname:String!}input ScopeConstraintSchemaCreateInput{schema:String!scopeId:String!}input ScopeConstraintSchemaUpdateInput{schema:String!scopeConstraintSchemaId:String!scopeId:String!}input ScopeCreateInput{scopeConstraintSchemaId:String scopeDescription:String!scopeName:String!}input ScopeUpdateInput{scopeConstraintSchemaId:String scopeDescription:String!scopeId:String!scopeName:String!}input SearchFilterInput{objectType:SearchFilterInputObjectType!objectValue:String!}enum SearchFilterInputObjectType{AUTHENTICATION_GROUP_ID AUTHORIZATION_GROUP_ID CLIENT_ID TENANT_ID USER_ID}input SearchInput{filters:[SearchFilterInput]page:Int!perPage:Int!resultType:SearchResultType sortDirection:String sortField:String term:String}type SearchResultItem{description:String email:String enabled:Boolean name:String!objectId:String!objectType:SearchResultType!owningClientId:String owningTenantId:String subType:String subTypeKey:String}enum SearchResultType{ACCESS_CONTROL AUTHENTICATION_GROUP AUTHORIZATION_GROUP CLIENT KEY OIDC_PROVIDER RATE_LIMIT TENANT USER}type SearchResults{endTime:Float!page:Int!perPage:Int!resultList:[SearchResultItem!]!startTime:Float!took:Int!total:Int!}enum SecondFactorType{EMAIL SECURITY_KEY SMS TOTP}type SigningKey{certificate:String expiresAtMs:Float!keyId:String!keyName:String!keyType:String!keyTypeId:String keyUse:String!password:String privateKeyPkcs8:String!publicKey:String status:String!statusId:String tenantId:String!}input SigningKeyCreateInput{certificate:String expiresAtMs:Float keyName:String!keyType:String!keyTypeId:String keyUse:String!password:String privateKeyPkcs8:String!publicKey:String tenantId:String!}input SigningKeyUpdateInput{keyId:String!keyName:String keyUse:String status:String!}type SocialOIDCProviderTenantRel{federatedOIDCProviderId:String!tenantId:String!}type SuccessfulLoginResponse{challenge:String mfaEnabled:Boolean!mfaType:String userId:String!}type Tenant{allowAnonymousUsers:Boolean!allowForgotPassword:Boolean!allowLoginByPhoneNumber:Boolean!allowSocialLogin:Boolean!allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!claimsSupported:[String!]!enabled:Boolean!federatedAuthenticationConstraint:String!federatedauthenticationconstraintid:String markForDelete:Boolean!migrateLegacyUsers:Boolean!tenantDescription:String tenantId:String!tenantName:String!tenantType:String!tenanttypeid:String verifyEmailOnSelfRegistration:Boolean!}input TenantCreateInput{allowAnonymousUsers:Boolean!allowForgotPassword:Boolean!allowLoginByPhoneNumber:Boolean!allowSocialLogin:Boolean!allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!anonymousUserConfigInput:AnonymousUserConfigInput claimsSupported:[String!]!contactInput:[ContactInput!]!enabled:Boolean!federatedAuthenticationConstraint:String!migrateLegacyUsers:Boolean!passwordConfigInput:PasswordConfigInput tenantDescription:String tenantId:String!tenantName:String!tenantType:String!verifyEmailOnSelfRegistration:Boolean!}type TenantLegacyUserMigrationConfig{authenticationUri:String!tenantId:String!userProfileUri:String!usernameCheckUri:String!}type TenantLookAndFeel{adminheaderbackgroundcolor:String adminheadertext:String adminheadertextcolor:String adminlogo:String authenticationheaderbackgroundcolor:String authenticationheadertext:String authenticationheadertextcolor:String authenticationlogo:String footerlinks:[FooterLink]tenantid:String!}type TenantManagementDomainRel{domain:String!tenantId:String!}type TenantMetaData{tenant:Tenant!tenantLookAndFeel:TenantLookAndFeel}type TenantPasswordConfig{allowMfa:Boolean!mfaTypesAllowed:String mfaTypesRequired:String passwordHashingAlgorithm:String!passwordMaxLength:Int!passwordMinLength:Int!requireLowerCase:Boolean!requireMfa:Boolean!requireNumbers:Boolean!requireSpecialCharacters:Boolean!requireUpperCase:Boolean!specialCharactersAllowed:String tenantId:String!}type TenantRateLimitRel{allowUnlimitedRate:Boolean rateLimit:Int rateLimitId:String!rateLimitPeriodMinutes:Int tenantId:String!}type TenantRestrictedAuthenticationDomainRel{domain:String!tenantId:String!}type TenantScopeRel{accessRuleId:String scopeId:String!tenantId:String!}input TenantUpdateInput{allowAnonymousUsers:Boolean!allowForgotPassword:Boolean!allowLoginByPhoneNumber:Boolean!allowSocialLogin:Boolean!allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!anonymousUserConfigInput:AnonymousUserConfigInput claimsSupported:[String!]!contactInput:[ContactInput!]!enabled:Boolean!federatedAuthenticationConstraint:String!markForDelete:Boolean!migrateLegacyUsers:Boolean!passwordConfigInput:PasswordConfigInput tenantDescription:String tenantId:String!tenantName:String!tenantType:String!verifyEmailOnSelfRegistration:Boolean!}type User{address:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!middleName:String nameOrder:String!phoneNumber:String preferredLanguageCode:String twoFactorAuthType:String userId:String!}input UserCreateInput{address:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!middleName:String nameOrder:String!phoneNumber:String preferredLanguageCode:String twoFactorAuthType:String}type UserCredential{dateCreated:String!hashedPassword:String!hashingAlgorithm:String!salt:String!userId:String!}type UserFailedLoginAttempts{failureAtMS:Float!userId:String!}type UserScopeRel{accessruleid:String scopeid:String!tenantid:String!userid:String!}type UserTenantRel{enabled:Boolean!relType:String!tenantId:String!userId:String!}input UserUpdateInput{address:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!middleName:String nameOrder:String!phoneNumber:String preferredLanguageCode:String twoFactorAuthType:String userId:String!}`);