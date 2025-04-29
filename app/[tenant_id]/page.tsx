"use client";
import React, { useContext } from "react";
import { useSearchParams } from 'next/navigation';
import { TenantContext, TenantMetaDataBean } from "@/components/contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import TenantDetail from "@/components/tenants/tenant-detail";
import SigningKeyList from "@/components/signing-keys/signing-key-list";
import ScopeList from "@/components/scope/scope-list";
import SearchResultListLayout from "@/components/layout/search-result-list-layout";
import { SearchResultType } from "@/graphql/generated/graphql-types";


const TenantLandingPage: React.FC = () => {

    // CONTEXT HOOKS
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);
    
     // QUERY PARAMS
    const params = useSearchParams();
    const section = params?.get("section");
    const searchTerm = params?.get("term");

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
                    perPage={20}
                    filterInputLabel="Filter Results"
                    resultType={null}
                    breadCrumbText={""}
                />
            }
            {section === "clients" &&
                <SearchResultListLayout
                    page={1}
                    perPage={20}
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
                    perPage={20}
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
                    perPage={20}
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
                    perPage={20}
                    breadCrumbText="Authorization Groups"
                    sortDirection={"asc"}
                    sortField={"name"}
                />
            }
            {section === "oidc-providers" &&
                <SearchResultListLayout 
                    filterInputLabel="Filter Providers" 
                    resultType={SearchResultType.OidcProvider}
                    page={1} 
                    perPage={20}
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
                    perPage={20}
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
                    perPage={20}
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
                    perPage={20}
                    breadCrumbText="Rate Limits"
                    sortDirection={"asc"}
                    sortField={"name"}
                />                
            }
        </>
    )
}

export default TenantLandingPage;