import { ExternalOidcProvider, ExternalOidcProviderDomainRel, ExternalOidcProviderTenantRel } from "@/graphql/generated/graphql-types";
import ExternalOIDCProviderDao from "../../external-oidc-provider-dao";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { GraphQLError } from "graphql";
import { EXTERNAL_OIDC_PROVIDER_FILE, EXTERNAL_OIDC_PROVIDER_TENANT_REL_FILE, EXTERNAL_OIDC_PROVIDER_DOMAIN_REL_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedExternalOIDCProviderDao extends ExternalOIDCProviderDao {

    public async getExternalOIDCProviders(tenantId?: string): Promise<Array<ExternalOidcProvider>> {
        let providers: Array<ExternalOidcProvider> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_FILE}`, "[]"));
        if(tenantId){
            const rels: Array<ExternalOidcProviderTenantRel> = await this.getExternalOIDCProviderTenantRels(tenantId);
            providers = providers.filter(
                (provider: ExternalOidcProvider) => {
                    // if we find the provider id somewhere in the relationship table
                    const rel = rels.find(
                        (rel: ExternalOidcProviderTenantRel) => rel.externalOIDCProviderId === provider.externalOIDCProviderId
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

    public async getExternalOIDCProviderById(externalOIDCProviderId: string): Promise<ExternalOidcProvider | null> {
        const providers = await this.getExternalOIDCProviders();
        const provider = providers.find(
            (provider: ExternalOidcProvider) => provider.externalOIDCProviderId === externalOIDCProviderId
        )
        return provider ? Promise.resolve(provider) : Promise.resolve(null);
    }

    public async createExternalOIDCProvider(externalOIDCProvider: ExternalOidcProvider): Promise<ExternalOidcProvider> {
        const providers = await this.getExternalOIDCProviders();
        providers.push(externalOIDCProvider);
        writeFileSync(`${dataDir}/EXTERNAL_OIDC_PROVIDER_FILE`, JSON.stringify(providers), {encoding: "utf-8"});
        return Promise.resolve(externalOIDCProvider);
    }

    public async updateExternalOIDCProvider(externalOIDCProvider: ExternalOidcProvider): Promise<ExternalOidcProvider> {
        const providers: Array<ExternalOidcProvider> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_FILE}`, "[]"));
        const provider: ExternalOidcProvider | undefined = providers.find(
            (p: ExternalOidcProvider) => p.externalOIDCProviderId === externalOIDCProvider.externalOIDCProviderId
        )
        if(!provider){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_EXTERNAL_OIDC_PROVIDER_TO_UPDATE");
        }
        provider.clientAuthType = externalOIDCProvider.clientAuthType;
        provider.externalOIDCProviderClientId = externalOIDCProvider.externalOIDCProviderClientId;
        provider.externalOIDCProviderClientSecret = externalOIDCProvider.externalOIDCProviderClientSecret;
        provider.externalOIDCProviderDescription = externalOIDCProvider.externalOIDCProviderDescription;
        provider.externalOIDCProviderName = externalOIDCProvider.externalOIDCProviderName;
        provider.externalOIDCProviderTenantId = externalOIDCProvider.externalOIDCProviderTenantId;
        provider.externalOIDCProviderWellKnownUri = externalOIDCProvider.externalOIDCProviderWellKnownUri;
        provider.refreshTokenAllowed = externalOIDCProvider.refreshTokenAllowed;
        provider.usePkce = externalOIDCProvider.usePkce;
        writeFileSync(`${dataDir}/EXTERNAL_OIDC_PROVIDER_FILE`, JSON.stringify(providers), {encoding: "utf-8"});
        return Promise.resolve(externalOIDCProvider);
    }

    public async getExternalOIDCProviderTenantRels(tenantId?: string): Promise<Array<ExternalOidcProviderTenantRel>> {
        let rels: Array<ExternalOidcProviderTenantRel> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_TENANT_REL_FILE}`, "[]"));
        if(tenantId){
            rels = rels.filter(
                (rel: ExternalOidcProviderTenantRel) => rel.tenantId === tenantId
            )
        }
        return Promise.resolve(rels);
    }

    public async getExternalOIDCProviderByDomain(domain: string): Promise<ExternalOidcProvider | null> {
        const domainRels: Array<ExternalOidcProviderDomainRel> = await this.getExternalOIDCProviderDomainRels();
        const domainRel: ExternalOidcProviderDomainRel | undefined = domainRels.find(
            (r: ExternalOidcProviderDomainRel) => r.domain === domain
        )
        if(!domainRel){
            return Promise.resolve(null);
        }
        return this.getExternalOIDCProviderById(domainRel.externalOIDCProviderId);
    }

    public async assignExternalOIDCProviderToTenant(externalOIDCProviderId: string, tenantId: string): Promise<ExternalOidcProviderTenantRel> {
        const rels: Array<ExternalOidcProviderTenantRel> = await this.getExternalOIDCProviderTenantRels(tenantId);
        const existingRel: ExternalOidcProviderTenantRel | undefined = rels.find(
            (r: ExternalOidcProviderTenantRel) => r.externalOIDCProviderId === externalOIDCProviderId
        )
        if(existingRel){
            return Promise.resolve(existingRel)
        }
        const newRel: ExternalOidcProviderTenantRel= {
            tenantId: tenantId,
            externalOIDCProviderId: externalOIDCProviderId
        }
        rels.push(newRel);
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_TENANT_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve(newRel);
    }

    public async removeExternalOIDCProviderFromTenant(externalOIDCProviderId: string, tenantId: string): Promise<ExternalOidcProviderTenantRel> {
        let rels: Array<ExternalOidcProviderTenantRel> = await this.getExternalOIDCProviderTenantRels();
        rels = rels.filter(
            (r: ExternalOidcProviderTenantRel) => !(r.tenantId === tenantId && r.externalOIDCProviderId === externalOIDCProviderId)
        );
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_TENANT_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve({
            tenantId: tenantId,
            externalOIDCProviderId: externalOIDCProviderId
        })
    }

    public async getExternalOIDCProviderDomainRels(): Promise<Array<ExternalOidcProviderDomainRel>>{
        const domainRels: Array<ExternalOidcProviderDomainRel> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_DOMAIN_REL_FILE}`, "[]"));
        return Promise.resolve(domainRels);
    }

    public async assignExternalOIDCProviderToDomain(externalOIDCProviderId: string, domain: string): Promise<ExternalOidcProviderDomainRel>{
        const domainRels: Array<ExternalOidcProviderDomainRel> = await this.getExternalOIDCProviderDomainRels();
        const existingRel: ExternalOidcProviderDomainRel | undefined = domainRels.find(
            (rel: ExternalOidcProviderDomainRel) => rel.domain === domain && rel.externalOIDCProviderId === externalOIDCProviderId
        )
        if(existingRel){
            return Promise.resolve(existingRel);
        }
        const newRel: ExternalOidcProviderDomainRel = {
            domain: domain,
            externalOIDCProviderId: externalOIDCProviderId
        }
        domainRels.push(newRel);
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_DOMAIN_REL_FILE}`, JSON.stringify(domainRels), {encoding: "utf-8"});
        return Promise.resolve(newRel);
    }

    public async removeExternalOIDCProviderFromDomain(externalOIDCProviderId: string, domain: string): Promise<ExternalOidcProviderDomainRel>{
        let domainRels: Array<ExternalOidcProviderDomainRel> = await this.getExternalOIDCProviderDomainRels();
        domainRels.filter(
            (r: ExternalOidcProviderDomainRel) => !(r.domain === domain && r.externalOIDCProviderId === externalOIDCProviderId)
        );
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_PROVIDER_DOMAIN_REL_FILE}`, JSON.stringify(domainRels), {encoding: "utf-8"});
        return Promise.resolve({
            domain: domain,
            externalOIDCProviderId: externalOIDCProviderId
        });
    }

    public async deleteExternalOIDCProvider(externalOIDCProviderId: string): Promise<void> {
        // TODO
        // REMOVE existing relationships between provider and domain and provider and tenant
        throw new Error("Method not implemented.");
    }

}

export default FSBasedExternalOIDCProviderDao;