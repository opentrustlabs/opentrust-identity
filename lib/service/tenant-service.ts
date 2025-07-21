import { TenantAnonymousUserConfiguration, Contact, ObjectSearchResultItem, SearchResultType, Tenant, TenantLegacyUserMigrationConfig, TenantLookAndFeel, TenantManagementDomainRel, TenantMetaData, TenantPasswordConfig, TenantRestrictedAuthenticationDomainRel, FederatedOidcProviderTenantRel, TenantAvailableScope, TenantLoginFailurePolicy, CaptchaConfig } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { GraphQLError } from "graphql";
import { randomUUID } from 'crypto'; 
import { CAPTCHA_CONFIG_SCOPE, DEFAULT_TENANT_META_DATA, MFA_AUTH_TYPE_NONE, MFA_AUTH_TYPES, PASSWORD_HASHING_ALGORITHMS, PASSWORD_MAXIMUM_LENGTH, PASSWORD_MINIMUM_LENGTH, SEARCH_INDEX_OBJECT_SEARCH, TENANT_CREATE_SCOPE, TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE, TENANT_TYPE_ROOT_TENANT, TENANT_TYPES_DISPLAY, TENANT_UPDATE_SCOPE } from "@/utils/consts";
import { Client } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import ScopeDao from "../dao/scope-dao";
import { authorizeByScopeAndTenant, containsScope, ServiceAuthorizationWrapper } from "@/utils/authz-utils";

