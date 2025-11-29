"use client";
import React, { useContext } from "react";
import { useSearchParams } from 'next/navigation';
import { TenantContext, TenantMetaDataBean } from "@/components/contexts/tenant-context";
import { DEFAULT_SEARCH_PAGE_SIZE, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import TenantDetail from "@/components/tenants/tenant-detail";
import SearchResultListLayout from "@/components/layout/search-result-list-layout";
import { SearchResultType } from "@/graphql/generated/graphql-types";
// import LandingPage from "@/components/layout/landing-page";


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
                    perPage={DEFAULT_SEARCH_PAGE_SIZE} 
                    filterInputLabel="Filter Tenants" 
                    resultType={SearchResultType.Tenant}
                    breadCrumbText=""
                    sortDirection={"asc"}
                    sortField={"name"}

                />
            }
            {(section === null || section === "tenants") && tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&             
                <TenantDetail tenantId={tenantBean.getTenantMetaData().tenant.tenantId} />
            }
            {section === "search" &&
                <SearchResultListLayout
                    page={1}
                    perPage={DEFAULT_SEARCH_PAGE_SIZE} 
                    filterInputLabel="Filter Results"
                    resultType={null}
                    breadCrumbText={""}
                />
            }
            {section === "clients" &&
                <SearchResultListLayout
                    page={1}
                    perPage={DEFAULT_SEARCH_PAGE_SIZE} 
                    filterInputLabel="Filter Clients"
                    resultType={SearchResultType.Client}
                    breadCrumbText={"Client List"}
                    sortDirection={"asc"}
                    sortField={"name"}
                />
            }
            {section === "users" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Users" 
                    resultType={SearchResultType.User}
                    page={1} 
                    perPage={DEFAULT_SEARCH_PAGE_SIZE} 
                    breadCrumbText="User List"
                    sortDirection={"asc"}
                    sortField={"name"}
                />
            }
            {section === "authorization-groups" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Authorization Groups" 
                    resultType={SearchResultType.AuthorizationGroup}
                    page={1} 
                    perPage={DEFAULT_SEARCH_PAGE_SIZE} 
                    breadCrumbText="Authorization Groups"
                    sortDirection={"asc"}
                    sortField={"name"}
                />
            }
            {section === "authentication-groups" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Authentication Groups" 
                    resultType={SearchResultType.AuthenticationGroup}
                    page={1} 
                    perPage={DEFAULT_SEARCH_PAGE_SIZE} 
                    breadCrumbText="Authentication Groups"
                    sortDirection={"asc"}
                    sortField={"name"}
                />
            }
            {section === "oidc-providers" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Providers" 
                    resultType={SearchResultType.OidcProvider}
                    page={1} 
                    perPage={DEFAULT_SEARCH_PAGE_SIZE} 
                    breadCrumbText="Federated OIDC Providers"
                    sortDirection={"asc"}
                    sortField={"name"}
                />
            }
            {section === "signing-keys" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Keys" 
                    resultType={SearchResultType.Key}
                    page={1} 
                    perPage={DEFAULT_SEARCH_PAGE_SIZE} 
                    breadCrumbText="Keys"
                    sortDirection={"asc"}
                    sortField={"name"}
                />
            }
            {section === "scope-access-control" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Scope" 
                    resultType={SearchResultType.AccessControl}
                    page={1} 
                    perPage={DEFAULT_SEARCH_PAGE_SIZE} 
                    breadCrumbText="Scope/Access Control"
                    sortDirection={"asc"}
                    sortField={"name"}
                />
            }
            {section === "rate-limits" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Rate Limits" 
                    resultType={SearchResultType.RateLimit}
                    page={1} 
                    perPage={DEFAULT_SEARCH_PAGE_SIZE} 
                    breadCrumbText="Rate Limits"
                    sortDirection={"asc"}
                    sortField={"name"}
                />                
            }
        </>
    )
}

export default TenantLandingPage;