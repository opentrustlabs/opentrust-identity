import { FederatedOidcProvider, FederatedOidcProviderDomainRel, FederatedOidcProviderTenantRel, ObjectSearchResultItem, RelSearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";

import FederatedOIDCProviderDao from "@/lib/dao/federated-oidc-provider-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import { FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, FEDERATED_OIDC_PROVIDER_DELETE_SCOPE, FEDERATED_OIDC_PROVIDER_READ_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE, FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { Client } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "@/lib/data-sources/search";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";
import { authorizeByScopeAndTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import { error } from "console";

const searchClient: Client = getOpenSearchClient();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const tenantDao = DaoFactory.getInstance().getTenantDao();
const kms: Kms = DaoFactory.getInstance().getKms();

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
                additionalConstraintCheck: async function(oidcContext: OIDCContext, result: FederatedOidcProvider | null): Promise<{isAuthorized: boolean, errorMessage: string | null}> {
                    if(result){
                        if(oidcContext.portalUserProfile?.managementAccessTenantId){
                            const arr: Array<FederatedOidcProviderTenantRel> = await federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(oidcContext.portalUserProfile.managementAccessTenantId, result.federatedOIDCProviderId);
                            if(arr.length === 0){
                                return { isAuthorized: false, errorMessage: "ERROR_OIDC_PROVIDER_NOT_ASSIGNED_TO_TENANT"}
                            }
                            else{
                                return { isAuthorized: true, errorMessage: null}
                            }
                        }
                    }
                    return {isAuthorized: true, errorMessage: null}
                },
                postProcess: async function(_, result) {
                    if(result){
                        result.federatedOIDCProviderClientSecret = ""
                    }
                    return result
                },
            }
        );
        const f = await getData(this.oidcContext, [FEDERATED_OIDC_PROVIDER_READ_SCOPE, TENANT_READ_ALL_SCOPE], federatedOIDCProviderId);
        return Promise.resolve(f);
    }

    public async createFederatedOIDCProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider>{
        const { isAuthorized, errorMessage } = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR"); 
        }
        
        let inputValidation = this.validateOIDCProviderInput(federatedOIDCProvider);        
        if(!inputValidation.valid){
            throw new GraphQLError(inputValidation.errorMessage);
        }
        
        if(federatedOIDCProvider.federatedOIDCProviderClientSecret && federatedOIDCProvider.federatedOIDCProviderClientSecret !== ""){
            const encryptedSecret: string | null = await kms.encrypt(federatedOIDCProvider.federatedOIDCProviderClientSecret);
            if(encryptedSecret === null){
                throw new GraphQLError("ERROR_UNABLE_TO_ENCRYPT_OIDC_PROVIDER_CLIENT_SECRET");
            }
            else{
                federatedOIDCProvider.federatedOIDCProviderClientSecret = encryptedSecret;
            }
        }

        federatedOIDCProvider.federatedOIDCProviderId = randomUUID().toString();
        await federatedOIDCProviderDao.createFederatedOidcProvider(federatedOIDCProvider);
        await this.updateSearchIndex(federatedOIDCProvider);
        return Promise.resolve(federatedOIDCProvider);
    }

    protected validateOIDCProviderInput(federatedOIDCProvider: FederatedOidcProvider): {valid: boolean, errorMessage: string} {
        if(!federatedOIDCProvider.federatedOIDCProviderClientId || "" === federatedOIDCProvider.federatedOIDCProviderClientId){
            return {valid: false, errorMessage: "ERROR_MISSING_CLIENT_ID_IN_OIDC_CONFIGURATION"};
        }
        if(!federatedOIDCProvider.federatedOIDCProviderWellKnownUri || "" === federatedOIDCProvider.federatedOIDCProviderWellKnownUri){
            return {valid: false, errorMessage: "ERROR_MISSING_WELL_KNOWN_URI_IN_OIDC_CONFIGURATION"};
        }
        if(!federatedOIDCProvider.federatedOIDCProviderClientSecret && !federatedOIDCProvider.usePkce){
            return {valid: false, errorMessage: "ERROR_NO_CLIENT_SECRET_AND_PKCE_IS_NOT_ALLOWED"};
        }
        if(!federatedOIDCProvider.federatedOIDCProviderName){
            return {valid: false, errorMessage: "ERROR_MISSING_OIDC_CLIENT_NAME"};
        }
        return {valid: true, errorMessage: ""}
    }
    
    public async updateFederatedOIDCProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider>{    
        
        const authorizedResult = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, null);
        if(!authorizedResult.isAuthorized){
            throw new GraphQLError(authorizedResult.errorMessage || "ERROR");
        }

        const existingProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderById(federatedOIDCProvider.federatedOIDCProviderId);
        if(!existingProvider){
            throw new GraphQLError("ERROR_NO_FEDERATED_OIDC_PROVIDER_FOUND");
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
                throw new GraphQLError("ERROR_UNABLE_TO_ENCRYPT_OIDC_PROVIDER_CLIENT_SECRET");
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

        const { valid, errorMessage } = this.validateOIDCProviderInput(federatedOIDCProvider);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }        

        await federatedOIDCProviderDao.updateFederatedOidcProvider(federatedOIDCProvider);
        await this.updateSearchIndex(federatedOIDCProvider);
        this.bulkUpdateRelSearchRecord(federatedOIDCProvider);
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
        await searchClient.index({
            id: `${tenantId}::${federatedOIDCProvider.federatedOIDCProviderId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: document
        });
    }

    protected async removeRelSearchRecord(tenantId: string, federatedOidcProviderId: string): Promise<void> {
        await searchClient.delete({
            id: `${tenantId}::${federatedOidcProviderId}`,
            index: SEARCH_INDEX_REL_SEARCH
        });
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
        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }

        const provider: FederatedOidcProvider | null = await this.getFederatedOIDCProviderById(federatedOIDCProviderId);
        if(!provider){
            throw new GraphQLError("ERROR_EXTERNAL_OIDC_PROVIDER_NOT_FOUND");
        }
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND");
        }

        const data = await federatedOIDCProviderDao.assignFederatedOidcProviderToTenant(federatedOIDCProviderId, tenantId);
        await this.updateRelSearchIndex(tenantId, provider);

        return data;
        
    }

    public async removeFederatedOIDCProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }
        await this.removeRelSearchRecord(tenantId, federatedOIDCProviderId);
        return federatedOIDCProviderDao.removeFederatedOidcProviderFromTenant(federatedOIDCProviderId, tenantId);
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
        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }

        const provider: FederatedOidcProvider | null = await this.getFederatedOIDCProviderById(federatedOIDCProviderId);
        if(!provider){
            throw new GraphQLError("ERROR_EXTERNAL_OIDC_PROVIDER_NOT_FOUND");
        }
        const existingDomainRel: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderByDomain(domain);
        if(existingDomainRel && existingDomainRel.federatedOIDCProviderId !== federatedOIDCProviderId){
            throw new GraphQLError("ERROR_DOMAIN_IS_ALREADY_ASSIGNED_TO_AN_EXTERNAL_OIDC_PROVIDER");
        }
        
        if(existingDomainRel && existingDomainRel.federatedOIDCProviderId === federatedOIDCProviderId){
            return Promise.resolve({
                domain: domain,
                federatedOIDCProviderId: federatedOIDCProviderId
            })
        }
        return federatedOIDCProviderDao.assignFederatedOidcProviderToDomain(federatedOIDCProviderId, domain);
    }

    public async removeFederatedOIDCProviderFromDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel>{
        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }
        return federatedOIDCProviderDao.removeFederatedOidcProviderFromDomain(federatedOIDCProviderId, domain);
    }

    public async deleteFederatedOIDCProvider(federatedOIDCProviderId: string): Promise<void>{
        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_DELETE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }
        return Promise.resolve()
    }
}

export default FederatedOIDCProviderService;