import { ErrorDetail, FederatedOidcProvider, FederatedOidcProviderDomainRel, FederatedOidcProviderTenantRel, ObjectSearchResultItem, RelSearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import FederatedOIDCProviderDao from "@/lib/dao/federated-oidc-provider-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { CHANGE_EVENT_CLASS_OIDC_PROVIDER, CHANGE_EVENT_CLASS_OIDC_PROVIDER_DOMAIN_REL, CHANGE_EVENT_CLASS_OIDC_PROVIDER_TENANT_REL, CHANGE_EVENT_TYPE_CREATE, CHANGE_EVENT_TYPE_CREATE_REL, CHANGE_EVENT_TYPE_REMOVE_REL, CHANGE_EVENT_TYPE_UPDATE, FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, FEDERATED_OIDC_PROVIDER_READ_SCOPE, FEDERATED_OIDC_PROVIDER_SUBJECT_TYPES, FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE, FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE, FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, FEDERATED_OIDC_RESPONSE_TYPES, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { Client } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";
import { authorizeByScopeAndTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import { ERROR_CODES } from "../models/error";
import { logWithDetails } from "../logging/logger";
import ChangeEventDao from "../dao/change-event-dao";


const searchClient: Client = getOpenSearchClient();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const tenantDao = DaoFactory.getInstance().getTenantDao();
const kms: Kms = DaoFactory.getInstance().getKms();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();

class FederatedOIDCProviderService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }
    
    public async getFederatedOIDCProviders(tenantId?: string): Promise<Array<FederatedOidcProvider>>{
        const getData = ServiceAuthorizationWrapper(
            {
                preProcess: async function(oidcContext: OIDCContext, ...args) {
                    if (oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
                        return [oidcContext.portalUserProfile?.managementAccessTenantId || ""];
                    }
                    return args;
                },
                performOperation: async function (_, ...args): Promise<Array<FederatedOidcProvider>> {                    
                    const arr = await federatedOIDCProviderDao.getFederatedOidcProviders(...args);                    
                    return arr;
                },
                postProcess: async function(_, result) {
                    if(result){
                        result.forEach(
                            (p: FederatedOidcProvider) => p.federatedOIDCProviderClientSecret = ""
                        )
                    }
                    return result;
                },
            }
        );
        const providers = await getData(this.oidcContext, [FEDERATED_OIDC_PROVIDER_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        return providers || [];  
    }

    public async getFederatedOIDCProviderById(federatedOIDCProviderId: string): Promise<FederatedOidcProvider | null>{
        const getData = ServiceAuthorizationWrapper(
            {
                performOperation: async function(_, federatedOIDCProviderId): Promise<FederatedOidcProvider | null> {
                    const provider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderById(federatedOIDCProviderId);                    
                    return provider;
                },
                additionalConstraintCheck: async function(oidcContext: OIDCContext, result: FederatedOidcProvider | null): Promise<{isAuthorized: boolean, errorDetail: ErrorDetail}> {
                    if(result){
                        if(oidcContext.portalUserProfile?.managementAccessTenantId){
                            const arr: Array<FederatedOidcProviderTenantRel> = await federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(oidcContext.portalUserProfile.managementAccessTenantId, result.federatedOIDCProviderId);
                            if(arr.length === 0){
                                return { isAuthorized: false, errorDetail: ERROR_CODES.EC00018}
                            }
                            else{
                                return { isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR}
                            }
                        }
                    }
                    return {isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR}
                },
                postProcess: async function(_, result) {
                    if(result && result.federatedOIDCProviderClientSecret && result.federatedOIDCProviderClientSecret.length > 0){
                        result.federatedOIDCProviderClientSecret = " ";
                    }
                    return result
                },
            }
        );
        const f = await getData(this.oidcContext, [FEDERATED_OIDC_PROVIDER_READ_SCOPE, TENANT_READ_ALL_SCOPE], federatedOIDCProviderId);        
        return Promise.resolve(f);
    }

    public async createFederatedOIDCProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider>{
        const { isAuthorized, errorDetail } = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}}); 
        }
        
        const inputValidation = this.validateOIDCProviderInput(federatedOIDCProvider);        
        if(!inputValidation.valid){
            throw new GraphQLError(inputValidation.errorDetail.errorCode, {extensions: {errorDetail: inputValidation.errorDetail}});
        }
        
        if(federatedOIDCProvider.federatedOIDCProviderClientSecret && federatedOIDCProvider.federatedOIDCProviderClientSecret !== ""){
            const encryptedSecret: string | null = await kms.encrypt(federatedOIDCProvider.federatedOIDCProviderClientSecret);
            if(encryptedSecret === null){
                throw new GraphQLError(ERROR_CODES.EC00019.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00019}});
            }
            else{
                federatedOIDCProvider.federatedOIDCProviderClientSecret = encryptedSecret;
            }
        }

        federatedOIDCProvider.federatedOIDCProviderId = randomUUID().toString();
        await federatedOIDCProviderDao.createFederatedOidcProvider(federatedOIDCProvider);
        await this.updateSearchIndex(federatedOIDCProvider);
        changeEventDao.addChangeEvent({
            objectId: federatedOIDCProvider.federatedOIDCProviderId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_OIDC_PROVIDER,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...federatedOIDCProvider, federatedOIDCProviderClientSecret: ""})
        });
        return Promise.resolve(federatedOIDCProvider);
    }

    protected validateOIDCProviderInput(federatedOIDCProvider: FederatedOidcProvider): {valid: boolean, errorDetail: ErrorDetail} {
        if(!federatedOIDCProvider.federatedOIDCProviderClientId || "" === federatedOIDCProvider.federatedOIDCProviderClientId){
            return {valid: false, errorDetail: ERROR_CODES.EC00020};
        }
        if(!federatedOIDCProvider.federatedOIDCProviderWellKnownUri || "" === federatedOIDCProvider.federatedOIDCProviderWellKnownUri){
            return {valid: false, errorDetail: ERROR_CODES.EC00021};
        }
        // We will allow the creation or update without a client secret because in some cases
        // the federated OIDC owner may want to enter this themselves via the secret-sharing
        // process
        // if(!federatedOIDCProvider.federatedOIDCProviderClientSecret && !federatedOIDCProvider.usePkce){
        //     return {valid: false, errorCode: "NO_CLIENT_SECRET_AND_PKCE_IS_NOT_ALLOWED"};
        // }
        if(!federatedOIDCProvider.federatedOIDCProviderName){
            return {valid: false, errorDetail: ERROR_CODES.EC00022};
        }
        if(!FEDERATED_OIDC_RESPONSE_TYPES.includes(federatedOIDCProvider.federatedOIDCProviderResponseType)){
            return {valid: false, errorDetail: ERROR_CODES.EC00228};
        }
        if(!FEDERATED_OIDC_PROVIDER_SUBJECT_TYPES.includes(federatedOIDCProvider.federatedOIDCProviderSubjectType)){
            return {valid: false, errorDetail: ERROR_CODES.EC00229};
        }
        return {valid: true, errorDetail: ERROR_CODES.NULL_ERROR}
    }
    
    public async updateFederatedOIDCProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider>{    
        
        const authorizedResult = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, null);
        if(!authorizedResult.isAuthorized){
            throw new GraphQLError(authorizedResult.errorDetail.errorCode, {extensions: {errorDetail: authorizedResult.errorDetail}});
        }

        const existingProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderById(federatedOIDCProvider.federatedOIDCProviderId);
        if(!existingProvider){
            throw new GraphQLError(ERROR_CODES.EC00023.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00023}});
        }
        // If the user intended to update the client secret, then overwrite the existing secret. Otherwise, just use the
        // existing secret.                
        if(federatedOIDCProvider.federatedOIDCProviderClientSecret === null || federatedOIDCProvider.federatedOIDCProviderClientSecret === ""){
            if(existingProvider.federatedOIDCProviderClientSecret !== null && existingProvider.federatedOIDCProviderClientSecret !== ""){                
                federatedOIDCProvider.federatedOIDCProviderClientSecret = existingProvider.federatedOIDCProviderClientSecret;
            }   
        }
        else if(federatedOIDCProvider.federatedOIDCProviderClientSecret && federatedOIDCProvider.federatedOIDCProviderClientSecret !== ""){
            const encryptedSecret: string | null = await kms.encrypt(federatedOIDCProvider.federatedOIDCProviderClientSecret);
            if(encryptedSecret === null){
                throw new GraphQLError(ERROR_CODES.EC00019.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00019}});
            }
            else{
                federatedOIDCProvider.federatedOIDCProviderClientSecret = encryptedSecret;
            }            
        }

        // Since the both the provider type and the social provider values are write-once, 
        // we need to update those values from the database as well. The user cannot change
        // these once created.
        federatedOIDCProvider.socialLoginProvider = existingProvider.socialLoginProvider;
        federatedOIDCProvider.federatedOIDCProviderType = existingProvider.federatedOIDCProviderType;

        const { valid, errorDetail } = this.validateOIDCProviderInput(federatedOIDCProvider);
        if(!valid){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }        

        await federatedOIDCProviderDao.updateFederatedOidcProvider(federatedOIDCProvider);
        await this.updateSearchIndex(federatedOIDCProvider);
        this.bulkUpdateRelSearchRecord(federatedOIDCProvider);
        changeEventDao.addChangeEvent({
            objectId: federatedOIDCProvider.federatedOIDCProviderId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_OIDC_PROVIDER,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_UPDATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...federatedOIDCProvider, federatedOIDCProviderClientSecret: ""})
        });
        return Promise.resolve(federatedOIDCProvider);
    }

    protected async updateSearchIndex(federatedOIDCProvider: FederatedOidcProvider): Promise<void> {
            
        const document: ObjectSearchResultItem = {
            name: federatedOIDCProvider.federatedOIDCProviderName,
            description: federatedOIDCProvider.federatedOIDCProviderDescription,
            objectid: federatedOIDCProvider.federatedOIDCProviderId,
            objecttype: SearchResultType.OidcProvider,
            owningtenantid: "",
            email: "",
            enabled: true,
            owningclientid: "",
            subtype: FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY.get(federatedOIDCProvider.federatedOIDCProviderType),
            subtypekey: federatedOIDCProvider.federatedOIDCProviderType
        }
        
        await searchClient.index({
            id: federatedOIDCProvider.federatedOIDCProviderId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });        
    }

    protected async updateRelSearchIndex(tenantId: string, federatedOIDCProvider: FederatedOidcProvider): Promise<void>{
        const document: RelSearchResultItem = {
            childid: federatedOIDCProvider.federatedOIDCProviderId,
            childname: federatedOIDCProvider.federatedOIDCProviderName,
            childdescription: federatedOIDCProvider.federatedOIDCProviderDescription,
            childtype: SearchResultType.OidcProvider,
            owningtenantid: tenantId,
            parentid: tenantId,
            parenttype: SearchResultType.Tenant
        };
        try{
            await searchClient.index({
                id: `${tenantId}::${federatedOIDCProvider.federatedOIDCProviderId}`,
                index: SEARCH_INDEX_REL_SEARCH,
                body: document
            });
        }        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(err: any){
            logWithDetails("error", `Error adding rel search record for tenant and federated OIDC provider. ${err.message}.`, {...err, tenantId, federatedOidcProviderId: federatedOIDCProvider.federatedOIDCProviderId});
        }        
    }

    protected async removeRelSearchRecord(tenantId: string, federatedOidcProviderId: string): Promise<void> {
        try{
            await searchClient.delete({
                id: `${tenantId}::${federatedOidcProviderId}`,
                index: SEARCH_INDEX_REL_SEARCH
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(err: any){
            logWithDetails("error", `Error removing rel search record for tenant and federated OIDC provider. ${err.message}.`, {...err, tenantId, federatedOidcProviderId});
        }
        return Promise.resolve();
    }
    
    protected async bulkUpdateRelSearchRecord(federatedOIDCProvider: FederatedOidcProvider): Promise<void>{
        searchClient.updateByQuery({
            index: SEARCH_INDEX_REL_SEARCH,
            body: {
                query: {
                    term: {
                        childid: federatedOIDCProvider.federatedOIDCProviderId
                    }
                },
                script: {
                    source: "ctx._source.childname = params.childname; ctx._source.childdescription = params.childdescription",
                    lang: "painless",
                    params: {
                        childname: federatedOIDCProvider.federatedOIDCProviderName,
                        childdescription: federatedOIDCProvider.federatedOIDCProviderDescription
                    }
                }
            },
            conflicts: "proceed",
            requests_per_second: 25
        });
    }

    public async getFederatedOIDCProviderTenantRels(tenantId?: string): Promise<Array<FederatedOidcProviderTenantRel>>{
        const getData = ServiceAuthorizationWrapper(
            {
                async preProcess(oidcContext: OIDCContext, ...args) {
                    if (oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
                        return [oidcContext.portalUserProfile?.managementAccessTenantId || ""];
                    }
                    return [args];
                },
                async performOperation(_, ...args): Promise<Array<FederatedOidcProviderTenantRel>> {
                    return federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(...args);
                }
            }
        );
        const rels = await getData(this.oidcContext, [FEDERATED_OIDC_PROVIDER_READ_SCOPE, TENANT_READ_ALL_SCOPE], tenantId);
        return rels || [];        
    }

    public async assignFederatedOIDCProviderToTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel>{
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        const provider: FederatedOidcProvider | null = await this.getFederatedOIDCProviderById(federatedOIDCProviderId);
        if(!provider){
            throw new GraphQLError(ERROR_CODES.EC00023.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00023}});
        }

        // Only social providers can be assigned to a tenant. Enterprise providers will always be
        // used for those domains assigned to the provider, regardless of the tenant. With social 
        // providers, the user's email domain could be anything.
        if(provider.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE){
            throw new GraphQLError(ERROR_CODES.EC00024.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00024}});
        }
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }

        const data = await federatedOIDCProviderDao.assignFederatedOidcProviderToTenant(federatedOIDCProviderId, tenantId);
        await this.updateRelSearchIndex(tenantId, provider);
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_OIDC_PROVIDER_TENANT_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({federatedOIDCProviderId, tenantId})
        });

        return data;
        
    }

    public async removeFederatedOIDCProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        const rel: FederatedOidcProviderTenantRel = await federatedOIDCProviderDao.removeFederatedOidcProviderFromTenant(federatedOIDCProviderId, tenantId)
        await this.removeRelSearchRecord(tenantId, federatedOIDCProviderId);
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_OIDC_PROVIDER_TENANT_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({federatedOIDCProviderId, tenantId})
        });
        return rel;
    }

    public async getFederatedOIDCProviderDomainRels(federatedOIDCProviderId: string | null, domain: string | null): Promise<Array<FederatedOidcProviderDomainRel>> {
        const getData = ServiceAuthorizationWrapper(
            {
                performOperation: async function (_, federatedOIDCProviderId: string | null, domain: string | null): Promise<Array<FederatedOidcProviderDomainRel>> {
                    const providers: Array<FederatedOidcProviderDomainRel> = await federatedOIDCProviderDao.getFederatedOidcProviderDomainRels(federatedOIDCProviderId, domain)
                    return providers;
                },
                postProcess: async function (oidcContext: OIDCContext, result: Array<FederatedOidcProviderDomainRel> | null): Promise<Array<FederatedOidcProviderDomainRel> | null> {
                    if (result && result.length > 0 && oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
                        const tenantRels: Array<FederatedOidcProviderTenantRel> = await federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(oidcContext.portalUserProfile?.managementAccessTenantId || "");
                        if (tenantRels.length > 0) {
                            const filteredResult = result.filter(
                                (domainRel: FederatedOidcProviderDomainRel) => {
                                    const tenantRel = tenantRels.find(
                                        (r: FederatedOidcProviderTenantRel) => r.federatedOIDCProviderId === domainRel.federatedOIDCProviderId
                                    );
                                    return tenantRel !== undefined;
                                }
                            );
                            return filteredResult;
                        }
                        else {
                            return []
                        }
                    }
                    else {
                        return result;
                    }
                }
            }
        );
        const f = await getData(this.oidcContext, [FEDERATED_OIDC_PROVIDER_READ_SCOPE, TENANT_READ_ALL_SCOPE], federatedOIDCProviderId, domain);
        return f || [];
    }

    public async assignFederatedOIDCProviderToDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        const provider: FederatedOidcProvider | null = await this.getFederatedOIDCProviderById(federatedOIDCProviderId);
        if(!provider){
            throw new GraphQLError(ERROR_CODES.EC00023.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00023}});
        }

        // Social providers cannot have domains assigned to them, only enterprise providers.
        if(provider.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL){
            throw new GraphQLError(ERROR_CODES.EC00025.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00025}});
        }
        const existingDomainRel: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderByDomain(domain);
        if(existingDomainRel && existingDomainRel.federatedOIDCProviderId !== federatedOIDCProviderId){
            throw new GraphQLError(ERROR_CODES.EC00026.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00026}});
        }
        
        if(existingDomainRel && existingDomainRel.federatedOIDCProviderId === federatedOIDCProviderId){
            return Promise.resolve({
                domain: domain,
                federatedOIDCProviderId: federatedOIDCProviderId
            })
        }
        changeEventDao.addChangeEvent({
            objectId: federatedOIDCProviderId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_OIDC_PROVIDER_DOMAIN_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({federatedOIDCProviderId, domain})
        });
        return federatedOIDCProviderDao.assignFederatedOidcProviderToDomain(federatedOIDCProviderId, domain);
    }

    public async removeFederatedOIDCProviderFromDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel>{
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        changeEventDao.addChangeEvent({
            objectId: federatedOIDCProviderId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_OIDC_PROVIDER_DOMAIN_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({federatedOIDCProviderId, domain})
        });
        return federatedOIDCProviderDao.removeFederatedOidcProviderFromDomain(federatedOIDCProviderId, domain);
    }
    
}

export default FederatedOIDCProviderService;