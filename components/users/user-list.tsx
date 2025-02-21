"use client";
import { useQuery } from "@apollo/client";
import React, { useContext, useRef } from "react";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import { SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import { SearchFilterInput, SearchFilterInputObjectType, ObjectSearchResultItem, ObjectSearchResults, SearchResultType } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import { MAX_SEARCH_PAGE_SIZE, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
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
import { ResultListProps } from "../layout/search-result-list-layout";

// export interface UserListProps {
//     tenantId: string | null,
//     authorizationGroupId: string | null,
//     authenticationGroupId: string | null,
//     page: number | null,
//     perPage: number | null,
//     embedded: boolean
// }

// const UserList: React.FC<UserListProps> = ({
//     tenantId,
//     authorizationGroupId,
//     authenticationGroupId,
//     page: p,
//     perPage: pp,
//     embedded
// }) => {

//     const perPage = pp && pp < MAX_SEARCH_PAGE_SIZE ? pp : 20;
//     // REF OBJECTS
//     const topOfSearchList = useRef<HTMLDivElement | null>(null);

//     // STATE VARIABLES
//     const [filterTerm, setFilterTerm] = React.useState<string>("");
//     const [page, setPage] = React.useState<number>(p  || 1);
    
//     // CONTEXT HOOKS
//     const tenantBean: TenantMetaDataBean = useContext(TenantContext);

//     // HANDLER FUNCTIONS
//     const arrBreadcrumbs = [];
//     arrBreadcrumbs.push({
//         href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
//         linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
//     },);

//     arrBreadcrumbs.push({
//         linkText: "Users",
//         href: null
//     });
//     const filters: Array<SearchFilterInput> = [];

//     tenantId && filters.push({
//         objectType: SearchFilterInputObjectType.TenantId,
//         objectValue: tenantId
//     });
//     authorizationGroupId && filters.push({
//         objectType: SearchFilterInputObjectType.AuthorizationGroupId,
//         objectValue: authorizationGroupId
//     });
//     authenticationGroupId && filters.push({
//         objectType: SearchFilterInputObjectType.AuthenticationGroupId,
//         objectValue: authenticationGroupId
//     });

//     let { data, loading, error, refetch, previousData } = useQuery(SEARCH_QUERY, {
//         variables: {
//             searchInput: {
//                 term: filterTerm,
//                 filters: filters,
//                 page: page,
//                 perPage: perPage,
//                 resultType: SearchResultType.User
//             }
//         },

//     })

//     // Material UI TablePagination component uses zero-based 
//     // indexing (argh) for pagination. Is there ever a page 0?
//     // So we need to constantly adjust from zero-based to 1-based
//     // indexing. They should really use OFFSET rather than page,
//     // since that makes more sense.
//     const handlePageChange = async (evt: any, page: number) => {
//         setPage(page + 1);
//         await refetch({
//             searchInput: {
//                 term: filterTerm,
//                 filters: filters,
//                 page: page + 1,
//                 perPage: perPage,
//                 resultType: SearchResultType.User
//             }
//         });
//         topOfSearchList.current?.scrollIntoView({
//             behavior: "smooth"
//         })
//     }


//     const handleFilterTermChange = async (evt: any) => {
//         const term = evt.target.value || "";        
//         setFilterTerm(term);      
//         if (term && term.length >= 3) {
//             setPage(1);
//         }
//         if (!term || term.length < 3) {
//             setPage(1);
//         }
//     }
    

//     return (

//         <main >
//             <Typography component={"div"}>
//                 {embedded === false &&
//                     <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />
//                 }                
//                 <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
//                     <div style={{ display: "inline-flex", alignItems: "center" }}>
//                         <TextField
//                             label={"Filter Users"}
//                             size={"small"}
//                             name={"filter"}
//                             value={filterTerm}
//                             onChange={handleFilterTermChange}
//                             slotProps={{
//                                 input: {
//                                     endAdornment: (
//                                         <InputAdornment position="end">
//                                             <CloseOutlinedIcon
//                                                 sx={{ cursor: "pointer" }}
//                                                 onClick={() => { setFilterTerm(""); setPage(1) }}
//                                             />
//                                         </InputAdornment>
//                                     )
//                                 }
//                             }}
//                         />
//                     </div>
//                     <div ref={topOfSearchList}></div>
//                 </Stack>
//                 {
//                     /*  Need to  divide this component into 2 (one managing filters, pagination, queries and the other managing just the display), 
//                         so that they have independent state values and therefore
//                         do not constantly re-render (slowly and painfully) any time a user types something into the filter field.
//                     */
//                 }
//                 {loading && !previousData && 
//                     <DataLoading dataLoadingSize="44vh" color={null} />
//                 }
//                 {error &&
//                     <ErrorComponent message={error.stack || "Unknown Error Occurred."} componentSize='lg' />
//                 }
//                 {loading && previousData && 
//                     <UserResultList
//                         searchResults={previousData.search}
//                         embedded={embedded}
//                     />
//                 }
//                 {data &&
//                     <UserResultList
//                         searchResults={data.search}
//                         embedded={embedded}
//                     />
//                 }
                
//                 <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
//                 <Grid2 size={12}>
//                     {loading && previousData &&
//                         <TablePagination
//                             component={"div"}
//                             page={page - 1}
//                             rowsPerPage={perPage}
//                             count={previousData.search.total}
//                             onPageChange={handlePageChange}
//                             rowsPerPageOptions={[]}
//                         />
//                     }
//                     {data &&
//                         <TablePagination
//                             component={"div"}
//                             page={page - 1}
//                             rowsPerPage={perPage}
//                             count={data.search.total}
//                             onPageChange={handlePageChange}
//                             rowsPerPageOptions={[]}
//                         />
//                     }
                    
//                 </Grid2>
//             </Grid2>

//             </Typography>
//         </main>


//     )
// }

// interface UserResultListProps {
//     searchResults: ObjectSearchResults,
//     embedded: boolean
// }

const UserResultList: React.FC<ResultListProps> = ({
    searchResults
}) => {


    // CONTEXT HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    
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
                    {searchResults.resultlist.map(
                        (user: ObjectSearchResultItem) => (
                            <Typography key={`${user.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={8}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.objectid}`}>{user.name}</Link></Grid2>
                                    <Grid2 size={2}>
                                        {user.enabled &&
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
                                    <Grid2 size={1}>
                                        {mapViewExpanded.has(user.objectid) &&
                                            <UnfoldLessOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => removeExpanded(user.objectid)}
                                            />
                                        }
                                        {!mapViewExpanded.has(user.objectid) &&
                                            <UnfoldMoreOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => setExpanded(user.objectid)}
                                            />
                                        }
                                    </Grid2>
                                </Grid2>
                                {mapViewExpanded.has(user.objectid) &&
                                    <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>                                        
                                        <Grid2 size={1}></Grid2>
                                        <Grid2 size={11} container>
                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Email</Grid2>
                                            <Grid2 size={12} >{user.email}</Grid2>
                                        </Grid2>

                                        <Grid2 size={1}></Grid2>
                                        <Grid2 size={11} container>
                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                            <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{user.objectid}</div><ContentCopyIcon /></Grid2>
                                        </Grid2>
                                    </Grid2>
                                }
                            </Typography>
                        )
                    )}
                </>
            }
            {!c.isMedium &&
                <Grid2 size={12}>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            
                            <Grid2 size={0.4}></Grid2>
                            <Grid2 size={3.0}>User Name</Grid2>
                            <Grid2 size={3.6}>Email</Grid2>
                            <Grid2 size={1}>Enabled</Grid2>
                            <Grid2 size={3.5}>Object ID</Grid2>
                            <Grid2 size={0.5}></Grid2>
                            
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

                    {searchResults.resultlist.map(
                        (user: ObjectSearchResultItem) => (
                            <Typography key={`${user.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={0.4}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={3.0}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.objectid}`}>{user.name}</Link></Grid2>
                                    <Grid2 size={3.6}>{user.email}</Grid2>
                                    <Grid2 size={1}>
                                        {user.enabled &&
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
                                    <Grid2 size={3.5} display={"inline-flex"} columnGap={1} ><div>{user.objectid}</div></Grid2>
                                    <Grid2 size={0.5} ><ContentCopyIcon /></Grid2>
                                </Grid2>
                                                               
                            </Typography>
                        )
                    )}
                    
                </Grid2>
            }
            
        </div>

    )
}

export default UserResultList;
