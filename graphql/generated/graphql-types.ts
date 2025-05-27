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
  accessRuleName: Scalars['String']['output'];
  scopeAccessRuleSchemaId: Scalars['String']['output'];
};

export type AccessRuleCreateInput = {
  accessRuleDefinition: Scalars['String']['input'];
  accessRuleName: Scalars['String']['input'];
  scopeAccessRuleSchemaId: Scalars['String']['input'];
};

export type AccessRuleUpdateInput = {
  accessRuleDefinition: Scalars['String']['input'];
  accessRuleId: Scalars['String']['input'];
  accessRuleName: Scalars['String']['input'];
  scopeAccessRuleSchemaId: Scalars['String']['input'];
};

export type AuthenticationGroup = {
  __typename?: 'AuthenticationGroup';
  authenticationGroupDescription?: Maybe<Scalars['String']['output']>;
  authenticationGroupId: Scalars['String']['output'];
  authenticationGroupName: Scalars['String']['output'];
  defaultGroup: Scalars['Boolean']['output'];
  markForDelete: Scalars['Boolean']['output'];
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

export type AuthenticatorAttestationResponseInput = {
  attestationObject: Scalars['String']['input'];
  authenticatorData: Scalars['String']['input'];
  clientDataJSON: Scalars['String']['input'];
  publicKey: Scalars['String']['input'];
  publicKeyAlgorithm: Scalars['Int']['input'];
  transports: Array<Scalars['String']['input']>;
};

export type AuthenticatorAuthenticationResponseInput = {
  authenticatorData: Scalars['String']['input'];
  clientDataJSON: Scalars['String']['input'];
  signature: Scalars['String']['input'];
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
  allowForAnonymousUsers: Scalars['Boolean']['output'];
  default: Scalars['Boolean']['output'];
  groupDescription?: Maybe<Scalars['String']['output']>;
  groupId: Scalars['String']['output'];
  groupName: Scalars['String']['output'];
  markForDelete: Scalars['Boolean']['output'];
  tenantId: Scalars['String']['output'];
};

export type AuthorizationGroupCreateInput = {
  allowForAnonymousUsers: Scalars['Boolean']['input'];
  default: Scalars['Boolean']['input'];
  groupDescription?: InputMaybe<Scalars['String']['input']>;
  groupName: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type AuthorizationGroupScopeRel = {
  __typename?: 'AuthorizationGroupScopeRel';
  groupId: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type AuthorizationGroupUpdateInput = {
  allowForAnonymousUsers: Scalars['Boolean']['input'];
  default: Scalars['Boolean']['input'];
  groupDescription?: InputMaybe<Scalars['String']['input']>;
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
  enabled: Scalars['Boolean']['output'];
  markForDelete: Scalars['Boolean']['output'];
  maxRefreshTokenCount?: Maybe<Scalars['Int']['output']>;
  oidcEnabled: Scalars['Boolean']['output'];
  pkceEnabled: Scalars['Boolean']['output'];
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
  enabled: Scalars['Boolean']['input'];
  maxRefreshTokenCount?: InputMaybe<Scalars['Int']['input']>;
  oidcEnabled: Scalars['Boolean']['input'];
  pkceEnabled: Scalars['Boolean']['input'];
  tenantId: Scalars['String']['input'];
  userTokenTTLSeconds?: InputMaybe<Scalars['Int']['input']>;
};

export type ClientScopeRel = {
  __typename?: 'ClientScopeRel';
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
  enabled: Scalars['Boolean']['input'];
  maxRefreshTokenCount?: InputMaybe<Scalars['Int']['input']>;
  oidcEnabled: Scalars['Boolean']['input'];
  pkceEnabled: Scalars['Boolean']['input'];
  tenantId: Scalars['String']['input'];
  userTokenTTLSeconds?: InputMaybe<Scalars['Int']['input']>;
};

export type Contact = {
  __typename?: 'Contact';
  contactid: Scalars['String']['output'];
  email: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  objectid: Scalars['String']['output'];
  objecttype: Scalars['String']['output'];
  userid?: Maybe<Scalars['String']['output']>;
};

export type ContactCreateInput = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  objectid: Scalars['String']['input'];
  objecttype: Scalars['String']['input'];
  userid?: InputMaybe<Scalars['String']['input']>;
};

export type DeletionStatus = {
  __typename?: 'DeletionStatus';
  completedAt?: Maybe<Scalars['Float']['output']>;
  markForDeleteId: Scalars['String']['output'];
  startedAt: Scalars['Float']['output'];
  step: Scalars['String']['output'];
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
  markForDelete: Scalars['Boolean']['output'];
  refreshTokenAllowed: Scalars['Boolean']['output'];
  scopes: Array<Scalars['String']['output']>;
  socialLoginProvider?: Maybe<Scalars['String']['output']>;
  usePkce: Scalars['Boolean']['output'];
};

export type FederatedOidcProviderCreateInput = {
  clientAuthType: Scalars['String']['input'];
  clientauthtypeid?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderClientId: Scalars['String']['input'];
  federatedOIDCProviderClientSecret?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderDescription?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderName: Scalars['String']['input'];
  federatedOIDCProviderTenantId?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderType: Scalars['String']['input'];
  federatedOIDCProviderWellKnownUri: Scalars['String']['input'];
  federatedoidcprovidertypeid?: InputMaybe<Scalars['String']['input']>;
  refreshTokenAllowed: Scalars['Boolean']['input'];
  scopes: Array<Scalars['String']['input']>;
  socialLoginProvider?: InputMaybe<Scalars['String']['input']>;
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
  scopes: Array<Scalars['String']['input']>;
  socialLoginProvider?: InputMaybe<Scalars['String']['input']>;
  usePkce: Scalars['Boolean']['input'];
};

export type Fido2AuthenticationChallengePasskey = {
  __typename?: 'Fido2AuthenticationChallengePasskey';
  id: Scalars['String']['output'];
  transports: Array<Scalars['String']['output']>;
};

export type Fido2AuthenticationChallengeResponse = {
  __typename?: 'Fido2AuthenticationChallengeResponse';
  fido2AuthenticationChallengePasskeys: Array<Fido2AuthenticationChallengePasskey>;
  fido2Challenge: Fido2Challenge;
  rpId: Scalars['String']['output'];
};

export type Fido2Challenge = {
  __typename?: 'Fido2Challenge';
  challenge: Scalars['String']['output'];
  expiresAtMs: Scalars['Float']['output'];
  issuedAtMs: Scalars['Float']['output'];
  userId: Scalars['String']['output'];
};

export type Fido2KeyAuthenticationInput = {
  authenticationAttachment: Scalars['String']['input'];
  id: Scalars['String']['input'];
  rawId: Scalars['String']['input'];
  response: AuthenticatorAuthenticationResponseInput;
  type: Scalars['String']['input'];
};

export type Fido2KeyRegistrationInput = {
  authenticationAttachment: Scalars['String']['input'];
  id: Scalars['String']['input'];
  rawId: Scalars['String']['input'];
  response: AuthenticatorAttestationResponseInput;
  type: Scalars['String']['input'];
};

export type Fido2RegistrationChallengeResponse = {
  __typename?: 'Fido2RegistrationChallengeResponse';
  email: Scalars['String']['output'];
  fido2Challenge: Fido2Challenge;
  rpId: Scalars['String']['output'];
  rpName: Scalars['String']['output'];
  userName: Scalars['String']['output'];
};

export type FooterLink = {
  __typename?: 'FooterLink';
  footerlinkid: Scalars['String']['output'];
  linktext: Scalars['String']['output'];
  tenantid: Scalars['String']['output'];
  uri: Scalars['String']['output'];
};

export type FooterLinkInput = {
  footerlinkid?: InputMaybe<Scalars['String']['input']>;
  linktext: Scalars['String']['input'];
  tenantid: Scalars['String']['input'];
  uri: Scalars['String']['input'];
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
  category: SearchResultType;
  resultList: Array<LookaheadItem>;
};

export type MarkForDelete = {
  __typename?: 'MarkForDelete';
  completedData?: Maybe<Scalars['Float']['output']>;
  markForDeleteId: Scalars['String']['output'];
  objectId: Scalars['String']['output'];
  objectType: MarkForDeleteObjectType;
  submittedBy: Scalars['String']['output'];
  submittedDate: Scalars['Float']['output'];
};

export type MarkForDeleteInput = {
  markForDeleteObjectType: MarkForDeleteObjectType;
  objectId: Scalars['String']['input'];
};

export enum MarkForDeleteObjectType {
  AuthenticationGroup = 'AUTHENTICATION_GROUP',
  AuthorizationGroup = 'AUTHORIZATION_GROUP',
  Client = 'CLIENT',
  FederatedOidcProvider = 'FEDERATED_OIDC_PROVIDER',
  RateLimitServiceGroup = 'RATE_LIMIT_SERVICE_GROUP',
  Scope = 'SCOPE',
  SigningKey = 'SIGNING_KEY',
  Tenant = 'TENANT',
  User = 'USER'
}

export type Mutation = {
  __typename?: 'Mutation';
  addContact: Contact;
  addDomainToTenantManagement?: Maybe<TenantManagementDomainRel>;
  addDomainToTenantRestrictedAuthentication?: Maybe<TenantRestrictedAuthenticationDomainRel>;
  addRedirectURI?: Maybe<Scalars['String']['output']>;
  addUserToAuthenticationGroup?: Maybe<AuthenticationGroupUserRel>;
  addUserToAuthorizationGroup?: Maybe<AuthorizationGroupUserRel>;
  assignAuthenticationGroupToClient?: Maybe<AuthenticationGroupClientRel>;
  assignFederatedOIDCProviderToDomain: FederatedOidcProviderDomainRel;
  assignFederatedOIDCProviderToTenant: FederatedOidcProviderTenantRel;
  assignRateLimitToTenant?: Maybe<TenantRateLimitRel>;
  assignScopeToAuthorizationGroup?: Maybe<AuthorizationGroupScopeRel>;
  assignScopeToClient?: Maybe<ClientScopeRel>;
  assignScopeToTenant?: Maybe<TenantAvailableScope>;
  assignScopeToUser?: Maybe<UserScopeRel>;
  assignUserToTenant: UserTenantRel;
  authenticateFIDO2Key: Scalars['Boolean']['output'];
  createAccessRule?: Maybe<AccessRule>;
  createAuthenticationGroup?: Maybe<AuthenticationGroup>;
  createAuthorizationGroup?: Maybe<AuthorizationGroup>;
  createClient?: Maybe<Client>;
  createFederatedOIDCProvider?: Maybe<FederatedOidcProvider>;
  createFido2AuthenticationChallenge?: Maybe<Fido2AuthenticationChallengeResponse>;
  createFido2RegistrationChallenge?: Maybe<Fido2RegistrationChallengeResponse>;
  createRateLimitServiceGroup?: Maybe<RateLimitServiceGroup>;
  createRootTenant?: Maybe<Tenant>;
  createScope?: Maybe<Scope>;
  createScopeAccessRuleSchema?: Maybe<ScopeAccessRuleSchema>;
  createSigningKey: SigningKey;
  createTenant?: Maybe<Tenant>;
  createUser: User;
  deleteAccessRule: Scalars['String']['output'];
  deleteAuthenticationGroup: Scalars['String']['output'];
  deleteAuthorizationGroup: Scalars['String']['output'];
  deleteClient?: Maybe<Scalars['String']['output']>;
  deleteFIDOKey?: Maybe<Scalars['String']['output']>;
  deleteFederatedOIDCProvider: Scalars['String']['output'];
  deleteRateLimitServiceGroup?: Maybe<Scalars['String']['output']>;
  deleteSchedulerLock: Scalars['String']['output'];
  deleteScope?: Maybe<Scalars['String']['output']>;
  deleteScopeAccessRuleSchema: Scalars['String']['output'];
  deleteSigningKey: Scalars['String']['output'];
  deleteTOTP?: Maybe<Scalars['String']['output']>;
  deleteTenant?: Maybe<Scalars['String']['output']>;
  deleteUserSession?: Maybe<Scalars['String']['output']>;
  generateTOTP?: Maybe<TotpResponse>;
  login: LoginAuthenticationHandlerResponse;
  logout?: Maybe<Scalars['String']['output']>;
  markForDelete?: Maybe<MarkForDelete>;
  registerFIDO2Key?: Maybe<UserMfaRel>;
  removeAuthenticationGroupFromClient?: Maybe<Scalars['String']['output']>;
  removeContact: Scalars['String']['output'];
  removeDomainFromTenantManagement?: Maybe<Scalars['String']['output']>;
  removeDomainFromTenantRestrictedAuthentication?: Maybe<Scalars['String']['output']>;
  removeFederatedOIDCProviderFromDomain: FederatedOidcProviderDomainRel;
  removeFederatedOIDCProviderFromTenant: FederatedOidcProviderTenantRel;
  removeRateLimitFromTenant?: Maybe<Scalars['String']['output']>;
  removeRedirectURI?: Maybe<Scalars['String']['output']>;
  removeScopeFromAuthorizationGroup?: Maybe<Scalars['String']['output']>;
  removeScopeFromClient?: Maybe<Scalars['String']['output']>;
  removeScopeFromTenant?: Maybe<Scalars['String']['output']>;
  removeScopeFromUser?: Maybe<Scalars['String']['output']>;
  removeTenantAnonymousUserConfig?: Maybe<Scalars['String']['output']>;
  removeTenantLegacyUserMigrationConfig?: Maybe<Scalars['String']['output']>;
  removeTenantLookAndFeel?: Maybe<Scalars['String']['output']>;
  removeTenantPasswordConfig?: Maybe<Scalars['String']['output']>;
  removeUserFromAuthenticationGroup?: Maybe<Scalars['String']['output']>;
  removeUserFromAuthorizationGroup?: Maybe<Scalars['String']['output']>;
  removeUserFromTenant?: Maybe<Scalars['String']['output']>;
  setTenantAnonymousUserConfig?: Maybe<TenantAnonymousUserConfiguration>;
  setTenantLegacyUserMigrationConfig?: Maybe<TenantLegacyUserMigrationConfig>;
  setTenantLookAndFeel?: Maybe<TenantLookAndFeel>;
  setTenantPasswordConfig?: Maybe<TenantPasswordConfig>;
  updateAccessRule?: Maybe<AccessRule>;
  updateAuthenticationGroup?: Maybe<AuthenticationGroup>;
  updateAuthorizationGroup?: Maybe<AuthorizationGroup>;
  updateClient?: Maybe<Client>;
  updateFederatedOIDCProvider?: Maybe<FederatedOidcProvider>;
  updateLoginFailurePolicy: LoginFailurePolicy;
  updateRateLimitForTenant?: Maybe<TenantRateLimitRel>;
  updateRateLimitServiceGroup?: Maybe<RateLimitServiceGroup>;
  updateRootTenant?: Maybe<Tenant>;
  updateScope?: Maybe<Scope>;
  updateScopeAccessRuleSchema?: Maybe<ScopeAccessRuleSchema>;
  updateSigningKey: SigningKey;
  updateTenant?: Maybe<Tenant>;
  updateUser: User;
  updateUserTenantRel: UserTenantRel;
};


export type MutationAddContactArgs = {
  contactCreateInput: ContactCreateInput;
};


export type MutationAddDomainToTenantManagementArgs = {
  domain: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAddDomainToTenantRestrictedAuthenticationArgs = {
  domain: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAddRedirectUriArgs = {
  clientId: Scalars['String']['input'];
  uri: Scalars['String']['input'];
};


export type MutationAddUserToAuthenticationGroupArgs = {
  authenticationGroupId: Scalars['String']['input'];
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
  rateLimitPeriodMinutes?: InputMaybe<Scalars['Int']['input']>;
  serviceGroupId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAssignScopeToAuthorizationGroupArgs = {
  groupId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationAssignScopeToClientArgs = {
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
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationAssignUserToTenantArgs = {
  relType: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationAuthenticateFido2KeyArgs = {
  fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput;
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


export type MutationCreateFido2AuthenticationChallengeArgs = {
  userId: Scalars['String']['input'];
};


export type MutationCreateFido2RegistrationChallengeArgs = {
  userId: Scalars['String']['input'];
};


export type MutationCreateRateLimitServiceGroupArgs = {
  rateLimitServiceGroupInput: RateLimitServiceGroupCreateInput;
};


export type MutationCreateRootTenantArgs = {
  tenantInput: TenantCreateInput;
};


export type MutationCreateScopeArgs = {
  scopeInput: ScopeCreateInput;
};


export type MutationCreateScopeAccessRuleSchemaArgs = {
  scopeAccessRuleSchemaInput: ScopeAccessRuleSchemaCreateInput;
};


export type MutationCreateSigningKeyArgs = {
  keyInput: SigningKeyCreateInput;
};


export type MutationCreateTenantArgs = {
  tenantInput: TenantCreateInput;
};


export type MutationCreateUserArgs = {
  tenantId: Scalars['String']['input'];
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


export type MutationDeleteFidoKeyArgs = {
  userId: Scalars['String']['input'];
};


export type MutationDeleteFederatedOidcProviderArgs = {
  federatedOIDCProviderId: Scalars['String']['input'];
};


export type MutationDeleteRateLimitServiceGroupArgs = {
  serviceGroupId: Scalars['String']['input'];
};


export type MutationDeleteSchedulerLockArgs = {
  instanceId: Scalars['String']['input'];
};


export type MutationDeleteScopeArgs = {
  scopeId: Scalars['String']['input'];
};


export type MutationDeleteScopeAccessRuleSchemaArgs = {
  scopeAccessRuleSchemaId: Scalars['String']['input'];
};


export type MutationDeleteSigningKeyArgs = {
  keyId: Scalars['String']['input'];
};


export type MutationDeleteTotpArgs = {
  userId: Scalars['String']['input'];
};


export type MutationDeleteTenantArgs = {
  tenantId: Scalars['String']['input'];
};


export type MutationDeleteUserSessionArgs = {
  clientId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationGenerateTotpArgs = {
  userId: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationLogoutArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationMarkForDeleteArgs = {
  markForDeleteInput: MarkForDeleteInput;
};


export type MutationRegisterFido2KeyArgs = {
  fido2KeyRegistrationInput: Fido2KeyRegistrationInput;
  userId: Scalars['String']['input'];
};


export type MutationRemoveAuthenticationGroupFromClientArgs = {
  authenticationGroupId: Scalars['String']['input'];
  clientId: Scalars['String']['input'];
};


export type MutationRemoveContactArgs = {
  contactId: Scalars['String']['input'];
};


export type MutationRemoveDomainFromTenantManagementArgs = {
  domain: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveDomainFromTenantRestrictedAuthenticationArgs = {
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
  serviceGroupId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveRedirectUriArgs = {
  clientId: Scalars['String']['input'];
  uri: Scalars['String']['input'];
};


export type MutationRemoveScopeFromAuthorizationGroupArgs = {
  groupId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
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


export type MutationRemoveScopeFromUserArgs = {
  scopeId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveTenantAnonymousUserConfigArgs = {
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveTenantLegacyUserMigrationConfigArgs = {
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveTenantLookAndFeelArgs = {
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveTenantPasswordConfigArgs = {
  tenantId: Scalars['String']['input'];
};


export type MutationRemoveUserFromAuthenticationGroupArgs = {
  authenticationGroupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveUserFromAuthorizationGroupArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveUserFromTenantArgs = {
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationSetTenantAnonymousUserConfigArgs = {
  tenantAnonymousUserConfigInput: TenantAnonymousUserConfigInput;
};


export type MutationSetTenantLegacyUserMigrationConfigArgs = {
  tenantLegacyUserMigrationConfigInput: TenantLegacyUserMigrationConfigInput;
};


export type MutationSetTenantLookAndFeelArgs = {
  tenantLookAndFeelInput: TenantLookAndFeelInput;
};


export type MutationSetTenantPasswordConfigArgs = {
  passwordConfigInput: PasswordConfigInput;
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


export type MutationUpdateRateLimitForTenantArgs = {
  allowUnlimited?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  rateLimitPeriodMinutes?: InputMaybe<Scalars['Int']['input']>;
  serviceGroupId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationUpdateRateLimitServiceGroupArgs = {
  rateLimitServiceGroupInput: RateLimitServiceGroupUpdateInput;
};


export type MutationUpdateRootTenantArgs = {
  tenantInput: TenantUpdateInput;
};


export type MutationUpdateScopeArgs = {
  scopeInput: ScopeUpdateInput;
};


export type MutationUpdateScopeAccessRuleSchemaArgs = {
  scopeAccessRuleSchemaInput: ScopeAccessRuleSchemaUpdateInput;
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


export type MutationUpdateUserTenantRelArgs = {
  relType: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
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

export type ObjectSearchResultItem = {
  __typename?: 'ObjectSearchResultItem';
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  objectid: Scalars['String']['output'];
  objecttype: SearchResultType;
  owningclientid?: Maybe<Scalars['String']['output']>;
  owningtenantid?: Maybe<Scalars['String']['output']>;
  subtype?: Maybe<Scalars['String']['output']>;
  subtypekey?: Maybe<Scalars['String']['output']>;
};

export type ObjectSearchResults = {
  __typename?: 'ObjectSearchResults';
  endtime: Scalars['Float']['output'];
  page: Scalars['Int']['output'];
  perpage: Scalars['Int']['output'];
  resultlist: Array<ObjectSearchResultItem>;
  starttime: Scalars['Float']['output'];
  took: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PasswordConfigInput = {
  allowMfa: Scalars['Boolean']['input'];
  maxRepeatingCharacterLength?: InputMaybe<Scalars['Int']['input']>;
  mfaTypesAllowed?: InputMaybe<Scalars['String']['input']>;
  mfaTypesRequired?: InputMaybe<Scalars['String']['input']>;
  passwordHashingAlgorithm: Scalars['String']['input'];
  passwordHistoryPeriod?: InputMaybe<Scalars['Int']['input']>;
  passwordMaxLength: Scalars['Int']['input'];
  passwordMinLength: Scalars['Int']['input'];
  passwordRotationPeriodDays?: InputMaybe<Scalars['Int']['input']>;
  requireLowerCase: Scalars['Boolean']['input'];
  requireMfa: Scalars['Boolean']['input'];
  requireNumbers: Scalars['Boolean']['input'];
  requireSpecialCharacters: Scalars['Boolean']['input'];
  requireUpperCase: Scalars['Boolean']['input'];
  specialCharactersAllowed?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
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
  getAnonymousUserConfiguration?: Maybe<TenantAnonymousUserConfiguration>;
  getAuthenticationGroupById?: Maybe<AuthenticationGroup>;
  getAuthenticationGroups: Array<AuthenticationGroup>;
  getAuthorizationGroupById?: Maybe<AuthorizationGroup>;
  getAuthorizationGroupScopes: Array<Scope>;
  getAuthorizationGroups: Array<AuthorizationGroup>;
  getChangeEvents: Array<ChangeEvent>;
  getClientById?: Maybe<Client>;
  getClientScopes: Array<Scope>;
  getClients: Array<Client>;
  getContacts: Array<Contact>;
  getDeletionStatus: Array<DeletionStatus>;
  getDomainsForTenantAuthentication: Array<TenantRestrictedAuthenticationDomainRel>;
  getDomainsForTenantManagement: Array<TenantManagementDomainRel>;
  getFederatedOIDCProviderById?: Maybe<FederatedOidcProvider>;
  getFederatedOIDCProviderDomainRels: Array<FederatedOidcProviderDomainRel>;
  getFederatedOIDCProviders: Array<FederatedOidcProvider>;
  getLegacyUserMigrationConfiguration?: Maybe<TenantLegacyUserMigrationConfig>;
  getLoginFailurePolicy?: Maybe<LoginFailurePolicy>;
  getLoginUserNameHandler: LoginUserNameHandlerResponse;
  getMarkForDeleteById?: Maybe<MarkForDelete>;
  getRateLimitServiceGroupById?: Maybe<RateLimitServiceGroup>;
  getRateLimitServiceGroups: Array<RateLimitServiceGroup>;
  getRateLimitTenantRelViews: Array<TenantRateLimitRelView>;
  getRateLimitTenantRels: Array<TenantRateLimitRel>;
  getRedirectURIs: Array<Scalars['String']['output']>;
  getRootTenant: Tenant;
  getSchedulerLocks?: Maybe<Array<Maybe<SchedulerLock>>>;
  getScope: Array<Scope>;
  getScopeAccessRuleSchemaById?: Maybe<ScopeAccessRuleSchema>;
  getScopeAccessRuleSchemas: Array<ScopeAccessRuleSchema>;
  getScopeById?: Maybe<Scope>;
  getSecretValue?: Maybe<Scalars['String']['output']>;
  getSigningKeyById?: Maybe<SigningKey>;
  getSigningKeys: Array<SigningKey>;
  getStateProvinceRegions: Array<StateProvinceRegion>;
  getTenantById?: Maybe<Tenant>;
  getTenantLookAndFeel?: Maybe<TenantLookAndFeel>;
  getTenantMetaData?: Maybe<TenantMetaData>;
  getTenantPasswordConfig?: Maybe<TenantPasswordConfig>;
  getTenants: Array<Tenant>;
  getUserAuthorizationGroups: Array<AuthorizationGroup>;
  getUserById?: Maybe<User>;
  getUserMFARels: Array<UserMfaRel>;
  getUserScopes: Array<Scope>;
  getUserSessions: Array<UserSession>;
  getUserTenantRels: Array<UserTenantRelView>;
  getUsers: Array<User>;
  lookahead: Array<LookaheadResult>;
  me?: Maybe<PortalUserProfile>;
  relSearch: RelSearchResults;
  search: ObjectSearchResults;
  validateTOTP: Scalars['Boolean']['output'];
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


export type QueryGetContactsArgs = {
  objectId: Scalars['String']['input'];
};


export type QueryGetDeletionStatusArgs = {
  markForDeleteId: Scalars['String']['input'];
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


export type QueryGetFederatedOidcProviderDomainRelsArgs = {
  domain?: InputMaybe<Scalars['String']['input']>;
  federatedOIDCProviderId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetFederatedOidcProvidersArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetLegacyUserMigrationConfigurationArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetLoginFailurePolicyArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetLoginUserNameHandlerArgs = {
  preauthToken?: InputMaybe<Scalars['String']['input']>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
  username: Scalars['String']['input'];
};


export type QueryGetMarkForDeleteByIdArgs = {
  markForDeleteId: Scalars['String']['input'];
};


export type QueryGetRateLimitServiceGroupByIdArgs = {
  serviceGroupId: Scalars['String']['input'];
};


export type QueryGetRateLimitServiceGroupsArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetRateLimitTenantRelViewsArgs = {
  rateLimitServiceGroupId?: InputMaybe<Scalars['String']['input']>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetRateLimitTenantRelsArgs = {
  rateLimitServiceGroupId?: InputMaybe<Scalars['String']['input']>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetRedirectUrIsArgs = {
  clientId: Scalars['String']['input'];
};


export type QueryGetScopeArgs = {
  filterBy?: InputMaybe<ScopeFilterCriteria>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetScopeAccessRuleSchemaByIdArgs = {
  scopeAccessRuleSchemaId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetScopeByIdArgs = {
  scopeId: Scalars['String']['input'];
};


export type QueryGetSecretValueArgs = {
  objectId: Scalars['String']['input'];
  objectType: SecretObjectType;
};


export type QueryGetSigningKeyByIdArgs = {
  signingKeyId: Scalars['String']['input'];
};


export type QueryGetSigningKeysArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetStateProvinceRegionsArgs = {
  countryCode: Scalars['String']['input'];
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


export type QueryGetTenantPasswordConfigArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryGetTenantsArgs = {
  federatedOIDCProviderId?: InputMaybe<Scalars['String']['input']>;
  scopeId?: InputMaybe<Scalars['String']['input']>;
  tenantIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryGetUserAuthorizationGroupsArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUserByIdArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUserMfaRelsArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUserScopesArgs = {
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type QueryGetUserSessionsArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUserTenantRelsArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUsersArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLookaheadArgs = {
  term: Scalars['String']['input'];
};


export type QueryRelSearchArgs = {
  relSearchInput: RelSearchInput;
};


export type QuerySearchArgs = {
  searchInput: SearchInput;
};


export type QueryValidateTotpArgs = {
  totpValue: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type RateLimit = {
  __typename?: 'RateLimit';
  ratelimitid: Scalars['String']['output'];
  ratelimitname: Scalars['String']['output'];
  servicegroupid: Scalars['String']['output'];
};

export type RateLimitServiceGroup = {
  __typename?: 'RateLimitServiceGroup';
  markForDelete: Scalars['Boolean']['output'];
  servicegroupdescription?: Maybe<Scalars['String']['output']>;
  servicegroupid: Scalars['String']['output'];
  servicegroupname: Scalars['String']['output'];
};

export type RateLimitServiceGroupCreateInput = {
  servicegroupdescription?: InputMaybe<Scalars['String']['input']>;
  servicegroupname: Scalars['String']['input'];
};

export type RateLimitServiceGroupUpdateInput = {
  servicegroupdescription?: InputMaybe<Scalars['String']['input']>;
  servicegroupid: Scalars['String']['input'];
  servicegroupname: Scalars['String']['input'];
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

export type RelSearchInput = {
  childid?: InputMaybe<Scalars['String']['input']>;
  childids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  childtype?: InputMaybe<SearchResultType>;
  owningtenantid?: InputMaybe<Scalars['String']['input']>;
  page: Scalars['Int']['input'];
  parentid?: InputMaybe<Scalars['String']['input']>;
  parenttype?: InputMaybe<SearchResultType>;
  perPage: Scalars['Int']['input'];
  sortDirection?: InputMaybe<Scalars['String']['input']>;
  sortField?: InputMaybe<Scalars['String']['input']>;
  term?: InputMaybe<Scalars['String']['input']>;
};

export type RelSearchResultItem = {
  __typename?: 'RelSearchResultItem';
  childdescription?: Maybe<Scalars['String']['output']>;
  childid: Scalars['String']['output'];
  childname: Scalars['String']['output'];
  childtype: SearchResultType;
  owningtenantid: Scalars['String']['output'];
  owningtenantname?: Maybe<Scalars['String']['output']>;
  parentid: Scalars['String']['output'];
  parentname?: Maybe<Scalars['String']['output']>;
  parenttype: SearchResultType;
};

export type RelSearchResults = {
  __typename?: 'RelSearchResults';
  endtime: Scalars['Float']['output'];
  page: Scalars['Int']['output'];
  perpage: Scalars['Int']['output'];
  resultlist: Array<RelSearchResultItem>;
  starttime: Scalars['Float']['output'];
  took: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
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
  markForDelete: Scalars['Boolean']['output'];
  scopeDescription: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
  scopeName: Scalars['String']['output'];
  scopeUse: Scalars['String']['output'];
};

export type ScopeAccessRuleSchema = {
  __typename?: 'ScopeAccessRuleSchema';
  schemaVersion: Scalars['Int']['output'];
  scopeAccessRuleSchema: Scalars['String']['output'];
  scopeAccessRuleSchemaId: Scalars['String']['output'];
  scopeId: Scalars['String']['output'];
};

export type ScopeAccessRuleSchemaCreateInput = {
  schema: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
};

export type ScopeAccessRuleSchemaUpdateInput = {
  schema: Scalars['String']['input'];
  scopeAccessRuleSchemaId: Scalars['String']['input'];
  scopeId: Scalars['String']['input'];
};

export type ScopeCreateInput = {
  scopeAccessRuleSchemaId?: InputMaybe<Scalars['String']['input']>;
  scopeDescription: Scalars['String']['input'];
  scopeName: Scalars['String']['input'];
};

export enum ScopeFilterCriteria {
  Available = 'AVAILABLE',
  Existing = 'EXISTING'
}

export type ScopeUpdateInput = {
  scopeAccessRuleSchemaId?: InputMaybe<Scalars['String']['input']>;
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

export enum SearchRelType {
  AuthenticationGroupUserRel = 'AUTHENTICATION_GROUP_USER_REL',
  AuthorizationGroupUserRel = 'AUTHORIZATION_GROUP_USER_REL',
  ClientAuthenticationGroupRel = 'CLIENT_AUTHENTICATION_GROUP_REL'
}

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

export enum SecondFactorType {
  Email = 'EMAIL',
  SecurityKey = 'SECURITY_KEY',
  Sms = 'SMS',
  Totp = 'TOTP'
}

export enum SecretObjectType {
  ClientSecret = 'CLIENT_SECRET',
  OidcProviderClientSecret = 'OIDC_PROVIDER_CLIENT_SECRET',
  PrivateKey = 'PRIVATE_KEY',
  PrivateKeyPassword = 'PRIVATE_KEY_PASSWORD'
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
  markForDelete: Scalars['Boolean']['output'];
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

export type StateProvinceRegion = {
  __typename?: 'StateProvinceRegion';
  isoCountryCode: Scalars['String']['output'];
  isoEntryCode: Scalars['String']['output'];
  isoEntryName: Scalars['String']['output'];
  isoSubsetType: Scalars['String']['output'];
};

export type SuccessfulLoginResponse = {
  __typename?: 'SuccessfulLoginResponse';
  challenge?: Maybe<Scalars['String']['output']>;
  mfaEnabled: Scalars['Boolean']['output'];
  mfaType?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type TotpResponse = {
  __typename?: 'TOTPResponse';
  uri: Scalars['String']['output'];
  userMFARel: UserMfaRel;
};

export type Tenant = {
  __typename?: 'Tenant';
  allowAnonymousUsers: Scalars['Boolean']['output'];
  allowForgotPassword: Scalars['Boolean']['output'];
  allowLoginByPhoneNumber: Scalars['Boolean']['output'];
  allowSocialLogin: Scalars['Boolean']['output'];
  allowUnlimitedRate: Scalars['Boolean']['output'];
  allowUserSelfRegistration: Scalars['Boolean']['output'];
  defaultRateLimit?: Maybe<Scalars['Int']['output']>;
  defaultRateLimitPeriodMinutes?: Maybe<Scalars['Int']['output']>;
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

export type TenantAnonymousUserConfigInput = {
  defaultcountrycode?: InputMaybe<Scalars['String']['input']>;
  defaultlangugecode?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  tokenttlseconds: Scalars['Int']['input'];
};

export type TenantAnonymousUserConfiguration = {
  __typename?: 'TenantAnonymousUserConfiguration';
  defaultcountrycode?: Maybe<Scalars['String']['output']>;
  defaultlangugecode?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  tokenttlseconds: Scalars['Int']['output'];
};

export type TenantAvailableScope = {
  __typename?: 'TenantAvailableScope';
  accessRuleId?: Maybe<Scalars['String']['output']>;
  scopeId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type TenantCreateInput = {
  allowAnonymousUsers: Scalars['Boolean']['input'];
  allowForgotPassword: Scalars['Boolean']['input'];
  allowLoginByPhoneNumber: Scalars['Boolean']['input'];
  allowSocialLogin: Scalars['Boolean']['input'];
  allowUnlimitedRate: Scalars['Boolean']['input'];
  allowUserSelfRegistration: Scalars['Boolean']['input'];
  defaultRateLimit?: InputMaybe<Scalars['Int']['input']>;
  defaultRateLimitPeriodMinutes?: InputMaybe<Scalars['Int']['input']>;
  enabled: Scalars['Boolean']['input'];
  federatedAuthenticationConstraint: Scalars['String']['input'];
  migrateLegacyUsers: Scalars['Boolean']['input'];
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

export type TenantLegacyUserMigrationConfigInput = {
  authenticationUri: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userProfileUri: Scalars['String']['input'];
  usernameCheckUri: Scalars['String']['input'];
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
  authenticationlogomimetype?: Maybe<Scalars['String']['output']>;
  footerlinks?: Maybe<Array<Maybe<FooterLink>>>;
  tenantid: Scalars['String']['output'];
};

export type TenantLookAndFeelInput = {
  adminheaderbackgroundcolor?: InputMaybe<Scalars['String']['input']>;
  adminheadertext?: InputMaybe<Scalars['String']['input']>;
  adminheadertextcolor?: InputMaybe<Scalars['String']['input']>;
  adminlogo?: InputMaybe<Scalars['String']['input']>;
  authenticationheaderbackgroundcolor?: InputMaybe<Scalars['String']['input']>;
  authenticationheadertext?: InputMaybe<Scalars['String']['input']>;
  authenticationheadertextcolor?: InputMaybe<Scalars['String']['input']>;
  authenticationlogo?: InputMaybe<Scalars['String']['input']>;
  authenticationlogomimetype?: InputMaybe<Scalars['String']['input']>;
  footerlinks?: InputMaybe<Array<InputMaybe<FooterLinkInput>>>;
  tenantid: Scalars['String']['input'];
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
  maxRepeatingCharacterLength?: Maybe<Scalars['Int']['output']>;
  mfaTypesAllowed?: Maybe<Scalars['String']['output']>;
  mfaTypesRequired?: Maybe<Scalars['String']['output']>;
  passwordHashingAlgorithm: Scalars['String']['output'];
  passwordHistoryPeriod?: Maybe<Scalars['Int']['output']>;
  passwordMaxLength: Scalars['Int']['output'];
  passwordMinLength: Scalars['Int']['output'];
  passwordRotationPeriodDays?: Maybe<Scalars['Int']['output']>;
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
  rateLimitPeriodMinutes?: Maybe<Scalars['Int']['output']>;
  servicegroupid: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type TenantRateLimitRelView = {
  __typename?: 'TenantRateLimitRelView';
  allowUnlimitedRate?: Maybe<Scalars['Boolean']['output']>;
  rateLimit?: Maybe<Scalars['Int']['output']>;
  rateLimitPeriodMinutes?: Maybe<Scalars['Int']['output']>;
  servicegroupid: Scalars['String']['output'];
  servicegroupname: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
};

export type TenantRestrictedAuthenticationDomainRel = {
  __typename?: 'TenantRestrictedAuthenticationDomainRel';
  domain: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type TenantSupportedClaimRel = {
  __typename?: 'TenantSupportedClaimRel';
  claim: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
};

export type TenantUpdateInput = {
  allowAnonymousUsers: Scalars['Boolean']['input'];
  allowForgotPassword: Scalars['Boolean']['input'];
  allowLoginByPhoneNumber: Scalars['Boolean']['input'];
  allowSocialLogin: Scalars['Boolean']['input'];
  allowUnlimitedRate: Scalars['Boolean']['input'];
  allowUserSelfRegistration: Scalars['Boolean']['input'];
  defaultRateLimit?: InputMaybe<Scalars['Int']['input']>;
  defaultRateLimitPeriodMinutes?: InputMaybe<Scalars['Int']['input']>;
  enabled: Scalars['Boolean']['input'];
  federatedAuthenticationConstraint: Scalars['String']['input'];
  migrateLegacyUsers: Scalars['Boolean']['input'];
  tenantDescription?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  tenantName: Scalars['String']['input'];
  tenantType: Scalars['String']['input'];
  verifyEmailOnSelfRegistration: Scalars['Boolean']['input'];
};

export type User = {
  __typename?: 'User';
  address?: Maybe<Scalars['String']['output']>;
  addressLine1?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  domain: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  enabled: Scalars['Boolean']['output'];
  federatedOIDCProviderSubjectId?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  locked: Scalars['Boolean']['output'];
  markForDelete: Scalars['Boolean']['output'];
  middleName?: Maybe<Scalars['String']['output']>;
  nameOrder: Scalars['String']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  preferredLanguageCode?: Maybe<Scalars['String']['output']>;
  stateRegionProvince?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserCreateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  addressLine1?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
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
  postalCode?: InputMaybe<Scalars['String']['input']>;
  preferredLanguageCode?: InputMaybe<Scalars['String']['input']>;
  stateRegionProvince?: InputMaybe<Scalars['String']['input']>;
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

export type UserMfaRel = {
  __typename?: 'UserMFARel';
  fido2CredentialId?: Maybe<Scalars['String']['output']>;
  fido2KeySupportsCounters?: Maybe<Scalars['Boolean']['output']>;
  fido2PublicKey?: Maybe<Scalars['String']['output']>;
  fido2PublicKeyAlgorithm?: Maybe<Scalars['Int']['output']>;
  fido2Transports?: Maybe<Scalars['String']['output']>;
  mfaType: Scalars['String']['output'];
  primaryMfa: Scalars['Boolean']['output'];
  totpHashAlgorithm?: Maybe<Scalars['String']['output']>;
  totpSecret?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserScopeRel = {
  __typename?: 'UserScopeRel';
  scopeId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserSession = {
  __typename?: 'UserSession';
  clientId: Scalars['String']['output'];
  clientName: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserTenantRel = {
  __typename?: 'UserTenantRel';
  enabled: Scalars['Boolean']['output'];
  relType: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserTenantRelView = {
  __typename?: 'UserTenantRelView';
  relType: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserUpdateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  addressLine1?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
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
  postalCode?: InputMaybe<Scalars['String']['input']>;
  preferredLanguageCode?: InputMaybe<Scalars['String']['input']>;
  stateRegionProvince?: InputMaybe<Scalars['String']['input']>;
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
  AuthenticationGroup: ResolverTypeWrapper<AuthenticationGroup>;
  AuthenticationGroupClientRel: ResolverTypeWrapper<AuthenticationGroupClientRel>;
  AuthenticationGroupCreateInput: AuthenticationGroupCreateInput;
  AuthenticationGroupUpdateInput: AuthenticationGroupUpdateInput;
  AuthenticationGroupUserRel: ResolverTypeWrapper<AuthenticationGroupUserRel>;
  AuthenticatorAttestationResponseInput: AuthenticatorAttestationResponseInput;
  AuthenticatorAuthenticationResponseInput: AuthenticatorAuthenticationResponseInput;
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
  ContactCreateInput: ContactCreateInput;
  DeletionStatus: ResolverTypeWrapper<DeletionStatus>;
  ErrorActionHandler: ResolverTypeWrapper<ErrorActionHandler>;
  FederatedOIDCAuthorizationRel: ResolverTypeWrapper<FederatedOidcAuthorizationRel>;
  FederatedOIDCProvider: ResolverTypeWrapper<FederatedOidcProvider>;
  FederatedOIDCProviderCreateInput: FederatedOidcProviderCreateInput;
  FederatedOIDCProviderDomainRel: ResolverTypeWrapper<FederatedOidcProviderDomainRel>;
  FederatedOIDCProviderTenantRel: ResolverTypeWrapper<FederatedOidcProviderTenantRel>;
  FederatedOIDCProviderUpdateInput: FederatedOidcProviderUpdateInput;
  Fido2AuthenticationChallengePasskey: ResolverTypeWrapper<Fido2AuthenticationChallengePasskey>;
  Fido2AuthenticationChallengeResponse: ResolverTypeWrapper<Fido2AuthenticationChallengeResponse>;
  Fido2Challenge: ResolverTypeWrapper<Fido2Challenge>;
  Fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput;
  Fido2KeyRegistrationInput: Fido2KeyRegistrationInput;
  Fido2RegistrationChallengeResponse: ResolverTypeWrapper<Fido2RegistrationChallengeResponse>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FooterLink: ResolverTypeWrapper<FooterLink>;
  FooterLinkInput: FooterLinkInput;
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
  MarkForDelete: ResolverTypeWrapper<MarkForDelete>;
  MarkForDeleteInput: MarkForDeleteInput;
  MarkForDeleteObjectType: MarkForDeleteObjectType;
  Mutation: ResolverTypeWrapper<{}>;
  OIDCRedirectActionHandlerConfig: ResolverTypeWrapper<OidcRedirectActionHandlerConfig>;
  ObjectSearchResultItem: ResolverTypeWrapper<ObjectSearchResultItem>;
  ObjectSearchResults: ResolverTypeWrapper<ObjectSearchResults>;
  PasswordConfigInput: PasswordConfigInput;
  PortalUserProfile: ResolverTypeWrapper<PortalUserProfile>;
  PreAuthenticationState: ResolverTypeWrapper<PreAuthenticationState>;
  Query: ResolverTypeWrapper<{}>;
  RateLimit: ResolverTypeWrapper<RateLimit>;
  RateLimitServiceGroup: ResolverTypeWrapper<RateLimitServiceGroup>;
  RateLimitServiceGroupCreateInput: RateLimitServiceGroupCreateInput;
  RateLimitServiceGroupUpdateInput: RateLimitServiceGroupUpdateInput;
  RefreshData: ResolverTypeWrapper<RefreshData>;
  RelSearchInput: RelSearchInput;
  RelSearchResultItem: ResolverTypeWrapper<RelSearchResultItem>;
  RelSearchResults: ResolverTypeWrapper<RelSearchResults>;
  SchedulerLock: ResolverTypeWrapper<SchedulerLock>;
  Scope: ResolverTypeWrapper<Scope>;
  ScopeAccessRuleSchema: ResolverTypeWrapper<ScopeAccessRuleSchema>;
  ScopeAccessRuleSchemaCreateInput: ScopeAccessRuleSchemaCreateInput;
  ScopeAccessRuleSchemaUpdateInput: ScopeAccessRuleSchemaUpdateInput;
  ScopeCreateInput: ScopeCreateInput;
  ScopeFilterCriteria: ScopeFilterCriteria;
  ScopeUpdateInput: ScopeUpdateInput;
  SearchFilterInput: SearchFilterInput;
  SearchFilterInputObjectType: SearchFilterInputObjectType;
  SearchInput: SearchInput;
  SearchRelType: SearchRelType;
  SearchResultType: SearchResultType;
  SecondFactorType: SecondFactorType;
  SecretObjectType: SecretObjectType;
  SigningKey: ResolverTypeWrapper<SigningKey>;
  SigningKeyCreateInput: SigningKeyCreateInput;
  SigningKeyUpdateInput: SigningKeyUpdateInput;
  SocialOIDCProviderTenantRel: ResolverTypeWrapper<SocialOidcProviderTenantRel>;
  StateProvinceRegion: ResolverTypeWrapper<StateProvinceRegion>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SuccessfulLoginResponse: ResolverTypeWrapper<SuccessfulLoginResponse>;
  TOTPResponse: ResolverTypeWrapper<TotpResponse>;
  Tenant: ResolverTypeWrapper<Tenant>;
  TenantAnonymousUserConfigInput: TenantAnonymousUserConfigInput;
  TenantAnonymousUserConfiguration: ResolverTypeWrapper<TenantAnonymousUserConfiguration>;
  TenantAvailableScope: ResolverTypeWrapper<TenantAvailableScope>;
  TenantCreateInput: TenantCreateInput;
  TenantLegacyUserMigrationConfig: ResolverTypeWrapper<TenantLegacyUserMigrationConfig>;
  TenantLegacyUserMigrationConfigInput: TenantLegacyUserMigrationConfigInput;
  TenantLookAndFeel: ResolverTypeWrapper<TenantLookAndFeel>;
  TenantLookAndFeelInput: TenantLookAndFeelInput;
  TenantManagementDomainRel: ResolverTypeWrapper<TenantManagementDomainRel>;
  TenantMetaData: ResolverTypeWrapper<TenantMetaData>;
  TenantPasswordConfig: ResolverTypeWrapper<TenantPasswordConfig>;
  TenantRateLimitRel: ResolverTypeWrapper<TenantRateLimitRel>;
  TenantRateLimitRelView: ResolverTypeWrapper<TenantRateLimitRelView>;
  TenantRestrictedAuthenticationDomainRel: ResolverTypeWrapper<TenantRestrictedAuthenticationDomainRel>;
  TenantSupportedClaimRel: ResolverTypeWrapper<TenantSupportedClaimRel>;
  TenantUpdateInput: TenantUpdateInput;
  User: ResolverTypeWrapper<User>;
  UserCreateInput: UserCreateInput;
  UserCredential: ResolverTypeWrapper<UserCredential>;
  UserFailedLoginAttempts: ResolverTypeWrapper<UserFailedLoginAttempts>;
  UserMFARel: ResolverTypeWrapper<UserMfaRel>;
  UserScopeRel: ResolverTypeWrapper<UserScopeRel>;
  UserSession: ResolverTypeWrapper<UserSession>;
  UserTenantRel: ResolverTypeWrapper<UserTenantRel>;
  UserTenantRelView: ResolverTypeWrapper<UserTenantRelView>;
  UserUpdateInput: UserUpdateInput;
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
  AuthenticatorAttestationResponseInput: AuthenticatorAttestationResponseInput;
  AuthenticatorAuthenticationResponseInput: AuthenticatorAuthenticationResponseInput;
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
  ContactCreateInput: ContactCreateInput;
  DeletionStatus: DeletionStatus;
  ErrorActionHandler: ErrorActionHandler;
  FederatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel;
  FederatedOIDCProvider: FederatedOidcProvider;
  FederatedOIDCProviderCreateInput: FederatedOidcProviderCreateInput;
  FederatedOIDCProviderDomainRel: FederatedOidcProviderDomainRel;
  FederatedOIDCProviderTenantRel: FederatedOidcProviderTenantRel;
  FederatedOIDCProviderUpdateInput: FederatedOidcProviderUpdateInput;
  Fido2AuthenticationChallengePasskey: Fido2AuthenticationChallengePasskey;
  Fido2AuthenticationChallengeResponse: Fido2AuthenticationChallengeResponse;
  Fido2Challenge: Fido2Challenge;
  Fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput;
  Fido2KeyRegistrationInput: Fido2KeyRegistrationInput;
  Fido2RegistrationChallengeResponse: Fido2RegistrationChallengeResponse;
  Float: Scalars['Float']['output'];
  FooterLink: FooterLink;
  FooterLinkInput: FooterLinkInput;
  Int: Scalars['Int']['output'];
  LoginAuthenticationHandlerResponse: LoginAuthenticationHandlerResponse;
  LoginAuthenticationSuccessConfig: LoginAuthenticationSuccessConfig;
  LoginFailurePolicy: LoginFailurePolicy;
  LoginFailurePolicyInput: LoginFailurePolicyInput;
  LoginUserNameHandlerResponse: LoginUserNameHandlerResponse;
  LookaheadItem: LookaheadItem;
  LookaheadResult: LookaheadResult;
  MarkForDelete: MarkForDelete;
  MarkForDeleteInput: MarkForDeleteInput;
  Mutation: {};
  OIDCRedirectActionHandlerConfig: OidcRedirectActionHandlerConfig;
  ObjectSearchResultItem: ObjectSearchResultItem;
  ObjectSearchResults: ObjectSearchResults;
  PasswordConfigInput: PasswordConfigInput;
  PortalUserProfile: PortalUserProfile;
  PreAuthenticationState: PreAuthenticationState;
  Query: {};
  RateLimit: RateLimit;
  RateLimitServiceGroup: RateLimitServiceGroup;
  RateLimitServiceGroupCreateInput: RateLimitServiceGroupCreateInput;
  RateLimitServiceGroupUpdateInput: RateLimitServiceGroupUpdateInput;
  RefreshData: RefreshData;
  RelSearchInput: RelSearchInput;
  RelSearchResultItem: RelSearchResultItem;
  RelSearchResults: RelSearchResults;
  SchedulerLock: SchedulerLock;
  Scope: Scope;
  ScopeAccessRuleSchema: ScopeAccessRuleSchema;
  ScopeAccessRuleSchemaCreateInput: ScopeAccessRuleSchemaCreateInput;
  ScopeAccessRuleSchemaUpdateInput: ScopeAccessRuleSchemaUpdateInput;
  ScopeCreateInput: ScopeCreateInput;
  ScopeUpdateInput: ScopeUpdateInput;
  SearchFilterInput: SearchFilterInput;
  SearchInput: SearchInput;
  SigningKey: SigningKey;
  SigningKeyCreateInput: SigningKeyCreateInput;
  SigningKeyUpdateInput: SigningKeyUpdateInput;
  SocialOIDCProviderTenantRel: SocialOidcProviderTenantRel;
  StateProvinceRegion: StateProvinceRegion;
  String: Scalars['String']['output'];
  SuccessfulLoginResponse: SuccessfulLoginResponse;
  TOTPResponse: TotpResponse;
  Tenant: Tenant;
  TenantAnonymousUserConfigInput: TenantAnonymousUserConfigInput;
  TenantAnonymousUserConfiguration: TenantAnonymousUserConfiguration;
  TenantAvailableScope: TenantAvailableScope;
  TenantCreateInput: TenantCreateInput;
  TenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig;
  TenantLegacyUserMigrationConfigInput: TenantLegacyUserMigrationConfigInput;
  TenantLookAndFeel: TenantLookAndFeel;
  TenantLookAndFeelInput: TenantLookAndFeelInput;
  TenantManagementDomainRel: TenantManagementDomainRel;
  TenantMetaData: TenantMetaData;
  TenantPasswordConfig: TenantPasswordConfig;
  TenantRateLimitRel: TenantRateLimitRel;
  TenantRateLimitRelView: TenantRateLimitRelView;
  TenantRestrictedAuthenticationDomainRel: TenantRestrictedAuthenticationDomainRel;
  TenantSupportedClaimRel: TenantSupportedClaimRel;
  TenantUpdateInput: TenantUpdateInput;
  User: User;
  UserCreateInput: UserCreateInput;
  UserCredential: UserCredential;
  UserFailedLoginAttempts: UserFailedLoginAttempts;
  UserMFARel: UserMfaRel;
  UserScopeRel: UserScopeRel;
  UserSession: UserSession;
  UserTenantRel: UserTenantRel;
  UserTenantRelView: UserTenantRelView;
  UserUpdateInput: UserUpdateInput;
}>;

export type AccessRuleResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AccessRule'] = ResolversParentTypes['AccessRule']> = ResolversObject<{
  accessRuleDefinition?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  accessRuleId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  accessRuleName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeAccessRuleSchemaId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthenticationGroupResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthenticationGroup'] = ResolversParentTypes['AuthenticationGroup']> = ResolversObject<{
  authenticationGroupDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authenticationGroupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  authenticationGroupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  defaultGroup?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  markForDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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
  allowForAnonymousUsers?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  default?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  groupDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  groupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  markForDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthorizationGroupScopeRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthorizationGroupScopeRel'] = ResolversParentTypes['AuthorizationGroupScopeRel']> = ResolversObject<{
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
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  markForDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  maxRefreshTokenCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  oidcEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  pkceEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ContactResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Contact'] = ResolversParentTypes['Contact']> = ResolversObject<{
  contactid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  objectid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objecttype?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeletionStatusResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['DeletionStatus'] = ResolversParentTypes['DeletionStatus']> = ResolversObject<{
  completedAt?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  markForDeleteId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  step?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  markForDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  refreshTokenAllowed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  scopes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  socialLoginProvider?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type Fido2AuthenticationChallengePasskeyResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Fido2AuthenticationChallengePasskey'] = ResolversParentTypes['Fido2AuthenticationChallengePasskey']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  transports?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Fido2AuthenticationChallengeResponseResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Fido2AuthenticationChallengeResponse'] = ResolversParentTypes['Fido2AuthenticationChallengeResponse']> = ResolversObject<{
  fido2AuthenticationChallengePasskeys?: Resolver<Array<ResolversTypes['Fido2AuthenticationChallengePasskey']>, ParentType, ContextType>;
  fido2Challenge?: Resolver<ResolversTypes['Fido2Challenge'], ParentType, ContextType>;
  rpId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Fido2ChallengeResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Fido2Challenge'] = ResolversParentTypes['Fido2Challenge']> = ResolversObject<{
  challenge?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  issuedAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Fido2RegistrationChallengeResponseResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Fido2RegistrationChallengeResponse'] = ResolversParentTypes['Fido2RegistrationChallengeResponse']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fido2Challenge?: Resolver<ResolversTypes['Fido2Challenge'], ParentType, ContextType>;
  rpId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rpName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  category?: Resolver<ResolversTypes['SearchResultType'], ParentType, ContextType>;
  resultList?: Resolver<Array<ResolversTypes['LookaheadItem']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MarkForDeleteResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['MarkForDelete'] = ResolversParentTypes['MarkForDelete']> = ResolversObject<{
  completedData?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  markForDeleteId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectType?: Resolver<ResolversTypes['MarkForDeleteObjectType'], ParentType, ContextType>;
  submittedBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  submittedDate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addContact?: Resolver<ResolversTypes['Contact'], ParentType, ContextType, RequireFields<MutationAddContactArgs, 'contactCreateInput'>>;
  addDomainToTenantManagement?: Resolver<Maybe<ResolversTypes['TenantManagementDomainRel']>, ParentType, ContextType, RequireFields<MutationAddDomainToTenantManagementArgs, 'domain' | 'tenantId'>>;
  addDomainToTenantRestrictedAuthentication?: Resolver<Maybe<ResolversTypes['TenantRestrictedAuthenticationDomainRel']>, ParentType, ContextType, RequireFields<MutationAddDomainToTenantRestrictedAuthenticationArgs, 'domain' | 'tenantId'>>;
  addRedirectURI?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationAddRedirectUriArgs, 'clientId' | 'uri'>>;
  addUserToAuthenticationGroup?: Resolver<Maybe<ResolversTypes['AuthenticationGroupUserRel']>, ParentType, ContextType, RequireFields<MutationAddUserToAuthenticationGroupArgs, 'authenticationGroupId' | 'userId'>>;
  addUserToAuthorizationGroup?: Resolver<Maybe<ResolversTypes['AuthorizationGroupUserRel']>, ParentType, ContextType, RequireFields<MutationAddUserToAuthorizationGroupArgs, 'groupId' | 'userId'>>;
  assignAuthenticationGroupToClient?: Resolver<Maybe<ResolversTypes['AuthenticationGroupClientRel']>, ParentType, ContextType, RequireFields<MutationAssignAuthenticationGroupToClientArgs, 'authenticationGroupId' | 'clientId'>>;
  assignFederatedOIDCProviderToDomain?: Resolver<ResolversTypes['FederatedOIDCProviderDomainRel'], ParentType, ContextType, RequireFields<MutationAssignFederatedOidcProviderToDomainArgs, 'domain' | 'federatedOIDCProviderId'>>;
  assignFederatedOIDCProviderToTenant?: Resolver<ResolversTypes['FederatedOIDCProviderTenantRel'], ParentType, ContextType, RequireFields<MutationAssignFederatedOidcProviderToTenantArgs, 'federatedOIDCProviderId' | 'tenantId'>>;
  assignRateLimitToTenant?: Resolver<Maybe<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, RequireFields<MutationAssignRateLimitToTenantArgs, 'serviceGroupId' | 'tenantId'>>;
  assignScopeToAuthorizationGroup?: Resolver<Maybe<ResolversTypes['AuthorizationGroupScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToAuthorizationGroupArgs, 'groupId' | 'scopeId' | 'tenantId'>>;
  assignScopeToClient?: Resolver<Maybe<ResolversTypes['ClientScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToClientArgs, 'clientId' | 'scopeId' | 'tenantId'>>;
  assignScopeToTenant?: Resolver<Maybe<ResolversTypes['TenantAvailableScope']>, ParentType, ContextType, RequireFields<MutationAssignScopeToTenantArgs, 'scopeId' | 'tenantId'>>;
  assignScopeToUser?: Resolver<Maybe<ResolversTypes['UserScopeRel']>, ParentType, ContextType, RequireFields<MutationAssignScopeToUserArgs, 'scopeId' | 'tenantId' | 'userId'>>;
  assignUserToTenant?: Resolver<ResolversTypes['UserTenantRel'], ParentType, ContextType, RequireFields<MutationAssignUserToTenantArgs, 'relType' | 'tenantId' | 'userId'>>;
  authenticateFIDO2Key?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationAuthenticateFido2KeyArgs, 'fido2KeyAuthenticationInput' | 'userId'>>;
  createAccessRule?: Resolver<Maybe<ResolversTypes['AccessRule']>, ParentType, ContextType, RequireFields<MutationCreateAccessRuleArgs, 'accessRuleInput'>>;
  createAuthenticationGroup?: Resolver<Maybe<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, RequireFields<MutationCreateAuthenticationGroupArgs, 'authenticationGroupInput'>>;
  createAuthorizationGroup?: Resolver<Maybe<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, RequireFields<MutationCreateAuthorizationGroupArgs, 'groupInput'>>;
  createClient?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<MutationCreateClientArgs, 'clientInput'>>;
  createFederatedOIDCProvider?: Resolver<Maybe<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, RequireFields<MutationCreateFederatedOidcProviderArgs, 'oidcProviderInput'>>;
  createFido2AuthenticationChallenge?: Resolver<Maybe<ResolversTypes['Fido2AuthenticationChallengeResponse']>, ParentType, ContextType, RequireFields<MutationCreateFido2AuthenticationChallengeArgs, 'userId'>>;
  createFido2RegistrationChallenge?: Resolver<Maybe<ResolversTypes['Fido2RegistrationChallengeResponse']>, ParentType, ContextType, RequireFields<MutationCreateFido2RegistrationChallengeArgs, 'userId'>>;
  createRateLimitServiceGroup?: Resolver<Maybe<ResolversTypes['RateLimitServiceGroup']>, ParentType, ContextType, RequireFields<MutationCreateRateLimitServiceGroupArgs, 'rateLimitServiceGroupInput'>>;
  createRootTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationCreateRootTenantArgs, 'tenantInput'>>;
  createScope?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<MutationCreateScopeArgs, 'scopeInput'>>;
  createScopeAccessRuleSchema?: Resolver<Maybe<ResolversTypes['ScopeAccessRuleSchema']>, ParentType, ContextType, RequireFields<MutationCreateScopeAccessRuleSchemaArgs, 'scopeAccessRuleSchemaInput'>>;
  createSigningKey?: Resolver<ResolversTypes['SigningKey'], ParentType, ContextType, RequireFields<MutationCreateSigningKeyArgs, 'keyInput'>>;
  createTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationCreateTenantArgs, 'tenantInput'>>;
  createUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'tenantId' | 'userInput'>>;
  deleteAccessRule?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteAccessRuleArgs, 'accessRuleId'>>;
  deleteAuthenticationGroup?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteAuthenticationGroupArgs, 'authenticationGroupId'>>;
  deleteAuthorizationGroup?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteAuthorizationGroupArgs, 'groupId'>>;
  deleteClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteClientArgs, 'clientId'>>;
  deleteFIDOKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteFidoKeyArgs, 'userId'>>;
  deleteFederatedOIDCProvider?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteFederatedOidcProviderArgs, 'federatedOIDCProviderId'>>;
  deleteRateLimitServiceGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteRateLimitServiceGroupArgs, 'serviceGroupId'>>;
  deleteSchedulerLock?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteSchedulerLockArgs, 'instanceId'>>;
  deleteScope?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteScopeArgs, 'scopeId'>>;
  deleteScopeAccessRuleSchema?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteScopeAccessRuleSchemaArgs, 'scopeAccessRuleSchemaId'>>;
  deleteSigningKey?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteSigningKeyArgs, 'keyId'>>;
  deleteTOTP?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteTotpArgs, 'userId'>>;
  deleteTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteTenantArgs, 'tenantId'>>;
  deleteUserSession?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteUserSessionArgs, 'clientId' | 'tenantId' | 'userId'>>;
  generateTOTP?: Resolver<Maybe<ResolversTypes['TOTPResponse']>, ParentType, ContextType, RequireFields<MutationGenerateTotpArgs, 'userId'>>;
  login?: Resolver<ResolversTypes['LoginAuthenticationHandlerResponse'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'password' | 'username'>>;
  logout?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, Partial<MutationLogoutArgs>>;
  markForDelete?: Resolver<Maybe<ResolversTypes['MarkForDelete']>, ParentType, ContextType, RequireFields<MutationMarkForDeleteArgs, 'markForDeleteInput'>>;
  registerFIDO2Key?: Resolver<Maybe<ResolversTypes['UserMFARel']>, ParentType, ContextType, RequireFields<MutationRegisterFido2KeyArgs, 'fido2KeyRegistrationInput' | 'userId'>>;
  removeAuthenticationGroupFromClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveAuthenticationGroupFromClientArgs, 'authenticationGroupId' | 'clientId'>>;
  removeContact?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationRemoveContactArgs, 'contactId'>>;
  removeDomainFromTenantManagement?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveDomainFromTenantManagementArgs, 'domain' | 'tenantId'>>;
  removeDomainFromTenantRestrictedAuthentication?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveDomainFromTenantRestrictedAuthenticationArgs, 'domain' | 'tenantId'>>;
  removeFederatedOIDCProviderFromDomain?: Resolver<ResolversTypes['FederatedOIDCProviderDomainRel'], ParentType, ContextType, RequireFields<MutationRemoveFederatedOidcProviderFromDomainArgs, 'domain' | 'federatedOIDCProviderId'>>;
  removeFederatedOIDCProviderFromTenant?: Resolver<ResolversTypes['FederatedOIDCProviderTenantRel'], ParentType, ContextType, RequireFields<MutationRemoveFederatedOidcProviderFromTenantArgs, 'federatedOIDCProviderId' | 'tenantId'>>;
  removeRateLimitFromTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveRateLimitFromTenantArgs, 'serviceGroupId' | 'tenantId'>>;
  removeRedirectURI?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveRedirectUriArgs, 'clientId' | 'uri'>>;
  removeScopeFromAuthorizationGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromAuthorizationGroupArgs, 'groupId' | 'scopeId' | 'tenantId'>>;
  removeScopeFromClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromClientArgs, 'clientId' | 'scopeId' | 'tenantId'>>;
  removeScopeFromTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromTenantArgs, 'scopeId' | 'tenantId'>>;
  removeScopeFromUser?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveScopeFromUserArgs, 'scopeId' | 'tenantId' | 'userId'>>;
  removeTenantAnonymousUserConfig?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveTenantAnonymousUserConfigArgs, 'tenantId'>>;
  removeTenantLegacyUserMigrationConfig?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveTenantLegacyUserMigrationConfigArgs, 'tenantId'>>;
  removeTenantLookAndFeel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveTenantLookAndFeelArgs, 'tenantId'>>;
  removeTenantPasswordConfig?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveTenantPasswordConfigArgs, 'tenantId'>>;
  removeUserFromAuthenticationGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromAuthenticationGroupArgs, 'authenticationGroupId' | 'userId'>>;
  removeUserFromAuthorizationGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromAuthorizationGroupArgs, 'groupId' | 'userId'>>;
  removeUserFromTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromTenantArgs, 'tenantId' | 'userId'>>;
  setTenantAnonymousUserConfig?: Resolver<Maybe<ResolversTypes['TenantAnonymousUserConfiguration']>, ParentType, ContextType, RequireFields<MutationSetTenantAnonymousUserConfigArgs, 'tenantAnonymousUserConfigInput'>>;
  setTenantLegacyUserMigrationConfig?: Resolver<Maybe<ResolversTypes['TenantLegacyUserMigrationConfig']>, ParentType, ContextType, RequireFields<MutationSetTenantLegacyUserMigrationConfigArgs, 'tenantLegacyUserMigrationConfigInput'>>;
  setTenantLookAndFeel?: Resolver<Maybe<ResolversTypes['TenantLookAndFeel']>, ParentType, ContextType, RequireFields<MutationSetTenantLookAndFeelArgs, 'tenantLookAndFeelInput'>>;
  setTenantPasswordConfig?: Resolver<Maybe<ResolversTypes['TenantPasswordConfig']>, ParentType, ContextType, RequireFields<MutationSetTenantPasswordConfigArgs, 'passwordConfigInput'>>;
  updateAccessRule?: Resolver<Maybe<ResolversTypes['AccessRule']>, ParentType, ContextType, RequireFields<MutationUpdateAccessRuleArgs, 'accessRuleInput'>>;
  updateAuthenticationGroup?: Resolver<Maybe<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, RequireFields<MutationUpdateAuthenticationGroupArgs, 'authenticationGroupInput'>>;
  updateAuthorizationGroup?: Resolver<Maybe<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, RequireFields<MutationUpdateAuthorizationGroupArgs, 'groupInput'>>;
  updateClient?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<MutationUpdateClientArgs, 'clientInput'>>;
  updateFederatedOIDCProvider?: Resolver<Maybe<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, RequireFields<MutationUpdateFederatedOidcProviderArgs, 'oidcProviderInput'>>;
  updateLoginFailurePolicy?: Resolver<ResolversTypes['LoginFailurePolicy'], ParentType, ContextType, RequireFields<MutationUpdateLoginFailurePolicyArgs, 'loginFailurePolicyInput'>>;
  updateRateLimitForTenant?: Resolver<Maybe<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, RequireFields<MutationUpdateRateLimitForTenantArgs, 'serviceGroupId' | 'tenantId'>>;
  updateRateLimitServiceGroup?: Resolver<Maybe<ResolversTypes['RateLimitServiceGroup']>, ParentType, ContextType, RequireFields<MutationUpdateRateLimitServiceGroupArgs, 'rateLimitServiceGroupInput'>>;
  updateRootTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationUpdateRootTenantArgs, 'tenantInput'>>;
  updateScope?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<MutationUpdateScopeArgs, 'scopeInput'>>;
  updateScopeAccessRuleSchema?: Resolver<Maybe<ResolversTypes['ScopeAccessRuleSchema']>, ParentType, ContextType, RequireFields<MutationUpdateScopeAccessRuleSchemaArgs, 'scopeAccessRuleSchemaInput'>>;
  updateSigningKey?: Resolver<ResolversTypes['SigningKey'], ParentType, ContextType, RequireFields<MutationUpdateSigningKeyArgs, 'keyInput'>>;
  updateTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationUpdateTenantArgs, 'tenantInput'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'userInput'>>;
  updateUserTenantRel?: Resolver<ResolversTypes['UserTenantRel'], ParentType, ContextType, RequireFields<MutationUpdateUserTenantRelArgs, 'relType' | 'tenantId' | 'userId'>>;
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

export type ObjectSearchResultItemResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ObjectSearchResultItem'] = ResolversParentTypes['ObjectSearchResultItem']> = ResolversObject<{
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objecttype?: Resolver<ResolversTypes['SearchResultType'], ParentType, ContextType>;
  owningclientid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  owningtenantid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subtype?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subtypekey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ObjectSearchResultsResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ObjectSearchResults'] = ResolversParentTypes['ObjectSearchResults']> = ResolversObject<{
  endtime?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  perpage?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  resultlist?: Resolver<Array<ResolversTypes['ObjectSearchResultItem']>, ParentType, ContextType>;
  starttime?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  took?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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
  getAnonymousUserConfiguration?: Resolver<Maybe<ResolversTypes['TenantAnonymousUserConfiguration']>, ParentType, ContextType, RequireFields<QueryGetAnonymousUserConfigurationArgs, 'tenantId'>>;
  getAuthenticationGroupById?: Resolver<Maybe<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, RequireFields<QueryGetAuthenticationGroupByIdArgs, 'authenticationGroupId'>>;
  getAuthenticationGroups?: Resolver<Array<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, Partial<QueryGetAuthenticationGroupsArgs>>;
  getAuthorizationGroupById?: Resolver<Maybe<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, RequireFields<QueryGetAuthorizationGroupByIdArgs, 'groupId'>>;
  getAuthorizationGroupScopes?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetAuthorizationGroupScopesArgs, 'groupId'>>;
  getAuthorizationGroups?: Resolver<Array<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, Partial<QueryGetAuthorizationGroupsArgs>>;
  getChangeEvents?: Resolver<Array<ResolversTypes['ChangeEvent']>, ParentType, ContextType, RequireFields<QueryGetChangeEventsArgs, 'objectId'>>;
  getClientById?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<QueryGetClientByIdArgs, 'clientId'>>;
  getClientScopes?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetClientScopesArgs, 'clientId'>>;
  getClients?: Resolver<Array<ResolversTypes['Client']>, ParentType, ContextType, Partial<QueryGetClientsArgs>>;
  getContacts?: Resolver<Array<ResolversTypes['Contact']>, ParentType, ContextType, RequireFields<QueryGetContactsArgs, 'objectId'>>;
  getDeletionStatus?: Resolver<Array<ResolversTypes['DeletionStatus']>, ParentType, ContextType, RequireFields<QueryGetDeletionStatusArgs, 'markForDeleteId'>>;
  getDomainsForTenantAuthentication?: Resolver<Array<ResolversTypes['TenantRestrictedAuthenticationDomainRel']>, ParentType, ContextType, RequireFields<QueryGetDomainsForTenantAuthenticationArgs, 'tenantId'>>;
  getDomainsForTenantManagement?: Resolver<Array<ResolversTypes['TenantManagementDomainRel']>, ParentType, ContextType, RequireFields<QueryGetDomainsForTenantManagementArgs, 'tenantId'>>;
  getFederatedOIDCProviderById?: Resolver<Maybe<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, RequireFields<QueryGetFederatedOidcProviderByIdArgs, 'federatedOIDCProviderId'>>;
  getFederatedOIDCProviderDomainRels?: Resolver<Array<ResolversTypes['FederatedOIDCProviderDomainRel']>, ParentType, ContextType, Partial<QueryGetFederatedOidcProviderDomainRelsArgs>>;
  getFederatedOIDCProviders?: Resolver<Array<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, Partial<QueryGetFederatedOidcProvidersArgs>>;
  getLegacyUserMigrationConfiguration?: Resolver<Maybe<ResolversTypes['TenantLegacyUserMigrationConfig']>, ParentType, ContextType, RequireFields<QueryGetLegacyUserMigrationConfigurationArgs, 'tenantId'>>;
  getLoginFailurePolicy?: Resolver<Maybe<ResolversTypes['LoginFailurePolicy']>, ParentType, ContextType, RequireFields<QueryGetLoginFailurePolicyArgs, 'tenantId'>>;
  getLoginUserNameHandler?: Resolver<ResolversTypes['LoginUserNameHandlerResponse'], ParentType, ContextType, RequireFields<QueryGetLoginUserNameHandlerArgs, 'username'>>;
  getMarkForDeleteById?: Resolver<Maybe<ResolversTypes['MarkForDelete']>, ParentType, ContextType, RequireFields<QueryGetMarkForDeleteByIdArgs, 'markForDeleteId'>>;
  getRateLimitServiceGroupById?: Resolver<Maybe<ResolversTypes['RateLimitServiceGroup']>, ParentType, ContextType, RequireFields<QueryGetRateLimitServiceGroupByIdArgs, 'serviceGroupId'>>;
  getRateLimitServiceGroups?: Resolver<Array<ResolversTypes['RateLimitServiceGroup']>, ParentType, ContextType, Partial<QueryGetRateLimitServiceGroupsArgs>>;
  getRateLimitTenantRelViews?: Resolver<Array<ResolversTypes['TenantRateLimitRelView']>, ParentType, ContextType, Partial<QueryGetRateLimitTenantRelViewsArgs>>;
  getRateLimitTenantRels?: Resolver<Array<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, Partial<QueryGetRateLimitTenantRelsArgs>>;
  getRedirectURIs?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryGetRedirectUrIsArgs, 'clientId'>>;
  getRootTenant?: Resolver<ResolversTypes['Tenant'], ParentType, ContextType>;
  getSchedulerLocks?: Resolver<Maybe<Array<Maybe<ResolversTypes['SchedulerLock']>>>, ParentType, ContextType>;
  getScope?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, Partial<QueryGetScopeArgs>>;
  getScopeAccessRuleSchemaById?: Resolver<Maybe<ResolversTypes['ScopeAccessRuleSchema']>, ParentType, ContextType, Partial<QueryGetScopeAccessRuleSchemaByIdArgs>>;
  getScopeAccessRuleSchemas?: Resolver<Array<ResolversTypes['ScopeAccessRuleSchema']>, ParentType, ContextType>;
  getScopeById?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetScopeByIdArgs, 'scopeId'>>;
  getSecretValue?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryGetSecretValueArgs, 'objectId' | 'objectType'>>;
  getSigningKeyById?: Resolver<Maybe<ResolversTypes['SigningKey']>, ParentType, ContextType, RequireFields<QueryGetSigningKeyByIdArgs, 'signingKeyId'>>;
  getSigningKeys?: Resolver<Array<ResolversTypes['SigningKey']>, ParentType, ContextType, Partial<QueryGetSigningKeysArgs>>;
  getStateProvinceRegions?: Resolver<Array<ResolversTypes['StateProvinceRegion']>, ParentType, ContextType, RequireFields<QueryGetStateProvinceRegionsArgs, 'countryCode'>>;
  getTenantById?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<QueryGetTenantByIdArgs, 'tenantId'>>;
  getTenantLookAndFeel?: Resolver<Maybe<ResolversTypes['TenantLookAndFeel']>, ParentType, ContextType, RequireFields<QueryGetTenantLookAndFeelArgs, 'tenantId'>>;
  getTenantMetaData?: Resolver<Maybe<ResolversTypes['TenantMetaData']>, ParentType, ContextType, RequireFields<QueryGetTenantMetaDataArgs, 'tenantId'>>;
  getTenantPasswordConfig?: Resolver<Maybe<ResolversTypes['TenantPasswordConfig']>, ParentType, ContextType, RequireFields<QueryGetTenantPasswordConfigArgs, 'tenantId'>>;
  getTenants?: Resolver<Array<ResolversTypes['Tenant']>, ParentType, ContextType, Partial<QueryGetTenantsArgs>>;
  getUserAuthorizationGroups?: Resolver<Array<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, RequireFields<QueryGetUserAuthorizationGroupsArgs, 'userId'>>;
  getUserById?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserByIdArgs, 'userId'>>;
  getUserMFARels?: Resolver<Array<ResolversTypes['UserMFARel']>, ParentType, ContextType, RequireFields<QueryGetUserMfaRelsArgs, 'userId'>>;
  getUserScopes?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetUserScopesArgs, 'tenantId' | 'userId'>>;
  getUserSessions?: Resolver<Array<ResolversTypes['UserSession']>, ParentType, ContextType, RequireFields<QueryGetUserSessionsArgs, 'userId'>>;
  getUserTenantRels?: Resolver<Array<ResolversTypes['UserTenantRelView']>, ParentType, ContextType, RequireFields<QueryGetUserTenantRelsArgs, 'userId'>>;
  getUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, Partial<QueryGetUsersArgs>>;
  lookahead?: Resolver<Array<ResolversTypes['LookaheadResult']>, ParentType, ContextType, RequireFields<QueryLookaheadArgs, 'term'>>;
  me?: Resolver<Maybe<ResolversTypes['PortalUserProfile']>, ParentType, ContextType>;
  relSearch?: Resolver<ResolversTypes['RelSearchResults'], ParentType, ContextType, RequireFields<QueryRelSearchArgs, 'relSearchInput'>>;
  search?: Resolver<ResolversTypes['ObjectSearchResults'], ParentType, ContextType, RequireFields<QuerySearchArgs, 'searchInput'>>;
  validateTOTP?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryValidateTotpArgs, 'totpValue' | 'userId'>>;
}>;

export type RateLimitResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['RateLimit'] = ResolversParentTypes['RateLimit']> = ResolversObject<{
  ratelimitid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ratelimitname?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  servicegroupid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RateLimitServiceGroupResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['RateLimitServiceGroup'] = ResolversParentTypes['RateLimitServiceGroup']> = ResolversObject<{
  markForDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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

export type RelSearchResultItemResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['RelSearchResultItem'] = ResolversParentTypes['RelSearchResultItem']> = ResolversObject<{
  childdescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  childid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  childname?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  childtype?: Resolver<ResolversTypes['SearchResultType'], ParentType, ContextType>;
  owningtenantid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owningtenantname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parenttype?: Resolver<ResolversTypes['SearchResultType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RelSearchResultsResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['RelSearchResults'] = ResolversParentTypes['RelSearchResults']> = ResolversObject<{
  endtime?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  perpage?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  resultlist?: Resolver<Array<ResolversTypes['RelSearchResultItem']>, ParentType, ContextType>;
  starttime?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  took?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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
  markForDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  scopeDescription?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeUse?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ScopeAccessRuleSchemaResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ScopeAccessRuleSchema'] = ResolversParentTypes['ScopeAccessRuleSchema']> = ResolversObject<{
  schemaVersion?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scopeAccessRuleSchema?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeAccessRuleSchemaId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  markForDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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

export type StateProvinceRegionResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['StateProvinceRegion'] = ResolversParentTypes['StateProvinceRegion']> = ResolversObject<{
  isoCountryCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isoEntryCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isoEntryName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isoSubsetType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SuccessfulLoginResponseResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SuccessfulLoginResponse'] = ResolversParentTypes['SuccessfulLoginResponse']> = ResolversObject<{
  challenge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mfaEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  mfaType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TotpResponseResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TOTPResponse'] = ResolversParentTypes['TOTPResponse']> = ResolversObject<{
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userMFARel?: Resolver<ResolversTypes['UserMFARel'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Tenant'] = ResolversParentTypes['Tenant']> = ResolversObject<{
  allowAnonymousUsers?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowForgotPassword?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowLoginByPhoneNumber?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowSocialLogin?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowUnlimitedRate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowUserSelfRegistration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  defaultRateLimit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  defaultRateLimitPeriodMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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

export type TenantAnonymousUserConfigurationResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantAnonymousUserConfiguration'] = ResolversParentTypes['TenantAnonymousUserConfiguration']> = ResolversObject<{
  defaultcountrycode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  defaultlangugecode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tokenttlseconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantAvailableScopeResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantAvailableScope'] = ResolversParentTypes['TenantAvailableScope']> = ResolversObject<{
  accessRuleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  authenticationlogomimetype?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  maxRepeatingCharacterLength?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mfaTypesAllowed?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mfaTypesRequired?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  passwordHashingAlgorithm?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  passwordHistoryPeriod?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  passwordMaxLength?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  passwordMinLength?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  passwordRotationPeriodDays?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  rateLimitPeriodMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  servicegroupid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantRateLimitRelViewResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantRateLimitRelView'] = ResolversParentTypes['TenantRateLimitRelView']> = ResolversObject<{
  allowUnlimitedRate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  rateLimit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rateLimitPeriodMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  servicegroupid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  servicegroupname?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantRestrictedAuthenticationDomainRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantRestrictedAuthenticationDomainRel'] = ResolversParentTypes['TenantRestrictedAuthenticationDomainRel']> = ResolversObject<{
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantSupportedClaimRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantSupportedClaimRel'] = ResolversParentTypes['TenantSupportedClaimRel']> = ResolversObject<{
  claim?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addressLine1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  countryCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  federatedOIDCProviderSubjectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  markForDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  middleName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nameOrder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  postalCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  preferredLanguageCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stateRegionProvince?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type UserMfaRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserMFARel'] = ResolversParentTypes['UserMFARel']> = ResolversObject<{
  fido2CredentialId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fido2KeySupportsCounters?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  fido2PublicKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fido2PublicKeyAlgorithm?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fido2Transports?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mfaType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primaryMfa?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  totpHashAlgorithm?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totpSecret?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserScopeRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserScopeRel'] = ResolversParentTypes['UserScopeRel']> = ResolversObject<{
  scopeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserSessionResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserSession'] = ResolversParentTypes['UserSession']> = ResolversObject<{
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserTenantRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserTenantRel'] = ResolversParentTypes['UserTenantRel']> = ResolversObject<{
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  relType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserTenantRelViewResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserTenantRelView'] = ResolversParentTypes['UserTenantRelView']> = ResolversObject<{
  relType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = OIDCContext> = ResolversObject<{
  AccessRule?: AccessRuleResolvers<ContextType>;
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
  DeletionStatus?: DeletionStatusResolvers<ContextType>;
  ErrorActionHandler?: ErrorActionHandlerResolvers<ContextType>;
  FederatedOIDCAuthorizationRel?: FederatedOidcAuthorizationRelResolvers<ContextType>;
  FederatedOIDCProvider?: FederatedOidcProviderResolvers<ContextType>;
  FederatedOIDCProviderDomainRel?: FederatedOidcProviderDomainRelResolvers<ContextType>;
  FederatedOIDCProviderTenantRel?: FederatedOidcProviderTenantRelResolvers<ContextType>;
  Fido2AuthenticationChallengePasskey?: Fido2AuthenticationChallengePasskeyResolvers<ContextType>;
  Fido2AuthenticationChallengeResponse?: Fido2AuthenticationChallengeResponseResolvers<ContextType>;
  Fido2Challenge?: Fido2ChallengeResolvers<ContextType>;
  Fido2RegistrationChallengeResponse?: Fido2RegistrationChallengeResponseResolvers<ContextType>;
  FooterLink?: FooterLinkResolvers<ContextType>;
  LoginAuthenticationHandlerResponse?: LoginAuthenticationHandlerResponseResolvers<ContextType>;
  LoginAuthenticationSuccessConfig?: LoginAuthenticationSuccessConfigResolvers<ContextType>;
  LoginFailurePolicy?: LoginFailurePolicyResolvers<ContextType>;
  LoginUserNameHandlerResponse?: LoginUserNameHandlerResponseResolvers<ContextType>;
  LookaheadItem?: LookaheadItemResolvers<ContextType>;
  LookaheadResult?: LookaheadResultResolvers<ContextType>;
  MarkForDelete?: MarkForDeleteResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OIDCRedirectActionHandlerConfig?: OidcRedirectActionHandlerConfigResolvers<ContextType>;
  ObjectSearchResultItem?: ObjectSearchResultItemResolvers<ContextType>;
  ObjectSearchResults?: ObjectSearchResultsResolvers<ContextType>;
  PortalUserProfile?: PortalUserProfileResolvers<ContextType>;
  PreAuthenticationState?: PreAuthenticationStateResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RateLimit?: RateLimitResolvers<ContextType>;
  RateLimitServiceGroup?: RateLimitServiceGroupResolvers<ContextType>;
  RefreshData?: RefreshDataResolvers<ContextType>;
  RelSearchResultItem?: RelSearchResultItemResolvers<ContextType>;
  RelSearchResults?: RelSearchResultsResolvers<ContextType>;
  SchedulerLock?: SchedulerLockResolvers<ContextType>;
  Scope?: ScopeResolvers<ContextType>;
  ScopeAccessRuleSchema?: ScopeAccessRuleSchemaResolvers<ContextType>;
  SigningKey?: SigningKeyResolvers<ContextType>;
  SocialOIDCProviderTenantRel?: SocialOidcProviderTenantRelResolvers<ContextType>;
  StateProvinceRegion?: StateProvinceRegionResolvers<ContextType>;
  SuccessfulLoginResponse?: SuccessfulLoginResponseResolvers<ContextType>;
  TOTPResponse?: TotpResponseResolvers<ContextType>;
  Tenant?: TenantResolvers<ContextType>;
  TenantAnonymousUserConfiguration?: TenantAnonymousUserConfigurationResolvers<ContextType>;
  TenantAvailableScope?: TenantAvailableScopeResolvers<ContextType>;
  TenantLegacyUserMigrationConfig?: TenantLegacyUserMigrationConfigResolvers<ContextType>;
  TenantLookAndFeel?: TenantLookAndFeelResolvers<ContextType>;
  TenantManagementDomainRel?: TenantManagementDomainRelResolvers<ContextType>;
  TenantMetaData?: TenantMetaDataResolvers<ContextType>;
  TenantPasswordConfig?: TenantPasswordConfigResolvers<ContextType>;
  TenantRateLimitRel?: TenantRateLimitRelResolvers<ContextType>;
  TenantRateLimitRelView?: TenantRateLimitRelViewResolvers<ContextType>;
  TenantRestrictedAuthenticationDomainRel?: TenantRestrictedAuthenticationDomainRelResolvers<ContextType>;
  TenantSupportedClaimRel?: TenantSupportedClaimRelResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserCredential?: UserCredentialResolvers<ContextType>;
  UserFailedLoginAttempts?: UserFailedLoginAttemptsResolvers<ContextType>;
  UserMFARel?: UserMfaRelResolvers<ContextType>;
  UserScopeRel?: UserScopeRelResolvers<ContextType>;
  UserSession?: UserSessionResolvers<ContextType>;
  UserTenantRel?: UserTenantRelResolvers<ContextType>;
  UserTenantRelView?: UserTenantRelViewResolvers<ContextType>;
}>;



import gql from 'graphql-tag';
export const typeDefs = gql(`schema{query:Query mutation:Mutation}type AccessRule{accessRuleDefinition:String!accessRuleId:String!accessRuleName:String!scopeAccessRuleSchemaId:String!}input AccessRuleCreateInput{accessRuleDefinition:String!accessRuleName:String!scopeAccessRuleSchemaId:String!}input AccessRuleUpdateInput{accessRuleDefinition:String!accessRuleId:String!accessRuleName:String!scopeAccessRuleSchemaId:String!}type AuthenticationGroup{authenticationGroupDescription:String authenticationGroupId:String!authenticationGroupName:String!defaultGroup:Boolean!markForDelete:Boolean!tenantId:String!}type AuthenticationGroupClientRel{authenticationGroupId:String!clientId:String!}input AuthenticationGroupCreateInput{authenticationGroupDescription:String authenticationGroupName:String!defaultGroup:Boolean!tenantId:String!}input AuthenticationGroupUpdateInput{authenticationGroupDescription:String authenticationGroupId:String!authenticationGroupName:String!defaultGroup:Boolean!tenantId:String!}type AuthenticationGroupUserRel{authenticationGroupId:String!userId:String!}input AuthenticatorAttestationResponseInput{attestationObject:String!authenticatorData:String!clientDataJSON:String!publicKey:String!publicKeyAlgorithm:Int!transports:[String!]!}input AuthenticatorAuthenticationResponseInput{authenticatorData:String!clientDataJSON:String!signature:String!}type AuthorizationCodeData{clientId:String!code:String!codeChallenge:String codeChallengeMethod:String expiresAtMs:Float!redirectUri:String!scope:String!tenantId:String!userId:String!}type AuthorizationGroup{allowForAnonymousUsers:Boolean!default:Boolean!groupDescription:String groupId:String!groupName:String!markForDelete:Boolean!tenantId:String!}input AuthorizationGroupCreateInput{allowForAnonymousUsers:Boolean!default:Boolean!groupDescription:String groupName:String!tenantId:String!}type AuthorizationGroupScopeRel{groupId:String!scopeId:String!tenantId:String!}input AuthorizationGroupUpdateInput{allowForAnonymousUsers:Boolean!default:Boolean!groupDescription:String groupId:String!groupName:String!tenantId:String!}type AuthorizationGroupUserRel{groupId:String!userId:String!}type ChangeEvent{changeEventClass:String!changeEventClassId:String changeEventId:String!changeEventType:String!changeEventTypeId:String changeTimestamp:Float!changedById:String!data:String!keyId:String!objectid:String!objecttype:String!signature:String!}type Client{clientDescription:String clientId:String!clientName:String!clientSecret:String!clientTokenTTLSeconds:Int clientType:String!clienttypeid:String enabled:Boolean!markForDelete:Boolean!maxRefreshTokenCount:Int oidcEnabled:Boolean!pkceEnabled:Boolean!tenantId:String!userTokenTTLSeconds:Int}type ClientAuthHistory{clientId:String!expiresAtSeconds:Float!jti:String!tenantId:String!}input ClientCreateInput{clientDescription:String clientName:String!clientTokenTTLSeconds:Int clientType:String!clienttypeid:String enabled:Boolean!maxRefreshTokenCount:Int oidcEnabled:Boolean!pkceEnabled:Boolean!tenantId:String!userTokenTTLSeconds:Int}type ClientScopeRel{clientId:String!scopeId:String!tenantId:String!}input ClientUpdateInput{clientDescription:String clientId:String!clientName:String!clientTokenTTLSeconds:Int clientType:String!clienttypeid:String enabled:Boolean!maxRefreshTokenCount:Int oidcEnabled:Boolean!pkceEnabled:Boolean!tenantId:String!userTokenTTLSeconds:Int}type Contact{contactid:String!email:String!name:String objectid:String!objecttype:String!userid:String}input ContactCreateInput{email:String!name:String objectid:String!objecttype:String!userid:String}type DeletionStatus{completedAt:Float markForDeleteId:String!startedAt:Float!step:String!}type ErrorActionHandler{errorCode:String!errorMessage:String!}type FederatedOIDCAuthorizationRel{codeVerifier:String codechallengemethod:String expiresAtMs:Float!federatedOIDCProviderId:String!initClientId:String!initCodeChallenge:String initCodeChallengeMethod:String initRedirectUri:String!initResponseMode:String!initResponseType:String!initScope:String!initState:String!initTenantId:String!returnUri:String state:String!}type FederatedOIDCProvider{clientAuthType:String!clientauthtypeid:String federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderId:String!federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderType:String!federatedOIDCProviderWellKnownUri:String!federatedoidcprovidertypeid:String markForDelete:Boolean!refreshTokenAllowed:Boolean!scopes:[String!]!socialLoginProvider:String usePkce:Boolean!}input FederatedOIDCProviderCreateInput{clientAuthType:String!clientauthtypeid:String federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderType:String!federatedOIDCProviderWellKnownUri:String!federatedoidcprovidertypeid:String refreshTokenAllowed:Boolean!scopes:[String!]!socialLoginProvider:String usePkce:Boolean!}type FederatedOIDCProviderDomainRel{domain:String!federatedOIDCProviderId:String!}type FederatedOIDCProviderTenantRel{federatedOIDCProviderId:String!tenantId:String!}input FederatedOIDCProviderUpdateInput{clientAuthType:String!clientauthtypeid:String federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderId:String!federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderType:String!federatedOIDCProviderWellKnownUri:String!federatedoidcprovidertypeid:String refreshTokenAllowed:Boolean!scopes:[String!]!socialLoginProvider:String usePkce:Boolean!}type Fido2AuthenticationChallengePasskey{id:String!transports:[String!]!}type Fido2AuthenticationChallengeResponse{fido2AuthenticationChallengePasskeys:[Fido2AuthenticationChallengePasskey!]!fido2Challenge:Fido2Challenge!rpId:String!}type Fido2Challenge{challenge:String!expiresAtMs:Float!issuedAtMs:Float!userId:String!}input Fido2KeyAuthenticationInput{authenticationAttachment:String!id:String!rawId:String!response:AuthenticatorAuthenticationResponseInput!type:String!}input Fido2KeyRegistrationInput{authenticationAttachment:String!id:String!rawId:String!response:AuthenticatorAttestationResponseInput!type:String!}type Fido2RegistrationChallengeResponse{email:String!fido2Challenge:Fido2Challenge!rpId:String!rpName:String!userName:String!}type FooterLink{footerlinkid:String!linktext:String!tenantid:String!uri:String!}input FooterLinkInput{footerlinkid:String linktext:String!tenantid:String!uri:String!}enum LoginAuthenticationHandlerAction{AUTHENTICATED ERROR SECOND_FACTOR_INPUT}type LoginAuthenticationHandlerResponse{errorActionHandler:ErrorActionHandler secondFactorType:SecondFactorType status:LoginAuthenticationHandlerAction!successConfig:LoginAuthenticationSuccessConfig}type LoginAuthenticationSuccessConfig{code:String!redirectUri:String!responseMode:String state:String}type LoginFailurePolicy{failureThreshold:Int!initBackoffDurationMinutes:Int loginFailurePolicyType:String!loginfailurepolicytypeid:String numberOfBackoffCyclesBeforeLocking:Int numberOfPauseCyclesBeforeLocking:Int pauseDurationMinutes:Int tenantId:String!}input LoginFailurePolicyInput{failureThreshold:Int!initBackoffDurationMinutes:Int loginFailurePolicyType:String!loginfailurepolicytypeid:String numberOfBackoffCyclesBeforeLocking:Int numberOfPauseCyclesBeforeLocking:Int pauseDurationMinutes:Int tenantId:String!}enum LoginUserNameHandlerAction{ENTER_PASSWORD ERROR OIDC_REDIRECT}type LoginUserNameHandlerResponse{action:LoginUserNameHandlerAction!errorActionHandler:ErrorActionHandler oidcRedirectActionHandlerConfig:OIDCRedirectActionHandlerConfig}type LookaheadItem{displayValue:String!id:String!matchingString:String}type LookaheadResult{category:SearchResultType!resultList:[LookaheadItem!]!}type MarkForDelete{completedData:Float markForDeleteId:String!objectId:String!objectType:MarkForDeleteObjectType!submittedBy:String!submittedDate:Float!}input MarkForDeleteInput{markForDeleteObjectType:MarkForDeleteObjectType!objectId:String!}enum MarkForDeleteObjectType{AUTHENTICATION_GROUP AUTHORIZATION_GROUP CLIENT FEDERATED_OIDC_PROVIDER RATE_LIMIT_SERVICE_GROUP SCOPE SIGNING_KEY TENANT USER}type Mutation{addContact(contactCreateInput:ContactCreateInput!):Contact!addDomainToTenantManagement(domain:String!tenantId:String!):TenantManagementDomainRel addDomainToTenantRestrictedAuthentication(domain:String!tenantId:String!):TenantRestrictedAuthenticationDomainRel addRedirectURI(clientId:String!uri:String!):String addUserToAuthenticationGroup(authenticationGroupId:String!userId:String!):AuthenticationGroupUserRel addUserToAuthorizationGroup(groupId:String!userId:String!):AuthorizationGroupUserRel assignAuthenticationGroupToClient(authenticationGroupId:String!clientId:String!):AuthenticationGroupClientRel assignFederatedOIDCProviderToDomain(domain:String!federatedOIDCProviderId:String!):FederatedOIDCProviderDomainRel!assignFederatedOIDCProviderToTenant(federatedOIDCProviderId:String!tenantId:String!):FederatedOIDCProviderTenantRel!assignRateLimitToTenant(allowUnlimited:Boolean limit:Int rateLimitPeriodMinutes:Int serviceGroupId:String!tenantId:String!):TenantRateLimitRel assignScopeToAuthorizationGroup(groupId:String!scopeId:String!tenantId:String!):AuthorizationGroupScopeRel assignScopeToClient(clientId:String!scopeId:String!tenantId:String!):ClientScopeRel assignScopeToTenant(accessRuleId:String scopeId:String!tenantId:String!):TenantAvailableScope assignScopeToUser(scopeId:String!tenantId:String!userId:String!):UserScopeRel assignUserToTenant(relType:String!tenantId:String!userId:String!):UserTenantRel!authenticateFIDO2Key(fido2KeyAuthenticationInput:Fido2KeyAuthenticationInput!userId:String!):Boolean!createAccessRule(accessRuleInput:AccessRuleCreateInput!):AccessRule createAuthenticationGroup(authenticationGroupInput:AuthenticationGroupCreateInput!):AuthenticationGroup createAuthorizationGroup(groupInput:AuthorizationGroupCreateInput!):AuthorizationGroup createClient(clientInput:ClientCreateInput!):Client createFederatedOIDCProvider(oidcProviderInput:FederatedOIDCProviderCreateInput!):FederatedOIDCProvider createFido2AuthenticationChallenge(userId:String!):Fido2AuthenticationChallengeResponse createFido2RegistrationChallenge(userId:String!):Fido2RegistrationChallengeResponse createRateLimitServiceGroup(rateLimitServiceGroupInput:RateLimitServiceGroupCreateInput!):RateLimitServiceGroup createRootTenant(tenantInput:TenantCreateInput!):Tenant createScope(scopeInput:ScopeCreateInput!):Scope createScopeAccessRuleSchema(scopeAccessRuleSchemaInput:ScopeAccessRuleSchemaCreateInput!):ScopeAccessRuleSchema createSigningKey(keyInput:SigningKeyCreateInput!):SigningKey!createTenant(tenantInput:TenantCreateInput!):Tenant createUser(tenantId:String!userInput:UserCreateInput!):User!deleteAccessRule(accessRuleId:String!):String!deleteAuthenticationGroup(authenticationGroupId:String!):String!deleteAuthorizationGroup(groupId:String!):String!deleteClient(clientId:String!):String deleteFIDOKey(userId:String!):String deleteFederatedOIDCProvider(federatedOIDCProviderId:String!):String!deleteRateLimitServiceGroup(serviceGroupId:String!):String deleteSchedulerLock(instanceId:String!):String!deleteScope(scopeId:String!):String deleteScopeAccessRuleSchema(scopeAccessRuleSchemaId:String!):String!deleteSigningKey(keyId:String!):String!deleteTOTP(userId:String!):String deleteTenant(tenantId:String!):String deleteUserSession(clientId:String!tenantId:String!userId:String!):String generateTOTP(userId:String!):TOTPResponse login(password:String!username:String!):LoginAuthenticationHandlerResponse!logout(userId:String):String markForDelete(markForDeleteInput:MarkForDeleteInput!):MarkForDelete registerFIDO2Key(fido2KeyRegistrationInput:Fido2KeyRegistrationInput!userId:String!):UserMFARel removeAuthenticationGroupFromClient(authenticationGroupId:String!clientId:String!):String removeContact(contactId:String!):String!removeDomainFromTenantManagement(domain:String!tenantId:String!):String removeDomainFromTenantRestrictedAuthentication(domain:String!tenantId:String!):String removeFederatedOIDCProviderFromDomain(domain:String!federatedOIDCProviderId:String!):FederatedOIDCProviderDomainRel!removeFederatedOIDCProviderFromTenant(federatedOIDCProviderId:String!tenantId:String!):FederatedOIDCProviderTenantRel!removeRateLimitFromTenant(serviceGroupId:String!tenantId:String!):String removeRedirectURI(clientId:String!uri:String!):String removeScopeFromAuthorizationGroup(groupId:String!scopeId:String!tenantId:String!):String removeScopeFromClient(clientId:String!scopeId:String!tenantId:String!):String removeScopeFromTenant(scopeId:String!tenantId:String!):String removeScopeFromUser(scopeId:String!tenantId:String!userId:String!):String removeTenantAnonymousUserConfig(tenantId:String!):String removeTenantLegacyUserMigrationConfig(tenantId:String!):String removeTenantLookAndFeel(tenantId:String!):String removeTenantPasswordConfig(tenantId:String!):String removeUserFromAuthenticationGroup(authenticationGroupId:String!userId:String!):String removeUserFromAuthorizationGroup(groupId:String!userId:String!):String removeUserFromTenant(tenantId:String!userId:String!):String setTenantAnonymousUserConfig(tenantAnonymousUserConfigInput:TenantAnonymousUserConfigInput!):TenantAnonymousUserConfiguration setTenantLegacyUserMigrationConfig(tenantLegacyUserMigrationConfigInput:TenantLegacyUserMigrationConfigInput!):TenantLegacyUserMigrationConfig setTenantLookAndFeel(tenantLookAndFeelInput:TenantLookAndFeelInput!):TenantLookAndFeel setTenantPasswordConfig(passwordConfigInput:PasswordConfigInput!):TenantPasswordConfig updateAccessRule(accessRuleInput:AccessRuleUpdateInput!):AccessRule updateAuthenticationGroup(authenticationGroupInput:AuthenticationGroupUpdateInput!):AuthenticationGroup updateAuthorizationGroup(groupInput:AuthorizationGroupUpdateInput!):AuthorizationGroup updateClient(clientInput:ClientUpdateInput!):Client updateFederatedOIDCProvider(oidcProviderInput:FederatedOIDCProviderUpdateInput!):FederatedOIDCProvider updateLoginFailurePolicy(loginFailurePolicyInput:LoginFailurePolicyInput!):LoginFailurePolicy!updateRateLimitForTenant(allowUnlimited:Boolean limit:Int rateLimitPeriodMinutes:Int serviceGroupId:String!tenantId:String!):TenantRateLimitRel updateRateLimitServiceGroup(rateLimitServiceGroupInput:RateLimitServiceGroupUpdateInput!):RateLimitServiceGroup updateRootTenant(tenantInput:TenantUpdateInput!):Tenant updateScope(scopeInput:ScopeUpdateInput!):Scope updateScopeAccessRuleSchema(scopeAccessRuleSchemaInput:ScopeAccessRuleSchemaUpdateInput!):ScopeAccessRuleSchema updateSigningKey(keyInput:SigningKeyUpdateInput!):SigningKey!updateTenant(tenantInput:TenantUpdateInput!):Tenant updateUser(userInput:UserUpdateInput!):User!updateUserTenantRel(relType:String!tenantId:String!userId:String!):UserTenantRel!}type OIDCRedirectActionHandlerConfig{clientId:String!codeChallenge:String codeChallengeMethod:String redirectUri:String!responseMode:String!responseType:String!scope:String state:String!}type ObjectSearchResultItem{description:String email:String enabled:Boolean name:String!objectid:String!objecttype:SearchResultType!owningclientid:String owningtenantid:String subtype:String subtypekey:String}type ObjectSearchResults{endtime:Float!page:Int!perpage:Int!resultlist:[ObjectSearchResultItem!]!starttime:Float!took:Int!total:Int!}input PasswordConfigInput{allowMfa:Boolean!maxRepeatingCharacterLength:Int mfaTypesAllowed:String mfaTypesRequired:String passwordHashingAlgorithm:String!passwordHistoryPeriod:Int passwordMaxLength:Int!passwordMinLength:Int!passwordRotationPeriodDays:Int requireLowerCase:Boolean!requireMfa:Boolean!requireNumbers:Boolean!requireSpecialCharacters:Boolean!requireUpperCase:Boolean!specialCharactersAllowed:String tenantId:String!}type PortalUserProfile{address:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!managementAccessTenantId:String middleName:String nameOrder:String!phoneNumber:String preferredLanguageCode:String scope:[Scope!]!tenantId:String!tenantName:String!userId:String!}type PreAuthenticationState{clientId:String!codeChallenge:String codeChallengeMethod:String expiresAtMs:Float!redirectUri:String!responseMode:String!responseType:String!scope:String!state:String tenantId:String!token:String!}type Query{getAccessRuleById(accessRuleId:String!):AccessRule getAccessRules(tenantId:String):[AccessRule!]!getAnonymousUserConfiguration(tenantId:String!):TenantAnonymousUserConfiguration getAuthenticationGroupById(authenticationGroupId:String!):AuthenticationGroup getAuthenticationGroups(clientId:String tenantId:String userId:String):[AuthenticationGroup!]!getAuthorizationGroupById(groupId:String!):AuthorizationGroup getAuthorizationGroupScopes(groupId:String!):[Scope!]!getAuthorizationGroups(tenantId:String):[AuthorizationGroup!]!getChangeEvents(objectId:String!):[ChangeEvent!]!getClientById(clientId:String!):Client getClientScopes(clientId:String!):[Scope!]!getClients(tenantId:String):[Client!]!getContacts(objectId:String!):[Contact!]!getDeletionStatus(markForDeleteId:String!):[DeletionStatus!]!getDomainsForTenantAuthentication(tenantId:String!):[TenantRestrictedAuthenticationDomainRel!]!getDomainsForTenantManagement(tenantId:String!):[TenantManagementDomainRel!]!getFederatedOIDCProviderById(federatedOIDCProviderId:String!):FederatedOIDCProvider getFederatedOIDCProviderDomainRels(domain:String federatedOIDCProviderId:String):[FederatedOIDCProviderDomainRel!]!getFederatedOIDCProviders(tenantId:String):[FederatedOIDCProvider!]!getLegacyUserMigrationConfiguration(tenantId:String!):TenantLegacyUserMigrationConfig getLoginFailurePolicy(tenantId:String!):LoginFailurePolicy getLoginUserNameHandler(preauthToken:String tenantId:String username:String!):LoginUserNameHandlerResponse!getMarkForDeleteById(markForDeleteId:String!):MarkForDelete getRateLimitServiceGroupById(serviceGroupId:String!):RateLimitServiceGroup getRateLimitServiceGroups(tenantId:String):[RateLimitServiceGroup!]!getRateLimitTenantRelViews(rateLimitServiceGroupId:String tenantId:String):[TenantRateLimitRelView!]!getRateLimitTenantRels(rateLimitServiceGroupId:String tenantId:String):[TenantRateLimitRel!]!getRedirectURIs(clientId:String!):[String!]!getRootTenant:Tenant!getSchedulerLocks:[SchedulerLock]getScope(filterBy:ScopeFilterCriteria tenantId:String):[Scope!]!getScopeAccessRuleSchemaById(scopeAccessRuleSchemaId:String):ScopeAccessRuleSchema getScopeAccessRuleSchemas:[ScopeAccessRuleSchema!]!getScopeById(scopeId:String!):Scope getSecretValue(objectId:String!objectType:SecretObjectType!):String getSigningKeyById(signingKeyId:String!):SigningKey getSigningKeys(tenantId:String):[SigningKey!]!getStateProvinceRegions(countryCode:String!):[StateProvinceRegion!]!getTenantById(tenantId:String!):Tenant getTenantLookAndFeel(tenantId:String!):TenantLookAndFeel getTenantMetaData(tenantId:String!):TenantMetaData getTenantPasswordConfig(tenantId:String!):TenantPasswordConfig getTenants(federatedOIDCProviderId:String scopeId:String tenantIds:[String!]):[Tenant!]!getUserAuthorizationGroups(userId:String!):[AuthorizationGroup!]!getUserById(userId:String!):User getUserMFARels(userId:String!):[UserMFARel!]!getUserScopes(tenantId:String!userId:String!):[Scope!]!getUserSessions(userId:String!):[UserSession!]!getUserTenantRels(userId:String!):[UserTenantRelView!]!getUsers(tenantId:String):[User!]!lookahead(term:String!):[LookaheadResult!]!me:PortalUserProfile relSearch(relSearchInput:RelSearchInput!):RelSearchResults!search(searchInput:SearchInput!):ObjectSearchResults!validateTOTP(totpValue:String!userId:String!):Boolean!}type RateLimit{ratelimitid:String!ratelimitname:String!servicegroupid:String!}type RateLimitServiceGroup{markForDelete:Boolean!servicegroupdescription:String servicegroupid:String!servicegroupname:String!}input RateLimitServiceGroupCreateInput{servicegroupdescription:String servicegroupname:String!}input RateLimitServiceGroupUpdateInput{servicegroupdescription:String servicegroupid:String!servicegroupname:String!}type RefreshData{clientId:String!redirecturi:String!refreshCount:Int!refreshToken:String!refreshTokenClientType:String!refreshtokenclienttypeid:String scope:String!tenantId:String!userId:String!}input RelSearchInput{childid:String childids:[String]childtype:SearchResultType owningtenantid:String page:Int!parentid:String parenttype:SearchResultType perPage:Int!sortDirection:String sortField:String term:String}type RelSearchResultItem{childdescription:String childid:String!childname:String!childtype:SearchResultType!owningtenantid:String!owningtenantname:String parentid:String!parentname:String parenttype:SearchResultType!}type RelSearchResults{endtime:Float!page:Int!perpage:Int!resultlist:[RelSearchResultItem!]!starttime:Float!took:Int!total:Int!}type SchedulerLock{lockExpiresAtMS:Float!lockInstanceId:String!lockName:String!lockStartTimeMS:Float!}type Scope{markForDelete:Boolean!scopeDescription:String!scopeId:String!scopeName:String!scopeUse:String!}type ScopeAccessRuleSchema{schemaVersion:Int!scopeAccessRuleSchema:String!scopeAccessRuleSchemaId:String!scopeId:String!}input ScopeAccessRuleSchemaCreateInput{schema:String!scopeId:String!}input ScopeAccessRuleSchemaUpdateInput{schema:String!scopeAccessRuleSchemaId:String!scopeId:String!}input ScopeCreateInput{scopeAccessRuleSchemaId:String scopeDescription:String!scopeName:String!}enum ScopeFilterCriteria{AVAILABLE EXISTING}input ScopeUpdateInput{scopeAccessRuleSchemaId:String scopeDescription:String!scopeId:String!scopeName:String!}input SearchFilterInput{objectType:SearchFilterInputObjectType!objectValue:String!}enum SearchFilterInputObjectType{AUTHENTICATION_GROUP_ID AUTHORIZATION_GROUP_ID CLIENT_ID TENANT_ID USER_ID}input SearchInput{filters:[SearchFilterInput]page:Int!perPage:Int!resultType:SearchResultType sortDirection:String sortField:String term:String}enum SearchRelType{AUTHENTICATION_GROUP_USER_REL AUTHORIZATION_GROUP_USER_REL CLIENT_AUTHENTICATION_GROUP_REL}enum SearchResultType{ACCESS_CONTROL AUTHENTICATION_GROUP AUTHORIZATION_GROUP CLIENT KEY OIDC_PROVIDER RATE_LIMIT TENANT USER}enum SecondFactorType{EMAIL SECURITY_KEY SMS TOTP}enum SecretObjectType{CLIENT_SECRET OIDC_PROVIDER_CLIENT_SECRET PRIVATE_KEY PRIVATE_KEY_PASSWORD}type SigningKey{certificate:String expiresAtMs:Float!keyId:String!keyName:String!keyType:String!keyTypeId:String keyUse:String!markForDelete:Boolean!password:String privateKeyPkcs8:String!publicKey:String status:String!statusId:String tenantId:String!}input SigningKeyCreateInput{certificate:String expiresAtMs:Float keyName:String!keyType:String!keyTypeId:String keyUse:String!password:String privateKeyPkcs8:String!publicKey:String tenantId:String!}input SigningKeyUpdateInput{keyId:String!keyName:String keyUse:String status:String!}type SocialOIDCProviderTenantRel{federatedOIDCProviderId:String!tenantId:String!}type StateProvinceRegion{isoCountryCode:String!isoEntryCode:String!isoEntryName:String!isoSubsetType:String!}type SuccessfulLoginResponse{challenge:String mfaEnabled:Boolean!mfaType:String userId:String!}type TOTPResponse{uri:String!userMFARel:UserMFARel!}type Tenant{allowAnonymousUsers:Boolean!allowForgotPassword:Boolean!allowLoginByPhoneNumber:Boolean!allowSocialLogin:Boolean!allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!defaultRateLimit:Int defaultRateLimitPeriodMinutes:Int enabled:Boolean!federatedAuthenticationConstraint:String!federatedauthenticationconstraintid:String markForDelete:Boolean!migrateLegacyUsers:Boolean!tenantDescription:String tenantId:String!tenantName:String!tenantType:String!tenanttypeid:String verifyEmailOnSelfRegistration:Boolean!}input TenantAnonymousUserConfigInput{defaultcountrycode:String defaultlangugecode:String tenantId:String!tokenttlseconds:Int!}type TenantAnonymousUserConfiguration{defaultcountrycode:String defaultlangugecode:String tenantId:String!tokenttlseconds:Int!}type TenantAvailableScope{accessRuleId:String scopeId:String!tenantId:String!}input TenantCreateInput{allowAnonymousUsers:Boolean!allowForgotPassword:Boolean!allowLoginByPhoneNumber:Boolean!allowSocialLogin:Boolean!allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!defaultRateLimit:Int defaultRateLimitPeriodMinutes:Int enabled:Boolean!federatedAuthenticationConstraint:String!migrateLegacyUsers:Boolean!tenantDescription:String tenantId:String!tenantName:String!tenantType:String!verifyEmailOnSelfRegistration:Boolean!}type TenantLegacyUserMigrationConfig{authenticationUri:String!tenantId:String!userProfileUri:String!usernameCheckUri:String!}input TenantLegacyUserMigrationConfigInput{authenticationUri:String!tenantId:String!userProfileUri:String!usernameCheckUri:String!}type TenantLookAndFeel{adminheaderbackgroundcolor:String adminheadertext:String adminheadertextcolor:String adminlogo:String authenticationheaderbackgroundcolor:String authenticationheadertext:String authenticationheadertextcolor:String authenticationlogo:String authenticationlogomimetype:String footerlinks:[FooterLink]tenantid:String!}input TenantLookAndFeelInput{adminheaderbackgroundcolor:String adminheadertext:String adminheadertextcolor:String adminlogo:String authenticationheaderbackgroundcolor:String authenticationheadertext:String authenticationheadertextcolor:String authenticationlogo:String authenticationlogomimetype:String footerlinks:[FooterLinkInput]tenantid:String!}type TenantManagementDomainRel{domain:String!tenantId:String!}type TenantMetaData{tenant:Tenant!tenantLookAndFeel:TenantLookAndFeel}type TenantPasswordConfig{allowMfa:Boolean!maxRepeatingCharacterLength:Int mfaTypesAllowed:String mfaTypesRequired:String passwordHashingAlgorithm:String!passwordHistoryPeriod:Int passwordMaxLength:Int!passwordMinLength:Int!passwordRotationPeriodDays:Int requireLowerCase:Boolean!requireMfa:Boolean!requireNumbers:Boolean!requireSpecialCharacters:Boolean!requireUpperCase:Boolean!specialCharactersAllowed:String tenantId:String!}type TenantRateLimitRel{allowUnlimitedRate:Boolean rateLimit:Int rateLimitPeriodMinutes:Int servicegroupid:String!tenantId:String!}type TenantRateLimitRelView{allowUnlimitedRate:Boolean rateLimit:Int rateLimitPeriodMinutes:Int servicegroupid:String!servicegroupname:String!tenantId:String!tenantName:String!}type TenantRestrictedAuthenticationDomainRel{domain:String!tenantId:String!}type TenantSupportedClaimRel{claim:String!tenantId:String!}input TenantUpdateInput{allowAnonymousUsers:Boolean!allowForgotPassword:Boolean!allowLoginByPhoneNumber:Boolean!allowSocialLogin:Boolean!allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!defaultRateLimit:Int defaultRateLimitPeriodMinutes:Int enabled:Boolean!federatedAuthenticationConstraint:String!migrateLegacyUsers:Boolean!tenantDescription:String tenantId:String!tenantName:String!tenantType:String!verifyEmailOnSelfRegistration:Boolean!}type User{address:String addressLine1:String city:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!markForDelete:Boolean!middleName:String nameOrder:String!phoneNumber:String postalCode:String preferredLanguageCode:String stateRegionProvince:String userId:String!}input UserCreateInput{address:String addressLine1:String city:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!middleName:String nameOrder:String!phoneNumber:String postalCode:String preferredLanguageCode:String stateRegionProvince:String}type UserCredential{dateCreated:String!hashedPassword:String!hashingAlgorithm:String!salt:String!userId:String!}type UserFailedLoginAttempts{failureAtMS:Float!userId:String!}type UserMFARel{fido2CredentialId:String fido2KeySupportsCounters:Boolean fido2PublicKey:String fido2PublicKeyAlgorithm:Int fido2Transports:String mfaType:String!primaryMfa:Boolean!totpHashAlgorithm:String totpSecret:String userId:String!}type UserScopeRel{scopeId:String!tenantId:String!userId:String!}type UserSession{clientId:String!clientName:String!tenantId:String!tenantName:String!userId:String!}type UserTenantRel{enabled:Boolean!relType:String!tenantId:String!userId:String!}type UserTenantRelView{relType:String!tenantId:String!tenantName:String!userId:String!}input UserUpdateInput{address:String addressLine1:String city:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!middleName:String nameOrder:String!phoneNumber:String postalCode:String preferredLanguageCode:String stateRegionProvince:String userId:String!}`);