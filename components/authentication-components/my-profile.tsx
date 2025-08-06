"use client";
import { PortalUserProfile, UserUpdateInput } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { AuthContextProps, AuthContext } from "../contexts/auth-context";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ErrorComponent from "../error/error-component";
import { AuthSessionProps, useAuthSessionContext } from "../contexts/auth-session-context";
import { ME_QUERY, TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";


const MyProfile: React.FC = () => {

    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    //const authSessionProps: AuthSessionProps = useAuthSessionContext();
    //const authContextProps: AuthContextProps = useContext(AuthContext);
    //const profile: PortalUserProfile | null = authContextProps.portalUserProfile;


    const [userTenantId, setUserTenantId] = React.useState<string | null>(null);

    const {data, loading, error} = useQuery(ME_QUERY, {
        onCompleted(data) {
            if(data && data.me && data.me.tenantId){
                setUserTenantId(data.me.tenantId);
                //setUserTenantId("2a303f6d-0ebc-4590-9d12-7ebab6531d7e");
            }
        },
    });

    const {data: tenantMetaData} = useQuery(TENANT_META_DATA_QUERY, {
        variables: {
            tenantId: userTenantId
        },
        skip: userTenantId === null,
        onCompleted(data) {
            console.log(data);
            if(data && data.getTenantMetaData){
                tenantBean.setTenantMetaData(data.getTenantMetaData);
                
            }
        },
    })
    
    // const authHashKVPair = window.location.hash;
    // console.log(authHashKVPair);
    
    // if(authHashKVPair){
    //     console.log("checpoint 3");
    //     const kvPair = authHashKVPair.split("=");
    //     const accessToken = kvPair[1];
    //     console.log("access token is: " + accessToken);
    //     if(accessToken){
    //         authSessionProps.setAuthSessionData(
    //             {
    //                 accessToken: accessToken,
    //                 expiresAtMs: Date.now() + 84000
    //             }        
    //         );
    //     }
    // }
    
    

    // if(profile === null){
    //     return <ErrorComponent message={"No profile can be found"} componentSize='lg' />
    // }

    // const initInput: UserUpdateInput = {
    //     domain: user.domain,
    //     email: profile.email,
    //     emailVerified: user.emailVerified,
    //     enabled: user.enabled,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     locked: user.locked,
    //     nameOrder: user.nameOrder,
    //     userId: user.userId,
    //     address: user.address || "",
    //     addressLine1: user.addressLine1 || "",
    //     city: user.city || "",
    //     stateRegionProvince: user.stateRegionProvince || "",
    //     postalCode: user.postalCode || "",
    //     countryCode: user.countryCode,
    //     federatedOIDCProviderSubjectId: user.federatedOIDCProviderSubjectId,
    //     middleName: user.middleName || "",
    //     phoneNumber: user.phoneNumber,
    //     preferredLanguageCode: user.preferredLanguageCode
    // }
    // // STATE VARIABLES
    // const [userInput, setUserInput] = React.useState<UserUpdateInput>(initInput);
    // const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    // const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    // const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    // const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);


    return (
        <div>
            {JSON.stringify(data)}
        </div>
    )
}

export default MyProfile;