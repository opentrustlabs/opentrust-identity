import { AuthenticationState, AuthorizationGroup, Client, Contact, ErrorDetail, FederatedAuthTest, FederatedOidcProvider, PortalUserProfile, Scope, SigningKey, SystemInitializationInput, SystemInitializationReadyResponse, SystemInitializationResponse, SystemSettings, Tenant, User, UserAuthenticationStateResponse, UserCredential } from "@/graphql/generated/graphql-types";
import { DaoFactory } from "../data-sources/dao-factory";
import ClientDao from "../dao/client-dao";
import TenantDao from "../dao/tenant-dao";
import AuthorizationGroupDao from "../dao/authorization-group-dao";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import ScopeDao from "../dao/scope-dao";
import ChangeEventDao from "../dao/change-event-dao";
import Kms from "../kms/kms";
import ContactDao from "../dao/contact-dao";
import { readFileSync } from "node:fs";
import { createPrivateKey, createPublicKey, KeyObject, PrivateKeyInput, PublicKeyInput, randomUUID, X509Certificate } from "node:crypto";
import { ERROR_CODES } from "../models/error";
import { logWithDetails } from "../logging/logger";
import BaseSearchService from "./base-search-service";
import JwtServiceUtils from "./jwt-service-utils";
import { ALL_INTERNAL_SCOPE_NAMES_DISPLAY, CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP, CHANGE_EVENT_CLASS_CLIENT, CHANGE_EVENT_CLASS_OIDC_PROVIDER, CHANGE_EVENT_CLASS_SCOPE, CHANGE_EVENT_CLASS_SIGNING_KEY, CHANGE_EVENT_CLASS_TENANT, CHANGE_EVENT_CLASS_USER, CHANGE_EVENT_TYPE_CREATE, CONTACT_TYPE_FOR_CLIENT, CONTACT_TYPE_FOR_TENANT, CUSTOM_ENCRYP_DECRYPT_SCOPE, FEDERATED_AUTH_TEST_STATE_PARAM_PREFIX, KEY_TYPE_RSA, KEY_USE_JWT_SIGNING, LEGACY_USER_MIGRATION_SCOPE, NAME_ORDER_WESTERN, OIDC_CLIENT_AUTH_TYPES, OPENTRUST_IDENTITY_VERSION, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PRINCIPAL_TYPE_SYSTEM_INIT_USER, SCOPE_USE_IAM_MANAGEMENT, SECURITY_EVENT_WRITE_SCOPE, SIGNING_KEY_STATUS_ACTIVE, SYSTEM_INITIALIZATION_KEY_ID, TENANT_READ_ALL_SCOPE, TENANT_TYPE_ROOT_TENANT, USER_TENANT_REL_TYPE_PRIMARY, VALID_KMS_STRATEGIES } from "@/utils/consts";
import { JWTPayload, JWTVerifyResult } from "jose";
import { generateHash, generateRandomToken, generateUserCredential, getDomainFromEmail } from "@/utils/dao-utils";
import IdentityDao from "../dao/identity-dao";
import { createSigningKey } from "@/utils/signing-key-utils";
import SigningKeysDao from "../dao/signing-keys-dao";
import { OIDCContext } from "@/graphql/graphql-context";
import { JWTPrincipal } from "../models/principal";
import AuthDao from "../dao/auth-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import OIDCServiceUtils from "./oidc-service-utils";
import { WellknownConfig } from "../models/wellknown-config";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const authorizationGroupDao: AuthorizationGroupDao = DaoFactory.getInstance().getAuthorizationGroupDao();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const kms: Kms = DaoFactory.getInstance().getKms();
const contactDao: ContactDao = DaoFactory.getInstance().getContactDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const authDao: AuthDao = DaoFactory.getInstance().getAuthDao();
const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();

const {
    SYSTEM_INIT,
    SYSTEM_INIT_CERTIFICATE_FILE,
    SMTP_ENABLED,
    EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT,
    SECURITY_EVENT_CALLBACK_URI,
    KMS_STRATEGY,
    AUTH_DOMAIN,
    MFA_ISSUER,
    MFA_ORIGIN,
    MFA_ID,
    CUSTOM_KMS_ENCRYPTION_ENDPOINT,
    CUSTOM_KMS_DECRYPTION_ENDPOINT
} = process.env;


