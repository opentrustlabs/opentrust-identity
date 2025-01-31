"use client";
import ErrorComponent from "@/components/error/error-component";
import DataLoading from "@/components/layout/data-loading";
import UserDetail from "@/components/users/user-detail";
import { USER_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React from "react";


const UserDetailPage: React.FC = () => {



    const params = useParams();
    const userId = params?.id as string;

    const {data, loading, error} = useQuery(
        USER_DETAIL_QUERY,
        {
            skip: userId === null || userId === undefined,
            variables: {
                userId: userId
            },
        }
        
    )

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !userId) return <ErrorComponent message={error ? error.message : "No user with this ID can be found"} componentSize='lg' />
    
    return (
        <UserDetail user={data.getUserById} />
    )

}

export default UserDetailPage