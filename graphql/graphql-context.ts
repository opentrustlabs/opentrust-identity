import { OIDCPrincipal } from "@/lib/models/principal";
import { Tenant } from "@/graphql/generated/graphql-types";

export interface OIDCContext {
    authToken: string,
    oidcPrincipal: OIDCPrincipal | null,
    rootTenant: Tenant,
    requestCache: Map<string, any>
}