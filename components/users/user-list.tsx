"use client";
import { useQuery } from "@apollo/client";
import React, { useContext } from "react";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import { USER_SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import { Client, SearchFilterInput, SearchFilterInputObjectType, SearchResultItem, SearchResultType } from "@/graphql/generated/graphql-types";
import { useSearchParams } from "next/navigation";
import Typography from "@mui/material/Typography";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import { TENANT_TYPE_ROOT_TENANT, CLIENT_TYPES_DISPLAY } from "@/utils/consts";
import Link from "next/link";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import AddBoxIcon from '@mui/icons-material/AddBox';
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
    
    // STATE VARIABLES
    const [filterTerm, setFilterTerm] = React.useState<string>(term || "");
    const [doFilterTerm, setDoFilterTerm] = React.useState<string>(term || "");
    const [page, setPage] = React.useState<number>(p ? parseInt(p) : 0);
    const [perPage, setPerPage] = React.useState<number>(pp ? parseInt(pp) : 30);
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    
    // CONTEXT HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // HANDLER FUNCTIONS

    const setExpanded = (section: string): void => {
        console.log("set is expanded")
        mapViewExpanded.set(section, true);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    const removeExpanded = (section: string): void => {
        console.log("remove is expanded")
        mapViewExpanded.delete(section);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);
    
    arrBreadcrumbs.push({
        linkText: "Users",
        href: null
    });


    const handleFilterTermChange = async (evt: any) => {
        const term = evt.target.value;        
        setFilterTerm(term);
        console.log("setting filter term to: " + term);
        if(term && term.length >= 3){
            setDoFilterTerm(term);
        }
        if(!term || term.length < 3){
            setDoFilterTerm("");
        }
    }


    return (

        <main >
            <Typography component={"div"}>
                <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />
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
                                                onClick={() => {setFilterTerm(""); setDoFilterTerm(""); setPage(0)}}
                                            />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </div>
                </Stack>
                <StupidResults 
                    authenticationGroupId={authenticationGroupId}
                    authorizationGroupId={authorizationGroupId}
                    embedded={false}
                    filterTerm={doFilterTerm}
                    page={page}
                    perPage={perPage}
                    tenantId={tenantId}
                    filterTermUpdater={(s: string) => {console.log("will update")}}

                />
                {/* 
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
                        {data.search.total < 1 &&
                            <Typography component={"div"} fontSize={"0.9em"}>
                                <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                    No users to display
                                </Grid2>
                            </Typography>
                        }

                        {data.search.resultList.map(
                            (user: SearchResultItem) => (
                                <Typography key={`${user.id}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                        <Grid2 size={8}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.id}`}>{user.name}</Link></Grid2>
                                        <Grid2 size={2}>
                                            {user.enabled &&
                                                <CheckOutlinedIcon />
                                            }
                                        </Grid2>
                                        <Grid2 size={1}>
                                            {mapViewExpanded.has(user.id) &&
                                                <UnfoldLessOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => removeExpanded(user.id)}
                                                />
                                            }
                                            {!mapViewExpanded.has(user.id) &&
                                                <UnfoldMoreOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => setExpanded(user.id)}
                                                />
                                            }
                                        </Grid2>
                                    </Grid2>
                                    {mapViewExpanded.has(user.id) &&
                                        <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                            <Grid2 size={1}></Grid2>
                                            <Grid2 size={11} container>
                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                                <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{user.id}</div><ContentCopyIcon /></Grid2>
                                            </Grid2>
                                        </Grid2>
                                    }
                                </Typography>
                            )
                        )}
                    </>
                }
                {!c.isMedium &&
                    <>
                        <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                            <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                <Grid2 size={0.3}></Grid2>
                                <Grid2 size={2.7}>User Name</Grid2>
                                <Grid2 size={1}>Enabled</Grid2>
                                <Grid2 size={8}>Object ID</Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>
                        {data.search.total < 1 &&
                            <Typography component={"div"} fontSize={"0.9em"}>
                                <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                    No users to display
                                </Grid2>
                            </Typography>
                        }

                        {data.search.resultList.map(
                            (user: SearchResultItem) => (
                                <Typography key={`${user.id}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={0.3}><DeleteForeverOutlinedIcon /></Grid2>
                                        <Grid2 size={2.7}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.id}`}>{user.name}</Link></Grid2>                                        
                                        <Grid2 size={1}>
                                            {user.enabled &&
                                                <CheckOutlinedIcon />
                                            }
                                        </Grid2>
                                        <Grid2 size={3} display={"inline-flex"} columnGap={1} ><div>{user.id}</div><div><ContentCopyIcon /></div></Grid2>
                                    </Grid2>
                                </Typography>

                            )
                        )}
                    </>
                }

                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                    <Grid2 size={7}>
                        <TablePagination 
                            component={"div"}
                            page={page}
                            rowsPerPage={perPage}
                            count={data.search.total}
                            onPageChange={handlePageChange}
                            rowsPerPageOptions={[]}
                            
                        />
                    </Grid2>
                </Grid2>
                */}
            </Typography>
        </main>


    )
}

interface StupidUserListProps {
    tenantId: string | null,
    authorizationGroupId: string | null,
    authenticationGroupId: string | null,
    embedded: boolean | null,
    filterTerm: string | null,
    page: number,
    perPage: number,
    filterTermUpdater: (term: string) => void
}

const StupidResults: React.FC<StupidUserListProps> = ({
    tenantId,
    authenticationGroupId,
    authorizationGroupId,
    embedded,
    filterTerm,
    page: p,
    perPage: pp
}) => {

    console.log("rerendering for some reason")

        // CONTEXT HOOKS
        const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
        const tenantBean: TenantMetaDataBean = useContext(TenantContext);

        // STATE VARIABLES
        //const [filterTerm, setFilterTerm] = React.useState<string | null | undefined>(term || "");
        const [page, setPage] = React.useState<number>(p || 0);
        const [perPage, setPerPage] = React.useState<number>(pp || 30);
        const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());

    const setExpanded = (section: string): void => {
        console.log("set is expanded")
        mapViewExpanded.set(section, true);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    const removeExpanded = (section: string): void => {
        console.log("remove is expanded")
        mapViewExpanded.delete(section);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

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
                page: p,
                perPage: perPage,
                resultType: SearchResultType.User
            }
        }
    })

    const handlePageChange = async (evt: any, page: number) => {
        console.log("will change pages");
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

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
        // if(!embedded){

        // }
        // if(embedded === true){

        // }
        console.log("page to go to is: " + page);
    }

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.stack || "Unknown Error Occurred."} componentSize='lg' />


    return (
        <>
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
                {data.search.total < 1 &&
                    <Typography component={"div"} fontSize={"0.9em"}>
                        <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                            No users to display
                        </Grid2>
                    </Typography>
                }

                {data.search.resultList.map(
                    (user: SearchResultItem) => (
                        <Typography key={`${user.id}`} component={"div"} fontSize={"0.9em"}>
                            <Divider></Divider>
                            <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                <Grid2 size={8}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.id}`}>{user.name}</Link></Grid2>
                                <Grid2 size={2}>
                                    {user.enabled &&
                                        <CheckOutlinedIcon />
                                    }
                                </Grid2>
                                <Grid2 size={1}>
                                    {mapViewExpanded.has(user.id) &&
                                        <UnfoldLessOutlinedIcon
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => removeExpanded(user.id)}
                                        />
                                    }
                                    {!mapViewExpanded.has(user.id) &&
                                        <UnfoldMoreOutlinedIcon
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => setExpanded(user.id)}
                                        />
                                    }
                                </Grid2>
                            </Grid2>
                            {mapViewExpanded.has(user.id) &&
                                <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                    <Grid2 size={1}></Grid2>
                                    <Grid2 size={11} container>
                                        <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                        <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{user.id}</div><ContentCopyIcon /></Grid2>
                                    </Grid2>
                                </Grid2>
                            }
                        </Typography>
                    )
                )}
            </>
        }
        {!c.isMedium &&
            <>
                <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                    <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                        <Grid2 size={0.3}></Grid2>
                        <Grid2 size={2.7}>User Name</Grid2>
                        <Grid2 size={1}>Enabled</Grid2>
                        <Grid2 size={8}>Object ID</Grid2>
                    </Grid2>
                </Typography>
                <Divider></Divider>
                {data.search.total < 1 &&
                    <Typography component={"div"} fontSize={"0.9em"}>
                        <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                            No users to display
                        </Grid2>
                    </Typography>
                }

                {data.search.resultList.map(
                    (user: SearchResultItem) => (
                        <Typography key={`${user.id}`} component={"div"} fontSize={"0.9em"}>
                            <Divider></Divider>
                            <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                <Grid2 size={0.3}><DeleteForeverOutlinedIcon /></Grid2>
                                <Grid2 size={2.7}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.id}`}>{user.name}</Link></Grid2>                                        
                                <Grid2 size={1}>
                                    {user.enabled &&
                                        <CheckOutlinedIcon />
                                    }
                                </Grid2>
                                <Grid2 size={3} display={"inline-flex"} columnGap={1} ><div>{user.id}</div><div><ContentCopyIcon /></div></Grid2>
                            </Grid2>
                        </Typography>

                    )
                )}
            </>
        }
        
        
        <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
            <Grid2 size={7}>
                <TablePagination 
                    component={"div"}
                    page={page}
                    rowsPerPage={perPage}
                    count={data.search.total}
                    onPageChange={handlePageChange}
                    rowsPerPageOptions={[]}
                    
                />
            </Grid2>
        </Grid2>
        </>
        
    )
}

