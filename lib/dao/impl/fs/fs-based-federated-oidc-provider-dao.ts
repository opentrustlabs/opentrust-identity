import { FederatedOidcProvider, FederatedOidcProviderDomainRel, FederatedOidcProviderTenantRel } from "@/graphql/generated/graphql-types";
import FederatedOidcProviderDao from "../../federated-oidc-provider-dao";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { GraphQLError } from "graphql";
import { EXTERNAL_OIDC_PROVIDER_FILE, EXTERNAL_OIDC_PROVIDER_TENANT_REL_FILE, EXTERNAL_OIDC_PROVIDER_DOMAIN_REL_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedFederatedOidcProviderDao extends FederatedOidcProviderDao {

    public async getFederatedOidcProviders(tenantId?: string): Promise<Array<FederatedOidcProvider>> {
        let providers: Array<FederatedOidcProvider> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_FILE}`, "[]"));
        if(tenantId){
            const rels: Array<FederatedOidcProviderTenantRel> = await this.getFederatedOidcProviderTenantRels(tenantId);
            providers = providers.filter(
                (provider: FederatedOidcProvider) => {
                    // if we find the provider id somewhere in the relationship table
                    const rel = rels.find(
                        (rel: FederatedOidcProviderTenantRel) => rel.federatedOIDCProviderId === provider.federatedOIDCProviderId
                    );
                    if(rel){
                        return true;
                    }
                    return false;
                }
            );
        }
        return Promise.resolve(providers);
    }

    public async getFederatedOidcProviderById(federatedOIDCProviderId: string): Promise<FederatedOidcProvider | null> {
        const providers = await this.getFederatedOidcProviders();
        const provider = providers.find(
            (provider: FederatedOidcProvider) => provider.federatedOIDCProviderId === federatedOIDCProviderId
        )
        return provider ? Promise.resolve(provider) : Promise.resolve(null);
    }

    public async createFederatedOidcProvider(FederatedOidcProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        const providers = await this.getFederatedOidcProviders();
        providers.push(FederatedOidcProvider);
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_FILE}`, JSON.stringify(providers), {encoding: "utf-8"});
        return Promise.resolve(FederatedOidcProvider);
    }

    public async updateFederatedOidcProvider(FederatedOidcProvider: FederatedOidcProvider): Promise<FederatedOidcProvider> {
        const providers: Array<FederatedOidcProvider> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_FILE}`, "[]"));
        const provider: FederatedOidcProvider | undefined = providers.find(
            (p: FederatedOidcProvider) => p.federatedOIDCProviderId === FederatedOidcProvider.federatedOIDCProviderId
        )
        if(!provider){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_EXTERNAL_OIDC_PROVIDER_TO_UPDATE");
        }
        provider.clientAuthType = FederatedOidcProvider.clientAuthType;
        provider.federatedOIDCProviderClientId = FederatedOidcProvider.federatedOIDCProviderClientId;
        provider.federatedOIDCProviderClientSecret = FederatedOidcProvider.federatedOIDCProviderClientSecret;
        provider.federatedOIDCProviderDescription = FederatedOidcProvider.federatedOIDCProviderDescription;
        provider.federatedOIDCProviderName = FederatedOidcProvider.federatedOIDCProviderName;
        provider.federatedOIDCProviderTenantId = FederatedOidcProvider.federatedOIDCProviderTenantId;
        provider.federatedOIDCProviderWellKnownUri = FederatedOidcProvider.federatedOIDCProviderWellKnownUri;
        provider.refreshTokenAllowed = FederatedOidcProvider.refreshTokenAllowed;
        provider.usePkce = FederatedOidcProvider.usePkce;
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_FILE}`, JSON.stringify(providers), {encoding: "utf-8"});
        return Promise.resolve(FederatedOidcProvider);
    }

    public async getFederatedOidcProviderTenantRels(tenantId?: string): Promise<Array<FederatedOidcProviderTenantRel>> {
        let rels: Array<FederatedOidcProviderTenantRel> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_TENANT_REL_FILE}`, "[]"));
        if(tenantId){
            rels = rels.filter(
                (rel: FederatedOidcProviderTenantRel) => rel.tenantId === tenantId
            )
        }
        return Promise.resolve(rels);
    }

    public async getFederatedOidcProviderByDomain(domain: string): Promise<FederatedOidcProvider | null> {
        const domainRels: Array<FederatedOidcProviderDomainRel> = await this.getFederatedOidcProviderDomainRels();
        const domainRel: FederatedOidcProviderDomainRel | undefined = domainRels.find(
            (r: FederatedOidcProviderDomainRel) => r.domain === domain
        )
        if(!domainRel){
            return Promise.resolve(null);
        }
        return this.getFederatedOidcProviderById(domainRel.federatedOIDCProviderId);
    }

    public async assignFederatedOidcProviderToTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        const rels: Array<FederatedOidcProviderTenantRel> = await this.getFederatedOidcProviderTenantRels(tenantId);
        const existingRel: FederatedOidcProviderTenantRel | undefined = rels.find(
            (r: FederatedOidcProviderTenantRel) => r.federatedOIDCProviderId === federatedOIDCProviderId
        )
        if(existingRel){
            return Promise.resolve(existingRel)
        }
        const newRel: FederatedOidcProviderTenantRel= {
            tenantId: tenantId,
            federatedOIDCProviderId: federatedOIDCProviderId
        }
        rels.push(newRel);
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_TENANT_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve(newRel);
    }

    public async removeFederatedOidcProviderFromTenant(federatedOIDCProviderId: string, tenantId: string): Promise<FederatedOidcProviderTenantRel> {
        let rels: Array<FederatedOidcProviderTenantRel> = await this.getFederatedOidcProviderTenantRels();
        rels = rels.filter(
            (r: FederatedOidcProviderTenantRel) => !(r.tenantId === tenantId && r.federatedOIDCProviderId === federatedOIDCProviderId)
        );
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_TENANT_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve({
            tenantId: tenantId,
            federatedOIDCProviderId: federatedOIDCProviderId
        })
    }

    public async getFederatedOidcProviderDomainRels(): Promise<Array<FederatedOidcProviderDomainRel>>{
        const domainRels: Array<FederatedOidcProviderDomainRel> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_DOMAIN_REL_FILE}`, "[]"));
        return Promise.resolve(domainRels);
    }

    public async assignFederatedOidcProviderToDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel>{
        const domainRels: Array<FederatedOidcProviderDomainRel> = await this.getFederatedOidcProviderDomainRels();
        const existingRel: FederatedOidcProviderDomainRel | undefined = domainRels.find(
            (rel: FederatedOidcProviderDomainRel) => rel.domain === domain && rel.federatedOIDCProviderId === federatedOIDCProviderId
        )
        if(existingRel){
            return Promise.resolve(existingRel);
        }
        const newRel: FederatedOidcProviderDomainRel = {
            domain: domain,
            federatedOIDCProviderId: federatedOIDCProviderId
        }
        domainRels.push(newRel);
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_DOMAIN_REL_FILE}`, JSON.stringify(domainRels), {encoding: "utf-8"});
        return Promise.resolve(newRel);
    }

    public async removeFederatedOidcProviderFromDomain(federatedOIDCProviderId: string, domain: string): Promise<FederatedOidcProviderDomainRel>{
        let domainRels: Array<FederatedOidcProviderDomainRel> = await this.getFederatedOidcProviderDomainRels();
        domainRels.filter(
            (r: FederatedOidcProviderDomainRel) => !(r.domain === domain && r.federatedOIDCProviderId === federatedOIDCProviderId)
        );
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_DOMAIN_REL_FILE}`, JSON.stringify(domainRels), {encoding: "utf-8"});
        return Promise.resolve({
            domain: domain,
            federatedOIDCProviderId: federatedOIDCProviderId
        });
    }

    public async deleteFederatedOidcProvider(FederatedOidcProviderId: string): Promise<void> {
        // TODO
        // REMOVE existing relationships between provider and domain and provider and tenant
        throw new Error("Method not implemented.");
    }

}

export default FSBasedFederatedOidcProviderDao;