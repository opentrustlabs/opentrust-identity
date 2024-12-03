import { ExternalOidcProvider, ExternalOidcProviderDomainRel, ExternalOidcProviderTenantRel, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { getExternalOIDCProvicerDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import ExternalOIDCProviderDao from "@/lib/dao/external-oidc-provider-dao";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 

const externalOIDCProviderDao: ExternalOIDCProviderDao = getExternalOIDCProvicerDaoImpl();
const tenantDao = getTenantDaoImpl();

class ExternalOIDCProviderService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }
    
    public async getExternalOIDCProviders(tenantId?: string): Promise<Array<ExternalOidcProvider>>{
        return externalOIDCProviderDao.getExternalOIDCProviders(tenantId);
    }

    public async getExternalOIDCProviderById(externalOIDCProviderId: string): Promise<ExternalOidcProvider | null>{
        return externalOIDCProviderDao.getExternalOIDCProviderById(externalOIDCProviderId);
    }

    public async createExternalOIDCProvider(externalOIDCProvider: ExternalOidcProvider): Promise<ExternalOidcProvider>{
        externalOIDCProvider.externalOIDCProviderId = randomUUID.toString();
        const { valid, errorMessage } = this.validateOIDCProviderInput(externalOIDCProvider);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }
        externalOIDCProvider.externalOIDCProviderId = randomUUID().toString();
        return Promise.resolve(externalOIDCProvider);
    }

    protected validateOIDCProviderInput(externalOIDCProvider: ExternalOidcProvider): {valid: boolean, errorMessage: string} {
        if(!externalOIDCProvider.externalOIDCProviderClientId || "" === externalOIDCProvider.externalOIDCProviderClientId){
            return {valid: false, errorMessage: "ERROR_MISSING_CLIENT_ID_IN_OIDC_CONFIGURATION"};
        }
        if(!externalOIDCProvider.externalOIDCProviderWellKnownUri || "" === externalOIDCProvider.externalOIDCProviderWellKnownUri){
            return {valid: false, errorMessage: "ERROR_MISSING_WELL_KNOWN_URI_IN_OIDC_CONFIGURATION"};
        }
        if(!externalOIDCProvider.externalOIDCProviderClientSecret && !externalOIDCProvider.usePkce){
            return {valid: false, errorMessage: "ERROR_NO_CLIENT_SECRET_AND_PKCE_IS_NOT_ALLOWED"};
        }
        if(!externalOIDCProvider.externalOIDCProviderName){
            return {valid: false, errorMessage: "ERROR_MISSING_OIDC_CLIENT_NAME"};
        }
        return {valid: true, errorMessage: ""}
    }
    
    public async updateExternalOIDCProvider(externalOIDCProvider: ExternalOidcProvider): Promise<ExternalOidcProvider>{        
        const { valid, errorMessage } = this.validateOIDCProviderInput(externalOIDCProvider);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }
        externalOIDCProviderDao.updateExternalOIDCProvider(externalOIDCProvider);
        return Promise.resolve(externalOIDCProvider);
    }

    public async getExternalOIDCProviderTenantRels(tenantId?: string): Promise<Array<ExternalOidcProviderTenantRel>>{
        return externalOIDCProviderDao.getExternalOIDCProviderTenantRels(tenantId);
    }

    public async getExternalOIDCProviderByDomain(domain: string): Promise<ExternalOidcProvider | null>{
        return externalOIDCProviderDao.getExternalOIDCProviderByDomain(domain);
    }

    public async assignExternalOIDCProviderToTenant(externalOIDCProviderId: string, tenantId: string): Promise<ExternalOidcProviderTenantRel>{
        const provider: ExternalOidcProvider | null = await this.getExternalOIDCProviderById(externalOIDCProviderId);
        if(!provider){
            throw new GraphQLError("ERROR_EXTERNAL_OIDC_PROVIDER_NOT_FOUND");
        }
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND");
        }
        return externalOIDCProviderDao.assignExternalOIDCProviderToTenant(externalOIDCProviderId, tenantId);
        
    }

    public async removeExternalOIDCProviderFromTenant(externalOIDCProviderId: string, tenantId: string): Promise<ExternalOidcProviderTenantRel> {
        return externalOIDCProviderDao.removeExternalOIDCProviderFromTenant(externalOIDCProviderId, tenantId);
    }

    public async getExternalOIDCProviderDomainRels(): Promise<Array<ExternalOidcProviderDomainRel>>{
        return externalOIDCProviderDao.getExternalOIDCProviderDomainRels();
    }

    public async assignExternalOIDCProviderToDomain(externalOIDCProviderId: string, domain: string): Promise<ExternalOidcProviderDomainRel> {
        const provider: ExternalOidcProvider | null = await this.getExternalOIDCProviderById(externalOIDCProviderId);
        if(!provider){
            throw new GraphQLError("ERROR_EXTERNAL_OIDC_PROVIDER_NOT_FOUND");
        }
        const existingDomainRel: ExternalOidcProvider | null = await this.getExternalOIDCProviderByDomain(domain);
        if(existingDomainRel && existingDomainRel.externalOIDCProviderId !== externalOIDCProviderId){
            throw new GraphQLError("ERROR_DOMAIN_IS_ALREADY_ASSIGNED_TO_AN_EXTERNAL_OIDC_PROVIDER");
        }
        if(existingDomainRel && existingDomainRel.externalOIDCProviderId === externalOIDCProviderId){
            return Promise.resolve({
                domain: domain,
                externalOIDCProviderId: externalOIDCProviderId
            })
        }
        return externalOIDCProviderDao.assignExternalOIDCProviderToDomain(externalOIDCProviderId, domain);
    }

    public async removeExternalOIDCProviderFromDomain(externalOIDCProviderId: string, domain: string): Promise<ExternalOidcProviderDomainRel>{
        return externalOIDCProviderDao.removeExternalOIDCProviderFromDomain(externalOIDCProviderId, domain);
    }

    public async deleteExternalOIDCProvider(externalOIDCProviderId: string): Promise<void>{
        return Promise.resolve()
    }
}

export default ExternalOIDCProviderService;