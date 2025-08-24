"use client";
import Grid2 from "@mui/material/Grid2";
import React from "react";


export interface DetailPageContainerProps {
    children: React.ReactNode
}
const DetailPageContainer: React.FC<DetailPageContainerProps> = ({children}) => {

    return (
        <Grid2 container size={12} spacing={3} marginBottom={"16px"} >
            {children}
        </Grid2>
    )
}

const DetailPageMainContentContainer: React.FC<DetailPageContainerProps> = ({children}) => {

    return (
        <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 9, xl: 9 }}>
            {children}
        </Grid2>
        
    )
}

const DetailPageRightNavContainer: React.FC<DetailPageContainerProps> = ({children}) => {

    return (
        <Grid2 spacing={2} size={{ xs: 12, sm: 12, md: 12, lg: 3, xl: 3 }}>
            {children}
        </Grid2>
    )
}

export { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer };