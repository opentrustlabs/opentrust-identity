"use client";
import { useQuery } from "@apollo/client";
import React from "react";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import { USER_SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import { SearchFilterInput, SearchFilterInputObjectType, SearchResultType } from "@/graphql/generated/graphql-types";
import { useSearchParams } from "next/navigation";


export interface UserListProps {
    tenantId: string | null,
    authorizationGroupId: string | null,
    authenticationGroupId: string | null,
    embedded: boolean | null
}

const UserList: React.FC<UserListProps> = ({
    tenantId,
    authorizationGroupId,
    authenticationGroupId,
    embedded
}) => {

    const params = useSearchParams();
    const p = params?.get("page");
    const pp = params?.get("per_page");
    const term = params?.get("term");
    
    const [filterTerm, setFilterTerm] = React.useState<string | null | undefined>(term);
    const [page, setPage] = React.useState<number>(p ? parseInt(p) : 1);
    const [perPage, setPerPage] = React.useState<number>(pp ? parseInt(pp) : 30);
    

    const filters: Array<SearchFilterInput> = [];
    tenantId && filters.push({
          objectType: SearchFilterInputObjectType.TenantId,
          objectValue: tenantId  
        });    
    authorizationGroupId && filters.push({
        objectType: SearchFilterInputObjectType.AuthorizationGroupId,
        objectValue: authorizationGroupId  
    });
    authenticationGroupId && filters.push({
        objectType: SearchFilterInputObjectType.AuthenticationGroupId,
        objectValue: authenticationGroupId  
    });

    

    const {data, loading, error, refetch} = useQuery(USER_SEARCH_QUERY, {
        variables: {
            searchInput: {                
                term: filterTerm,
                filters: filters,                
                page: page,
                perPage: perPage,
                resultType: SearchResultType.User
            }
        }
    })


    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.stack || "Unknown Error Occurred."} componentSize='lg' />

    return (<div>{JSON.stringify(data.search)}</div>)
}

export default UserList;
