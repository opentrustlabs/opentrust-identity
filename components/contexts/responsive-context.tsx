"use client";
import React, { Context, ReactNode } from "react";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export interface ResponsiveBreakpoints {    
    isExtraSmall: boolean,
    isSmall: boolean,
    isMedium: boolean,
    isLarge: boolean,
    isExtraLarge: boolean,
    isGreaterThanExtraLarge: boolean;
}

export interface ResponsiveContextProps {
    children: ReactNode
}


export const ResponsiveContext: Context<ResponsiveBreakpoints> = React.createContext<ResponsiveBreakpoints>({
    isGreaterThanExtraLarge: false,
    isExtraLarge: true,
    isLarge: false,
    isMedium: false,
    isSmall: false,
    isExtraSmall: false
});

const ResponsiveContextProvider: React.FC<ResponsiveContextProps> = ({
    children
}) => {


    const theme = useTheme();
    const isExtraSmall: boolean = useMediaQuery(theme.breakpoints.down("xs"));
    const isSmall: boolean = useMediaQuery(theme.breakpoints.down("sm"));
    const isMedium: boolean = useMediaQuery(theme.breakpoints.down("md"));
    const isLarge: boolean = useMediaQuery(theme.breakpoints.down("lg"));
    const isExtraLarge: boolean = useMediaQuery(theme.breakpoints.down("xl"));
    const isGreaterThanExtraLarge: boolean = useMediaQuery(theme.breakpoints.up("xl"));
    const r: ResponsiveBreakpoints = {
        isExtraSmall,
        isSmall,
        isMedium,
        isLarge,
        isExtraLarge,
        isGreaterThanExtraLarge
    }

    return (
        <ResponsiveContext.Provider 
            value={r}
        >
            {children}
        </ResponsiveContext.Provider>
    )

}

export default ResponsiveContextProvider;