class SystemInitializationService extends BaseSearchService {

    oidcContext: OIDCContext; 
    
    constructor(oidcContext: OIDCContext){
        super()
        this.oidcContext = oidcContext;
    }

    public async systemInitializationReady(): Promise<SystemInitializationReadyResponse> {
        const preReqErrors = await this.hasPreRequisites();
        const warnings = await this.hasWarnings();
        
        const systemInitializationReadyResponse: SystemInitializationReadyResponse = {
            systemInitializationReady: preReqErrors.length === 0,
            systemInitializationReadyErrors: preReqErrors,
            systemInitializationWarnings: warnings
        }
        return systemInitializationReadyResponse;
    }

    public async systemInitializationAuthentication(privateKey: string, password: string | null): Promise<UserAuthenticationStateResponse> {
        const TOKEN_VALIDITY_PERIOD_HOURS: number = 8;

        const response: UserAuthenticationStateResponse = {
            userAuthenticationState: {
                authenticationSessionToken: "",
                authenticationState: AuthenticationState.Error,
                authenticationStateOrder: 0,
                authenticationStateStatus: "",
                deviceCodeId: undefined,
                expiresAtMs: 0,
                preAuthToken: undefined,
                returnToUri: undefined,
                tenantId: "",
                userId: ""
            },
            accessToken: "",
            authenticationError: null,
            tokenExpiresAtMs: 0
        };
        const preReqErrors = await this.hasPreRequisites();
        if(preReqErrors.length > 0){
            response.authenticationError = ERROR_CODES.EC00218;
            return response;
        }

        const privateKeyInput: PrivateKeyInput = {
            key: privateKey,
            encoding: "utf-8",
            format: "pem",
            passphrase: password !== null ? password : undefined
        };                    
        const privateKeyObject: KeyObject = createPrivateKey(privateKeyInput);

        const principal: JWTPayload = {
            sub: randomUUID().toString(),
            iss: `${AUTH_DOMAIN}/api/`,
            aud: `${AUTH_DOMAIN}/api/`,
            iat: Date.now() / 1000,
            exp: (Date.now() / 1000) + (TOKEN_VALIDITY_PERIOD_HOURS * 60 * 60),
            at_hash: "",
            name: "",
            given_name: "",
            family_name: "",
            middle_name: "",
            nickname: "",
            preferred_username: "",
            profile: "",
            phone_number: "",
            address: "",
            email: "",
            country_code: "",
            language_code: "en",
            jti: randomUUID().toString(),
            tenant_id: "",
            tenant_name: "",
            client_id: "",
            client_name: "",
            client_type: "",
            principal_type: PRINCIPAL_TYPE_SYSTEM_INIT_USER            
        }
        
        try{
            const jwt: string = await jwtServiceUtils.signJwtWithKey(principal, privateKeyObject, SYSTEM_INITIALIZATION_KEY_ID);
            const {principal: verfiedPrincipal, errorDetail} = await this.validateJwt(jwt);
            if(errorDetail !== null && verfiedPrincipal === null){
                response.authenticationError = errorDetail;
                return response;    
            }
            // if(!p.payload){
            //     response.authenticationError = ERROR_CODES.EC00219;
            //     return response;    
            // }
            else{
                response.userAuthenticationState.authenticationState = AuthenticationState.Completed;
                response.accessToken = jwt;
                response.tokenExpiresAtMs = Date.now() + (TOKEN_VALIDITY_PERIOD_HOURS * 60 * 60 * 1000);
                return response;
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(err: any){
            logWithDetails("error", `Error creating or validating the JWT for system initialization: ${err.message}`, {});
            response.authenticationError = ERROR_CODES.EC00219;
            return response;
        }

    }

    public async initializeSystem(systemInitializationInput: SystemInitializationInput): Promise<SystemInitializationResponse> {
        const response: SystemInitializationResponse = {
            systemInitializationErrors: [],
            tenant: null,
        };
        
        const preReqErrors = await this.hasPreRequisites();
        if(preReqErrors.length > 0){
            response.systemInitializationErrors = preReqErrors;
            return response;
        }

        // To check authorization, at this point we only have the authorization token from the header, which should be a
        // signed JWT that the systemInitializationAuthentication() method produced. The graphql.ts should NOT
        // product a valid portalUserProfile because no user/tenant/client/etc exists at this point. So we need
        // to parse the JWT here and validate using the certificate in the file
        const {principal, errorDetail} = await this.validateJwt(this.oidcContext.authToken);
        if(errorDetail !== null && principal === null){
            response.systemInitializationErrors = [errorDetail];
            return response;
        }
        // if(!p.payload){
        //     response.systemInitializationErrors = [ERROR_CODES.EC00222]
        // }
        // const principal: JWTPrincipal = p.payload as unknown as JWTPrincipal;

        // if(principal.principal_type !== PRINCIPAL_TYPE_SYSTEM_INIT_USER){
        //     response.systemInitializationErrors = [ERROR_CODES.EC00217];
        //     return response;
        // }
        // if(principal.exp < Date.now() / 1000){
        //     response.systemInitializationErrors = [ERROR_CODES.EC00223];
        //     return response;
        // }

        // ************************************************************************************************
        // Create the root tenant
        // ************************************************************************************************
        const rootTenantId: string = randomUUID().toString();
        const tenant: Tenant = {
            allowAnonymousUsers: false,
            allowForgotPassword: systemInitializationInput.rootTenantInput.allowForgotPassword,
            allowLoginByPhoneNumber: false,
            allowSocialLogin: false,
            allowUnlimitedRate: true,
            allowUserSelfRegistration: systemInitializationInput.rootTenantInput.allowUserSelfRegistration,
            enabled: true,
            federatedAuthenticationConstraint: systemInitializationInput.rootTenantInput.federatedAuthenticationConstraint,
            markForDelete: false,
            migrateLegacyUsers: false,
            registrationRequireCaptcha: false,
            registrationRequireTermsAndConditions: false,
            tenantId: rootTenantId,
            tenantName: systemInitializationInput.rootTenantInput.tenantName,
            tenantDescription: systemInitializationInput.rootTenantInput.tenantDescription,            
            tenantType: TENANT_TYPE_ROOT_TENANT,
            verifyEmailOnSelfRegistration: systemInitializationInput.rootTenantInput.verifyEmailOnSelfRegistration
        };
        await tenantDao.createRootTenant(tenant);

        // ************************************************************************************************
        // Create the root client
        // ************************************************************************************************
        const client: Client = {
            clientId: randomUUID().toString(),
            clientName: systemInitializationInput.rootClientInput.clientName,
            clientSecret: "",
            clientType: systemInitializationInput.rootClientInput.clientType,
            enabled: true,
            markForDelete: false,
            oidcEnabled: systemInitializationInput.rootClientInput.oidcEnabled,
            pkceEnabled: systemInitializationInput.rootClientInput.pkceEnabled,
            tenantId: rootTenantId,
            audience: systemInitializationInput.rootClientInput.audience,
            clientDescription: systemInitializationInput.rootClientInput.clientDescription,
            clientTokenTTLSeconds: systemInitializationInput.rootClientInput.clientTokenTTLSeconds,
            maxRefreshTokenCount: systemInitializationInput.rootClientInput.maxRefreshTokenCount,
            userTokenTTLSeconds: systemInitializationInput.rootClientInput.userTokenTTLSeconds
        };
        const clientSecret = generateRandomToken(24, "hex");
        const encryptedClientSecret = await kms.encrypt(clientSecret);
        if(encryptedClientSecret === null){
            response.systemInitializationErrors?.push(ERROR_CODES.EC00032);
            return response;
        }        
        client.clientSecret = encryptedClientSecret;
        await clientDao.createClient(client);

        // ************************************************************************************************
        // Create the root authorization group and optionally a read-only authz group
        // ************************************************************************************************
        const rootAuthzGroup: AuthorizationGroup = {
            allowForAnonymousUsers: false,
            default: false,
            groupId: randomUUID().toString(),
            groupName: systemInitializationInput.rootAuthorizationGroupInput.groupName,
            markForDelete: false,
            tenantId: rootTenantId,
            groupDescription: systemInitializationInput.rootAuthorizationGroupInput.groupDescription
        };
        await authorizationGroupDao.createAuthorizationGroup(rootAuthzGroup);

        let readOnlyAuthzGroup: AuthorizationGroup | null = null;
        if(systemInitializationInput.rootReadOnlyAuthorizationGroupInput){
            readOnlyAuthzGroup = {
                allowForAnonymousUsers: false,
                default: true,
                groupId: randomUUID().toString(),
                groupName: systemInitializationInput.rootReadOnlyAuthorizationGroupInput.groupName,
                groupDescription: systemInitializationInput.rootReadOnlyAuthorizationGroupInput.groupDescription,
                markForDelete: false,
                tenantId: rootTenantId
            }
            await authorizationGroupDao.createAuthorizationGroup(readOnlyAuthzGroup);
        };

        // ************************************************************************************************
        // Create the user and credentials and assign the user to the root tenant and root authz group
        // ************************************************************************************************
        const domain: string = getDomainFromEmail(systemInitializationInput.rootUserCreateInput.email);        
        const user: User = {
            domain: domain,
            email: systemInitializationInput.rootUserCreateInput.email,
            emailVerified: false,
            enabled: true,
            firstName: systemInitializationInput.rootUserCreateInput.firstName,
            lastName: systemInitializationInput.rootUserCreateInput.lastName,
            locked: false,
            markForDelete: false,
            nameOrder: systemInitializationInput.rootUserCreateInput.nameOrder,
            userId: randomUUID().toString(),
            preferredLanguageCode: systemInitializationInput.rootUserCreateInput.preferredLanguageCode,
            countryCode: systemInitializationInput.rootUserCreateInput.countryCode,
            middleName: systemInitializationInput.rootUserCreateInput.middleName,
            phoneNumber: systemInitializationInput.rootUserCreateInput.phoneNumber
        };
        await identityDao.createUser(user);        
        const userCredential: UserCredential = generateUserCredential(user.userId, systemInitializationInput.rootUserCreateInput.password, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS);
        await identityDao.addUserCredential(userCredential);
        
        await identityDao.assignUserToTenant(rootTenantId, user.userId, USER_TENANT_REL_TYPE_PRIMARY);
        await authorizationGroupDao.addUserToAuthorizationGroup(user.userId, rootAuthzGroup.groupId);


        // ************************************************************************************************
        // Create the contacts for the tenant and client
        // ************************************************************************************************
        const rootTenantContact: Contact = {
            contactid: randomUUID().toString(),
            email: systemInitializationInput.rootContact.email,
            objectid: rootTenantId,
            objecttype: CONTACT_TYPE_FOR_TENANT,
            name: systemInitializationInput.rootContact.name
        };
        await contactDao.addContact(rootTenantContact);

        const rootClientContact: Contact = {
            contactid: randomUUID().toString(),
            email: systemInitializationInput.rootContact.email,
            objectid: client.clientId,
            objecttype: CONTACT_TYPE_FOR_CLIENT,
            name: systemInitializationInput.rootContact.name
        };
        await contactDao.addContact(rootClientContact);


        // ************************************************************************************************
        // Add authentication and management domains for the root tenant.
        // ************************************************************************************************
        await tenantDao.addDomainToTenantManagement(rootTenantId, systemInitializationInput.rootAuthenticationDomain);
        await tenantDao.addDomainToTenantRestrictedAuthentication(rootTenantId, systemInitializationInput.rootAuthenticationDomain);


        // ************************************************************************************************
        // Set the system settings
        // ************************************************************************************************
        const systemSettings: SystemSettings = {
            allowDuressPassword: systemInitializationInput.systemSettingsInput.allowDuressPassword,
            allowRecoveryEmail: systemInitializationInput.systemSettingsInput.allowRecoveryEmail,
            enablePortalAsLegacyIdp: false,
            rootClientId: client.clientId,
            softwareVersion: OPENTRUST_IDENTITY_VERSION,
            systemCategories: [],
            systemId: randomUUID().toString(),
            auditRecordRetentionPeriodDays: systemInitializationInput.systemSettingsInput.auditRecordRetentionPeriodDays,
            contactEmail: systemInitializationInput.systemSettingsInput.contactEmail,
            noReplyEmail: systemInitializationInput.systemSettingsInput.noReplyEmail
        };
        await tenantDao.updateSystemSettings(systemSettings);

        // ************************************************************************************************
        // Federated OIDC Provider. If this is set, then we also need to test it
        // ************************************************************************************************
        let federatedOIDCProvider: FederatedOidcProvider | null = null;
        if(systemInitializationInput.rootFederatedOIDCProviderInput){
            federatedOIDCProvider = {
                clientAuthType: systemInitializationInput.rootFederatedOIDCProviderInput.clientAuthType,
                federatedOIDCProviderClientId: systemInitializationInput.rootFederatedOIDCProviderInput.federatedOIDCProviderClientId,
                federatedOIDCProviderId: randomUUID().toString(),
                federatedOIDCProviderName: systemInitializationInput.rootFederatedOIDCProviderInput.federatedOIDCProviderName,
                federatedOIDCProviderType: systemInitializationInput.rootFederatedOIDCProviderInput.federatedOIDCProviderType,
                federatedOIDCProviderWellKnownUri: systemInitializationInput.rootFederatedOIDCProviderInput.federatedOIDCProviderWellKnownUri,
                markForDelete: false,
                refreshTokenAllowed: systemInitializationInput.rootFederatedOIDCProviderInput.refreshTokenAllowed,
                scopes: systemInitializationInput.rootFederatedOIDCProviderInput.scopes,
                usePkce: systemInitializationInput.rootFederatedOIDCProviderInput.usePkce,
                federatedOIDCProviderClientSecret: systemInitializationInput.rootFederatedOIDCProviderInput.federatedOIDCProviderClientSecret,
                federatedOIDCProviderDescription: systemInitializationInput.rootFederatedOIDCProviderInput.federatedOIDCProviderDescription,
                federatedOIDCProviderTenantId: systemInitializationInput.rootFederatedOIDCProviderInput.federatedOIDCProviderTenantId
            }
            await federatedOIDCProviderDao.createFederatedOidcProvider(federatedOIDCProvider);
            await federatedOIDCProviderDao.assignFederatedOidcProviderToDomain(federatedOIDCProvider.federatedOIDCProviderId, systemInitializationInput.rootAuthenticationDomain);
        }

        // ************************************************************************************************
        // Create all scope values and assign them to the root tenant and then to the root authz group
        // ************************************************************************************************
        const scopes: Array<Scope> = [];
        for(let i = 0; i < ALL_INTERNAL_SCOPE_NAMES_DISPLAY.length; i++){
            const scope: Scope = {
                markForDelete: false,
                scopeDescription: ALL_INTERNAL_SCOPE_NAMES_DISPLAY[i].scopeDescription,
                scopeId: randomUUID().toString(),
                scopeName: ALL_INTERNAL_SCOPE_NAMES_DISPLAY[i].scopeName,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT
            };
            await scopeDao.createScope(scope);            
            scopes.push(scope);
            await scopeDao.assignScopeToTenant(rootTenantId, scope.scopeId);
            await scopeDao.assignScopeToAuthorizationGroup(rootTenantId, rootAuthzGroup.groupId, scope.scopeId);

            // Assign the 3 outbound calling scopes to the root client
            if(scope.scopeName === CUSTOM_ENCRYP_DECRYPT_SCOPE || scope.scopeName === LEGACY_USER_MIGRATION_SCOPE || scope.scopeName === SECURITY_EVENT_WRITE_SCOPE){
                await scopeDao.assignScopeToClient(rootTenantId, client.clientId, scope.scopeId);
            }
            if(readOnlyAuthzGroup !== null && scope.scopeName === TENANT_READ_ALL_SCOPE){
                await scopeDao.assignScopeToAuthorizationGroup(rootTenantId, readOnlyAuthzGroup.groupId, scope.scopeId);
            }
            
        }

        // ************************************************************************************************
        // Create the JWT signing key
        // ************************************************************************************************
        const expiresAtDate = new Date(Date.now() + (120 * 24 * 60 * 60 * 1000));
        const keyVersion = generateRandomToken(8, "hex").toUpperCase();
        const keyName = `${tenant.tenantName} JWT Signing Key V-${keyVersion}`;
        const {passphrase, privateKey, certificate} = createSigningKey(keyName, tenant.tenantName, expiresAtDate);        
        const encrypted: string | null = await kms.encrypt(passphrase);        

        const key: SigningKey = {
            createdAtMs: Date.now(),
            expiresAtMs: expiresAtDate.getTime(),
            keyId: randomUUID().toString(),
            keyName: keyName,
            keyType: KEY_TYPE_RSA,
            keyUse: KEY_USE_JWT_SIGNING,            
            markForDelete: false,
            privateKeyPkcs8: privateKey,
            status: SIGNING_KEY_STATUS_ACTIVE,
            tenantId: tenant.tenantId,
            certificate: certificate,
            password: encrypted
        }
        await signingKeysDao.createSigningKey(key);


        // ************************************************************************************************
        // Index all of the documents
        // ************************************************************************************************
        await this.indexTenant(tenant, tenant);
        await this.indexClient(client);
        await this.indexAuthorizationGroup(rootAuthzGroup);
        await this.indexSigningKey(key);
        
        await this.indexUser(user, tenant.tenantId, tenant.tenantId, rootAuthzGroup);
        for(let i = 0; i < scopes.length; i++){
            await this.indexScope(scopes[i], tenant.tenantId);
        }
        if(readOnlyAuthzGroup){
            await this.indexAuthorizationGroup(readOnlyAuthzGroup);
        }
        if(federatedOIDCProvider){
            await this.indexFederatedOIDCProvider(federatedOIDCProvider);
        }
        
        // ************************************************************************************************
        // Create the changes events for all of these objects
        // ************************************************************************************************
        let changeByUser = user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`
        changeByUser = `${changeByUser} - ${user.userId}`
        await changeEventDao.addChangeEvent({
            changedBy: changeByUser,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify(tenant),
            objectId: tenant.tenantId
        });

        await changeEventDao.addChangeEvent({
            changedBy: changeByUser,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify(client),
            objectId: client.clientId
        });

        await changeEventDao.addChangeEvent({
            changedBy: changeByUser,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify(rootAuthzGroup),
            objectId: rootAuthzGroup.groupId
        });

        await changeEventDao.addChangeEvent({
            changedBy: changeByUser,
            changeEventClass: CHANGE_EVENT_CLASS_USER,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify(user),
            objectId: user.userId
        });

        await changeEventDao.addChangeEvent({
            changedBy: changeByUser,
            changeEventClass: CHANGE_EVENT_CLASS_SIGNING_KEY,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({keyId: key.keyId, keyName: key.keyName, createdAtMs: key.createdAtMs, expiresAtMs: key.expiresAtMs, keyType: key.keyType, keyUse: key.keyUse}),
            objectId: key.keyId
        });

        if(readOnlyAuthzGroup){
            await changeEventDao.addChangeEvent({
                changedBy: changeByUser,
                changeEventClass: CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_CREATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(readOnlyAuthzGroup),
                objectId: readOnlyAuthzGroup.groupId
            });
        }
        
        if(federatedOIDCProvider){
            await changeEventDao.addChangeEvent({
                changedBy: changeByUser,
                changeEventClass: CHANGE_EVENT_CLASS_OIDC_PROVIDER,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_CREATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify({federatedOIDCProviderWellKnownUri: federatedOIDCProvider.federatedOIDCProviderWellKnownUri, federatedOIDCProviderId: federatedOIDCProvider.federatedOIDCProviderId, federatedOIDCProviderName: federatedOIDCProvider.federatedOIDCProviderName, federatedOIDCProviderType: federatedOIDCProvider.federatedOIDCProviderType, }),
                objectId: federatedOIDCProvider.federatedOIDCProviderId
            });
        }
        
        for(let i = 0; i < scopes.length; i++){
            await changeEventDao.addChangeEvent({
                changedBy: changeByUser,
                changeEventClass: CHANGE_EVENT_CLASS_SCOPE,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_CREATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(scopes[i]),
                objectId: scopes[i].scopeId
            }); 
        }

        response.tenant = tenant;       
        
        return response;
    }

    public getInitializationCertificate(): X509Certificate | null {
        try {
            const cert = readFileSync(SYSTEM_INIT_CERTIFICATE_FILE || "");
            const x509Cert: X509Certificate = new X509Certificate(cert);
            const d: Date = new Date(x509Cert.validTo);
            if (d.getTime() < Date.now()) {
                return null;
            }
            return x509Cert;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error reading or parsing certificate file for initialization: ${err.message}`, {});
            return null;
        }
    }

