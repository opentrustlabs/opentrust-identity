"use client";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "./tenant-context";
import { useInternationalizationContext } from "./internationalization-context";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export interface RecaptchaContextProviderProps {
    children: React.ReactNode
}


const RecaptchaContextProvider: React.FC<RecaptchaContextProviderProps> = ({
    children
}) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const i18nContext = useInternationalizationContext();

    return (
        <React.Fragment>
            {tenantBean.getTenantMetaData().tenant.registrationRequireCaptcha === true && tenantBean.getTenantMetaData().recaptchaMetaData?.useCaptchaV3 === true &&
                <GoogleReCaptchaProvider
                    reCaptchaKey={tenantBean.getTenantMetaData().recaptchaMetaData?.recaptchaSiteKey || ""}
                    language={i18nContext.getLanguage()}
                    useRecaptchaNet={false}
                    useEnterprise={tenantBean.getTenantMetaData().recaptchaMetaData?.useEnterpriseCaptcha || false}
                    scriptProps={{
                        async: true, // optional, default to false,
                        defer: true, // optional, default to false
                        appendTo: 'body', // optional, default to "head", can be "head" or "body",
                        nonce: undefined // optional, default undefined
                    }}
                    // container={{ // optional to render inside custom element
                    // element: "[required_id_or_htmlelement]",
                    // parameters: {
                    //     badge: '[inline|bottomright|bottomleft]', // optional, default undefined
                    //     theme: 'dark', // optional, default undefined
                    // }
                    // }}
                >
                    {children}
                </GoogleReCaptchaProvider>
            }
            {tenantBean.getTenantMetaData().tenant.registrationRequireCaptcha === false &&
                <React.Fragment>{children}</React.Fragment>
            }
        </React.Fragment>
    )


}







export default RecaptchaContextProvider;