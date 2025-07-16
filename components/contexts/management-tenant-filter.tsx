"use client";
import React, { ReactNode, useContext, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { QUERY_PARAM_AUTHENTICATE_TO_PORTAL, TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE } from "@/utils/consts";
import { useQuery } from "@apollo/client";
import { TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { AuthContext, AuthContextProps } from "./auth-context";
import { TenantMetaDataBean, TenantContext } from "./tenant-context";
import DataLoading from "../layout/data-loading";
import { containsScope } from "@/utils/authz-utils";

interface LayoutProps {
    children: ReactNode
}
const ManagementTenantFilter: React.FC<LayoutProps> = ({
    children,
  }) => {

    // CONTEXT OBJECTS
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);

    // Hooks
    const params = useParams();
    const tenantIdFromPath: string | null = params ? params.tenant_id as string : null;
    
    const router = useRouter();


    // If tenantIdFromPath is null or undefined, then we may redirect to the login screen. 
    // But first we will check some things:
    //
    // 1.   What is the user profile from the "me" call. Is there a valid user?
    // 2.   Is there a tenant id which the user can manage and which is set in their profile?
    // 
    // Note that the query param _pa=true will be present in these authentication redirects.
    // _pa=true is a flag that indicates that the user is NOT coming from a client (which is
    // doing an OAuth2 flow) but rather from a user who wants to authenticate and access a
    // management screen.
    // 
    // ACTIONS
    // =======
    // 1.   If no user profile and no tenant id in the path, then
    //      redirect to the /authorization/login?_pa=true screen.
    // 2.   If the profile is valid and the user has access to a management screen, then
    //      redirect to the landing page of the tenant, which is just /{tenant_id}/
    // 3.   If the profile is valid but the user does NOT have access to a management screen then
    //      show an error message
    // 4.   If there is no a valid user profile but there IS a tenant id in local storeage, then
    //      redirect to /authorization/login?_tid={tenant id found in local storage}&_pa=true
    //
    // Any redirects to the authorization screen will ALSO include any saved language and country
    // values that were saved in local storage, or defaulted to en-US

    let needsRedirect = true;
    let redirectUri: string = `/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`;
    

    if(tenantIdFromPath === null && profile === null){
        redirectUri = `/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`;
    }
    else if(tenantIdFromPath === null && profile !== null){
        if(profile.managementAccessTenantId !== undefined){
            redirectUri = `/${profile.managementAccessTenantId}/`;
        }
        else{
            // TODO 
            // Get language and country from local storage and add to the query params
            redirectUri = `/access-error?access_error_code=00023`;
        }
    }
    else if(tenantIdFromPath !== null && profile === null){
        redirectUri = `/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`;
    }
    else if(tenantIdFromPath !== null && profile !== null){
        
        if(!profile.managementAccessTenantId){
            redirectUri = `/access-error?access_error_code=00023`;
        }

        else{            
            if(profile.managementAccessTenantId !== tenantIdFromPath){
                // const additionalPath = window.location.pathname.replace(`/${tenantIdFromPath}`, "");
                // const currentQueryParams = window.location.search;
                redirectUri = `/${profile.managementAccessTenantId}`; //${additionalPath}${currentQueryParams}`;
            }
            else{
                // Need to check to see if the user has any permissions within the tenant
                // They need to have, at a minimum tenant.all.read or tenant.read scope
                if(profile.scope.length === 0 || !containsScope([TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], profile.scope)){
                    redirectUri = `/access-error?access_error_code=00025`;
                }
                else{
                    // No need to do anything else, since the user is on a valid page for managing
                    // their tenant.
                    needsRedirect = false;
                }
            }            
        }
    }

    // If either of the profile or the tenant id change, update the tenant context
    useEffect(() => {
        if(needsRedirect){
            router.push(redirectUri);
        }
    }, [profile, tenantIdFromPath]);

    

    // GRAPHQL QUERIES
    const {data, loading } = useQuery(TENANT_META_DATA_QUERY, {
        variables: {
            tenantId: tenantIdFromPath
        },
        skip: needsRedirect,
        ssr: false,
        onCompleted(data) {
            if(data.getTenantMetaData === null){
                router.push(`/access-error?access_error_code=00024&extended_message=${data.error.message}`);
            }
            else{
                tenantBean.setTenantMetaData(data.getTenantMetaData);
            }
        },
        onError(error) {
            router.push(`/access-error?access_error_code=00024&extended_message=${error.message}`)
            // TODO
            // Need to inspect the error message and redirect the user to the
            // access-error page with an appropriate message. This should almost
            // never happen, since most error conditions are handled above, and so
            // the tenant id should always exist (unless, perhaps, the user has edited their 
            // own local storage). But it could be that the tenant has been
            // disabled and so we need alert the user to that fact.
            //setErrorMessage(JSON.stringify(error));
        },
    });

    if(!needsRedirect && loading) return <div><DataLoading dataLoadingSize={"xl"} color={null}  /></div>
    else if(!needsRedirect && data) return <>{children}</>    
    else return <></>
    
}

export default ManagementTenantFilter;