interface StupidFilterProps {
    term: string,
    minFilterTermLength: number,
    lable: string,
    filterCallback: (term: string) => void
}
const StupidFilterBox: React.FC<StupidFilterProps> = ({
    term,
    minFilterTermLength,
    filterCallback
}) => {

    // STATE VARIABLES
    const [filterTerm, setFilterTerm] = React.useState<string | null | undefined>(term || "");

    const handleFilterChange = async (evt: any) => {
        setFilterTerm(evt.target.value);
        const term = evt.target.value;
        filterCallback(term);
        // if(term && term.length > 3){            
        //     setPage(0);
        //     await refetch({
        //         searchInput: {
        //             term: term,
        //             filters: filters,
        //             page: 0,
        //             perPage: perPage,
        //             resultType: SearchResultType.User
        //         }
        //     })
        // }
        
    }

    return(
    <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
    <div style={{ display: "inline-flex", alignItems: "center" }}>
        <TextField
            label={"Filter Users"}
            size={"small"}
            name={"filter"}
            value={filterTerm}
            onChange={handleFilterChange}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <CloseOutlinedIcon
                                sx={{ cursor: "pointer" }}
                                onClick={() => setFilterTerm("")}
                            />
                        </InputAdornment>
                    )
                }
            }}
        />
    </div>
</Stack>
)
}

export default UserList;