    public async createFederatedAuthTest(clientId: string, clientSecret: string | null, usePkce: boolean, scope: string, wellKnownUri: string, clientAuthType: string): Promise<string> {
        // const {errorDetail} = await this.validateJwt(this.oidcContext.authToken);
        // if(errorDetail !== null){
        //     throw new GraphQLError("ERROR_INVALID_TOKEN");
        // }

        if(usePkce === false && clientSecret === null){
            throw new GraphQLError("ERROR_MISSING_CLIENT_SECRET");
        }

        if(!OIDC_CLIENT_AUTH_TYPES.includes(clientAuthType)){
            throw new GraphQLError("ERROR_INVALID_CLIENT_AUTH_TYPE");
        }
        const wellKnownConfig: WellknownConfig | null = await oidcServiceUtils.getWellKnownConfig(wellKnownUri);
        if(!wellKnownConfig){
            throw new GraphQLError("ERROR_UNABLE_TO_RETRIEVE_OIDC_INFORMATION_FROM_WELL_KNOWN_URI");
        }

        const codeVerifier: string | null = usePkce ? generateRandomToken(16) : null;
        const encryptedSecret: string | null = clientSecret !== null ? await kms.encrypt(clientSecret) : null;

        const federatedAuthTest: FederatedAuthTest = {
            authState: `${FEDERATED_AUTH_TEST_STATE_PARAM_PREFIX}${generateRandomToken(16)}`,
            clientAuthType: clientAuthType,
            clientId: clientId,
            expiresAtMs: Date.now() + 60 * 60 * 1000,
            redirectUri: `${AUTH_DOMAIN}/api/federated-auth/return`,
            scope: scope,
            usePkce: usePkce,
            wellKnownUri: wellKnownUri,
            clientSecret: encryptedSecret,
            codeVerifier: codeVerifier
        }

        await authDao.saveFederatedAuthTest(federatedAuthTest);

        const params: URLSearchParams = new URLSearchParams();
        params.set("state", federatedAuthTest.authState);
        params.set("redirect_uri", federatedAuthTest.redirectUri);
        params.set("response_type", "code");
        params.set("scope", scope);
        params.set("client_id", clientId);
        if(usePkce && codeVerifier){
            params.set("code_challenge", generateHash(codeVerifier, "sha256"));
            params.set("code_challenge_method", "S256");
        }

        const uri: string = `${wellKnownConfig.authorization_endpoint}?${params.toString()}`
        return uri;

    }

