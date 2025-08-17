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

export enum AuthenticationState {
  AcceptTermsAndConditions = 'ACCEPT_TERMS_AND_CONDITIONS',
  AuthWithFederatedOidc = 'AUTH_WITH_FEDERATED_OIDC',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  ConfigureSecurityKey = 'CONFIGURE_SECURITY_KEY',
  ConfigureTotp = 'CONFIGURE_TOTP',
  EnterEmail = 'ENTER_EMAIL',
  EnterPassword = 'ENTER_PASSWORD',
  EnterPasswordAndMigrateUser = 'ENTER_PASSWORD_AND_MIGRATE_USER',
  EnterUserCode = 'ENTER_USER_CODE',
  Error = 'ERROR',
  Expired = 'EXPIRED',
  PostAuthnStateSendSecurityEventDeviceRegistered = 'POST_AUTHN_STATE_SEND_SECURITY_EVENT_DEVICE_REGISTERED',
  PostAuthnStateSendSecurityEventDuressLogon = 'POST_AUTHN_STATE_SEND_SECURITY_EVENT_DURESS_LOGON',
  PostAuthnStateSendSecurityEventSuccessLogon = 'POST_AUTHN_STATE_SEND_SECURITY_EVENT_SUCCESS_LOGON',
  RedirectBackToApplication = 'REDIRECT_BACK_TO_APPLICATION',
  RedirectToIamPortal = 'REDIRECT_TO_IAM_PORTAL',
  Register = 'REGISTER',
  RotatePassword = 'ROTATE_PASSWORD',
  SelectTenant = 'SELECT_TENANT',
  SelectTenantThenRegister = 'SELECT_TENANT_THEN_REGISTER',
  ValidatePasswordResetToken = 'VALIDATE_PASSWORD_RESET_TOKEN',
  ValidateSecurityKey = 'VALIDATE_SECURITY_KEY',
  ValidateTotp = 'VALIDATE_TOTP'
}

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

