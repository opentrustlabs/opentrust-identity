"use client";
import React, { useContext } from "react";
import { useSearchParams } from 'next/navigation';
import TenantList from "@/components/tenants/tenant-list";
import ClientList from "@/components/clients/client-list";
import AuthorizationGroupList from "@/components/authorization-groups/authorization-group-list";
import { TenantContext, TenantMetaDataBean } from "@/components/contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import TenantDetail from "@/components/tenants/tenant-detail";
import UserList from "@/components/users/user-list";
import AuthenticationGroupList from "@/components/authentication-groups/authentication-group-list";
import FederatedOIDCProviderList from "@/components/oidc-providers/oidc-provider-list";
import SigningKeyList from "@/components/signing-keys/signing-key-list";
import ScopeList from "@/components/scope/scope-list";


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
                <TenantList />
            }
            {(section === null || section === "tenants") && tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT && 
                <TenantDetail tenantId={tenantBean.getTenantMetaData().tenant.tenantId} />
            }
            {section === "clients" &&
                <ClientList />
            }
            {section === "users" &&
                <UserList tenantId={tenantBean.getTenantMetaData().tenant.tenantId} authorizationGroupId={""} authenticationGroupId={""}  page={0} perPage={20} embedded={false}/>
            }
            {section === "authorization-groups" &&
                <AuthorizationGroupList />
            }
            {section === "authentication-groups" &&
                <AuthenticationGroupList />
            }
            {section === "oidc-providers" &&
                <FederatedOIDCProviderList  />
            }
            {section === "signing-keys" &&
                <SigningKeyList />
            }
            {section === "scope-access-control" &&
                <ScopeList />
            }
        </>
    )
}

export default TenantLandingPage;