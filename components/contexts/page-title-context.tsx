"use client";
import React, { Context, ReactNode } from "react";


export interface PageTitleSetter {
    setPageTitle: (title: string) => void
}

export interface AuthContextProps {
    children: ReactNode
}

const setter: PageTitleSetter = {
    setPageTitle: function (title: string): void {
        if(typeof window !== "undefined"){
            document.title = title;
        }
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