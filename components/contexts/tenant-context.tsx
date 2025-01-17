"use client";
import React, { Context, ReactNode } from "react";

export interface TenantBean {
    getCurrentTenant: () => string,
    setCurrentTenant: (tenantId: string) => void
}

export interface TenantContextProps {
    children: ReactNode
}


export const TenantContext: Context<TenantBean> = React.createContext<TenantBean>({
    getCurrentTenant: function (): string {
        throw new Error("Function not implemented.");
    },
    setCurrentTenant: function (tenantId: string): void {
        throw new Error("Function not implemented.");
    }
});

const TenantContextProvider: React.FC<TenantContextProps> = ({
    children
}) => {


    const [tenant, setTenant] = React.useState<string>("");
    
    return (
        <TenantContext.Provider 
            value={
                {
                    getCurrentTenant(): string {
                        return tenant;
                    },
                    setCurrentTenant(tenantId) {
                        console.log("tennat context will set tenant id");
                        setTenant(tenantId)
                    },
                }
            }
        >
            {children}
        </TenantContext.Provider>
    )

}

export default TenantContextProvider;