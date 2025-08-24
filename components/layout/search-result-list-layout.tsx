"use client";
import Grid2 from "@mui/material/Grid2";
import TablePagination from "@mui/material/TablePagination";
import React, { useContext, useEffect, useRef } from "react";
import DataLoading from "./data-loading";
import ErrorComponent from "../error/error-component";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useQuery } from "@apollo/client";
import { MAX_SEARCH_PAGE_SIZE, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { ObjectSearchResults, SearchFilterInput, SearchFilterInputObjectType, SearchResultType } from "@/graphql/generated/graphql-types";
import { SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import TenantResultList from "../tenants/tenant-list";
import UserResultList from "../users/user-list";
import ClientResultList from "../clients/client-list";
import AuthorizationGroupList from "../authorization-groups/authorization-group-list";
import AuthenticationGroupList from "../authentication-groups/authentication-group-list";
import FederatedOIDCProviderList from "../oidc-providers/oidc-provider-list";
import RateLimitList from "../rate-limits/rate-limit-list";
import SearchResultList from "../search/search-result-list";
import { useSearchParams } from "next/navigation";
import ScopeList from "../scope/scope-list";
import SigningKeyList from "../signing-keys/signing-key-list";


export interface ResultListProps {
    searchResults: ObjectSearchResults,
    deleteItemListener?: (itemId: string, page: number, perPage: number) => void 
}

export interface SearchResultListProps {
    filterInputLabel: string,
    page: number,
    perPage: number,
    resultType: SearchResultType | null,
    breadCrumbText: string | null
    sortDirection?: string | null,
    sortField?: string | null
}


const SearchResultListLayout: React.FC<SearchResultListProps> = ({    
    filterInputLabel,
    page: p,
    perPage: pp,
    resultType,
    breadCrumbText,
    sortField,
    sortDirection
}) => {

    
    // CONTEXT HOOKS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const searchParams = useSearchParams();
    const isSearchPage: boolean = searchParams?.get("section")  === "search" ? true : false;
    const t = searchParams?.get("term") || "";
    
    const perPage = pp && pp < MAX_SEARCH_PAGE_SIZE ? pp : 20;
    
    // REF OBJECTS
    const topOfSearchList = useRef<HTMLDivElement | null>(null);

    // STATE VARIABLES
    const [filterTerm, setFilterTerm] = React.useState<string>(t);
    const [page, setPage] = React.useState<number>(p  || 1);
    
    useEffect(() => {
        setFilterTerm(searchParams?.get("term") || "");
    }, [searchParams]);

    // HANDLER FUNCTIONS
    const arrBreadcrumbs = [];
    if(isSearchPage){
        const suffix = t ? ` (search term: ${t})` : ``
        arrBreadcrumbs.push({
            href: null,
            linkText: `Search Results${suffix}`
        });
    }
    else{
        arrBreadcrumbs.push({
            href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
            linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
        });
    }

    if(breadCrumbText){
        arrBreadcrumbs.push({
            linkText: breadCrumbText,
            href: null
        });
    }
    const filters: Array<SearchFilterInput> = [];

    if(tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT){
        filters.push({
            objectType: SearchFilterInputObjectType.TenantId,
            objectValue: tenantBean.getTenantMetaData().tenant.tenantId
        });
    }


    const { data, loading, error, previousData } = useQuery(SEARCH_QUERY, {
        variables: {
            searchInput: {
                term: filterTerm,
                filters: filters,
                page: page,
                perPage: perPage,
                resultType: resultType ? resultType : null,
                sortDirection: sortDirection,
                sortField: sortField
            }
        },
        fetchPolicy: "network-only",
        nextFetchPolicy: "network-only"
    });

    // Material UI TablePagination component uses zero-based 
    // indexing (argh) for pagination. Is there ever a page 0?
    // So we need to constantly adjust from zero-based to 1-based
    // indexing. They should really use OFFSET rather than page,
    // since that makes more sense.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePageChange = async (evt: any, page: number) => {
        setPage(page + 1);        
        topOfSearchList.current?.scrollIntoView({
            behavior: "smooth"
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFilterTermChange = async (evt: any) => {
        const term = evt.target.value || "";        
        setFilterTerm(term);      
        if (term && term.length >= 3) {
            setPage(1);
        }
        if (!term || term.length < 3) {
            setPage(1);
        }
    }
    

    return (

        <main >
            <Typography component={"div"}>
                <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />                
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        {!isSearchPage &&
                            <TextField
                                label={filterInputLabel}
                                size={"small"}
                                name={"filter"}
                                value={filterTerm}
                                onChange={handleFilterTermChange}                                
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <CloseOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => { setFilterTerm(""); setPage(1) }}
                                                />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        }
                    </div>
                    <div ref={topOfSearchList}></div>
                </Stack>
                {
                    /*  Need to  divide this component into 2 (one managing filters, pagination, queries and the other managing just the display), 
                        so that they have independent state values and therefore
                        do not constantly re-render (slowly and painfully) any time a user types something into the filter field.
                    */
                }
                {loading && !previousData && 
                    <DataLoading dataLoadingSize="44vh" color={null} />
                }
                {error &&
                    <ErrorComponent message={error.message || "Unknown Error Occurred."} componentSize='lg' />
                }                
                {loading && previousData && 
                    <>
                        {resultType === null &&
                            <SearchResultList searchResults={previousData.search} />                            
                        }
                        {resultType === SearchResultType.Tenant &&
                            <TenantResultList searchResults={previousData.search} />
                        }
                        {resultType === SearchResultType.User &&
                            <UserResultList searchResults={previousData.search} />
                        }
                        {resultType === SearchResultType.Client &&
                            <ClientResultList searchResults={previousData.search} />
                        }
                        {resultType === SearchResultType.AuthorizationGroup &&
                            <AuthorizationGroupList searchResults={previousData.search} />
                        }
                        {resultType === SearchResultType.AuthenticationGroup &&
                            <AuthenticationGroupList searchResults={previousData.search} />
                        }
                        {resultType === SearchResultType.OidcProvider &&
                            <FederatedOIDCProviderList searchResults={previousData.search} />
                        }
                        {resultType === SearchResultType.RateLimit &&
                            <RateLimitList searchResults={previousData.search} />
                        }
                        {resultType === SearchResultType.AccessControl &&
                            <ScopeList searchResults={previousData.search} />
                        }
                        {resultType === SearchResultType.Key &&
                            <SigningKeyList searchResults={previousData.search} />
                        }
                    </>                    
                }
                { data &&
                    <>
                        {resultType === null &&
                            <SearchResultList searchResults={data.search} />
                        }
                        {resultType === SearchResultType.Tenant &&
                            <TenantResultList searchResults={data.search} />
                        }
                        {resultType === SearchResultType.User &&
                            <UserResultList searchResults={data.search} />
                        }
                        {resultType === SearchResultType.Client &&
                            <ClientResultList searchResults={data.search} />
                        }
                        {resultType === SearchResultType.AuthorizationGroup &&
                            <AuthorizationGroupList searchResults={data.search} />
                        }
                        {resultType === SearchResultType.AuthenticationGroup &&
                            <AuthenticationGroupList searchResults={data.search} />
                        }
                        {resultType === SearchResultType.OidcProvider &&
                            <FederatedOIDCProviderList searchResults={data.search} />
                        }
                        {resultType === SearchResultType.RateLimit &&
                            <RateLimitList searchResults={data.search} />
                        }
                        {resultType === SearchResultType.AccessControl &&
                            <ScopeList searchResults={data.search} />
                        }
                        {resultType === SearchResultType.Key &&
                            <SigningKeyList searchResults={data.search} />
                        }
                    </>
                }
                
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                    <Grid2 size={12}>
                        {loading && previousData && previousData.search.total > 0 &&
                            <TablePagination
                                component={"div"}
                                page={page - 1}
                                rowsPerPage={perPage}
                                count={previousData.search.total}
                                onPageChange={handlePageChange}
                                rowsPerPageOptions={[]}
                            />
                        }
                        {data && data.search.total > 0 &&
                            <TablePagination
                                component={"div"}
                                page={page - 1}
                                rowsPerPage={perPage}
                                count={data.search.total}
                                onPageChange={handlePageChange}
                                rowsPerPageOptions={[]}
                            />
                        }                    
                    </Grid2>
                </Grid2>

            </Typography>
        </main>


    )
}

export default SearchResultListLayout;