import { FederatedOidcProvider, FederatedOidcProviderDomainRel, FederatedOidcProviderTenantRel, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { getFederatedOIDCProvicerDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import FederatedOIDCProviderDao from "@/lib/dao/federated-oidc-provider-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 

const federatedOIDCProviderDao: FederatedOIDCProviderDao = getFederatedOIDCProvicerDaoImpl();
const tenantDao = getTenantDaoImpl();

class FederatedOIDCProviderService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }
    
    public async getFederatedOIDCProviders(tenantId?: string): Promise<Array<FederatedOidcProvider>>{
        return federatedOIDCProviderDao.getFederatedOidcProviders(tenantId);
    }

    public async getFederatedOIDCProviderById(federatedOIDCProviderId: string): Promise<FederatedOidcProvider | null>{
        return federatedOIDCProviderDao.getFederatedOidcProviderById(federatedOIDCProviderId);
    }

    public async createFederatedOIDCProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<FederatedOidcProvider>{
        const { valid, errorMessage } = this.validateOIDCProviderInput(federatedOIDCProvider);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }
        federatedOIDCProvider.federatedOIDCProviderId = randomUUID().toString();
        await federatedOIDCProviderDao.createFederatedOidcProvider(federatedOIDCProvider);
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
        const { valid, errorMessage } = this.validateOIDCProviderInput(federatedOIDCProvider);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }
        if(!this.getFederatedOIDCProviderById(federatedOIDCProvider.federatedOIDCProviderId)){
            throw new GraphQLError("ERROR_NO_FEDERATED_OIDC_PROVIDER_FOUND");
        }
        await federatedOIDCProviderDao.updateFederatedOidcProvider(federatedOIDCProvider);
        return Promise.resolve(federatedOIDCProvider);
    }

    public async getFederatedOIDCProviderTenantRels(tenantId?: string): Promise<Array<FederatedOidcProviderTenantRel>>{
        return federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(tenantId);
    }

    public async getFederatedOIDCProviderByDomain(domain: string): Promise<FederatedOidcProvider | null>{
        return federatedOIDCProviderDao.getFederatedOidcProviderByDomain(domain);
    }

    public async assignFederatedOIDCProviderToTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel>{
        const provider: FederatedOidcProvider | null = await this.getFederatedOIDCProviderById(federatedOIDCProviderId);
        if(!provider){
            throw new GraphQLError("ERROR_EXTERNAL_OIDC_PROVIDER_NOT_FOUND");
        }
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND");
        }
        return federatedOIDCProviderDao.assignFederatedOidcProviderToTenant(federatedOIDCProviderId, tenantId);
        
    }

    public async removeFederatedOIDCProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        return federatedOIDCProviderDao.removeFederatedOidcProviderFromTenant(federatedOIDCProviderId, tenantId);
    }

    public async getFederatedOIDCProviderDomainRels(): Promise<Array<FederatedOidcProviderDomainRel>>{
        return federatedOIDCProviderDao.getFederatedOidcProviderDomainRels();
    }

    public async assignFederatedOIDCProviderToDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel> {
        const provider: FederatedOidcProvider | null = await this.getFederatedOIDCProviderById(federatedOIDCProviderId);
        if(!provider){
            throw new GraphQLError("ERROR_EXTERNAL_OIDC_PROVIDER_NOT_FOUND");
        }
        const existingDomainRel: FederatedOidcProvider | null = await this.getFederatedOIDCProviderByDomain(domain);
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
        return federatedOIDCProviderDao.removeFederatedOidcProviderFromDomain(federatedOIDCProviderId, domain);
    }

    public async deleteFederatedOIDCProvider(federatedOIDCProviderId: string): Promise<void>{
        return Promise.resolve()
    }
}

export default FederatedOIDCProviderService;