"use client";
import { useQuery } from "@apollo/client";
import React, { useContext, useRef } from "react";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import { USER_SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import { Client, SearchFilterInput, SearchFilterInputObjectType, SearchResultItem, SearchResults, SearchResultType } from "@/graphql/generated/graphql-types";
import { useSearchParams } from "next/navigation";
import Typography from "@mui/material/Typography";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import Link from "next/link";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { TablePagination } from "@mui/material";

export interface UserListProps {
    tenantId: string | null,
    authorizationGroupId: string | null,
    authenticationGroupId: string | null,
    page: number | null,
    perPage: number | null,
    embedded: boolean
}

const UserList: React.FC<UserListProps> = ({
    tenantId,
    authorizationGroupId,
    authenticationGroupId,
    page: p,
    perPage: pp,
    embedded
}) => {

    // const params = useSearchParams();
    // const p = params?.get("page");
    // const pp = params?.get("per_page");
    // const term = params?.get("term");

    // REF OBJECTS
    const topOfSearchList = useRef<HTMLDivElement | null>(null);

    // STATE VARIABLES
    const [filterTerm, setFilterTerm] = React.useState<string>("");
    const [doFilterTerm, setDoFilterTerm] = React.useState<string>("");
    const [page, setPage] = React.useState<number>(p  || 0);
    const [perPage, setPerPage] = React.useState<number>(pp || 30);
    
    // CONTEXT HOOKS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // HANDLER FUNCTIONS
    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);

    arrBreadcrumbs.push({
        linkText: "Users",
        href: null
    });
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

    let { data, loading, error, refetch, previousData } = useQuery(USER_SEARCH_QUERY, {
        variables: {
            searchInput: {
                term: filterTerm,
                filters: filters,
                page: page,
                perPage: perPage,
                resultType: SearchResultType.User
            }
        },

    })

    const handlePageChange = async (evt: any, page: number) => {
        setPage(page);

        await refetch({
            searchInput: {
                term: filterTerm,
                filters: filters,
                page: page,
                perPage: perPage,
                resultType: SearchResultType.User
            }
        });
        topOfSearchList.current?.scrollIntoView({
            behavior: "smooth"
        })
    }



    const handleFilterTermChange = async (evt: any) => {
        const term = evt.target.value;
        setFilterTerm(term);
        console.log("setting filter term to: " + term);
        if (term && term.length >= 3) {
            setDoFilterTerm(term);
            console.log('setting page to 0')
            setPage(0);
        }
        if (!term || term.length < 3) {
            setDoFilterTerm("");
            console.log('setting page to 0')
            setPage(0);
        }
    }

    

    return (

        <main >
            <Typography component={"div"}>
                {embedded === false &&
                    <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />
                }                
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <TextField
                            label={"Filter Users"}
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
                                                onClick={() => { setFilterTerm(""); setDoFilterTerm(""); setPage(0) }}
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
                    <ErrorComponent message={error.stack || "Unknown Error Occurred."} componentSize='lg' />
                }
                {loading && previousData && 
                    <UserResultList
                        searchResults={previousData.search}
                        embedded={embedded}
                    />
                }
                {data &&
                    <UserResultList
                        searchResults={data.search}
                        embedded={embedded}
                    />
                }
                
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                <Grid2 size={embedded ? 12 : 9}>
                    {loading && previousData &&
                        <TablePagination
                            component={"div"}
                            page={page}
                            rowsPerPage={perPage}
                            count={previousData.search.total}
                            onPageChange={handlePageChange}
                            rowsPerPageOptions={[]}
                        />
                    }
                    {data &&
                        <TablePagination
                            component={"div"}
                            page={page}
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

interface UserResultListProps {
    searchResults: SearchResults,
    embedded: boolean
}

const UserResultList: React.FC<UserResultListProps> = ({
    searchResults,
    embedded
}) => {



    // CONTEXT HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES
    // const [page, setPage] = React.useState<number>(p || 0);
    // const [perPage, setPerPage] = React.useState<number>(pp || 30);
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    //const [filterTerm, setFilterTerm] = React.useState<string>(ft || "");

    // HANDLER FUNCTIONS
    const setExpanded = (section: string): void => {
        mapViewExpanded.set(section, true);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    const removeExpanded = (section: string): void => {
        mapViewExpanded.delete(section);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    return (
        <div>
            {c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={1}></Grid2>
                            <Grid2 size={8}>User Name</Grid2>
                            <Grid2 size={2}>Enabled</Grid2>
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No users to display
                            </Grid2>
                        </Typography>
                    }
                    {searchResults.resultList.map(
                        (user: SearchResultItem) => (
                            <Typography key={`${user.objectId}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={8}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.objectId}`}>{user.name}</Link></Grid2>
                                    <Grid2 size={2}>
                                        {user.enabled &&
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
                                    <Grid2 size={1}>
                                        {mapViewExpanded.has(user.objectId) &&
                                            <UnfoldLessOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => removeExpanded(user.objectId)}
                                            />
                                        }
                                        {!mapViewExpanded.has(user.objectId) &&
                                            <UnfoldMoreOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => setExpanded(user.objectId)}
                                            />
                                        }
                                    </Grid2>
                                </Grid2>
                                {mapViewExpanded.has(user.objectId) &&
                                    <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                        <Grid2 size={1}></Grid2>
                                        <Grid2 size={11} container>
                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                            <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{user.objectId}</div><ContentCopyIcon /></Grid2>
                                        </Grid2>
                                    </Grid2>
                                }
                            </Typography>
                        )
                    )}
                </>
            }
            {!c.isMedium &&
                <Grid2 size={embedded ? 12 : 9}>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={0.4}></Grid2>
                            <Grid2 size={4.6}>User Name</Grid2>
                            <Grid2 size={2}>Enabled</Grid2>
                            <Grid2 size={4}>Object ID</Grid2>
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No users to display
                            </Grid2>
                        </Typography>
                    }

                    {searchResults.resultList.map(
                        (user: SearchResultItem) => (
                            <Typography key={`${user.objectId}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={0.4}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={4.6}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.objectId}`}>{user.name}</Link></Grid2>
                                    <Grid2 size={2}>
                                        {user.enabled &&
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
                                    <Grid2 size={4} display={"inline-flex"} columnGap={1} ><div>{user.objectId}</div></Grid2>
                                    <Grid2 size={1} ><ContentCopyIcon /></Grid2>
                                </Grid2>
                            </Typography>
                        )
                    )}
                    
                </Grid2>
            }
            
        </div>

    )
}

export default UserList;
