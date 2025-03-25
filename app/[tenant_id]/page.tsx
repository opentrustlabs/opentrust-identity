"use client";
import React, { useContext } from "react";
import { useSearchParams } from 'next/navigation';
import { TenantContext, TenantMetaDataBean } from "@/components/contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import TenantDetail from "@/components/tenants/tenant-detail";
import AuthenticationGroupList from "@/components/authentication-groups/authentication-group-list";
import FederatedOIDCProviderList from "@/components/oidc-providers/oidc-provider-list";
import SigningKeyList from "@/components/signing-keys/signing-key-list";
import ScopeList from "@/components/scope/scope-list";
import RateLimitList from "@/components/rate-limits/rate-limit-list";
import SearchResultListLayout from "@/components/layout/search-result-list-layout";
import { SearchResultType } from "@/graphql/generated/graphql-types";


const TenantLandingPage: React.FC = () => {

    // CONTEXT HOOKS
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);
    
     // QUERY PARAMS
    const params = useSearchParams();
    const section = params?.get("section");

    /*
        In the content section for the landing page for the tenant, we will
        decide which component to include based on the section value, defaulting
        to either the tenant list (for root tenant admins) or the tenant
        detail page (for tenants which allow specific admin users to access the
        management screens).

        section = search | tenants | clients | users | scope/access rules | authn groups | authz groups | federated oidc providers | rate limits | keys 
    
    
    */

    return (
        <>
            {(section === null || section === "tenants") && tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT && 
                <SearchResultListLayout 
                    page={1} 
                    perPage={20} 
                    filterInputLabel="Filter Tenants" 
                    resultType={SearchResultType.Tenant}
                    breadCrumbText=""
                />
            }
            {(section === null || section === "tenants") && tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT && 
                <TenantDetail tenantId={tenantBean.getTenantMetaData().tenant.tenantId} />
            }
            {section === "clients" &&
                <SearchResultListLayout
                    page={1}
                    perPage={20}
                    filterInputLabel="Filter Clients"
                    resultType={SearchResultType.Client}
                    breadCrumbText={"Client List"}
                />
            }
            {section === "users" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Users" 
                    resultType={SearchResultType.User}
                    page={1} 
                    perPage={20}
                    breadCrumbText="User List"
                />
            }
            {section === "authorization-groups" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Authorization Groups" 
                    resultType={SearchResultType.AuthorizationGroup}
                    page={1} 
                    perPage={20}
                    breadCrumbText="Authorization Groups"
                />
            }
            {section === "authentication-groups" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Authentication Groups" 
                    resultType={SearchResultType.AuthenticationGroup}
                    page={1} 
                    perPage={20}
                    breadCrumbText="Authorization Groups"
                />
            }
            {section === "oidc-providers" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Providers" 
                    resultType={SearchResultType.OidcProvider}
                    page={1} 
                    perPage={20}
                    breadCrumbText="Federated OIDC Providers"
                />
            }
            {section === "signing-keys" &&
                <SigningKeyList />
            }
            {section === "scope-access-control" &&
                <ScopeList />
            }
            {section === "rate-limits" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Rate Limits" 
                    resultType={SearchResultType.RateLimit}
                    page={1} 
                    perPage={20}
                    breadCrumbText="Rate Limits"
                />                
            }
        </>
    )
}

export default TenantLandingPage;