"use client";
import Grid2 from "@mui/material/Grid2";
import TablePagination from "@mui/material/TablePagination";
import React, { useContext, useRef } from "react";
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
}


const SearchResultListLayout: React.FC<SearchResultListProps> = ({    
    filterInputLabel,
    page: p,
    perPage: pp,
    resultType,
    breadCrumbText
}) => {

    const perPage = pp && pp < MAX_SEARCH_PAGE_SIZE ? pp : 20;
    // REF OBJECTS
    const topOfSearchList = useRef<HTMLDivElement | null>(null);

    // STATE VARIABLES
    const [filterTerm, setFilterTerm] = React.useState<string>("");
    const [page, setPage] = React.useState<number>(p  || 1);
    
    // CONTEXT HOOKS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // HANDLER FUNCTIONS
    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);

    breadCrumbText &&
        arrBreadcrumbs.push({
            linkText: breadCrumbText,
            href: null
        });
    const filters: Array<SearchFilterInput> = [];

    tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT && filters.push({
        objectType: SearchFilterInputObjectType.TenantId,
        objectValue: tenantBean.getTenantMetaData().tenant.tenantId
    });

    let { data, loading, error, refetch, previousData } = useQuery(SEARCH_QUERY, {
        variables: {
            searchInput: {
                term: filterTerm,
                filters: filters,
                page: page,
                perPage: perPage,
                resultType: resultType ? resultType : null
            }
        },

    })

    // Material UI TablePagination component uses zero-based 
    // indexing (argh) for pagination. Is there ever a page 0?
    // So we need to constantly adjust from zero-based to 1-based
    // indexing. They should really use OFFSET rather than page,
    // since that makes more sense.
    const handlePageChange = async (evt: any, page: number) => {
        setPage(page + 1);
        await refetch({
            searchInput: {
                term: filterTerm,
                filters: filters,
                page: page + 1,
                perPage: perPage,
                resultType: SearchResultType.User
            }
        });
        topOfSearchList.current?.scrollIntoView({
            behavior: "smooth"
        })
    }


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
                    </>
                    
                }
                {data &&
                    <>
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
                    </>
                }
                
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                <Grid2 size={12}>
                    {loading && previousData &&
                        <TablePagination
                            component={"div"}
                            page={page - 1}
                            rowsPerPage={perPage}
                            count={previousData.search.total}
                            onPageChange={handlePageChange}
                            rowsPerPageOptions={[]}
                        />
                    }
                    {data &&
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