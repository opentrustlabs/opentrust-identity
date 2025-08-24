"use client";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import { DEFAULT_TENANT_META_DATA } from "@/utils/consts";
import React, { Context, ReactNode } from "react";


export interface TenantMetaDataBean {

    setTenantMetaData: (tenantMetadata: TenantMetaData) => void,
    getTenantMetaData: () => TenantMetaData
}

export interface TenantContextProps {
    children: ReactNode
}


export const TenantContext: Context<TenantMetaDataBean> = React.createContext<TenantMetaDataBean>({
    setTenantMetaData: function (): void {
        throw new Error("Function not implemented.");
    },
    getTenantMetaData: function (): TenantMetaData {
        throw new Error("Function not implemented.");
    }
});

const TenantContextProvider: React.FC<TenantContextProps> = ({
    children
}) => {


    const [currentTenantMetaData, setCurrentTenantMetaData] = React.useState<TenantMetaData>(DEFAULT_TENANT_META_DATA);
    
    return (
        <TenantContext.Provider 
            value={
                {
                    getTenantMetaData(): TenantMetaData {
                        return currentTenantMetaData;
                    },
                    setTenantMetaData(metaData: TenantMetaData) {
                        setCurrentTenantMetaData(metaData)
                    }
                }
            }
        >
            {children}
        </TenantContext.Provider>
    )

}

export default TenantContextProvider;