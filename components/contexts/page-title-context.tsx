"use client";
import React, { Context, ReactNode } from "react";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/graphql/queries/oidc-queries";


export interface PageTitleSetter {
    setPageTitle: (title: string) => void
}

export interface AuthContextProps {
    children: ReactNode
}

const setter: PageTitleSetter = {
    setPageTitle: function (title: string): void {
        document.title = title;
    }
}

export const PageTitleContext: Context<PageTitleSetter> = React.createContext<PageTitleSetter>(setter);

const PageTitleContextProvider: React.FC<AuthContextProps> = ({
    children
}) => {


    return (
        <PageTitleContext.Provider 
            value={setter}
        >
            {children}
        </PageTitleContext.Provider>
    )

}

export default PageTitleContextProvider;