    protected async hasWarnings(): Promise<Array<ErrorDetail>> {
        const arr: Array<ErrorDetail> = [];
        if(!SMTP_ENABLED || SMTP_ENABLED !== "true"){
            arr.push(ERROR_CODES.EC00214);
        }
        if(SMTP_ENABLED === "true" && (!EMAIL_SERVER_HOST || !EMAIL_SERVER_PORT)){
            arr.push(ERROR_CODES.EC00215);
        }
        if(!SECURITY_EVENT_CALLBACK_URI){
            arr.push(ERROR_CODES.EC00216);
        }
        if(KMS_STRATEGY === "none"){
            arr.push(ERROR_CODES.EC00221);
        }

        return arr;
    }

    protected async hasPreRequisites(): Promise<Array<ErrorDetail>> {

        const arr: Array<ErrorDetail> = [];

        if (!SYSTEM_INIT || SYSTEM_INIT !== "true") {
            arr.push(ERROR_CODES.EC00203);
        }
        if (!SYSTEM_INIT_CERTIFICATE_FILE) {
            arr.push(ERROR_CODES.EC00204);
        }
        const x509Cert: X509Certificate | null = this.getInitializationCertificate();
        if(x509Cert === null){
            arr.push(ERROR_CODES.EC00205);
        }

        try{
            const tenant: Tenant | null = await tenantDao.getRootTenant();
            if(tenant !== null){
                arr.push(ERROR_CODES.EC00206);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(err: any){
            logWithDetails("error", `Error reading tenant information for initialization: ${err.message}`, {});
            arr.push(ERROR_CODES.EC00207)
        }

        try {
            const objectSearchResults = await this._objectSearch(
                {
                    page: 1,
                    perPage: 10
                },
                []
            );
            if(!objectSearchResults){
                arr.push(ERROR_CODES.EC00208);
            }
            const relSearch = await this._relSearch(
                {
                    page: 1,
                    perPage: 10
                },
                []
            );
            if(!relSearch){
                arr.push(ERROR_CODES.EC00209);
            }
        }
        catch(err: any){
            logWithDetails("error", `Error querying search index for initialization: ${err.message}`, {});
            arr.push(ERROR_CODES.EC00210);
        }
        if(!KMS_STRATEGY || !VALID_KMS_STRATEGIES.includes(KMS_STRATEGY)){
            arr.push(ERROR_CODES.EC00211);
        }
        if(KMS_STRATEGY === "custom" && (!CUSTOM_KMS_DECRYPTION_ENDPOINT || !CUSTOM_KMS_ENCRYPTION_ENDPOINT)){
            arr.push(ERROR_CODES.EC00220);
        }
        if(!AUTH_DOMAIN){
            arr.push(ERROR_CODES.EC00212);
        }
        if(!MFA_ISSUER || !MFA_ORIGIN || !MFA_ID){
            arr.push(ERROR_CODES.EC00213);
        }

        return arr;
    }

    protected async validateJwt(jwt: string): Promise<{principal: JWTPrincipal | null, errorDetail: ErrorDetail | null}> {
        const cert = readFileSync(SYSTEM_INIT_CERTIFICATE_FILE || "");

        const publicKeyInput: PublicKeyInput = {
            key: cert,
            encoding: "utf-8",
            format: "pem"
        };
        
        const publicKeyObject = createPublicKey(publicKeyInput);
        const p = await jwtServiceUtils.validateJwtWithCertificate(jwt, publicKeyObject);
         
        if(!p.payload){
            return {principal: null, errorDetail: ERROR_CODES.EC00222};
            //response.systemInitializationErrors = [ERROR_CODES.EC00222]
        }
        const principal: JWTPrincipal = p.payload as unknown as JWTPrincipal;

        if(principal.principal_type !== PRINCIPAL_TYPE_SYSTEM_INIT_USER){
            return {principal: null, errorDetail: ERROR_CODES.EC00217};
            // response.systemInitializationErrors = [ERROR_CODES.EC00217];
            // return response;
        }
        if(principal.exp < Date.now() / 1000){
            return {principal: null, errorDetail: ERROR_CODES.EC00223};
            // response.systemInitializationErrors = [ERROR_CODES.EC00223];
            // return response;
        }

        return {principal: principal, errorDetail: null};
    }


}


export default SystemInitializationService;
