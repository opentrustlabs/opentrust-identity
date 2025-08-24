import { TenantAnonymousUserConfiguration, ObjectSearchResultItem, SearchResultType, Tenant, TenantLegacyUserMigrationConfig, TenantLookAndFeel, TenantManagementDomainRel, TenantMetaData, TenantPasswordConfig, TenantRestrictedAuthenticationDomainRel, FederatedOidcProviderTenantRel, TenantAvailableScope, TenantLoginFailurePolicy, CaptchaConfig, SystemSettings, SystemSettingsUpdateInput, JobData, Client, ErrorDetail, FederatedOidcProvider } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql";
import { randomUUID } from 'crypto'; 
import { CAPTCHA_CONFIG_SCOPE, CHANGE_EVENT_CLASS_TENANT, CHANGE_EVENT_CLASS_TENANT_ANONYMOUS_USER_CONFIGURATION, CHANGE_EVENT_CLASS_TENANT_AUTHENTICATION_DOMAIN_REL, CHANGE_EVENT_CLASS_TENANT_LEGACY_USER_MIGRATION_CONFIGURATION, CHANGE_EVENT_CLASS_TENANT_LOGIN_FAILURE_POLICY, CHANGE_EVENT_CLASS_TENANT_LOOK_AND_FEEL, CHANGE_EVENT_CLASS_TENANT_PASSWORD_CONFIGURATION, CHANGE_EVENT_TYPE_CREATE, CHANGE_EVENT_TYPE_CREATE_REL, CHANGE_EVENT_TYPE_DELETE, CHANGE_EVENT_TYPE_REMOVE_REL, CHANGE_EVENT_TYPE_UPDATE, DEFAULT_TENANT_META_DATA, FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, JOBS_READ_SCOPE, MFA_AUTH_TYPE_NONE, MFA_AUTH_TYPES, PASSWORD_HASHING_ALGORITHMS, PASSWORD_MAXIMUM_LENGTH, PASSWORD_MINIMUM_LENGTH, SEARCH_INDEX_OBJECT_SEARCH, SYSTEM_SETTINGS_READ_SCOPE, SYSTEM_SETTINGS_UPDATE_SCOPE, TENANT_CREATE_SCOPE, TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE, TENANT_TYPE_ROOT_TENANT, TENANT_TYPES_DISPLAY, TENANT_UPDATE_SCOPE } from "@/utils/consts";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import ScopeDao from "../dao/scope-dao";
import { authorizeByScopeAndTenant, containsScope, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import MarkForDeleteDao from "../dao/mark-for-delete-dao";
import SchedulerDao from "../dao/scheduler-dao";
import ClientDao from "../dao/client-dao";
import { ERROR_CODES } from "../models/error";
import ChangeEventDao from "../dao/change-event-dao";

const searchClient = getOpenSearchClient();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const markForDeleteDao: MarkForDeleteDao = DaoFactory.getInstance().getMarkForDeleteDao();
const schedulerDao: SchedulerDao = DaoFactory.getInstance().getSchedulerDao();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();

class TenantService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getRootTenant(): Promise<Tenant> {
        return tenantDao.getRootTenant();
    }

    public async createRootTenant(tenant: Tenant): Promise<Tenant> {

        // TODO
        // Get the root tenant first in a try/catch block. If the root
        // tenant does not already exist, the error object should have the 
        // message: ERROR_UNABLE_TO_FIND_A_ROOT_TENANT
        // In that case, create a new tenant
        // 
        // If there is already a root tenant, then throw an error
        //
        // The scope should be TENANT_CREATE (derived from an RSA key pair for identity) 
        // and the .env file should have a property called: INIT_IAM_PORTAL=true

        tenant.tenantId = randomUUID().toString();
        await tenantDao.createRootTenant(tenant);
        await this.updateSearchIndex(tenant);

        return Promise.resolve(tenant);        
    }

    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenant.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const {valid, errorDetail} = await this.validateTenantInput(tenant);        
        if(!valid){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        // TODO
        // If the tenant.allowSocialLogin is set to false, then delete any OIDC
        // provider with a provider type of "SOCIAL"
        await tenantDao.updateRootTenant(tenant);
        await this.updateSearchIndex(tenant);
        return Promise.resolve(tenant);
    }
        
    public async getTenants(tenantIds?: Array<string>, federatedOIDCProviderId?: string, scopeId?: string): Promise<Array<Tenant>> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], this.oidcContext.portalUserProfile?.managementAccessTenantId || "");
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        let tenantFilterIds: Array<string> | undefined = undefined;

        if(federatedOIDCProviderId){
            const r: Array<FederatedOidcProviderTenantRel> = await federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(undefined, federatedOIDCProviderId);
            tenantFilterIds = r.map((rel: FederatedOidcProviderTenantRel) => rel.tenantId);
        }
        else if(tenantIds){
            tenantFilterIds = tenantIds;
        }
        else if(scopeId){
            const s: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(undefined, scopeId);
            tenantFilterIds = s.map((e: TenantAvailableScope) => e.tenantId);
        }

        if(this.oidcContext.portalUserProfile?.managementAccessTenantId !== this.oidcContext.rootTenant.tenantId){
            tenantFilterIds = tenantFilterIds?.filter(
                (id: string) => id === this.oidcContext.portalUserProfile?.managementAccessTenantId
            );
        }        

        return tenantDao.getTenants(tenantFilterIds);    
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        return tenantDao.getTenantById(tenantId);
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_CREATE_SCOPE], null);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const {valid, errorDetail} = await this.validateTenantInput(tenant);
        if(!valid){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        
        tenant.tenantId = randomUUID().toString();
        await tenantDao.createTenant(tenant);
        await this.updateSearchIndex(tenant);

        changeEventDao.addChangeEvent({
            objectId: tenant.tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify(tenant)
        });

        return Promise.resolve(tenant);
    }
    
    protected async updateSearchIndex(tenant: Tenant): Promise<void> {
        let owningTenantId: string | null = null;
        if(tenant.tenantType !== TENANT_TYPE_ROOT_TENANT){
            const rootTenant: Tenant = await this.getRootTenant();
            owningTenantId = rootTenant.tenantId;
        }
        const document: ObjectSearchResultItem = {
            name: tenant.tenantName,
            description: tenant.tenantDescription,
            objectid: tenant.tenantId,
            objecttype: SearchResultType.Tenant,
            owningtenantid: owningTenantId,
            email: "",
            enabled: tenant.enabled,
            owningclientid: "",
            subtype: TENANT_TYPES_DISPLAY.get(tenant.tenantType),
            subtypekey: tenant.tenantType
        }
        
        await searchClient.index({
            id: tenant.tenantId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });        
    }
    
    protected async validateTenantInput(tenant: Tenant): Promise<{valid: boolean, errorDetail: ErrorDetail}> {
    
        // TODO
        //
        //
        // if(tenant.federatedAuthenticationConstraint === FederatedAuthenticationConstraint.Exclusive && (!tenant.federatedOIDCProviderId || "" === tenant.federatedOIDCProviderId)){
        //     return {valid: false, errorMessage: "ERROR_MISSING_EXTERNAL_OIDC_PROVIDER"};
        // }
        // if(tenant.federatedOIDCProviderId && "" !== tenant.federatedOIDCProviderId){
        //     const oidcProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderById(tenant.federatedOIDCProviderId || "");
        //     if(!oidcProvider){
        //         return {valid: false, errorMessage: "ERROR_INVALID_OIDC_PROVIDER"};
        //     }
        // }
        if(tenant.tenantType === ""){
            return {valid: false, errorDetail: ERROR_CODES.EC00008}
        }
        return {valid: true, errorDetail: ERROR_CODES.NULL_ERROR};
    }

    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenant.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const {valid, errorDetail} = await this.validateTenantInput(tenant);
        if(!valid){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        
        // TODO
        // If the tenant.allowSocialLogin is set to false, then delete any OIDC
        // provider with a provider type of "SOCIAL"
        await tenantDao.updateTenant(tenant);
        await this.updateSearchIndex(tenant);

        changeEventDao.addChangeEvent({
            objectId: tenant.tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_UPDATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify(tenant)
        });

        return Promise.resolve(tenant);
    }


    public async addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorMessage, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){            
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }
        // if the relsByDomain exists, just return it        
        const relsByDomain: Array<TenantManagementDomainRel> = await this.getDomainTenantManagementRels(tenantId, domain);
        if(relsByDomain.length === 1){
            return {
                domain,
                tenantId
            };
        }

        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_AUTHENTICATION_DOMAIN_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, domain})
        });

        return tenantDao.addDomainToTenantManagement(tenantId, domain);
    }

    public async removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_AUTHENTICATION_DOMAIN_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, domain})
        });

        return tenantDao.removeDomainFromTenantManagement(tenantId, domain);
    }

    public async getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>>{
        const getData = ServiceAuthorizationWrapper(
            {
                preProcess: async function(oidcContext: OIDCContext, ...args) {
                    if (oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
                        return [oidcContext.portalUserProfile?.managementAccessTenantId || "", args[1]];
                    }
                    return args;
                },
                performOperation: async function(_, ...args) {                    
                    return tenantDao.getDomainTenantManagementRels(...args);
                },
            }
        );
        const rels = await getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], tenantId, domain);
        return rels || [];
    }
   

    public async getTenantMetaData(tenantId: string): Promise<TenantMetaData | null> {
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }
        
        const tenantLookAndFeel: TenantLookAndFeel | null = await tenantDao.getTenantLookAndFeel(tenantId);

        const systemSettings: SystemSettings = await tenantDao.getSystemSettings();
        // clear out the details of the system settings. Details are only for admin users with sufficient permissions
        // to view and update
        systemSettings.systemCategories = [];
        
        
        let socialProviders: Array<FederatedOidcProvider> = await federatedOIDCProviderDao.getFederatedOidcProviders(tenantId);
        socialProviders.forEach(
            (p: FederatedOidcProvider) => {
                p.federatedOIDCProviderClientSecret = "";
                p.federatedOIDCProviderWellKnownUri = "";
                p.clientAuthType = "";
                p.scopes = [];                
            }
        );        
        socialProviders = socialProviders.filter(
            (p: FederatedOidcProvider) => p.markForDelete === false && p.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL
        );        
        return Promise.resolve(
            {
                tenant: tenant,
                tenantLookAndFeel: tenantLookAndFeel ? tenantLookAndFeel : DEFAULT_TENANT_META_DATA.tenantLookAndFeel,
                systemSettings: systemSettings,
                socialOIDCProviders: socialProviders
            }
        );
    }

    public async getTenantLookAndFeel(tenantId: string): Promise<TenantLookAndFeel | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        const tenantLookAndFeel: TenantLookAndFeel | null = await tenantDao.getTenantLookAndFeel(tenantId);
        return Promise.resolve(tenantLookAndFeel);
    }

    public async setTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantLookAndFeel.tenantid);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const existing: TenantLookAndFeel | null = await tenantDao.getTenantLookAndFeel(tenantLookAndFeel.tenantid);
        if(!existing){
            changeEventDao.addChangeEvent({
                objectId: tenantLookAndFeel.tenantid,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_TENANT_LOOK_AND_FEEL,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_CREATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(tenantLookAndFeel)
            });
            return tenantDao.createTenantLookAndFeel(tenantLookAndFeel);
        }
        else {
            changeEventDao.addChangeEvent({
                objectId: tenantLookAndFeel.tenantid,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_TENANT_LOOK_AND_FEEL,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_UPDATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(tenantLookAndFeel)
            });
            return tenantDao.updateTenantLookAndFeel(tenantLookAndFeel);
        }
    }

 
    public async deleteTenantLookAndFeel(tenantId: string): Promise<void>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_LOOK_AND_FEEL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_DELETE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId})
        });
        return tenantDao.deleteTenantLookAndFeel(tenantId);
    }

    public async getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null> {        
        return tenantDao.getTenantPasswordConfig(tenantId);
    }

    public async assignPasswordConfigToTenant(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantPasswordConfig.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        if(tenantPasswordConfig.passwordMinLength < PASSWORD_MINIMUM_LENGTH){
            throw new GraphQLError(ERROR_CODES.EC00088.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00088}});
        }
        if(tenantPasswordConfig.passwordMaxLength > PASSWORD_MAXIMUM_LENGTH){
            throw new GraphQLError(ERROR_CODES.EC00089.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00089}});
        }
        if(tenantPasswordConfig.requireMfa){
            if(tenantPasswordConfig.mfaTypesRequired === null || tenantPasswordConfig.mfaTypesRequired === undefined || tenantPasswordConfig.mfaTypesRequired === ""){
                throw new GraphQLError(ERROR_CODES.EC00090.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00090}});
            }
            else{
                const mfaTypes = tenantPasswordConfig.mfaTypesRequired.split(",");
                let hasValidMfaTypes: boolean = true;
                for(let i = 0; i < mfaTypes.length; i++){
                    if(mfaTypes[i] === MFA_AUTH_TYPE_NONE){
                        hasValidMfaTypes = false;
                        break;
                    }
                    if(!MFA_AUTH_TYPES.includes(mfaTypes[i])){
                        hasValidMfaTypes = false;
                        break;
                    }
                }
                if(hasValidMfaTypes === false){
                    throw new GraphQLError(ERROR_CODES.EC00091.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00091}});
                }
            }
        }
        if(!PASSWORD_HASHING_ALGORITHMS.includes(tenantPasswordConfig.passwordHashingAlgorithm)){
            throw new GraphQLError(ERROR_CODES.EC00092.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00092}});
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantPasswordConfig.tenantId);
        if(tenant === null){
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }
        const existingConfig: TenantPasswordConfig | null = await tenantDao.getTenantPasswordConfig(tenantPasswordConfig.tenantId);
        if(existingConfig === null){ 
            changeEventDao.addChangeEvent({
                objectId: tenantPasswordConfig.tenantId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_TENANT_PASSWORD_CONFIGURATION,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_CREATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(tenantPasswordConfig)
            });
            return tenantDao.assignPasswordConfigToTenant(tenantPasswordConfig);    
        }
        else{
            changeEventDao.addChangeEvent({
                objectId: tenantPasswordConfig.tenantId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_TENANT_PASSWORD_CONFIGURATION,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_UPDATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(tenantPasswordConfig)
            });
            return tenantDao.updatePasswordConfig(tenantPasswordConfig);
        }
    }

    public async removePasswordConfigFromTenant(tenantId: string): Promise<void>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_PASSWORD_CONFIGURATION,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_DELETE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId})
        });
        return tenantDao.removePasswordConfigFromTenant(tenantId);
    }

    public async getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        return tenantDao.getLegacyUserMigrationConfiguration(tenantId);
    }

    public async setTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantLegacyUserMigrationConfig.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        const existing: TenantLegacyUserMigrationConfig | null = await tenantDao.getLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig.tenantId);
        if(existing){ 
            changeEventDao.addChangeEvent({
                objectId: tenantLegacyUserMigrationConfig.tenantId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_TENANT_LEGACY_USER_MIGRATION_CONFIGURATION,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_UPDATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(tenantLegacyUserMigrationConfig)
            });
            return tenantDao.updateTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig)
        }
        else{
            changeEventDao.addChangeEvent({
                objectId: tenantLegacyUserMigrationConfig.tenantId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_TENANT_LEGACY_USER_MIGRATION_CONFIGURATION,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_CREATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(tenantLegacyUserMigrationConfig)
            });
            return tenantDao.createTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig);
        }
    }

    public async setTenantAnonymousUserConfig(tenantAnonymousUserConfigInput: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantAnonymousUserConfigInput.tenantId); 
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        const existing: TenantAnonymousUserConfiguration | null = await tenantDao.getAnonymousUserConfiguration(tenantAnonymousUserConfigInput.tenantId);
        if(existing){
            changeEventDao.addChangeEvent({
                objectId: tenantAnonymousUserConfigInput.tenantId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_TENANT_ANONYMOUS_USER_CONFIGURATION,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_UPDATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(tenantAnonymousUserConfigInput)
            });
            return tenantDao.updateAnonymousUserConfiguration(tenantAnonymousUserConfigInput);
        }
        else{
            changeEventDao.addChangeEvent({
                objectId: tenantAnonymousUserConfigInput.tenantId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_TENANT_ANONYMOUS_USER_CONFIGURATION,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_CREATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(tenantAnonymousUserConfigInput)
            });
            return tenantDao.createAnonymousUserConfiguration(tenantAnonymousUserConfigInput);
        }
    }

    public async removeTenantAnonymousUserConfig(tenantId: string): Promise<void> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId); 
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        await tenantDao.deleteAnonymousUserConfiguration(tenantId);
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_ANONYMOUS_USER_CONFIGURATION,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_DELETE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId})
        });
        return;
    }

    public async getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        return tenantDao.getDomainsForTenantRestrictedAuthentication(tenantId);
    }

    public async addDomainToTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<TenantRestrictedAuthenticationDomainRel> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        } 

        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_AUTHENTICATION_DOMAIN_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, domain})
        });
        return tenantDao.addDomainToTenantRestrictedAuthentication(tenantId, domain);
    }

    public async removeDomainFromTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<void>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_AUTHENTICATION_DOMAIN_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, domain})
        });
        return tenantDao.removeDomainFromTenantRestrictedAuthentication(tenantId, domain);
    }

    public async getTenantLoginFailurePolicy(tenantId: string): Promise<TenantLoginFailurePolicy | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        return tenantDao.getLoginFailurePolicy(tenantId);
    }

    public async setTenantLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], loginFailurePolicy.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        const existing: TenantLoginFailurePolicy | null = await tenantDao.getLoginFailurePolicy(loginFailurePolicy.tenantId);
        
        if(!existing){  
            changeEventDao.addChangeEvent({
                objectId: loginFailurePolicy.tenantId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_TENANT_LOGIN_FAILURE_POLICY,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_CREATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(loginFailurePolicy)
            });
            await tenantDao.createLoginFailurePolicy(loginFailurePolicy);        
        }
        else{
            changeEventDao.addChangeEvent({
                objectId: loginFailurePolicy.tenantId,
                changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
                changeEventClass: CHANGE_EVENT_CLASS_TENANT_LOGIN_FAILURE_POLICY,
                changeEventId: randomUUID().toString(),
                changeEventType: CHANGE_EVENT_TYPE_UPDATE,
                changeTimestamp: Date.now(),
                data: JSON.stringify(loginFailurePolicy)
            });
            await tenantDao.updateLoginFailurePolicy(loginFailurePolicy);
        }
        return loginFailurePolicy;
    }

    public async removeTenantLoginFailurePolicy(tenantId: string): Promise<void> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_LOGIN_FAILURE_POLICY,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_DELETE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId})
        });
        await tenantDao.removeLoginFailurePolicy(tenantId);
    }

    public async getCaptchaConfig(): Promise<CaptchaConfig | null> {
        const getData = ServiceAuthorizationWrapper(
            {                
                performOperation: async function() {                    
                    return tenantDao.getCaptchaConfig();
                },
                postProcess: async function(oidcContext: OIDCContext, result) {
                    if(result && !containsScope(CAPTCHA_CONFIG_SCOPE, oidcContext.portalUserProfile?.scope || [])){
                        result.apiKey = "";
                        result.siteKey = "";
                        result.minScopeThreshold = null;
                        result.projectId = null;
                    }
                    return result;
                }
            }
        );
        const config = await getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE]);
        return config;
    }

    public async getSystemSettings(): Promise<SystemSettings> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [SYSTEM_SETTINGS_READ_SCOPE], null);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        return tenantDao.getSystemSettings();
    }

    public async updateSystemSettings(systemSettingsUpdateInput: SystemSettingsUpdateInput): Promise<SystemSettings> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [SYSTEM_SETTINGS_UPDATE_SCOPE], null);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        
        const existingSystemSettings = await tenantDao.getSystemSettings();
        if(existingSystemSettings.rootClientId !== systemSettingsUpdateInput.rootClientId){
            const client: Client | null = await clientDao.getClientById(systemSettingsUpdateInput.rootClientId);
            if(client === null){
                throw new GraphQLError(ERROR_CODES.EC00093.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00093}});
            }
            const rootTenant: Tenant = await tenantDao.getRootTenant();
            if(client.tenantId !== rootTenant.tenantId){
                throw new GraphQLError(ERROR_CODES.EC00094.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00094}});
            }
        }
        if(systemSettingsUpdateInput.auditRecordRetentionPeriodDays){
            if(systemSettingsUpdateInput.auditRecordRetentionPeriodDays < 1){
                throw new GraphQLError(ERROR_CODES.EC00186.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00186}});
            }
        }

        await tenantDao.updateSystemSettings(systemSettingsUpdateInput);
        changeEventDao.addChangeEvent({
            objectId: existingSystemSettings.systemId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_LOGIN_FAILURE_POLICY,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_UPDATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify(systemSettingsUpdateInput)
        });
        
        return tenantDao.getSystemSettings();
    }

    public async getJobData(): Promise<JobData>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [JOBS_READ_SCOPE], null);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const m = await markForDeleteDao.getLatestMarkForDeleteRecords(500);
        const s = await schedulerDao.getSchedulerLocks(500);

        const jobData: JobData = {
            markForDeleteItems: m,
            schedulerLocks: s
        };
        
        return jobData;
    }

}

export default TenantService;