import { PortalUserProfile, Tenant } from "@/graphql/generated/graphql-types";

export interface OIDCContext {
    authToken: string,
    portalUserProfile: PortalUserProfile | null,
    rootTenant: Tenant,
    requestCache: Map<string, any>
}