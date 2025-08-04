import { PortalUserProfile, Tenant } from "@/graphql/generated/graphql-types";

export interface OIDCContext {
    authToken: string,
    portalUserProfile: PortalUserProfile | null,
    rootTenant: Tenant,
    requestCache: Map<string, any>,
    ipAddress: string | null,
    geoLocation: string | null,
    deviceFingerPrint: string | null // Not implemented yet. For future enhancements...
}