export type AuthorizationDeviceCodeData = {
  __typename?: 'AuthorizationDeviceCodeData';
  authorizationStatus: DeviceCodeAuthorizationStatus;
  clientId: Scalars['String']['output'];
  deviceCode: Scalars['String']['output'];
  deviceCodeId: Scalars['String']['output'];
  expiresAtMs: Scalars['Float']['output'];
  scope: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userCode: Scalars['String']['output'];
  userId?: Maybe<Scalars['String']['output']>;
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

export type AuthorizationReturnUri = {
  __typename?: 'AuthorizationReturnUri';
  code: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
  uri: Scalars['String']['output'];
};

export type AutoCreateSigningKeyInput = {
  commonName: Scalars['String']['input'];
  expiresAtMs: Scalars['Float']['input'];
  keyName: Scalars['String']['input'];
  keyType: Scalars['String']['input'];
  keyTypeId?: InputMaybe<Scalars['String']['input']>;
  keyUse: Scalars['String']['input'];
  organizationName: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
};

export type BulkScopeInput = {
  accessRuleId?: InputMaybe<Scalars['String']['input']>;
  scopeId: Scalars['String']['input'];
};

export type CaptchaConfig = {
  __typename?: 'CaptchaConfig';
  alias: Scalars['String']['output'];
  apiKey: Scalars['String']['output'];
  minScopeThreshold?: Maybe<Scalars['Float']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  siteKey: Scalars['String']['output'];
  useCaptchaV3: Scalars['Boolean']['output'];
};

export type CaptchaConfigInput = {
  alias: Scalars['String']['input'];
  apiKey: Scalars['String']['input'];
  minScopeThreshold?: InputMaybe<Scalars['Float']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  siteKey: Scalars['String']['input'];
  useCaptchaV3: Scalars['Boolean']['input'];
};

export type CategoryEntry = {
  __typename?: 'CategoryEntry';
  categoryKey: Scalars['String']['output'];
  categoryValue: Scalars['String']['output'];
};

export type ChangeEvent = {
  __typename?: 'ChangeEvent';
  changeEventClass: Scalars['String']['output'];
  changeEventId: Scalars['String']['output'];
  changeEventType: Scalars['String']['output'];
  changeTimestamp: Scalars['Float']['output'];
  changedBy: Scalars['String']['output'];
  data: Scalars['String']['output'];
  objectId: Scalars['String']['output'];
};

export type Client = {
  __typename?: 'Client';
  audience?: Maybe<Scalars['String']['output']>;
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
  audience?: InputMaybe<Scalars['String']['input']>;
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
  audience?: InputMaybe<Scalars['String']['input']>;
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

export enum DeviceCodeAuthorizationStatus {
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Pending = 'PENDING'
}

export enum EmailChangeState {
  Completed = 'COMPLETED',
  EnterEmail = 'ENTER_EMAIL',
  Error = 'ERROR',
  ValidateEmail = 'VALIDATE_EMAIL'
}

export type ErrorDetail = {
  __typename?: 'ErrorDetail';
  errorCode: Scalars['String']['output'];
  errorKey?: Maybe<Scalars['String']['output']>;
  errorMessage: Scalars['String']['output'];
};

export type FederatedOidcAuthorizationRel = {
  __typename?: 'FederatedOIDCAuthorizationRel';
  codeVerifier?: Maybe<Scalars['String']['output']>;
  codechallengemethod?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  expiresAtMs: Scalars['Float']['output'];
  federatedOIDCAuthorizationRelType: FederatedOidcAuthorizationRelType;
  federatedOIDCProviderId: Scalars['String']['output'];
  initClientId?: Maybe<Scalars['String']['output']>;
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
  userId?: Maybe<Scalars['String']['output']>;
};

export enum FederatedOidcAuthorizationRelType {
  AuthorizationRelTypeClientAuth = 'AUTHORIZATION_REL_TYPE_CLIENT_AUTH',
  AuthorizationRelTypePortalAuth = 'AUTHORIZATION_REL_TYPE_PORTAL_AUTH'
}

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

export type JobData = {
  __typename?: 'JobData';
  markForDeleteItems: Array<MarkForDelete>;
  schedulerLocks: Array<SchedulerLock>;
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
  completedDate?: Maybe<Scalars['Float']['output']>;
  markForDeleteId: Scalars['String']['output'];
  objectId: Scalars['String']['output'];
  objectType: MarkForDeleteObjectType;
  startedDate?: Maybe<Scalars['Float']['output']>;
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
  authenticateAcceptTermsAndConditions: UserAuthenticationStateResponse;
  authenticateConfigureTOTP: UserAuthenticationStateResponse;
  authenticateHandleForgotPassword: UserAuthenticationStateResponse;
  authenticateHandleUserCodeInput: UserAuthenticationStateResponse;
  authenticateHandleUserNameInput: UserAuthenticationStateResponse;
  authenticateRegisterSecurityKey: UserAuthenticationStateResponse;
  authenticateRotatePassword: UserAuthenticationStateResponse;
  authenticateUser: UserAuthenticationStateResponse;
  authenticateUserAndMigrate: UserAuthenticationStateResponse;
  authenticateValidatePasswordResetToken: UserAuthenticationStateResponse;
  authenticateValidateSecurityKey: UserAuthenticationStateResponse;
  authenticateValidateTOTP: UserAuthenticationStateResponse;
  authenticateWithSocialOIDCProvider: UserAuthenticationStateResponse;
  autoCreateSigningKey: SigningKey;
  bulkAssignScopeToAuthorizationGroup: Array<AuthorizationGroupScopeRel>;
  bulkAssignScopeToClient: Array<ClientScopeRel>;
  bulkAssignScopeToTenant: Array<TenantAvailableScope>;
  bulkAssignScopeToUser: Array<UserScopeRel>;
  cancelAuthentication: UserAuthenticationStateResponse;
  cancelRegistration: UserRegistrationStateResponse;
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
  deleteFIDOKey?: Maybe<Scalars['String']['output']>;
  deleteRecoveryEmail: Scalars['Boolean']['output'];
  deleteSchedulerLock: Scalars['String']['output'];
  deleteScopeAccessRuleSchema: Scalars['String']['output'];
  deleteTOTP?: Maybe<Scalars['String']['output']>;
  deleteUserSession?: Maybe<Scalars['String']['output']>;
  enterSecretValue: Scalars['Boolean']['output'];
  generateSecretShareLink: Scalars['Boolean']['output'];
  generateTOTP: TotpResponse;
  markForDelete?: Maybe<MarkForDelete>;
  profileAddRecoveryEmail: ProfileEmailChangeResponse;
  profileCancelEmailChange: ProfileEmailChangeResponse;
  profileHandleEmailChange: ProfileEmailChangeResponse;
  profileValidateEmail: ProfileEmailChangeResponse;
  registerAddDuressPassword: UserRegistrationStateResponse;
  registerAddRecoveryEmail: UserRegistrationStateResponse;
  registerConfigureSecurityKey: UserRegistrationStateResponse;
  registerConfigureTOTP: UserRegistrationStateResponse;
  registerUser: UserRegistrationStateResponse;
  registerValidateSecurityKey: UserRegistrationStateResponse;
  registerValidateTOTP: UserRegistrationStateResponse;
  registerVerifyEmailAddress: UserRegistrationStateResponse;
  registerVerifyRecoveryEmail: UserRegistrationStateResponse;
  removeAuthenticationGroupFromClient?: Maybe<Scalars['String']['output']>;
  removeCaptchaConfig: Scalars['String']['output'];
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
  removeTenantLoginFailurePolicy: Scalars['String']['output'];
  removeTenantLookAndFeel?: Maybe<Scalars['String']['output']>;
  removeTenantPasswordConfig?: Maybe<Scalars['String']['output']>;
  removeUserFromAuthenticationGroup?: Maybe<Scalars['String']['output']>;
  removeUserFromAuthorizationGroup?: Maybe<Scalars['String']['output']>;
  removeUserFromTenant?: Maybe<Scalars['String']['output']>;
  rotatePassword?: Maybe<Scalars['Boolean']['output']>;
  setCaptchaConfig: CaptchaConfig;
  setTenantAnonymousUserConfig?: Maybe<TenantAnonymousUserConfiguration>;
  setTenantLegacyUserMigrationConfig?: Maybe<TenantLegacyUserMigrationConfig>;
  setTenantLoginFailurePolicy: TenantLoginFailurePolicy;
  setTenantLookAndFeel?: Maybe<TenantLookAndFeel>;
  setTenantPasswordConfig?: Maybe<TenantPasswordConfig>;
  swapPrimaryAndRecoveryEmail: Scalars['Boolean']['output'];
  unlockUser?: Maybe<Scalars['Boolean']['output']>;
  updateAccessRule?: Maybe<AccessRule>;
  updateAuthenticationGroup?: Maybe<AuthenticationGroup>;
  updateAuthorizationGroup?: Maybe<AuthorizationGroup>;
  updateClient?: Maybe<Client>;
  updateFederatedOIDCProvider?: Maybe<FederatedOidcProvider>;
  updateRateLimitForTenant?: Maybe<TenantRateLimitRel>;
  updateRateLimitServiceGroup?: Maybe<RateLimitServiceGroup>;
  updateRootTenant?: Maybe<Tenant>;
  updateScope?: Maybe<Scope>;
  updateScopeAccessRuleSchema?: Maybe<ScopeAccessRuleSchema>;
  updateSigningKey: SigningKey;
  updateSystemSettings: SystemSettings;
  updateTenant?: Maybe<Tenant>;
  updateUser: User;
  updateUserTenantRel: UserTenantRel;
  validateTOTP: Scalars['Boolean']['output'];
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


export type MutationAuthenticateAcceptTermsAndConditionsArgs = {
  accepted: Scalars['Boolean']['input'];
  authenticationSessionToken: Scalars['String']['input'];
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAuthenticateConfigureTotpArgs = {
  authenticationSessionToken: Scalars['String']['input'];
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationAuthenticateHandleForgotPasswordArgs = {
  authenticationSessionToken: Scalars['String']['input'];
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  useRecoveryEmail: Scalars['Boolean']['input'];
};


export type MutationAuthenticateHandleUserCodeInputArgs = {
  userCode: Scalars['String']['input'];
};


export type MutationAuthenticateHandleUserNameInputArgs = {
  deviceCodeId?: InputMaybe<Scalars['String']['input']>;
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  returnToUri?: InputMaybe<Scalars['String']['input']>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
  username: Scalars['String']['input'];
};


export type MutationAuthenticateRegisterSecurityKeyArgs = {
  authenticationSessionToken: Scalars['String']['input'];
  fido2KeyRegistrationInput: Fido2KeyRegistrationInput;
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationAuthenticateRotatePasswordArgs = {
  authenticationSessionToken: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationAuthenticateUserArgs = {
  authenticationSessionToken: Scalars['String']['input'];
  password: Scalars['String']['input'];
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationAuthenticateUserAndMigrateArgs = {
  authenticationSessionToken: Scalars['String']['input'];
  password: Scalars['String']['input'];
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationAuthenticateValidatePasswordResetTokenArgs = {
  authenticationSessionToken: Scalars['String']['input'];
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
};


export type MutationAuthenticateValidateSecurityKeyArgs = {
  authenticationSessionToken: Scalars['String']['input'];
  fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput;
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationAuthenticateValidateTotpArgs = {
  authenticationSessionToken: Scalars['String']['input'];
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  totpTokenValue: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationAuthenticateWithSocialOidcProviderArgs = {
  federatedOIDCProviderId: Scalars['String']['input'];
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
};


export type MutationAutoCreateSigningKeyArgs = {
  keyInput: AutoCreateSigningKeyInput;
};


export type MutationBulkAssignScopeToAuthorizationGroupArgs = {
  bulkScopeInput: Array<BulkScopeInput>;
  groupId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationBulkAssignScopeToClientArgs = {
  bulkScopeInput: Array<BulkScopeInput>;
  clientId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationBulkAssignScopeToTenantArgs = {
  bulkScopeInput: Array<BulkScopeInput>;
  tenantId: Scalars['String']['input'];
};


export type MutationBulkAssignScopeToUserArgs = {
  bulkScopeInput: Array<BulkScopeInput>;
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationCancelAuthenticationArgs = {
  authenticationSessionToken: Scalars['String']['input'];
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationCancelRegistrationArgs = {
  deviceCodeId?: InputMaybe<Scalars['String']['input']>;
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  registrationSessionToken: Scalars['String']['input'];
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
  sessionToken?: InputMaybe<Scalars['String']['input']>;
  sessionTokenType?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationCreateFido2RegistrationChallengeArgs = {
  sessionToken?: InputMaybe<Scalars['String']['input']>;
  sessionTokenType?: InputMaybe<Scalars['String']['input']>;
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


export type MutationDeleteFidoKeyArgs = {
  userId: Scalars['String']['input'];
};


export type MutationDeleteRecoveryEmailArgs = {
  userId: Scalars['String']['input'];
};


export type MutationDeleteSchedulerLockArgs = {
  instanceId: Scalars['String']['input'];
};


export type MutationDeleteScopeAccessRuleSchemaArgs = {
  scopeAccessRuleSchemaId: Scalars['String']['input'];
};


export type MutationDeleteTotpArgs = {
  userId: Scalars['String']['input'];
};


export type MutationDeleteUserSessionArgs = {
  clientId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationEnterSecretValueArgs = {
  otp: Scalars['String']['input'];
  secretValue: Scalars['String']['input'];
};


export type MutationGenerateSecretShareLinkArgs = {
  email: Scalars['String']['input'];
  objectId: Scalars['String']['input'];
  secretShareObjectType: SecretShareObjectType;
};


export type MutationGenerateTotpArgs = {
  userId: Scalars['String']['input'];
};


export type MutationMarkForDeleteArgs = {
  markForDeleteInput: MarkForDeleteInput;
};


export type MutationProfileAddRecoveryEmailArgs = {
  recoveryEmail: Scalars['String']['input'];
};


export type MutationProfileCancelEmailChangeArgs = {
  changeEmailSessionToken: Scalars['String']['input'];
};


export type MutationProfileHandleEmailChangeArgs = {
  newEmail: Scalars['String']['input'];
};


export type MutationProfileValidateEmailArgs = {
  changeEmailSessionToken: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationRegisterAddDuressPasswordArgs = {
  password?: InputMaybe<Scalars['String']['input']>;
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  registrationSessionToken: Scalars['String']['input'];
  skip: Scalars['Boolean']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRegisterAddRecoveryEmailArgs = {
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  recoveryEmail?: InputMaybe<Scalars['String']['input']>;
  registrationSessionToken: Scalars['String']['input'];
  skip: Scalars['Boolean']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRegisterConfigureSecurityKeyArgs = {
  fido2KeyRegistrationInput?: InputMaybe<Fido2KeyRegistrationInput>;
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  registrationSessionToken: Scalars['String']['input'];
  skip: Scalars['Boolean']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRegisterConfigureTotpArgs = {
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  registrationSessionToken: Scalars['String']['input'];
  skip: Scalars['Boolean']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRegisterUserArgs = {
  deviceCodeId?: InputMaybe<Scalars['String']['input']>;
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  userInput: UserCreateInput;
};


export type MutationRegisterValidateSecurityKeyArgs = {
  fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput;
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  registrationSessionToken: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRegisterValidateTotpArgs = {
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  registrationSessionToken: Scalars['String']['input'];
  totpTokenValue: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRegisterVerifyEmailAddressArgs = {
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  registrationSessionToken: Scalars['String']['input'];
  token: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRegisterVerifyRecoveryEmailArgs = {
  preAuthToken?: InputMaybe<Scalars['String']['input']>;
  registrationSessionToken: Scalars['String']['input'];
  token: Scalars['String']['input'];
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


export type MutationRemoveTenantLoginFailurePolicyArgs = {
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


export type MutationRotatePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationSetCaptchaConfigArgs = {
  captchaConfigInput: CaptchaConfigInput;
};


export type MutationSetTenantAnonymousUserConfigArgs = {
  tenantAnonymousUserConfigInput: TenantAnonymousUserConfigInput;
};


export type MutationSetTenantLegacyUserMigrationConfigArgs = {
  tenantLegacyUserMigrationConfigInput: TenantLegacyUserMigrationConfigInput;
};


export type MutationSetTenantLoginFailurePolicyArgs = {
  tenantLoginFailurePolicyInput: TenantLoginFailurePolicyInput;
};


export type MutationSetTenantLookAndFeelArgs = {
  tenantLookAndFeelInput: TenantLookAndFeelInput;
};


export type MutationSetTenantPasswordConfigArgs = {
  passwordConfigInput: PasswordConfigInput;
};


export type MutationUnlockUserArgs = {
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


export type MutationUpdateSystemSettingsArgs = {
  systemSettingsUpdateInput: SystemSettingsUpdateInput;
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


export type MutationValidateTotpArgs = {
  totpToken: Scalars['String']['input'];
  userId: Scalars['String']['input'];
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
  maxRepeatingCharacterLength?: InputMaybe<Scalars['Int']['input']>;
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
  addressLine1?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  domain: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  enabled: Scalars['Boolean']['output'];
  expiresAtMs: Scalars['Float']['output'];
  federatedOIDCProviderSubjectId?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  locked: Scalars['Boolean']['output'];
  managementAccessTenantId?: Maybe<Scalars['String']['output']>;
  middleName?: Maybe<Scalars['String']['output']>;
  nameOrder: Scalars['String']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  preferredLanguageCode?: Maybe<Scalars['String']['output']>;
  principalType: Scalars['String']['output'];
  recoveryEmail?: Maybe<UserRecoveryEmail>;
  scope: Array<Scope>;
  stateRegionProvince?: Maybe<Scalars['String']['output']>;
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

export type ProfileEmailChangeResponse = {
  __typename?: 'ProfileEmailChangeResponse';
  profileEmailChangeError?: Maybe<ErrorDetail>;
  profileEmailChangeState: ProfileEmailChangeState;
};

export type ProfileEmailChangeState = {
  __typename?: 'ProfileEmailChangeState';
  changeEmailSessionToken: Scalars['String']['output'];
  changeOrder: Scalars['Int']['output'];
  changeStateStatus: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailChangeState: EmailChangeState;
  expiresAtMs: Scalars['Float']['output'];
  isPrimaryEmail: Scalars['Boolean']['output'];
  userId: Scalars['String']['output'];
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
  getCaptchaConfig?: Maybe<CaptchaConfig>;
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
  getMarkForDeleteById?: Maybe<MarkForDelete>;
  getRateLimitServiceGroupById?: Maybe<RateLimitServiceGroup>;
  getRateLimitServiceGroups: Array<RateLimitServiceGroup>;
  getRateLimitTenantRelViews: Array<TenantRateLimitRelView>;
  getRateLimitTenantRels: Array<TenantRateLimitRel>;
  getRedirectURIs: Array<Scalars['String']['output']>;
  getRootTenant: Tenant;
  getRunningJobs: JobData;
  getSchedulerLocks?: Maybe<Array<Maybe<SchedulerLock>>>;
  getScope: Array<Scope>;
  getScopeAccessRuleSchemaById?: Maybe<ScopeAccessRuleSchema>;
  getScopeAccessRuleSchemas: Array<ScopeAccessRuleSchema>;
  getScopeById?: Maybe<Scope>;
  getSecretValue?: Maybe<Scalars['String']['output']>;
  getSigningKeyById?: Maybe<SigningKey>;
  getSigningKeys: Array<SigningKey>;
  getStateProvinceRegions: Array<StateProvinceRegion>;
  getSystemSettings: SystemSettings;
  getTenantById?: Maybe<Tenant>;
  getTenantLoginFailurePolicy?: Maybe<TenantLoginFailurePolicy>;
  getTenantLookAndFeel?: Maybe<TenantLookAndFeel>;
  getTenantMetaData?: Maybe<TenantMetaData>;
  getTenantPasswordConfig?: Maybe<TenantPasswordConfig>;
  getTenants: Array<Tenant>;
  getUserAuthorizationGroups: Array<AuthorizationGroup>;
  getUserById?: Maybe<User>;
  getUserMFARels: Array<UserMfaRel>;
  getUserRecoveryEmail?: Maybe<UserRecoveryEmail>;
  getUserScopes: Array<Scope>;
  getUserSessions: Array<UserSession>;
  getUserTenantRels: Array<UserTenantRelView>;
  getUsers: Array<User>;
  lookahead: Array<LookaheadResult>;
  me?: Maybe<PortalUserProfile>;
  relSearch: RelSearchResults;
  search: ObjectSearchResults;
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
  filterBy: ScopeFilterCriteria;
  tenantId: Scalars['String']['input'];
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


export type QueryGetTenantLoginFailurePolicyArgs = {
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


export type QueryGetUserRecoveryEmailArgs = {
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
  codeChallenge?: Maybe<Scalars['String']['output']>;
  codeChallengeMethod?: Maybe<Scalars['String']['output']>;
  expiresAtMs: Scalars['Float']['output'];
  redirecturi: Scalars['String']['output'];
  refreshCount: Scalars['Int']['output'];
  refreshToken: Scalars['String']['output'];
  refreshTokenClientType: Scalars['String']['output'];
  scope: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export enum RegistrationState {
  AddDuressPasswordOptional = 'ADD_DURESS_PASSWORD_OPTIONAL',
  AddRecoveryEmailOptional = 'ADD_RECOVERY_EMAIL_OPTIONAL',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  ConfigureSecurityKeyOptional = 'CONFIGURE_SECURITY_KEY_OPTIONAL',
  ConfigureSecurityKeyRequired = 'CONFIGURE_SECURITY_KEY_REQUIRED',
  ConfigureTotpOptional = 'CONFIGURE_TOTP_OPTIONAL',
  ConfigureTotpRequired = 'CONFIGURE_TOTP_REQUIRED',
  Error = 'ERROR',
  Expired = 'EXPIRED',
  RedirectBackToApplication = 'REDIRECT_BACK_TO_APPLICATION',
  RedirectToIamPortal = 'REDIRECT_TO_IAM_PORTAL',
  Unregistered = 'UNREGISTERED',
  ValidateEmail = 'VALIDATE_EMAIL',
  ValidateRecoveryEmail = 'VALIDATE_RECOVERY_EMAIL',
  ValidateSecurityKey = 'VALIDATE_SECURITY_KEY',
  ValidateTotp = 'VALIDATE_TOTP'
}

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
  scopeUse: Scalars['String']['input'];
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
  SecurityKey = 'SECURITY_KEY',
  Totp = 'TOTP'
}

export enum SecretObjectType {
  ClientSecret = 'CLIENT_SECRET',
  OidcProviderClientSecret = 'OIDC_PROVIDER_CLIENT_SECRET',
  PrivateKey = 'PRIVATE_KEY',
  PrivateKeyPassword = 'PRIVATE_KEY_PASSWORD'
}

export type SecretShare = {
  __typename?: 'SecretShare';
  expiresAtMs: Scalars['Float']['output'];
  objectId: Scalars['String']['output'];
  otp: Scalars['String']['output'];
  secretShareId: Scalars['String']['output'];
  secretShareObjectType: SecretShareObjectType;
};

export enum SecretShareObjectType {
  OidcProvider = 'OIDC_PROVIDER'
}

export type SigningKey = {
  __typename?: 'SigningKey';
  certificate?: Maybe<Scalars['String']['output']>;
  createdAtMs: Scalars['Float']['output'];
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

export type SystemCategory = {
  __typename?: 'SystemCategory';
  categoryEntries: Array<CategoryEntry>;
  categoryName: Scalars['String']['output'];
};

export type SystemSettings = {
  __typename?: 'SystemSettings';
  allowDuressPassword: Scalars['Boolean']['output'];
  allowRecoveryEmail: Scalars['Boolean']['output'];
  auditRecordRetentionPeriodDays?: Maybe<Scalars['Int']['output']>;
  enablePortalAsLegacyIdp: Scalars['Boolean']['output'];
  rootClientId: Scalars['String']['output'];
  softwareVersion: Scalars['String']['output'];
  systemCategories: Array<SystemCategory>;
  systemId: Scalars['String']['output'];
};

export type SystemSettingsUpdateInput = {
  allowDuressPassword: Scalars['Boolean']['input'];
  allowRecoveryEmail: Scalars['Boolean']['input'];
  auditRecordRetentionPeriodDays?: InputMaybe<Scalars['Int']['input']>;
  enablePortalAsLegacyIdp: Scalars['Boolean']['input'];
  rootClientId: Scalars['String']['input'];
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
  registrationRequireCaptcha: Scalars['Boolean']['output'];
  registrationRequireTermsAndConditions: Scalars['Boolean']['output'];
  tenantDescription?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
  tenantType: Scalars['String']['output'];
  tenanttypeid?: Maybe<Scalars['String']['output']>;
  termsAndConditionsUri?: Maybe<Scalars['String']['output']>;
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
  registrationRequireCaptcha: Scalars['Boolean']['input'];
  registrationRequireTermsAndConditions: Scalars['Boolean']['input'];
  tenantDescription?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  tenantName: Scalars['String']['input'];
  tenantType: Scalars['String']['input'];
  termsAndConditionsUri?: InputMaybe<Scalars['String']['input']>;
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

export type TenantLoginFailurePolicy = {
  __typename?: 'TenantLoginFailurePolicy';
  failureThreshold: Scalars['Int']['output'];
  loginFailurePolicyType: Scalars['String']['output'];
  maximumLoginFailures?: Maybe<Scalars['Int']['output']>;
  pauseDurationMinutes?: Maybe<Scalars['Int']['output']>;
  tenantId: Scalars['String']['output'];
};

export type TenantLoginFailurePolicyInput = {
  failureThreshold: Scalars['Int']['input'];
  loginFailurePolicyType: Scalars['String']['input'];
  maximumLoginFailures?: InputMaybe<Scalars['Int']['input']>;
  pauseDurationMinutes?: InputMaybe<Scalars['Int']['input']>;
  tenantId: Scalars['String']['input'];
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
  systemSettings: SystemSettings;
  tenant: Tenant;
  tenantLookAndFeel?: Maybe<TenantLookAndFeel>;
};

export type TenantPasswordConfig = {
  __typename?: 'TenantPasswordConfig';
  maxRepeatingCharacterLength?: Maybe<Scalars['Int']['output']>;
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

export type TenantSelectorData = {
  __typename?: 'TenantSelectorData';
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
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
  registrationRequireCaptcha: Scalars['Boolean']['input'];
  registrationRequireTermsAndConditions: Scalars['Boolean']['input'];
  tenantDescription?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
  tenantName: Scalars['String']['input'];
  tenantType: Scalars['String']['input'];
  termsAndConditionsUri?: InputMaybe<Scalars['String']['input']>;
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
  recoveryEmail?: Maybe<UserRecoveryEmail>;
  stateRegionProvince?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserAuthenticationState = {
  __typename?: 'UserAuthenticationState';
  authenticationSessionToken: Scalars['String']['output'];
  authenticationState: AuthenticationState;
  authenticationStateOrder: Scalars['Int']['output'];
  authenticationStateStatus: Scalars['String']['output'];
  deviceCodeId?: Maybe<Scalars['String']['output']>;
  expiresAtMs: Scalars['Float']['output'];
  preAuthToken?: Maybe<Scalars['String']['output']>;
  returnToUri?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserAuthenticationStateResponse = {
  __typename?: 'UserAuthenticationStateResponse';
  accessToken?: Maybe<Scalars['String']['output']>;
  authenticationError?: Maybe<ErrorDetail>;
  availableTenants?: Maybe<Array<TenantSelectorData>>;
  passwordConfig?: Maybe<TenantPasswordConfig>;
  tokenExpiresAtMs?: Maybe<Scalars['Float']['output']>;
  totpSecret?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
  userAuthenticationState: UserAuthenticationState;
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
  password: Scalars['String']['input'];
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  preferredLanguageCode?: InputMaybe<Scalars['String']['input']>;
  stateRegionProvince?: InputMaybe<Scalars['String']['input']>;
  termsAndConditionsAccepted: Scalars['Boolean']['input'];
};

export type UserCredential = {
  __typename?: 'UserCredential';
  dateCreated: Scalars['String']['output'];
  hashedPassword: Scalars['String']['output'];
  hashingAlgorithm: Scalars['String']['output'];
  salt: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserFailedLogin = {
  __typename?: 'UserFailedLogin';
  failureAtMs: Scalars['Float']['output'];
  failureCount: Scalars['Float']['output'];
  nextLoginNotBefore: Scalars['Float']['output'];
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

export type UserRecoveryEmail = {
  __typename?: 'UserRecoveryEmail';
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  userId: Scalars['String']['output'];
};

export type UserRegistrationState = {
  __typename?: 'UserRegistrationState';
  deviceCodeId?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  expiresAtMs: Scalars['Float']['output'];
  preAuthToken?: Maybe<Scalars['String']['output']>;
  registrationSessionToken: Scalars['String']['output'];
  registrationState: RegistrationState;
  registrationStateOrder: Scalars['Int']['output'];
  registrationStateStatus: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserRegistrationStateResponse = {
  __typename?: 'UserRegistrationStateResponse';
  accessToken?: Maybe<Scalars['String']['output']>;
  registrationError?: Maybe<ErrorDetail>;
  tokenExpiresAtMs?: Maybe<Scalars['Float']['output']>;
  totpSecret?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
  userRegistrationState: UserRegistrationState;
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

export type UserTermsAndConditionsAccepted = {
  __typename?: 'UserTermsAndConditionsAccepted';
  acceptedAtMs: Scalars['Float']['output'];
  tenantId: Scalars['String']['output'];
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
  AuthenticationState: AuthenticationState;
  AuthenticatorAttestationResponseInput: AuthenticatorAttestationResponseInput;
  AuthenticatorAuthenticationResponseInput: AuthenticatorAuthenticationResponseInput;
  AuthorizationCodeData: ResolverTypeWrapper<AuthorizationCodeData>;
  AuthorizationDeviceCodeData: ResolverTypeWrapper<AuthorizationDeviceCodeData>;
  AuthorizationGroup: ResolverTypeWrapper<AuthorizationGroup>;
  AuthorizationGroupCreateInput: AuthorizationGroupCreateInput;
  AuthorizationGroupScopeRel: ResolverTypeWrapper<AuthorizationGroupScopeRel>;
  AuthorizationGroupUpdateInput: AuthorizationGroupUpdateInput;
  AuthorizationGroupUserRel: ResolverTypeWrapper<AuthorizationGroupUserRel>;
  AuthorizationReturnUri: ResolverTypeWrapper<AuthorizationReturnUri>;
  AutoCreateSigningKeyInput: AutoCreateSigningKeyInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BulkScopeInput: BulkScopeInput;
  CaptchaConfig: ResolverTypeWrapper<CaptchaConfig>;
  CaptchaConfigInput: CaptchaConfigInput;
  CategoryEntry: ResolverTypeWrapper<CategoryEntry>;
  ChangeEvent: ResolverTypeWrapper<ChangeEvent>;
  Client: ResolverTypeWrapper<Client>;
  ClientAuthHistory: ResolverTypeWrapper<ClientAuthHistory>;
  ClientCreateInput: ClientCreateInput;
  ClientScopeRel: ResolverTypeWrapper<ClientScopeRel>;
  ClientUpdateInput: ClientUpdateInput;
  Contact: ResolverTypeWrapper<Contact>;
  ContactCreateInput: ContactCreateInput;
  DeletionStatus: ResolverTypeWrapper<DeletionStatus>;
  DeviceCodeAuthorizationStatus: DeviceCodeAuthorizationStatus;
  EmailChangeState: EmailChangeState;
  ErrorDetail: ResolverTypeWrapper<ErrorDetail>;
  FederatedOIDCAuthorizationRel: ResolverTypeWrapper<FederatedOidcAuthorizationRel>;
  FederatedOIDCAuthorizationRelType: FederatedOidcAuthorizationRelType;
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
  JobData: ResolverTypeWrapper<JobData>;
  LookaheadItem: ResolverTypeWrapper<LookaheadItem>;
  LookaheadResult: ResolverTypeWrapper<LookaheadResult>;
  MarkForDelete: ResolverTypeWrapper<MarkForDelete>;
  MarkForDeleteInput: MarkForDeleteInput;
  MarkForDeleteObjectType: MarkForDeleteObjectType;
  Mutation: ResolverTypeWrapper<{}>;
  ObjectSearchResultItem: ResolverTypeWrapper<ObjectSearchResultItem>;
  ObjectSearchResults: ResolverTypeWrapper<ObjectSearchResults>;
  PasswordConfigInput: PasswordConfigInput;
  PortalUserProfile: ResolverTypeWrapper<PortalUserProfile>;
  PreAuthenticationState: ResolverTypeWrapper<PreAuthenticationState>;
  ProfileEmailChangeResponse: ResolverTypeWrapper<ProfileEmailChangeResponse>;
  ProfileEmailChangeState: ResolverTypeWrapper<ProfileEmailChangeState>;
  Query: ResolverTypeWrapper<{}>;
  RateLimit: ResolverTypeWrapper<RateLimit>;
  RateLimitServiceGroup: ResolverTypeWrapper<RateLimitServiceGroup>;
  RateLimitServiceGroupCreateInput: RateLimitServiceGroupCreateInput;
  RateLimitServiceGroupUpdateInput: RateLimitServiceGroupUpdateInput;
  RefreshData: ResolverTypeWrapper<RefreshData>;
  RegistrationState: RegistrationState;
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
  SecretShare: ResolverTypeWrapper<SecretShare>;
  SecretShareObjectType: SecretShareObjectType;
  SigningKey: ResolverTypeWrapper<SigningKey>;
  SigningKeyCreateInput: SigningKeyCreateInput;
  SigningKeyUpdateInput: SigningKeyUpdateInput;
  StateProvinceRegion: ResolverTypeWrapper<StateProvinceRegion>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SuccessfulLoginResponse: ResolverTypeWrapper<SuccessfulLoginResponse>;
  SystemCategory: ResolverTypeWrapper<SystemCategory>;
  SystemSettings: ResolverTypeWrapper<SystemSettings>;
  SystemSettingsUpdateInput: SystemSettingsUpdateInput;
  TOTPResponse: ResolverTypeWrapper<TotpResponse>;
  Tenant: ResolverTypeWrapper<Tenant>;
  TenantAnonymousUserConfigInput: TenantAnonymousUserConfigInput;
  TenantAnonymousUserConfiguration: ResolverTypeWrapper<TenantAnonymousUserConfiguration>;
  TenantAvailableScope: ResolverTypeWrapper<TenantAvailableScope>;
  TenantCreateInput: TenantCreateInput;
  TenantLegacyUserMigrationConfig: ResolverTypeWrapper<TenantLegacyUserMigrationConfig>;
  TenantLegacyUserMigrationConfigInput: TenantLegacyUserMigrationConfigInput;
  TenantLoginFailurePolicy: ResolverTypeWrapper<TenantLoginFailurePolicy>;
  TenantLoginFailurePolicyInput: TenantLoginFailurePolicyInput;
  TenantLookAndFeel: ResolverTypeWrapper<TenantLookAndFeel>;
  TenantLookAndFeelInput: TenantLookAndFeelInput;
  TenantManagementDomainRel: ResolverTypeWrapper<TenantManagementDomainRel>;
  TenantMetaData: ResolverTypeWrapper<TenantMetaData>;
  TenantPasswordConfig: ResolverTypeWrapper<TenantPasswordConfig>;
  TenantRateLimitRel: ResolverTypeWrapper<TenantRateLimitRel>;
  TenantRateLimitRelView: ResolverTypeWrapper<TenantRateLimitRelView>;
  TenantRestrictedAuthenticationDomainRel: ResolverTypeWrapper<TenantRestrictedAuthenticationDomainRel>;
  TenantSelectorData: ResolverTypeWrapper<TenantSelectorData>;
  TenantSupportedClaimRel: ResolverTypeWrapper<TenantSupportedClaimRel>;
  TenantUpdateInput: TenantUpdateInput;
  User: ResolverTypeWrapper<User>;
  UserAuthenticationState: ResolverTypeWrapper<UserAuthenticationState>;
  UserAuthenticationStateResponse: ResolverTypeWrapper<UserAuthenticationStateResponse>;
  UserCreateInput: UserCreateInput;
  UserCredential: ResolverTypeWrapper<UserCredential>;
  UserFailedLogin: ResolverTypeWrapper<UserFailedLogin>;
  UserMFARel: ResolverTypeWrapper<UserMfaRel>;
  UserRecoveryEmail: ResolverTypeWrapper<UserRecoveryEmail>;
  UserRegistrationState: ResolverTypeWrapper<UserRegistrationState>;
  UserRegistrationStateResponse: ResolverTypeWrapper<UserRegistrationStateResponse>;
  UserScopeRel: ResolverTypeWrapper<UserScopeRel>;
  UserSession: ResolverTypeWrapper<UserSession>;
  UserTenantRel: ResolverTypeWrapper<UserTenantRel>;
  UserTenantRelView: ResolverTypeWrapper<UserTenantRelView>;
  UserTermsAndConditionsAccepted: ResolverTypeWrapper<UserTermsAndConditionsAccepted>;
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
  AuthorizationDeviceCodeData: AuthorizationDeviceCodeData;
  AuthorizationGroup: AuthorizationGroup;
  AuthorizationGroupCreateInput: AuthorizationGroupCreateInput;
  AuthorizationGroupScopeRel: AuthorizationGroupScopeRel;
  AuthorizationGroupUpdateInput: AuthorizationGroupUpdateInput;
  AuthorizationGroupUserRel: AuthorizationGroupUserRel;
  AuthorizationReturnUri: AuthorizationReturnUri;
  AutoCreateSigningKeyInput: AutoCreateSigningKeyInput;
  Boolean: Scalars['Boolean']['output'];
  BulkScopeInput: BulkScopeInput;
  CaptchaConfig: CaptchaConfig;
  CaptchaConfigInput: CaptchaConfigInput;
  CategoryEntry: CategoryEntry;
  ChangeEvent: ChangeEvent;
  Client: Client;
  ClientAuthHistory: ClientAuthHistory;
  ClientCreateInput: ClientCreateInput;
  ClientScopeRel: ClientScopeRel;
  ClientUpdateInput: ClientUpdateInput;
  Contact: Contact;
  ContactCreateInput: ContactCreateInput;
  DeletionStatus: DeletionStatus;
  ErrorDetail: ErrorDetail;
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
  JobData: JobData;
  LookaheadItem: LookaheadItem;
  LookaheadResult: LookaheadResult;
  MarkForDelete: MarkForDelete;
  MarkForDeleteInput: MarkForDeleteInput;
  Mutation: {};
  ObjectSearchResultItem: ObjectSearchResultItem;
  ObjectSearchResults: ObjectSearchResults;
  PasswordConfigInput: PasswordConfigInput;
  PortalUserProfile: PortalUserProfile;
  PreAuthenticationState: PreAuthenticationState;
  ProfileEmailChangeResponse: ProfileEmailChangeResponse;
  ProfileEmailChangeState: ProfileEmailChangeState;
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
  SecretShare: SecretShare;
  SigningKey: SigningKey;
  SigningKeyCreateInput: SigningKeyCreateInput;
  SigningKeyUpdateInput: SigningKeyUpdateInput;
  StateProvinceRegion: StateProvinceRegion;
  String: Scalars['String']['output'];
  SuccessfulLoginResponse: SuccessfulLoginResponse;
  SystemCategory: SystemCategory;
  SystemSettings: SystemSettings;
  SystemSettingsUpdateInput: SystemSettingsUpdateInput;
  TOTPResponse: TotpResponse;
  Tenant: Tenant;
  TenantAnonymousUserConfigInput: TenantAnonymousUserConfigInput;
  TenantAnonymousUserConfiguration: TenantAnonymousUserConfiguration;
  TenantAvailableScope: TenantAvailableScope;
  TenantCreateInput: TenantCreateInput;
  TenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig;
  TenantLegacyUserMigrationConfigInput: TenantLegacyUserMigrationConfigInput;
  TenantLoginFailurePolicy: TenantLoginFailurePolicy;
  TenantLoginFailurePolicyInput: TenantLoginFailurePolicyInput;
  TenantLookAndFeel: TenantLookAndFeel;
  TenantLookAndFeelInput: TenantLookAndFeelInput;
  TenantManagementDomainRel: TenantManagementDomainRel;
  TenantMetaData: TenantMetaData;
  TenantPasswordConfig: TenantPasswordConfig;
  TenantRateLimitRel: TenantRateLimitRel;
  TenantRateLimitRelView: TenantRateLimitRelView;
  TenantRestrictedAuthenticationDomainRel: TenantRestrictedAuthenticationDomainRel;
  TenantSelectorData: TenantSelectorData;
  TenantSupportedClaimRel: TenantSupportedClaimRel;
  TenantUpdateInput: TenantUpdateInput;
  User: User;
  UserAuthenticationState: UserAuthenticationState;
  UserAuthenticationStateResponse: UserAuthenticationStateResponse;
  UserCreateInput: UserCreateInput;
  UserCredential: UserCredential;
  UserFailedLogin: UserFailedLogin;
  UserMFARel: UserMfaRel;
  UserRecoveryEmail: UserRecoveryEmail;
  UserRegistrationState: UserRegistrationState;
  UserRegistrationStateResponse: UserRegistrationStateResponse;
  UserScopeRel: UserScopeRel;
  UserSession: UserSession;
  UserTenantRel: UserTenantRel;
  UserTenantRelView: UserTenantRelView;
  UserTermsAndConditionsAccepted: UserTermsAndConditionsAccepted;
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

export type AuthorizationDeviceCodeDataResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthorizationDeviceCodeData'] = ResolversParentTypes['AuthorizationDeviceCodeData']> = ResolversObject<{
  authorizationStatus?: Resolver<ResolversTypes['DeviceCodeAuthorizationStatus'], ParentType, ContextType>;
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deviceCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deviceCodeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type AuthorizationReturnUriResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['AuthorizationReturnUri'] = ResolversParentTypes['AuthorizationReturnUri']> = ResolversObject<{
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CaptchaConfigResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['CaptchaConfig'] = ResolversParentTypes['CaptchaConfig']> = ResolversObject<{
  alias?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  apiKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  minScopeThreshold?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  siteKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  useCaptchaV3?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CategoryEntryResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['CategoryEntry'] = ResolversParentTypes['CategoryEntry']> = ResolversObject<{
  categoryKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  categoryValue?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ChangeEventResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ChangeEvent'] = ResolversParentTypes['ChangeEvent']> = ResolversObject<{
  changeEventClass?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  changeEventId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  changeEventType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  changeTimestamp?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  changedBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  data?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ClientResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['Client'] = ResolversParentTypes['Client']> = ResolversObject<{
  audience?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type ErrorDetailResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ErrorDetail'] = ResolversParentTypes['ErrorDetail']> = ResolversObject<{
  errorCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  errorKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  errorMessage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FederatedOidcAuthorizationRelResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['FederatedOIDCAuthorizationRel'] = ResolversParentTypes['FederatedOIDCAuthorizationRel']> = ResolversObject<{
  codeVerifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  codechallengemethod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  federatedOIDCAuthorizationRelType?: Resolver<ResolversTypes['FederatedOIDCAuthorizationRelType'], ParentType, ContextType>;
  federatedOIDCProviderId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  initClientId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type JobDataResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['JobData'] = ResolversParentTypes['JobData']> = ResolversObject<{
  markForDeleteItems?: Resolver<Array<ResolversTypes['MarkForDelete']>, ParentType, ContextType>;
  schedulerLocks?: Resolver<Array<ResolversTypes['SchedulerLock']>, ParentType, ContextType>;
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
  completedDate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  markForDeleteId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectType?: Resolver<ResolversTypes['MarkForDeleteObjectType'], ParentType, ContextType>;
  startedDate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
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
  authenticateAcceptTermsAndConditions?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateAcceptTermsAndConditionsArgs, 'accepted' | 'authenticationSessionToken'>>;
  authenticateConfigureTOTP?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateConfigureTotpArgs, 'authenticationSessionToken' | 'userId'>>;
  authenticateHandleForgotPassword?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateHandleForgotPasswordArgs, 'authenticationSessionToken' | 'useRecoveryEmail'>>;
  authenticateHandleUserCodeInput?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateHandleUserCodeInputArgs, 'userCode'>>;
  authenticateHandleUserNameInput?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateHandleUserNameInputArgs, 'username'>>;
  authenticateRegisterSecurityKey?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateRegisterSecurityKeyArgs, 'authenticationSessionToken' | 'fido2KeyRegistrationInput' | 'userId'>>;
  authenticateRotatePassword?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateRotatePasswordArgs, 'authenticationSessionToken' | 'newPassword' | 'userId'>>;
  authenticateUser?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateUserArgs, 'authenticationSessionToken' | 'password' | 'tenantId' | 'username'>>;
  authenticateUserAndMigrate?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateUserAndMigrateArgs, 'authenticationSessionToken' | 'password' | 'tenantId' | 'username'>>;
  authenticateValidatePasswordResetToken?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateValidatePasswordResetTokenArgs, 'authenticationSessionToken' | 'token'>>;
  authenticateValidateSecurityKey?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateValidateSecurityKeyArgs, 'authenticationSessionToken' | 'fido2KeyAuthenticationInput' | 'userId'>>;
  authenticateValidateTOTP?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateValidateTotpArgs, 'authenticationSessionToken' | 'totpTokenValue' | 'userId'>>;
  authenticateWithSocialOIDCProvider?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationAuthenticateWithSocialOidcProviderArgs, 'federatedOIDCProviderId' | 'tenantId'>>;
  autoCreateSigningKey?: Resolver<ResolversTypes['SigningKey'], ParentType, ContextType, RequireFields<MutationAutoCreateSigningKeyArgs, 'keyInput'>>;
  bulkAssignScopeToAuthorizationGroup?: Resolver<Array<ResolversTypes['AuthorizationGroupScopeRel']>, ParentType, ContextType, RequireFields<MutationBulkAssignScopeToAuthorizationGroupArgs, 'bulkScopeInput' | 'groupId' | 'tenantId'>>;
  bulkAssignScopeToClient?: Resolver<Array<ResolversTypes['ClientScopeRel']>, ParentType, ContextType, RequireFields<MutationBulkAssignScopeToClientArgs, 'bulkScopeInput' | 'clientId' | 'tenantId'>>;
  bulkAssignScopeToTenant?: Resolver<Array<ResolversTypes['TenantAvailableScope']>, ParentType, ContextType, RequireFields<MutationBulkAssignScopeToTenantArgs, 'bulkScopeInput' | 'tenantId'>>;
  bulkAssignScopeToUser?: Resolver<Array<ResolversTypes['UserScopeRel']>, ParentType, ContextType, RequireFields<MutationBulkAssignScopeToUserArgs, 'bulkScopeInput' | 'tenantId' | 'userId'>>;
  cancelAuthentication?: Resolver<ResolversTypes['UserAuthenticationStateResponse'], ParentType, ContextType, RequireFields<MutationCancelAuthenticationArgs, 'authenticationSessionToken' | 'userId'>>;
  cancelRegistration?: Resolver<ResolversTypes['UserRegistrationStateResponse'], ParentType, ContextType, RequireFields<MutationCancelRegistrationArgs, 'registrationSessionToken' | 'userId'>>;
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
  deleteFIDOKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteFidoKeyArgs, 'userId'>>;
  deleteRecoveryEmail?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteRecoveryEmailArgs, 'userId'>>;
  deleteSchedulerLock?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteSchedulerLockArgs, 'instanceId'>>;
  deleteScopeAccessRuleSchema?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationDeleteScopeAccessRuleSchemaArgs, 'scopeAccessRuleSchemaId'>>;
  deleteTOTP?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteTotpArgs, 'userId'>>;
  deleteUserSession?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteUserSessionArgs, 'clientId' | 'tenantId' | 'userId'>>;
  enterSecretValue?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationEnterSecretValueArgs, 'otp' | 'secretValue'>>;
  generateSecretShareLink?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationGenerateSecretShareLinkArgs, 'email' | 'objectId' | 'secretShareObjectType'>>;
  generateTOTP?: Resolver<ResolversTypes['TOTPResponse'], ParentType, ContextType, RequireFields<MutationGenerateTotpArgs, 'userId'>>;
  markForDelete?: Resolver<Maybe<ResolversTypes['MarkForDelete']>, ParentType, ContextType, RequireFields<MutationMarkForDeleteArgs, 'markForDeleteInput'>>;
  profileAddRecoveryEmail?: Resolver<ResolversTypes['ProfileEmailChangeResponse'], ParentType, ContextType, RequireFields<MutationProfileAddRecoveryEmailArgs, 'recoveryEmail'>>;
  profileCancelEmailChange?: Resolver<ResolversTypes['ProfileEmailChangeResponse'], ParentType, ContextType, RequireFields<MutationProfileCancelEmailChangeArgs, 'changeEmailSessionToken'>>;
  profileHandleEmailChange?: Resolver<ResolversTypes['ProfileEmailChangeResponse'], ParentType, ContextType, RequireFields<MutationProfileHandleEmailChangeArgs, 'newEmail'>>;
  profileValidateEmail?: Resolver<ResolversTypes['ProfileEmailChangeResponse'], ParentType, ContextType, RequireFields<MutationProfileValidateEmailArgs, 'changeEmailSessionToken' | 'token'>>;
  registerAddDuressPassword?: Resolver<ResolversTypes['UserRegistrationStateResponse'], ParentType, ContextType, RequireFields<MutationRegisterAddDuressPasswordArgs, 'registrationSessionToken' | 'skip' | 'userId'>>;
  registerAddRecoveryEmail?: Resolver<ResolversTypes['UserRegistrationStateResponse'], ParentType, ContextType, RequireFields<MutationRegisterAddRecoveryEmailArgs, 'registrationSessionToken' | 'skip' | 'userId'>>;
  registerConfigureSecurityKey?: Resolver<ResolversTypes['UserRegistrationStateResponse'], ParentType, ContextType, RequireFields<MutationRegisterConfigureSecurityKeyArgs, 'registrationSessionToken' | 'skip' | 'userId'>>;
  registerConfigureTOTP?: Resolver<ResolversTypes['UserRegistrationStateResponse'], ParentType, ContextType, RequireFields<MutationRegisterConfigureTotpArgs, 'registrationSessionToken' | 'skip' | 'userId'>>;
  registerUser?: Resolver<ResolversTypes['UserRegistrationStateResponse'], ParentType, ContextType, RequireFields<MutationRegisterUserArgs, 'tenantId' | 'userInput'>>;
  registerValidateSecurityKey?: Resolver<ResolversTypes['UserRegistrationStateResponse'], ParentType, ContextType, RequireFields<MutationRegisterValidateSecurityKeyArgs, 'fido2KeyAuthenticationInput' | 'registrationSessionToken' | 'userId'>>;
  registerValidateTOTP?: Resolver<ResolversTypes['UserRegistrationStateResponse'], ParentType, ContextType, RequireFields<MutationRegisterValidateTotpArgs, 'registrationSessionToken' | 'totpTokenValue' | 'userId'>>;
  registerVerifyEmailAddress?: Resolver<ResolversTypes['UserRegistrationStateResponse'], ParentType, ContextType, RequireFields<MutationRegisterVerifyEmailAddressArgs, 'registrationSessionToken' | 'token' | 'userId'>>;
  registerVerifyRecoveryEmail?: Resolver<ResolversTypes['UserRegistrationStateResponse'], ParentType, ContextType, RequireFields<MutationRegisterVerifyRecoveryEmailArgs, 'registrationSessionToken' | 'token' | 'userId'>>;
  removeAuthenticationGroupFromClient?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveAuthenticationGroupFromClientArgs, 'authenticationGroupId' | 'clientId'>>;
  removeCaptchaConfig?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  removeTenantLoginFailurePolicy?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationRemoveTenantLoginFailurePolicyArgs, 'tenantId'>>;
  removeTenantLookAndFeel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveTenantLookAndFeelArgs, 'tenantId'>>;
  removeTenantPasswordConfig?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveTenantPasswordConfigArgs, 'tenantId'>>;
  removeUserFromAuthenticationGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromAuthenticationGroupArgs, 'authenticationGroupId' | 'userId'>>;
  removeUserFromAuthorizationGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromAuthorizationGroupArgs, 'groupId' | 'userId'>>;
  removeUserFromTenant?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromTenantArgs, 'tenantId' | 'userId'>>;
  rotatePassword?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRotatePasswordArgs, 'newPassword' | 'oldPassword' | 'userId'>>;
  setCaptchaConfig?: Resolver<ResolversTypes['CaptchaConfig'], ParentType, ContextType, RequireFields<MutationSetCaptchaConfigArgs, 'captchaConfigInput'>>;
  setTenantAnonymousUserConfig?: Resolver<Maybe<ResolversTypes['TenantAnonymousUserConfiguration']>, ParentType, ContextType, RequireFields<MutationSetTenantAnonymousUserConfigArgs, 'tenantAnonymousUserConfigInput'>>;
  setTenantLegacyUserMigrationConfig?: Resolver<Maybe<ResolversTypes['TenantLegacyUserMigrationConfig']>, ParentType, ContextType, RequireFields<MutationSetTenantLegacyUserMigrationConfigArgs, 'tenantLegacyUserMigrationConfigInput'>>;
  setTenantLoginFailurePolicy?: Resolver<ResolversTypes['TenantLoginFailurePolicy'], ParentType, ContextType, RequireFields<MutationSetTenantLoginFailurePolicyArgs, 'tenantLoginFailurePolicyInput'>>;
  setTenantLookAndFeel?: Resolver<Maybe<ResolversTypes['TenantLookAndFeel']>, ParentType, ContextType, RequireFields<MutationSetTenantLookAndFeelArgs, 'tenantLookAndFeelInput'>>;
  setTenantPasswordConfig?: Resolver<Maybe<ResolversTypes['TenantPasswordConfig']>, ParentType, ContextType, RequireFields<MutationSetTenantPasswordConfigArgs, 'passwordConfigInput'>>;
  swapPrimaryAndRecoveryEmail?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  unlockUser?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationUnlockUserArgs, 'userId'>>;
  updateAccessRule?: Resolver<Maybe<ResolversTypes['AccessRule']>, ParentType, ContextType, RequireFields<MutationUpdateAccessRuleArgs, 'accessRuleInput'>>;
  updateAuthenticationGroup?: Resolver<Maybe<ResolversTypes['AuthenticationGroup']>, ParentType, ContextType, RequireFields<MutationUpdateAuthenticationGroupArgs, 'authenticationGroupInput'>>;
  updateAuthorizationGroup?: Resolver<Maybe<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, RequireFields<MutationUpdateAuthorizationGroupArgs, 'groupInput'>>;
  updateClient?: Resolver<Maybe<ResolversTypes['Client']>, ParentType, ContextType, RequireFields<MutationUpdateClientArgs, 'clientInput'>>;
  updateFederatedOIDCProvider?: Resolver<Maybe<ResolversTypes['FederatedOIDCProvider']>, ParentType, ContextType, RequireFields<MutationUpdateFederatedOidcProviderArgs, 'oidcProviderInput'>>;
  updateRateLimitForTenant?: Resolver<Maybe<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, RequireFields<MutationUpdateRateLimitForTenantArgs, 'serviceGroupId' | 'tenantId'>>;
  updateRateLimitServiceGroup?: Resolver<Maybe<ResolversTypes['RateLimitServiceGroup']>, ParentType, ContextType, RequireFields<MutationUpdateRateLimitServiceGroupArgs, 'rateLimitServiceGroupInput'>>;
  updateRootTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationUpdateRootTenantArgs, 'tenantInput'>>;
  updateScope?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<MutationUpdateScopeArgs, 'scopeInput'>>;
  updateScopeAccessRuleSchema?: Resolver<Maybe<ResolversTypes['ScopeAccessRuleSchema']>, ParentType, ContextType, RequireFields<MutationUpdateScopeAccessRuleSchemaArgs, 'scopeAccessRuleSchemaInput'>>;
  updateSigningKey?: Resolver<ResolversTypes['SigningKey'], ParentType, ContextType, RequireFields<MutationUpdateSigningKeyArgs, 'keyInput'>>;
  updateSystemSettings?: Resolver<ResolversTypes['SystemSettings'], ParentType, ContextType, RequireFields<MutationUpdateSystemSettingsArgs, 'systemSettingsUpdateInput'>>;
  updateTenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<MutationUpdateTenantArgs, 'tenantInput'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'userInput'>>;
  updateUserTenantRel?: Resolver<ResolversTypes['UserTenantRel'], ParentType, ContextType, RequireFields<MutationUpdateUserTenantRelArgs, 'relType' | 'tenantId' | 'userId'>>;
  validateTOTP?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationValidateTotpArgs, 'totpToken' | 'userId'>>;
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
  addressLine1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  countryCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  domain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  federatedOIDCProviderSubjectId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  managementAccessTenantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  middleName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nameOrder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  postalCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  preferredLanguageCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  principalType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recoveryEmail?: Resolver<Maybe<ResolversTypes['UserRecoveryEmail']>, ParentType, ContextType>;
  scope?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType>;
  stateRegionProvince?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type ProfileEmailChangeResponseResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ProfileEmailChangeResponse'] = ResolversParentTypes['ProfileEmailChangeResponse']> = ResolversObject<{
  profileEmailChangeError?: Resolver<Maybe<ResolversTypes['ErrorDetail']>, ParentType, ContextType>;
  profileEmailChangeState?: Resolver<ResolversTypes['ProfileEmailChangeState'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProfileEmailChangeStateResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['ProfileEmailChangeState'] = ResolversParentTypes['ProfileEmailChangeState']> = ResolversObject<{
  changeEmailSessionToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  changeOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  changeStateStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailChangeState?: Resolver<ResolversTypes['EmailChangeState'], ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  isPrimaryEmail?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  getCaptchaConfig?: Resolver<Maybe<ResolversTypes['CaptchaConfig']>, ParentType, ContextType>;
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
  getMarkForDeleteById?: Resolver<Maybe<ResolversTypes['MarkForDelete']>, ParentType, ContextType, RequireFields<QueryGetMarkForDeleteByIdArgs, 'markForDeleteId'>>;
  getRateLimitServiceGroupById?: Resolver<Maybe<ResolversTypes['RateLimitServiceGroup']>, ParentType, ContextType, RequireFields<QueryGetRateLimitServiceGroupByIdArgs, 'serviceGroupId'>>;
  getRateLimitServiceGroups?: Resolver<Array<ResolversTypes['RateLimitServiceGroup']>, ParentType, ContextType, Partial<QueryGetRateLimitServiceGroupsArgs>>;
  getRateLimitTenantRelViews?: Resolver<Array<ResolversTypes['TenantRateLimitRelView']>, ParentType, ContextType, Partial<QueryGetRateLimitTenantRelViewsArgs>>;
  getRateLimitTenantRels?: Resolver<Array<ResolversTypes['TenantRateLimitRel']>, ParentType, ContextType, Partial<QueryGetRateLimitTenantRelsArgs>>;
  getRedirectURIs?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryGetRedirectUrIsArgs, 'clientId'>>;
  getRootTenant?: Resolver<ResolversTypes['Tenant'], ParentType, ContextType>;
  getRunningJobs?: Resolver<ResolversTypes['JobData'], ParentType, ContextType>;
  getSchedulerLocks?: Resolver<Maybe<Array<Maybe<ResolversTypes['SchedulerLock']>>>, ParentType, ContextType>;
  getScope?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetScopeArgs, 'filterBy' | 'tenantId'>>;
  getScopeAccessRuleSchemaById?: Resolver<Maybe<ResolversTypes['ScopeAccessRuleSchema']>, ParentType, ContextType, Partial<QueryGetScopeAccessRuleSchemaByIdArgs>>;
  getScopeAccessRuleSchemas?: Resolver<Array<ResolversTypes['ScopeAccessRuleSchema']>, ParentType, ContextType>;
  getScopeById?: Resolver<Maybe<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetScopeByIdArgs, 'scopeId'>>;
  getSecretValue?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryGetSecretValueArgs, 'objectId' | 'objectType'>>;
  getSigningKeyById?: Resolver<Maybe<ResolversTypes['SigningKey']>, ParentType, ContextType, RequireFields<QueryGetSigningKeyByIdArgs, 'signingKeyId'>>;
  getSigningKeys?: Resolver<Array<ResolversTypes['SigningKey']>, ParentType, ContextType, Partial<QueryGetSigningKeysArgs>>;
  getStateProvinceRegions?: Resolver<Array<ResolversTypes['StateProvinceRegion']>, ParentType, ContextType, RequireFields<QueryGetStateProvinceRegionsArgs, 'countryCode'>>;
  getSystemSettings?: Resolver<ResolversTypes['SystemSettings'], ParentType, ContextType>;
  getTenantById?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<QueryGetTenantByIdArgs, 'tenantId'>>;
  getTenantLoginFailurePolicy?: Resolver<Maybe<ResolversTypes['TenantLoginFailurePolicy']>, ParentType, ContextType, RequireFields<QueryGetTenantLoginFailurePolicyArgs, 'tenantId'>>;
  getTenantLookAndFeel?: Resolver<Maybe<ResolversTypes['TenantLookAndFeel']>, ParentType, ContextType, RequireFields<QueryGetTenantLookAndFeelArgs, 'tenantId'>>;
  getTenantMetaData?: Resolver<Maybe<ResolversTypes['TenantMetaData']>, ParentType, ContextType, RequireFields<QueryGetTenantMetaDataArgs, 'tenantId'>>;
  getTenantPasswordConfig?: Resolver<Maybe<ResolversTypes['TenantPasswordConfig']>, ParentType, ContextType, RequireFields<QueryGetTenantPasswordConfigArgs, 'tenantId'>>;
  getTenants?: Resolver<Array<ResolversTypes['Tenant']>, ParentType, ContextType, Partial<QueryGetTenantsArgs>>;
  getUserAuthorizationGroups?: Resolver<Array<ResolversTypes['AuthorizationGroup']>, ParentType, ContextType, RequireFields<QueryGetUserAuthorizationGroupsArgs, 'userId'>>;
  getUserById?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserByIdArgs, 'userId'>>;
  getUserMFARels?: Resolver<Array<ResolversTypes['UserMFARel']>, ParentType, ContextType, RequireFields<QueryGetUserMfaRelsArgs, 'userId'>>;
  getUserRecoveryEmail?: Resolver<Maybe<ResolversTypes['UserRecoveryEmail']>, ParentType, ContextType, RequireFields<QueryGetUserRecoveryEmailArgs, 'userId'>>;
  getUserScopes?: Resolver<Array<ResolversTypes['Scope']>, ParentType, ContextType, RequireFields<QueryGetUserScopesArgs, 'tenantId' | 'userId'>>;
  getUserSessions?: Resolver<Array<ResolversTypes['UserSession']>, ParentType, ContextType, RequireFields<QueryGetUserSessionsArgs, 'userId'>>;
  getUserTenantRels?: Resolver<Array<ResolversTypes['UserTenantRelView']>, ParentType, ContextType, RequireFields<QueryGetUserTenantRelsArgs, 'userId'>>;
  getUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, Partial<QueryGetUsersArgs>>;
  lookahead?: Resolver<Array<ResolversTypes['LookaheadResult']>, ParentType, ContextType, RequireFields<QueryLookaheadArgs, 'term'>>;
  me?: Resolver<Maybe<ResolversTypes['PortalUserProfile']>, ParentType, ContextType>;
  relSearch?: Resolver<ResolversTypes['RelSearchResults'], ParentType, ContextType, RequireFields<QueryRelSearchArgs, 'relSearchInput'>>;
  search?: Resolver<ResolversTypes['ObjectSearchResults'], ParentType, ContextType, RequireFields<QuerySearchArgs, 'searchInput'>>;
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
  codeChallenge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  codeChallengeMethod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  redirecturi?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshTokenClientType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export type SecretShareResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SecretShare'] = ResolversParentTypes['SecretShare']> = ResolversObject<{
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  objectId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  otp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  secretShareId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  secretShareObjectType?: Resolver<ResolversTypes['SecretShareObjectType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SigningKeyResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SigningKey'] = ResolversParentTypes['SigningKey']> = ResolversObject<{
  certificate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
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

export type SystemCategoryResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SystemCategory'] = ResolversParentTypes['SystemCategory']> = ResolversObject<{
  categoryEntries?: Resolver<Array<ResolversTypes['CategoryEntry']>, ParentType, ContextType>;
  categoryName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SystemSettingsResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['SystemSettings'] = ResolversParentTypes['SystemSettings']> = ResolversObject<{
  allowDuressPassword?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowRecoveryEmail?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  auditRecordRetentionPeriodDays?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  enablePortalAsLegacyIdp?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  rootClientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  softwareVersion?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  systemCategories?: Resolver<Array<ResolversTypes['SystemCategory']>, ParentType, ContextType>;
  systemId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  registrationRequireCaptcha?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  registrationRequireTermsAndConditions?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tenantDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenanttypeid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  termsAndConditionsUri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type TenantLoginFailurePolicyResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantLoginFailurePolicy'] = ResolversParentTypes['TenantLoginFailurePolicy']> = ResolversObject<{
  failureThreshold?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  loginFailurePolicyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  maximumLoginFailures?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pauseDurationMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  systemSettings?: Resolver<ResolversTypes['SystemSettings'], ParentType, ContextType>;
  tenant?: Resolver<ResolversTypes['Tenant'], ParentType, ContextType>;
  tenantLookAndFeel?: Resolver<Maybe<ResolversTypes['TenantLookAndFeel']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantPasswordConfigResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantPasswordConfig'] = ResolversParentTypes['TenantPasswordConfig']> = ResolversObject<{
  maxRepeatingCharacterLength?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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

export type TenantSelectorDataResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['TenantSelectorData'] = ResolversParentTypes['TenantSelectorData']> = ResolversObject<{
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  recoveryEmail?: Resolver<Maybe<ResolversTypes['UserRecoveryEmail']>, ParentType, ContextType>;
  stateRegionProvince?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserAuthenticationStateResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserAuthenticationState'] = ResolversParentTypes['UserAuthenticationState']> = ResolversObject<{
  authenticationSessionToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  authenticationState?: Resolver<ResolversTypes['AuthenticationState'], ParentType, ContextType>;
  authenticationStateOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  authenticationStateStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deviceCodeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  preAuthToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  returnToUri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserAuthenticationStateResponseResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserAuthenticationStateResponse'] = ResolversParentTypes['UserAuthenticationStateResponse']> = ResolversObject<{
  accessToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authenticationError?: Resolver<Maybe<ResolversTypes['ErrorDetail']>, ParentType, ContextType>;
  availableTenants?: Resolver<Maybe<Array<ResolversTypes['TenantSelectorData']>>, ParentType, ContextType>;
  passwordConfig?: Resolver<Maybe<ResolversTypes['TenantPasswordConfig']>, ParentType, ContextType>;
  tokenExpiresAtMs?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totpSecret?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userAuthenticationState?: Resolver<ResolversTypes['UserAuthenticationState'], ParentType, ContextType>;
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

export type UserFailedLoginResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserFailedLogin'] = ResolversParentTypes['UserFailedLogin']> = ResolversObject<{
  failureAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  failureCount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  nextLoginNotBefore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
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

export type UserRecoveryEmailResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserRecoveryEmail'] = ResolversParentTypes['UserRecoveryEmail']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserRegistrationStateResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserRegistrationState'] = ResolversParentTypes['UserRegistrationState']> = ResolversObject<{
  deviceCodeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  preAuthToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registrationSessionToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  registrationState?: Resolver<ResolversTypes['RegistrationState'], ParentType, ContextType>;
  registrationStateOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  registrationStateStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserRegistrationStateResponseResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserRegistrationStateResponse'] = ResolversParentTypes['UserRegistrationStateResponse']> = ResolversObject<{
  accessToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  registrationError?: Resolver<Maybe<ResolversTypes['ErrorDetail']>, ParentType, ContextType>;
  tokenExpiresAtMs?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totpSecret?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userRegistrationState?: Resolver<ResolversTypes['UserRegistrationState'], ParentType, ContextType>;
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

export type UserTermsAndConditionsAcceptedResolvers<ContextType = OIDCContext, ParentType extends ResolversParentTypes['UserTermsAndConditionsAccepted'] = ResolversParentTypes['UserTermsAndConditionsAccepted']> = ResolversObject<{
  acceptedAtMs?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
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
  AuthorizationDeviceCodeData?: AuthorizationDeviceCodeDataResolvers<ContextType>;
  AuthorizationGroup?: AuthorizationGroupResolvers<ContextType>;
  AuthorizationGroupScopeRel?: AuthorizationGroupScopeRelResolvers<ContextType>;
  AuthorizationGroupUserRel?: AuthorizationGroupUserRelResolvers<ContextType>;
  AuthorizationReturnUri?: AuthorizationReturnUriResolvers<ContextType>;
  CaptchaConfig?: CaptchaConfigResolvers<ContextType>;
  CategoryEntry?: CategoryEntryResolvers<ContextType>;
  ChangeEvent?: ChangeEventResolvers<ContextType>;
  Client?: ClientResolvers<ContextType>;
  ClientAuthHistory?: ClientAuthHistoryResolvers<ContextType>;
  ClientScopeRel?: ClientScopeRelResolvers<ContextType>;
  Contact?: ContactResolvers<ContextType>;
  DeletionStatus?: DeletionStatusResolvers<ContextType>;
  ErrorDetail?: ErrorDetailResolvers<ContextType>;
  FederatedOIDCAuthorizationRel?: FederatedOidcAuthorizationRelResolvers<ContextType>;
  FederatedOIDCProvider?: FederatedOidcProviderResolvers<ContextType>;
  FederatedOIDCProviderDomainRel?: FederatedOidcProviderDomainRelResolvers<ContextType>;
  FederatedOIDCProviderTenantRel?: FederatedOidcProviderTenantRelResolvers<ContextType>;
  Fido2AuthenticationChallengePasskey?: Fido2AuthenticationChallengePasskeyResolvers<ContextType>;
  Fido2AuthenticationChallengeResponse?: Fido2AuthenticationChallengeResponseResolvers<ContextType>;
  Fido2Challenge?: Fido2ChallengeResolvers<ContextType>;
  Fido2RegistrationChallengeResponse?: Fido2RegistrationChallengeResponseResolvers<ContextType>;
  FooterLink?: FooterLinkResolvers<ContextType>;
  JobData?: JobDataResolvers<ContextType>;
  LookaheadItem?: LookaheadItemResolvers<ContextType>;
  LookaheadResult?: LookaheadResultResolvers<ContextType>;
  MarkForDelete?: MarkForDeleteResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  ObjectSearchResultItem?: ObjectSearchResultItemResolvers<ContextType>;
  ObjectSearchResults?: ObjectSearchResultsResolvers<ContextType>;
  PortalUserProfile?: PortalUserProfileResolvers<ContextType>;
  PreAuthenticationState?: PreAuthenticationStateResolvers<ContextType>;
  ProfileEmailChangeResponse?: ProfileEmailChangeResponseResolvers<ContextType>;
  ProfileEmailChangeState?: ProfileEmailChangeStateResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RateLimit?: RateLimitResolvers<ContextType>;
  RateLimitServiceGroup?: RateLimitServiceGroupResolvers<ContextType>;
  RefreshData?: RefreshDataResolvers<ContextType>;
  RelSearchResultItem?: RelSearchResultItemResolvers<ContextType>;
  RelSearchResults?: RelSearchResultsResolvers<ContextType>;
  SchedulerLock?: SchedulerLockResolvers<ContextType>;
  Scope?: ScopeResolvers<ContextType>;
  ScopeAccessRuleSchema?: ScopeAccessRuleSchemaResolvers<ContextType>;
  SecretShare?: SecretShareResolvers<ContextType>;
  SigningKey?: SigningKeyResolvers<ContextType>;
  StateProvinceRegion?: StateProvinceRegionResolvers<ContextType>;
  SuccessfulLoginResponse?: SuccessfulLoginResponseResolvers<ContextType>;
  SystemCategory?: SystemCategoryResolvers<ContextType>;
  SystemSettings?: SystemSettingsResolvers<ContextType>;
  TOTPResponse?: TotpResponseResolvers<ContextType>;
  Tenant?: TenantResolvers<ContextType>;
  TenantAnonymousUserConfiguration?: TenantAnonymousUserConfigurationResolvers<ContextType>;
  TenantAvailableScope?: TenantAvailableScopeResolvers<ContextType>;
  TenantLegacyUserMigrationConfig?: TenantLegacyUserMigrationConfigResolvers<ContextType>;
  TenantLoginFailurePolicy?: TenantLoginFailurePolicyResolvers<ContextType>;
  TenantLookAndFeel?: TenantLookAndFeelResolvers<ContextType>;
  TenantManagementDomainRel?: TenantManagementDomainRelResolvers<ContextType>;
  TenantMetaData?: TenantMetaDataResolvers<ContextType>;
  TenantPasswordConfig?: TenantPasswordConfigResolvers<ContextType>;
  TenantRateLimitRel?: TenantRateLimitRelResolvers<ContextType>;
  TenantRateLimitRelView?: TenantRateLimitRelViewResolvers<ContextType>;
  TenantRestrictedAuthenticationDomainRel?: TenantRestrictedAuthenticationDomainRelResolvers<ContextType>;
  TenantSelectorData?: TenantSelectorDataResolvers<ContextType>;
  TenantSupportedClaimRel?: TenantSupportedClaimRelResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserAuthenticationState?: UserAuthenticationStateResolvers<ContextType>;
  UserAuthenticationStateResponse?: UserAuthenticationStateResponseResolvers<ContextType>;
  UserCredential?: UserCredentialResolvers<ContextType>;
  UserFailedLogin?: UserFailedLoginResolvers<ContextType>;
  UserMFARel?: UserMfaRelResolvers<ContextType>;
  UserRecoveryEmail?: UserRecoveryEmailResolvers<ContextType>;
  UserRegistrationState?: UserRegistrationStateResolvers<ContextType>;
  UserRegistrationStateResponse?: UserRegistrationStateResponseResolvers<ContextType>;
  UserScopeRel?: UserScopeRelResolvers<ContextType>;
  UserSession?: UserSessionResolvers<ContextType>;
  UserTenantRel?: UserTenantRelResolvers<ContextType>;
  UserTenantRelView?: UserTenantRelViewResolvers<ContextType>;
  UserTermsAndConditionsAccepted?: UserTermsAndConditionsAcceptedResolvers<ContextType>;
}>;



import gql from 'graphql-tag';
export const typeDefs = gql(`schema{query:Query mutation:Mutation}type AccessRule{accessRuleDefinition:String!accessRuleId:String!accessRuleName:String!scopeAccessRuleSchemaId:String!}input AccessRuleCreateInput{accessRuleDefinition:String!accessRuleName:String!scopeAccessRuleSchemaId:String!}input AccessRuleUpdateInput{accessRuleDefinition:String!accessRuleId:String!accessRuleName:String!scopeAccessRuleSchemaId:String!}type AuthenticationGroup{authenticationGroupDescription:String authenticationGroupId:String!authenticationGroupName:String!defaultGroup:Boolean!markForDelete:Boolean!tenantId:String!}type AuthenticationGroupClientRel{authenticationGroupId:String!clientId:String!}input AuthenticationGroupCreateInput{authenticationGroupDescription:String authenticationGroupName:String!defaultGroup:Boolean!tenantId:String!}input AuthenticationGroupUpdateInput{authenticationGroupDescription:String authenticationGroupId:String!authenticationGroupName:String!defaultGroup:Boolean!tenantId:String!}type AuthenticationGroupUserRel{authenticationGroupId:String!userId:String!}enum AuthenticationState{ACCEPT_TERMS_AND_CONDITIONS AUTH_WITH_FEDERATED_OIDC CANCELLED COMPLETED CONFIGURE_SECURITY_KEY CONFIGURE_TOTP ENTER_EMAIL ENTER_PASSWORD ENTER_PASSWORD_AND_MIGRATE_USER ENTER_USER_CODE ERROR EXPIRED POST_AUTHN_STATE_SEND_SECURITY_EVENT_DEVICE_REGISTERED POST_AUTHN_STATE_SEND_SECURITY_EVENT_DURESS_LOGON POST_AUTHN_STATE_SEND_SECURITY_EVENT_SUCCESS_LOGON REDIRECT_BACK_TO_APPLICATION REDIRECT_TO_IAM_PORTAL REGISTER ROTATE_PASSWORD SELECT_TENANT SELECT_TENANT_THEN_REGISTER VALIDATE_PASSWORD_RESET_TOKEN VALIDATE_SECURITY_KEY VALIDATE_TOTP}input AuthenticatorAttestationResponseInput{attestationObject:String!authenticatorData:String!clientDataJSON:String!publicKey:String!publicKeyAlgorithm:Int!transports:[String!]!}input AuthenticatorAuthenticationResponseInput{authenticatorData:String!clientDataJSON:String!signature:String!}type AuthorizationCodeData{clientId:String!code:String!codeChallenge:String codeChallengeMethod:String expiresAtMs:Float!redirectUri:String!scope:String!tenantId:String!userId:String!}type AuthorizationDeviceCodeData{authorizationStatus:DeviceCodeAuthorizationStatus!clientId:String!deviceCode:String!deviceCodeId:String!expiresAtMs:Float!scope:String!tenantId:String!userCode:String!userId:String}type AuthorizationGroup{allowForAnonymousUsers:Boolean!default:Boolean!groupDescription:String groupId:String!groupName:String!markForDelete:Boolean!tenantId:String!}input AuthorizationGroupCreateInput{allowForAnonymousUsers:Boolean!default:Boolean!groupDescription:String groupName:String!tenantId:String!}type AuthorizationGroupScopeRel{groupId:String!scopeId:String!tenantId:String!}input AuthorizationGroupUpdateInput{allowForAnonymousUsers:Boolean!default:Boolean!groupDescription:String groupId:String!groupName:String!tenantId:String!}type AuthorizationGroupUserRel{groupId:String!userId:String!}type AuthorizationReturnUri{code:String!state:String uri:String!}input AutoCreateSigningKeyInput{commonName:String!expiresAtMs:Float!keyName:String!keyType:String!keyTypeId:String keyUse:String!organizationName:String!password:String tenantId:String!}input BulkScopeInput{accessRuleId:String scopeId:String!}type CaptchaConfig{alias:String!apiKey:String!minScopeThreshold:Float projectId:String siteKey:String!useCaptchaV3:Boolean!}input CaptchaConfigInput{alias:String!apiKey:String!minScopeThreshold:Float projectId:String siteKey:String!useCaptchaV3:Boolean!}type CategoryEntry{categoryKey:String!categoryValue:String!}type ChangeEvent{changeEventClass:String!changeEventId:String!changeEventType:String!changeTimestamp:Float!changedBy:String!data:String!objectId:String!}type Client{audience:String clientDescription:String clientId:String!clientName:String!clientSecret:String!clientTokenTTLSeconds:Int clientType:String!clienttypeid:String enabled:Boolean!markForDelete:Boolean!maxRefreshTokenCount:Int oidcEnabled:Boolean!pkceEnabled:Boolean!tenantId:String!userTokenTTLSeconds:Int}type ClientAuthHistory{clientId:String!expiresAtSeconds:Float!jti:String!tenantId:String!}input ClientCreateInput{audience:String clientDescription:String clientName:String!clientTokenTTLSeconds:Int clientType:String!clienttypeid:String enabled:Boolean!maxRefreshTokenCount:Int oidcEnabled:Boolean!pkceEnabled:Boolean!tenantId:String!userTokenTTLSeconds:Int}type ClientScopeRel{clientId:String!scopeId:String!tenantId:String!}input ClientUpdateInput{audience:String clientDescription:String clientId:String!clientName:String!clientTokenTTLSeconds:Int clientType:String!clienttypeid:String enabled:Boolean!maxRefreshTokenCount:Int oidcEnabled:Boolean!pkceEnabled:Boolean!tenantId:String!userTokenTTLSeconds:Int}type Contact{contactid:String!email:String!name:String objectid:String!objecttype:String!userid:String}input ContactCreateInput{email:String!name:String objectid:String!objecttype:String!userid:String}type DeletionStatus{completedAt:Float markForDeleteId:String!startedAt:Float!step:String!}enum DeviceCodeAuthorizationStatus{APPROVED CANCELLED PENDING}enum EmailChangeState{COMPLETED ENTER_EMAIL ERROR VALIDATE_EMAIL}type ErrorDetail{errorCode:String!errorKey:String errorMessage:String!}type FederatedOIDCAuthorizationRel{codeVerifier:String codechallengemethod:String email:String expiresAtMs:Float!federatedOIDCAuthorizationRelType:FederatedOIDCAuthorizationRelType!federatedOIDCProviderId:String!initClientId:String initCodeChallenge:String initCodeChallengeMethod:String initRedirectUri:String!initResponseMode:String!initResponseType:String!initScope:String!initState:String!initTenantId:String!returnUri:String state:String!userId:String}enum FederatedOIDCAuthorizationRelType{AUTHORIZATION_REL_TYPE_CLIENT_AUTH AUTHORIZATION_REL_TYPE_PORTAL_AUTH}type FederatedOIDCProvider{clientAuthType:String!clientauthtypeid:String federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderId:String!federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderType:String!federatedOIDCProviderWellKnownUri:String!federatedoidcprovidertypeid:String markForDelete:Boolean!refreshTokenAllowed:Boolean!scopes:[String!]!socialLoginProvider:String usePkce:Boolean!}input FederatedOIDCProviderCreateInput{clientAuthType:String!clientauthtypeid:String federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderType:String!federatedOIDCProviderWellKnownUri:String!federatedoidcprovidertypeid:String refreshTokenAllowed:Boolean!scopes:[String!]!socialLoginProvider:String usePkce:Boolean!}type FederatedOIDCProviderDomainRel{domain:String!federatedOIDCProviderId:String!}type FederatedOIDCProviderTenantRel{federatedOIDCProviderId:String!tenantId:String!}input FederatedOIDCProviderUpdateInput{clientAuthType:String!clientauthtypeid:String federatedOIDCProviderClientId:String!federatedOIDCProviderClientSecret:String federatedOIDCProviderDescription:String federatedOIDCProviderId:String!federatedOIDCProviderName:String!federatedOIDCProviderTenantId:String federatedOIDCProviderType:String!federatedOIDCProviderWellKnownUri:String!federatedoidcprovidertypeid:String refreshTokenAllowed:Boolean!scopes:[String!]!socialLoginProvider:String usePkce:Boolean!}type Fido2AuthenticationChallengePasskey{id:String!transports:[String!]!}type Fido2AuthenticationChallengeResponse{fido2AuthenticationChallengePasskeys:[Fido2AuthenticationChallengePasskey!]!fido2Challenge:Fido2Challenge!rpId:String!}type Fido2Challenge{challenge:String!expiresAtMs:Float!issuedAtMs:Float!userId:String!}input Fido2KeyAuthenticationInput{authenticationAttachment:String!id:String!rawId:String!response:AuthenticatorAuthenticationResponseInput!type:String!}input Fido2KeyRegistrationInput{authenticationAttachment:String!id:String!rawId:String!response:AuthenticatorAttestationResponseInput!type:String!}type Fido2RegistrationChallengeResponse{email:String!fido2Challenge:Fido2Challenge!rpId:String!rpName:String!userName:String!}type FooterLink{footerlinkid:String!linktext:String!tenantid:String!uri:String!}input FooterLinkInput{footerlinkid:String linktext:String!tenantid:String!uri:String!}type JobData{markForDeleteItems:[MarkForDelete!]!schedulerLocks:[SchedulerLock!]!}type LookaheadItem{displayValue:String!id:String!matchingString:String}type LookaheadResult{category:SearchResultType!resultList:[LookaheadItem!]!}type MarkForDelete{completedDate:Float markForDeleteId:String!objectId:String!objectType:MarkForDeleteObjectType!startedDate:Float submittedBy:String!submittedDate:Float!}input MarkForDeleteInput{markForDeleteObjectType:MarkForDeleteObjectType!objectId:String!}enum MarkForDeleteObjectType{AUTHENTICATION_GROUP AUTHORIZATION_GROUP CLIENT FEDERATED_OIDC_PROVIDER RATE_LIMIT_SERVICE_GROUP SCOPE SIGNING_KEY TENANT USER}type Mutation{addContact(contactCreateInput:ContactCreateInput!):Contact!addDomainToTenantManagement(domain:String!tenantId:String!):TenantManagementDomainRel addDomainToTenantRestrictedAuthentication(domain:String!tenantId:String!):TenantRestrictedAuthenticationDomainRel addRedirectURI(clientId:String!uri:String!):String addUserToAuthenticationGroup(authenticationGroupId:String!userId:String!):AuthenticationGroupUserRel addUserToAuthorizationGroup(groupId:String!userId:String!):AuthorizationGroupUserRel assignAuthenticationGroupToClient(authenticationGroupId:String!clientId:String!):AuthenticationGroupClientRel assignFederatedOIDCProviderToDomain(domain:String!federatedOIDCProviderId:String!):FederatedOIDCProviderDomainRel!assignFederatedOIDCProviderToTenant(federatedOIDCProviderId:String!tenantId:String!):FederatedOIDCProviderTenantRel!assignRateLimitToTenant(allowUnlimited:Boolean limit:Int rateLimitPeriodMinutes:Int serviceGroupId:String!tenantId:String!):TenantRateLimitRel assignScopeToAuthorizationGroup(groupId:String!scopeId:String!tenantId:String!):AuthorizationGroupScopeRel assignScopeToClient(clientId:String!scopeId:String!tenantId:String!):ClientScopeRel assignScopeToTenant(accessRuleId:String scopeId:String!tenantId:String!):TenantAvailableScope assignScopeToUser(scopeId:String!tenantId:String!userId:String!):UserScopeRel assignUserToTenant(relType:String!tenantId:String!userId:String!):UserTenantRel!authenticateAcceptTermsAndConditions(accepted:Boolean!authenticationSessionToken:String!preAuthToken:String):UserAuthenticationStateResponse!authenticateConfigureTOTP(authenticationSessionToken:String!preAuthToken:String userId:String!):UserAuthenticationStateResponse!authenticateHandleForgotPassword(authenticationSessionToken:String!preAuthToken:String useRecoveryEmail:Boolean!):UserAuthenticationStateResponse!authenticateHandleUserCodeInput(userCode:String!):UserAuthenticationStateResponse!authenticateHandleUserNameInput(deviceCodeId:String preAuthToken:String returnToUri:String tenantId:String username:String!):UserAuthenticationStateResponse!authenticateRegisterSecurityKey(authenticationSessionToken:String!fido2KeyRegistrationInput:Fido2KeyRegistrationInput!preAuthToken:String userId:String!):UserAuthenticationStateResponse!authenticateRotatePassword(authenticationSessionToken:String!newPassword:String!preAuthToken:String userId:String!):UserAuthenticationStateResponse!authenticateUser(authenticationSessionToken:String!password:String!preAuthToken:String tenantId:String!username:String!):UserAuthenticationStateResponse!authenticateUserAndMigrate(authenticationSessionToken:String!password:String!preAuthToken:String tenantId:String!username:String!):UserAuthenticationStateResponse!authenticateValidatePasswordResetToken(authenticationSessionToken:String!preAuthToken:String token:String!):UserAuthenticationStateResponse!authenticateValidateSecurityKey(authenticationSessionToken:String!fido2KeyAuthenticationInput:Fido2KeyAuthenticationInput!preAuthToken:String userId:String!):UserAuthenticationStateResponse!authenticateValidateTOTP(authenticationSessionToken:String!preAuthToken:String totpTokenValue:String!userId:String!):UserAuthenticationStateResponse!authenticateWithSocialOIDCProvider(federatedOIDCProviderId:String!preAuthToken:String tenantId:String!):UserAuthenticationStateResponse!autoCreateSigningKey(keyInput:AutoCreateSigningKeyInput!):SigningKey!bulkAssignScopeToAuthorizationGroup(bulkScopeInput:[BulkScopeInput!]!groupId:String!tenantId:String!):[AuthorizationGroupScopeRel!]!bulkAssignScopeToClient(bulkScopeInput:[BulkScopeInput!]!clientId:String!tenantId:String!):[ClientScopeRel!]!bulkAssignScopeToTenant(bulkScopeInput:[BulkScopeInput!]!tenantId:String!):[TenantAvailableScope!]!bulkAssignScopeToUser(bulkScopeInput:[BulkScopeInput!]!tenantId:String!userId:String!):[UserScopeRel!]!cancelAuthentication(authenticationSessionToken:String!preAuthToken:String userId:String!):UserAuthenticationStateResponse!cancelRegistration(deviceCodeId:String preAuthToken:String registrationSessionToken:String!userId:String!):UserRegistrationStateResponse!createAccessRule(accessRuleInput:AccessRuleCreateInput!):AccessRule createAuthenticationGroup(authenticationGroupInput:AuthenticationGroupCreateInput!):AuthenticationGroup createAuthorizationGroup(groupInput:AuthorizationGroupCreateInput!):AuthorizationGroup createClient(clientInput:ClientCreateInput!):Client createFederatedOIDCProvider(oidcProviderInput:FederatedOIDCProviderCreateInput!):FederatedOIDCProvider createFido2AuthenticationChallenge(sessionToken:String sessionTokenType:String userId:String!):Fido2AuthenticationChallengeResponse createFido2RegistrationChallenge(sessionToken:String sessionTokenType:String userId:String!):Fido2RegistrationChallengeResponse createRateLimitServiceGroup(rateLimitServiceGroupInput:RateLimitServiceGroupCreateInput!):RateLimitServiceGroup createRootTenant(tenantInput:TenantCreateInput!):Tenant createScope(scopeInput:ScopeCreateInput!):Scope createScopeAccessRuleSchema(scopeAccessRuleSchemaInput:ScopeAccessRuleSchemaCreateInput!):ScopeAccessRuleSchema createSigningKey(keyInput:SigningKeyCreateInput!):SigningKey!createTenant(tenantInput:TenantCreateInput!):Tenant createUser(tenantId:String!userInput:UserCreateInput!):User!deleteAccessRule(accessRuleId:String!):String!deleteFIDOKey(userId:String!):String deleteRecoveryEmail(userId:String!):Boolean!deleteSchedulerLock(instanceId:String!):String!deleteScopeAccessRuleSchema(scopeAccessRuleSchemaId:String!):String!deleteTOTP(userId:String!):String deleteUserSession(clientId:String!tenantId:String!userId:String!):String enterSecretValue(otp:String!secretValue:String!):Boolean!generateSecretShareLink(email:String!objectId:String!secretShareObjectType:SecretShareObjectType!):Boolean!generateTOTP(userId:String!):TOTPResponse!markForDelete(markForDeleteInput:MarkForDeleteInput!):MarkForDelete profileAddRecoveryEmail(recoveryEmail:String!):ProfileEmailChangeResponse!profileCancelEmailChange(changeEmailSessionToken:String!):ProfileEmailChangeResponse!profileHandleEmailChange(newEmail:String!):ProfileEmailChangeResponse!profileValidateEmail(changeEmailSessionToken:String!token:String!):ProfileEmailChangeResponse!registerAddDuressPassword(password:String preAuthToken:String registrationSessionToken:String!skip:Boolean!userId:String!):UserRegistrationStateResponse!registerAddRecoveryEmail(preAuthToken:String recoveryEmail:String registrationSessionToken:String!skip:Boolean!userId:String!):UserRegistrationStateResponse!registerConfigureSecurityKey(fido2KeyRegistrationInput:Fido2KeyRegistrationInput preAuthToken:String registrationSessionToken:String!skip:Boolean!userId:String!):UserRegistrationStateResponse!registerConfigureTOTP(preAuthToken:String registrationSessionToken:String!skip:Boolean!userId:String!):UserRegistrationStateResponse!registerUser(deviceCodeId:String preAuthToken:String tenantId:String!userInput:UserCreateInput!):UserRegistrationStateResponse!registerValidateSecurityKey(fido2KeyAuthenticationInput:Fido2KeyAuthenticationInput!preAuthToken:String registrationSessionToken:String!userId:String!):UserRegistrationStateResponse!registerValidateTOTP(preAuthToken:String registrationSessionToken:String!totpTokenValue:String!userId:String!):UserRegistrationStateResponse!registerVerifyEmailAddress(preAuthToken:String registrationSessionToken:String!token:String!userId:String!):UserRegistrationStateResponse!registerVerifyRecoveryEmail(preAuthToken:String registrationSessionToken:String!token:String!userId:String!):UserRegistrationStateResponse!removeAuthenticationGroupFromClient(authenticationGroupId:String!clientId:String!):String removeCaptchaConfig:String!removeContact(contactId:String!):String!removeDomainFromTenantManagement(domain:String!tenantId:String!):String removeDomainFromTenantRestrictedAuthentication(domain:String!tenantId:String!):String removeFederatedOIDCProviderFromDomain(domain:String!federatedOIDCProviderId:String!):FederatedOIDCProviderDomainRel!removeFederatedOIDCProviderFromTenant(federatedOIDCProviderId:String!tenantId:String!):FederatedOIDCProviderTenantRel!removeRateLimitFromTenant(serviceGroupId:String!tenantId:String!):String removeRedirectURI(clientId:String!uri:String!):String removeScopeFromAuthorizationGroup(groupId:String!scopeId:String!tenantId:String!):String removeScopeFromClient(clientId:String!scopeId:String!tenantId:String!):String removeScopeFromTenant(scopeId:String!tenantId:String!):String removeScopeFromUser(scopeId:String!tenantId:String!userId:String!):String removeTenantAnonymousUserConfig(tenantId:String!):String removeTenantLegacyUserMigrationConfig(tenantId:String!):String removeTenantLoginFailurePolicy(tenantId:String!):String!removeTenantLookAndFeel(tenantId:String!):String removeTenantPasswordConfig(tenantId:String!):String removeUserFromAuthenticationGroup(authenticationGroupId:String!userId:String!):String removeUserFromAuthorizationGroup(groupId:String!userId:String!):String removeUserFromTenant(tenantId:String!userId:String!):String rotatePassword(newPassword:String!oldPassword:String!userId:String!):Boolean setCaptchaConfig(captchaConfigInput:CaptchaConfigInput!):CaptchaConfig!setTenantAnonymousUserConfig(tenantAnonymousUserConfigInput:TenantAnonymousUserConfigInput!):TenantAnonymousUserConfiguration setTenantLegacyUserMigrationConfig(tenantLegacyUserMigrationConfigInput:TenantLegacyUserMigrationConfigInput!):TenantLegacyUserMigrationConfig setTenantLoginFailurePolicy(tenantLoginFailurePolicyInput:TenantLoginFailurePolicyInput!):TenantLoginFailurePolicy!setTenantLookAndFeel(tenantLookAndFeelInput:TenantLookAndFeelInput!):TenantLookAndFeel setTenantPasswordConfig(passwordConfigInput:PasswordConfigInput!):TenantPasswordConfig swapPrimaryAndRecoveryEmail:Boolean!unlockUser(userId:String!):Boolean updateAccessRule(accessRuleInput:AccessRuleUpdateInput!):AccessRule updateAuthenticationGroup(authenticationGroupInput:AuthenticationGroupUpdateInput!):AuthenticationGroup updateAuthorizationGroup(groupInput:AuthorizationGroupUpdateInput!):AuthorizationGroup updateClient(clientInput:ClientUpdateInput!):Client updateFederatedOIDCProvider(oidcProviderInput:FederatedOIDCProviderUpdateInput!):FederatedOIDCProvider updateRateLimitForTenant(allowUnlimited:Boolean limit:Int rateLimitPeriodMinutes:Int serviceGroupId:String!tenantId:String!):TenantRateLimitRel updateRateLimitServiceGroup(rateLimitServiceGroupInput:RateLimitServiceGroupUpdateInput!):RateLimitServiceGroup updateRootTenant(tenantInput:TenantUpdateInput!):Tenant updateScope(scopeInput:ScopeUpdateInput!):Scope updateScopeAccessRuleSchema(scopeAccessRuleSchemaInput:ScopeAccessRuleSchemaUpdateInput!):ScopeAccessRuleSchema updateSigningKey(keyInput:SigningKeyUpdateInput!):SigningKey!updateSystemSettings(systemSettingsUpdateInput:SystemSettingsUpdateInput!):SystemSettings!updateTenant(tenantInput:TenantUpdateInput!):Tenant updateUser(userInput:UserUpdateInput!):User!updateUserTenantRel(relType:String!tenantId:String!userId:String!):UserTenantRel!validateTOTP(totpToken:String!userId:String!):Boolean!}type ObjectSearchResultItem{description:String email:String enabled:Boolean name:String!objectid:String!objecttype:SearchResultType!owningclientid:String owningtenantid:String subtype:String subtypekey:String}type ObjectSearchResults{endtime:Float!page:Int!perpage:Int!resultlist:[ObjectSearchResultItem!]!starttime:Float!took:Int!total:Int!}input PasswordConfigInput{maxRepeatingCharacterLength:Int mfaTypesRequired:String passwordHashingAlgorithm:String!passwordHistoryPeriod:Int passwordMaxLength:Int!passwordMinLength:Int!passwordRotationPeriodDays:Int requireLowerCase:Boolean!requireMfa:Boolean!requireNumbers:Boolean!requireSpecialCharacters:Boolean!requireUpperCase:Boolean!specialCharactersAllowed:String tenantId:String!}type PortalUserProfile{address:String addressLine1:String city:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!expiresAtMs:Float!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!managementAccessTenantId:String middleName:String nameOrder:String!phoneNumber:String postalCode:String preferredLanguageCode:String principalType:String!recoveryEmail:UserRecoveryEmail scope:[Scope!]!stateRegionProvince:String tenantId:String!tenantName:String!userId:String!}type PreAuthenticationState{clientId:String!codeChallenge:String codeChallengeMethod:String expiresAtMs:Float!redirectUri:String!responseMode:String!responseType:String!scope:String!state:String tenantId:String!token:String!}type ProfileEmailChangeResponse{profileEmailChangeError:ErrorDetail profileEmailChangeState:ProfileEmailChangeState!}type ProfileEmailChangeState{changeEmailSessionToken:String!changeOrder:Int!changeStateStatus:String!email:String!emailChangeState:EmailChangeState!expiresAtMs:Float!isPrimaryEmail:Boolean!userId:String!}type Query{getAccessRuleById(accessRuleId:String!):AccessRule getAccessRules(tenantId:String):[AccessRule!]!getAnonymousUserConfiguration(tenantId:String!):TenantAnonymousUserConfiguration getAuthenticationGroupById(authenticationGroupId:String!):AuthenticationGroup getAuthenticationGroups(clientId:String tenantId:String userId:String):[AuthenticationGroup!]!getAuthorizationGroupById(groupId:String!):AuthorizationGroup getAuthorizationGroupScopes(groupId:String!):[Scope!]!getAuthorizationGroups(tenantId:String):[AuthorizationGroup!]!getCaptchaConfig:CaptchaConfig getChangeEvents(objectId:String!):[ChangeEvent!]!getClientById(clientId:String!):Client getClientScopes(clientId:String!):[Scope!]!getClients(tenantId:String):[Client!]!getContacts(objectId:String!):[Contact!]!getDeletionStatus(markForDeleteId:String!):[DeletionStatus!]!getDomainsForTenantAuthentication(tenantId:String!):[TenantRestrictedAuthenticationDomainRel!]!getDomainsForTenantManagement(tenantId:String!):[TenantManagementDomainRel!]!getFederatedOIDCProviderById(federatedOIDCProviderId:String!):FederatedOIDCProvider getFederatedOIDCProviderDomainRels(domain:String federatedOIDCProviderId:String):[FederatedOIDCProviderDomainRel!]!getFederatedOIDCProviders(tenantId:String):[FederatedOIDCProvider!]!getLegacyUserMigrationConfiguration(tenantId:String!):TenantLegacyUserMigrationConfig getMarkForDeleteById(markForDeleteId:String!):MarkForDelete getRateLimitServiceGroupById(serviceGroupId:String!):RateLimitServiceGroup getRateLimitServiceGroups(tenantId:String):[RateLimitServiceGroup!]!getRateLimitTenantRelViews(rateLimitServiceGroupId:String tenantId:String):[TenantRateLimitRelView!]!getRateLimitTenantRels(rateLimitServiceGroupId:String tenantId:String):[TenantRateLimitRel!]!getRedirectURIs(clientId:String!):[String!]!getRootTenant:Tenant!getRunningJobs:JobData!getSchedulerLocks:[SchedulerLock]getScope(filterBy:ScopeFilterCriteria!tenantId:String!):[Scope!]!getScopeAccessRuleSchemaById(scopeAccessRuleSchemaId:String):ScopeAccessRuleSchema getScopeAccessRuleSchemas:[ScopeAccessRuleSchema!]!getScopeById(scopeId:String!):Scope getSecretValue(objectId:String!objectType:SecretObjectType!):String getSigningKeyById(signingKeyId:String!):SigningKey getSigningKeys(tenantId:String):[SigningKey!]!getStateProvinceRegions(countryCode:String!):[StateProvinceRegion!]!getSystemSettings:SystemSettings!getTenantById(tenantId:String!):Tenant getTenantLoginFailurePolicy(tenantId:String!):TenantLoginFailurePolicy getTenantLookAndFeel(tenantId:String!):TenantLookAndFeel getTenantMetaData(tenantId:String!):TenantMetaData getTenantPasswordConfig(tenantId:String!):TenantPasswordConfig getTenants(federatedOIDCProviderId:String scopeId:String tenantIds:[String!]):[Tenant!]!getUserAuthorizationGroups(userId:String!):[AuthorizationGroup!]!getUserById(userId:String!):User getUserMFARels(userId:String!):[UserMFARel!]!getUserRecoveryEmail(userId:String!):UserRecoveryEmail getUserScopes(tenantId:String!userId:String!):[Scope!]!getUserSessions(userId:String!):[UserSession!]!getUserTenantRels(userId:String!):[UserTenantRelView!]!getUsers(tenantId:String):[User!]!lookahead(term:String!):[LookaheadResult!]!me:PortalUserProfile relSearch(relSearchInput:RelSearchInput!):RelSearchResults!search(searchInput:SearchInput!):ObjectSearchResults!}type RateLimit{ratelimitid:String!ratelimitname:String!servicegroupid:String!}type RateLimitServiceGroup{markForDelete:Boolean!servicegroupdescription:String servicegroupid:String!servicegroupname:String!}input RateLimitServiceGroupCreateInput{servicegroupdescription:String servicegroupname:String!}input RateLimitServiceGroupUpdateInput{servicegroupdescription:String servicegroupid:String!servicegroupname:String!}type RefreshData{clientId:String!codeChallenge:String codeChallengeMethod:String expiresAtMs:Float!redirecturi:String!refreshCount:Int!refreshToken:String!refreshTokenClientType:String!scope:String!tenantId:String!userId:String!}enum RegistrationState{ADD_DURESS_PASSWORD_OPTIONAL ADD_RECOVERY_EMAIL_OPTIONAL CANCELLED COMPLETED CONFIGURE_SECURITY_KEY_OPTIONAL CONFIGURE_SECURITY_KEY_REQUIRED CONFIGURE_TOTP_OPTIONAL CONFIGURE_TOTP_REQUIRED ERROR EXPIRED REDIRECT_BACK_TO_APPLICATION REDIRECT_TO_IAM_PORTAL UNREGISTERED VALIDATE_EMAIL VALIDATE_RECOVERY_EMAIL VALIDATE_SECURITY_KEY VALIDATE_TOTP}input RelSearchInput{childid:String childids:[String]childtype:SearchResultType owningtenantid:String page:Int!parentid:String parenttype:SearchResultType perPage:Int!sortDirection:String sortField:String term:String}type RelSearchResultItem{childdescription:String childid:String!childname:String!childtype:SearchResultType!owningtenantid:String!owningtenantname:String parentid:String!parentname:String parenttype:SearchResultType!}type RelSearchResults{endtime:Float!page:Int!perpage:Int!resultlist:[RelSearchResultItem!]!starttime:Float!took:Int!total:Int!}type SchedulerLock{lockExpiresAtMS:Float!lockInstanceId:String!lockName:String!lockStartTimeMS:Float!}type Scope{markForDelete:Boolean!scopeDescription:String!scopeId:String!scopeName:String!scopeUse:String!}type ScopeAccessRuleSchema{schemaVersion:Int!scopeAccessRuleSchema:String!scopeAccessRuleSchemaId:String!scopeId:String!}input ScopeAccessRuleSchemaCreateInput{schema:String!scopeId:String!}input ScopeAccessRuleSchemaUpdateInput{schema:String!scopeAccessRuleSchemaId:String!scopeId:String!}input ScopeCreateInput{scopeAccessRuleSchemaId:String scopeDescription:String!scopeName:String!scopeUse:String!}enum ScopeFilterCriteria{AVAILABLE EXISTING}input ScopeUpdateInput{scopeAccessRuleSchemaId:String scopeDescription:String!scopeId:String!scopeName:String!}input SearchFilterInput{objectType:SearchFilterInputObjectType!objectValue:String!}enum SearchFilterInputObjectType{AUTHENTICATION_GROUP_ID AUTHORIZATION_GROUP_ID CLIENT_ID TENANT_ID USER_ID}input SearchInput{filters:[SearchFilterInput]page:Int!perPage:Int!resultType:SearchResultType sortDirection:String sortField:String term:String}enum SearchRelType{AUTHENTICATION_GROUP_USER_REL AUTHORIZATION_GROUP_USER_REL CLIENT_AUTHENTICATION_GROUP_REL}enum SearchResultType{ACCESS_CONTROL AUTHENTICATION_GROUP AUTHORIZATION_GROUP CLIENT KEY OIDC_PROVIDER RATE_LIMIT TENANT USER}enum SecondFactorType{SECURITY_KEY TOTP}enum SecretObjectType{CLIENT_SECRET OIDC_PROVIDER_CLIENT_SECRET PRIVATE_KEY PRIVATE_KEY_PASSWORD}type SecretShare{expiresAtMs:Float!objectId:String!otp:String!secretShareId:String!secretShareObjectType:SecretShareObjectType!}enum SecretShareObjectType{OIDC_PROVIDER}type SigningKey{certificate:String createdAtMs:Float!expiresAtMs:Float!keyId:String!keyName:String!keyType:String!keyTypeId:String keyUse:String!markForDelete:Boolean!password:String privateKeyPkcs8:String!publicKey:String status:String!statusId:String tenantId:String!}input SigningKeyCreateInput{certificate:String expiresAtMs:Float keyName:String!keyType:String!keyTypeId:String keyUse:String!password:String privateKeyPkcs8:String!publicKey:String tenantId:String!}input SigningKeyUpdateInput{keyId:String!keyName:String keyUse:String status:String!}type StateProvinceRegion{isoCountryCode:String!isoEntryCode:String!isoEntryName:String!isoSubsetType:String!}type SuccessfulLoginResponse{challenge:String mfaEnabled:Boolean!mfaType:String userId:String!}type SystemCategory{categoryEntries:[CategoryEntry!]!categoryName:String!}type SystemSettings{allowDuressPassword:Boolean!allowRecoveryEmail:Boolean!auditRecordRetentionPeriodDays:Int enablePortalAsLegacyIdp:Boolean!rootClientId:String!softwareVersion:String!systemCategories:[SystemCategory!]!systemId:String!}input SystemSettingsUpdateInput{allowDuressPassword:Boolean!allowRecoveryEmail:Boolean!auditRecordRetentionPeriodDays:Int enablePortalAsLegacyIdp:Boolean!rootClientId:String!}type TOTPResponse{uri:String!userMFARel:UserMFARel!}type Tenant{allowAnonymousUsers:Boolean!allowForgotPassword:Boolean!allowLoginByPhoneNumber:Boolean!allowSocialLogin:Boolean!allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!defaultRateLimit:Int defaultRateLimitPeriodMinutes:Int enabled:Boolean!federatedAuthenticationConstraint:String!federatedauthenticationconstraintid:String markForDelete:Boolean!migrateLegacyUsers:Boolean!registrationRequireCaptcha:Boolean!registrationRequireTermsAndConditions:Boolean!tenantDescription:String tenantId:String!tenantName:String!tenantType:String!tenanttypeid:String termsAndConditionsUri:String verifyEmailOnSelfRegistration:Boolean!}input TenantAnonymousUserConfigInput{defaultcountrycode:String defaultlangugecode:String tenantId:String!tokenttlseconds:Int!}type TenantAnonymousUserConfiguration{defaultcountrycode:String defaultlangugecode:String tenantId:String!tokenttlseconds:Int!}type TenantAvailableScope{accessRuleId:String scopeId:String!tenantId:String!}input TenantCreateInput{allowAnonymousUsers:Boolean!allowForgotPassword:Boolean!allowLoginByPhoneNumber:Boolean!allowSocialLogin:Boolean!allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!defaultRateLimit:Int defaultRateLimitPeriodMinutes:Int enabled:Boolean!federatedAuthenticationConstraint:String!migrateLegacyUsers:Boolean!registrationRequireCaptcha:Boolean!registrationRequireTermsAndConditions:Boolean!tenantDescription:String tenantId:String!tenantName:String!tenantType:String!termsAndConditionsUri:String verifyEmailOnSelfRegistration:Boolean!}type TenantLegacyUserMigrationConfig{authenticationUri:String!tenantId:String!userProfileUri:String!usernameCheckUri:String!}input TenantLegacyUserMigrationConfigInput{authenticationUri:String!tenantId:String!userProfileUri:String!usernameCheckUri:String!}type TenantLoginFailurePolicy{failureThreshold:Int!loginFailurePolicyType:String!maximumLoginFailures:Int pauseDurationMinutes:Int tenantId:String!}input TenantLoginFailurePolicyInput{failureThreshold:Int!loginFailurePolicyType:String!maximumLoginFailures:Int pauseDurationMinutes:Int tenantId:String!}type TenantLookAndFeel{adminheaderbackgroundcolor:String adminheadertext:String adminheadertextcolor:String adminlogo:String authenticationheaderbackgroundcolor:String authenticationheadertext:String authenticationheadertextcolor:String authenticationlogo:String authenticationlogomimetype:String footerlinks:[FooterLink]tenantid:String!}input TenantLookAndFeelInput{adminheaderbackgroundcolor:String adminheadertext:String adminheadertextcolor:String adminlogo:String authenticationheaderbackgroundcolor:String authenticationheadertext:String authenticationheadertextcolor:String authenticationlogo:String authenticationlogomimetype:String footerlinks:[FooterLinkInput]tenantid:String!}type TenantManagementDomainRel{domain:String!tenantId:String!}type TenantMetaData{systemSettings:SystemSettings!tenant:Tenant!tenantLookAndFeel:TenantLookAndFeel}type TenantPasswordConfig{maxRepeatingCharacterLength:Int mfaTypesRequired:String passwordHashingAlgorithm:String!passwordHistoryPeriod:Int passwordMaxLength:Int!passwordMinLength:Int!passwordRotationPeriodDays:Int requireLowerCase:Boolean!requireMfa:Boolean!requireNumbers:Boolean!requireSpecialCharacters:Boolean!requireUpperCase:Boolean!specialCharactersAllowed:String tenantId:String!}type TenantRateLimitRel{allowUnlimitedRate:Boolean rateLimit:Int rateLimitPeriodMinutes:Int servicegroupid:String!tenantId:String!}type TenantRateLimitRelView{allowUnlimitedRate:Boolean rateLimit:Int rateLimitPeriodMinutes:Int servicegroupid:String!servicegroupname:String!tenantId:String!tenantName:String!}type TenantRestrictedAuthenticationDomainRel{domain:String!tenantId:String!}type TenantSelectorData{tenantId:String!tenantName:String!}type TenantSupportedClaimRel{claim:String!tenantId:String!}input TenantUpdateInput{allowAnonymousUsers:Boolean!allowForgotPassword:Boolean!allowLoginByPhoneNumber:Boolean!allowSocialLogin:Boolean!allowUnlimitedRate:Boolean!allowUserSelfRegistration:Boolean!defaultRateLimit:Int defaultRateLimitPeriodMinutes:Int enabled:Boolean!federatedAuthenticationConstraint:String!migrateLegacyUsers:Boolean!registrationRequireCaptcha:Boolean!registrationRequireTermsAndConditions:Boolean!tenantDescription:String tenantId:String!tenantName:String!tenantType:String!termsAndConditionsUri:String verifyEmailOnSelfRegistration:Boolean!}type User{address:String addressLine1:String city:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!markForDelete:Boolean!middleName:String nameOrder:String!phoneNumber:String postalCode:String preferredLanguageCode:String recoveryEmail:UserRecoveryEmail stateRegionProvince:String userId:String!}type UserAuthenticationState{authenticationSessionToken:String!authenticationState:AuthenticationState!authenticationStateOrder:Int!authenticationStateStatus:String!deviceCodeId:String expiresAtMs:Float!preAuthToken:String returnToUri:String tenantId:String!userId:String!}type UserAuthenticationStateResponse{accessToken:String authenticationError:ErrorDetail availableTenants:[TenantSelectorData!]passwordConfig:TenantPasswordConfig tokenExpiresAtMs:Float totpSecret:String uri:String userAuthenticationState:UserAuthenticationState!}input UserCreateInput{address:String addressLine1:String city:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!middleName:String nameOrder:String!password:String!phoneNumber:String postalCode:String preferredLanguageCode:String stateRegionProvince:String termsAndConditionsAccepted:Boolean!}type UserCredential{dateCreated:String!hashedPassword:String!hashingAlgorithm:String!salt:String!userId:String!}type UserFailedLogin{failureAtMs:Float!failureCount:Float!nextLoginNotBefore:Float!userId:String!}type UserMFARel{fido2CredentialId:String fido2KeySupportsCounters:Boolean fido2PublicKey:String fido2PublicKeyAlgorithm:Int fido2Transports:String mfaType:String!primaryMfa:Boolean!totpHashAlgorithm:String totpSecret:String userId:String!}type UserRecoveryEmail{email:String!emailVerified:Boolean!userId:String!}type UserRegistrationState{deviceCodeId:String email:String!expiresAtMs:Float!preAuthToken:String registrationSessionToken:String!registrationState:RegistrationState!registrationStateOrder:Int!registrationStateStatus:String!tenantId:String!userId:String!}type UserRegistrationStateResponse{accessToken:String registrationError:ErrorDetail tokenExpiresAtMs:Float totpSecret:String uri:String userRegistrationState:UserRegistrationState!}type UserScopeRel{scopeId:String!tenantId:String!userId:String!}type UserSession{clientId:String!clientName:String!tenantId:String!tenantName:String!userId:String!}type UserTenantRel{enabled:Boolean!relType:String!tenantId:String!userId:String!}type UserTenantRelView{relType:String!tenantId:String!tenantName:String!userId:String!}type UserTermsAndConditionsAccepted{acceptedAtMs:Float!tenantId:String!userId:String!}input UserUpdateInput{address:String addressLine1:String city:String countryCode:String domain:String!email:String!emailVerified:Boolean!enabled:Boolean!federatedOIDCProviderSubjectId:String firstName:String!lastName:String!locked:Boolean!middleName:String nameOrder:String!phoneNumber:String postalCode:String preferredLanguageCode:String stateRegionProvince:String userId:String!}`);