const searchClient: Client = getOpenSearchClient();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();

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
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const {valid, errorMessage} = await this.validateTenantInput(tenant);        
        if(!valid){
            throw new GraphQLError(errorMessage);
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
            throw new GraphQLError(authResult.errorMessage || "ERROR");
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
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        return tenantDao.getTenantById(tenantId);
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_CREATE_SCOPE], null);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const {valid, errorMessage} = await this.validateTenantInput(tenant);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }
        
        tenant.tenantId = randomUUID().toString();
        await tenantDao.createTenant(tenant);
        await this.updateSearchIndex(tenant);

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
    
    protected async validateTenantInput(tenant: Tenant): Promise<{valid: boolean, errorMessage: string}> {
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
        
        return {valid: true, errorMessage: ""};
    }

    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenant.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const {valid, errorMessage} = await this.validateTenantInput(tenant);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }
        
        // TODO
        // If the tenant.allowSocialLogin is set to false, then delete any OIDC
        // provider with a provider type of "SOCIAL"
        await tenantDao.updateTenant(tenant);
        await this.updateSearchIndex(tenant);
        return Promise.resolve(tenant);
    }

    public async deleteTenant(tenantId: string): Promise<void> {
        // delete all clients
        // delete all groups
        // delete all users
        // delete all login groups
        // delete all LoginGroupClientRel
        // delete all LoginGroupUserRel
        // delete all UserGroupRel
        // UserCredential
        // UserCredentialHistory
        // Key
        // TenantRateLimitRel
        // TenantScopeRel
        // ClientTenantScopeRel
        // TenantManagementDomainRel
        // delete tenant
        throw new Error("Method not implemented.");
    }


    public async addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
        }
        // if this exists, there should be at most 1. If the tenant id is different, then delete the existing record
        // and insert a new one, since the domain needs to be a unique key in this relationship.
        const relsByDomain: Array<TenantManagementDomainRel> = await this.getDomainTenantManagementRels(undefined, domain);
        if(!relsByDomain || relsByDomain.length === 0){
            return tenantDao.addDomainToTenantManagement(tenantId, domain);
        }
        else{    
            const rel: TenantManagementDomainRel = relsByDomain[0];
            // if equal to existing record, just return it
            if(rel.tenantId === tenantId){
                return Promise.resolve({tenantId, domain});
            }
            // else delete the existing relationship and add new
            await this.removeDomainFromTenantManagement(tenantId, domain);
            return tenantDao.addDomainToTenantManagement(tenantId, domain);
        }        
    }

    public async removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
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


    public async createAnonymousUserConfiguration(tenantId: string, anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        
        return tenantDao.createAnonymousUserConfiguration(tenantId, anonymousUserConfiguration);
    }

    public async updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], anonymousUserConfiguration.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return tenantDao.updateAnonymousUserConfiguration(anonymousUserConfiguration);
    }

    public async deleteAnonymousUserConfiguration(tenantId: string): Promise<void>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return tenantDao.deleteAnonymousUserConfiguration(tenantId);
    }

    public async getTenantMetaData(tenantId: string): Promise<TenantMetaData | null> {
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
        }
        
        const tenantLookAndFeel: TenantLookAndFeel | null = await tenantDao.getTenantLookAndFeel(tenantId);        
        return Promise.resolve(
            {
                tenant: tenant,
                tenantLookAndFeel: tenantLookAndFeel ? tenantLookAndFeel : DEFAULT_TENANT_META_DATA.tenantLookAndFeel
            }
        );
    }

    public async getTenantLookAndFeel(tenantId: string): Promise<TenantLookAndFeel | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        const tenantLookAndFeel: TenantLookAndFeel | null = await tenantDao.getTenantLookAndFeel(tenantId);
        return Promise.resolve(tenantLookAndFeel);
    }

    public async setTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantLookAndFeel.tenantid);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const existing: TenantLookAndFeel | null = await tenantDao.getTenantLookAndFeel(tenantLookAndFeel.tenantid);
        if(!existing){
            return tenantDao.createTenantLookAndFeel(tenantLookAndFeel);
        }
        else {
            return tenantDao.updateTenantLookAndFeel(tenantLookAndFeel);
        }
    }

 
    public async deleteTenantLookAndFeel(tenantId: string): Promise<void>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return tenantDao.deleteTenantLookAndFeel(tenantId);
    }

    public async getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null> {        
        return tenantDao.getTenantPasswordConfig(tenantId);
    }

    public async assignPasswordConfigToTenant(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantPasswordConfig.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        if(tenantPasswordConfig.passwordMinLength < PASSWORD_MINIMUM_LENGTH){
            throw new GraphQLError("ERROR_PASSWORD_MINIMUM_LENGTH_OUT_OF_BOUNDS");
        }
        if(tenantPasswordConfig.passwordMaxLength > PASSWORD_MAXIMUM_LENGTH){
            throw new GraphQLError("ERROR_PASSWORD_MAXIMUM_LENGTH_OUT_OF_BOUNDS");
        }
        if(tenantPasswordConfig.requireMfa){
            if(tenantPasswordConfig.mfaTypesRequired === null || tenantPasswordConfig.mfaTypesRequired === undefined || tenantPasswordConfig.mfaTypesRequired === ""){
                throw new GraphQLError("ERROR_NO_MFA_TYPE_SPECIFIED_FOR_REQUIRED_MFA");
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
                    throw new GraphQLError("ERROR_INVALID_MFA_TYPE_SUPPLIED");
                }
            }
        }
        if(!PASSWORD_HASHING_ALGORITHMS.includes(tenantPasswordConfig.passwordHashingAlgorithm)){
            throw new GraphQLError("ERROR_INVALID_HASHING_ALGORITHM_SUPPLIED");
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantPasswordConfig.tenantId);
        if(tenant === null){
            throw new GraphQLError("ERROR_UNABLE_TO_RETRIEVE_TENANT");
        }
        const existingConfig: TenantPasswordConfig | null = await tenantDao.getTenantPasswordConfig(tenantPasswordConfig.tenantId);
        if(existingConfig === null){
            return tenantDao.assignPasswordConfigToTenant(tenantPasswordConfig);    
        }
        else{
            return tenantDao.updatePasswordConfig(tenantPasswordConfig);
        }
    }

    public async removePasswordConfigFromTenant(tenantId: string): Promise<void>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return tenantDao.removePasswordConfigFromTenant(tenantId);
    }

    public async getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return tenantDao.getLegacyUserMigrationConfiguration(tenantId);
    }

    public async setTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantLegacyUserMigrationConfig.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        return tenantDao.setTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig);
    }

    public async getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return tenantDao.getDomainsForTenantRestrictedAuthentication(tenantId);
    }

    public async addDomainToTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<TenantRestrictedAuthenticationDomainRel> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return tenantDao.addDomainToTenantRestrictedAuthentication(tenantId, domain);
    }

    public async removeDomainFromTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<void>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return tenantDao.removeDomainFromTenantRestrictedAuthentication(tenantId, domain);
    }

    public async getTenantLoginFailurePolicy(tenantId: string): Promise<TenantLoginFailurePolicy | null> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return tenantDao.getLoginFailurePolicy(tenantId);
    }

    public async setTenantLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], loginFailurePolicy.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        const existing: TenantLoginFailurePolicy | null = await tenantDao.getLoginFailurePolicy(loginFailurePolicy.tenantId);
        
        if(!existing){        
            await tenantDao.createLoginFailurePolicy(loginFailurePolicy);        
        }
        else{
            await tenantDao.updateLoginFailurePolicy(loginFailurePolicy);
        }
        return loginFailurePolicy;
    }

    public async removeTenantLoginFailurePolicy(tenantId: string): Promise<void> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_UPDATE_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        await tenantDao.removeLoginFailurePolicy(tenantId);
    }

    public async getCaptchaConfig(): Promise<CaptchaConfig | null> {
        const getData = ServiceAuthorizationWrapper(
            {                
                performOperation: async function(_, __) {                    
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
        const config = await getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], null);
        return config;
    }

}

export default TenantService;