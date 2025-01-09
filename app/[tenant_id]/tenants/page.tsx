"use client";
import { TENANTS_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { CircularProgress } from "@mui/material";
import React from "react";

const TenantList: React.FC = () => {


    const {data, error, loading } = useQuery(TENANTS_QUERY, {

    });

    if(loading) return <CircularProgress />
    if(error) return <div>There was an error. ${error.stack}</div>
    if(data) return (

        <div>{JSON.stringify(data)}</div>
    )
}

export default TenantList;