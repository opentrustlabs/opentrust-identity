"use client";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import React, { useContext, useRef } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import Typography from "@mui/material/Typography";
import { Divider, Grid2, InputAdornment, Stack, TablePagination, TextField } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { SCOPE_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { Scope } from "@/graphql/generated/graphql-types";
import Link from "next/link";


const ScopeList: React.FC = () => {

    // REF OBJECTS
    const topOfSearchList = useRef<HTMLDivElement | null>(null);

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    const [filterValue, setFilerValue] = React.useState("");
    const [page, setPage] = React.useState<number>(0);

    // HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // GRAPHQL FUNCTION
    const { data, error, loading } = useQuery(SCOPE_QUERY, {
        variables: {
            tenantId: tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT ? tenantBean.getTenantMetaData().tenant.tenantId : null
        }
    });

    // HANDLER FUNCTIONS
    const handleFilterChange = (evt: any) => {
        setFilerValue(evt.target.value);
    }

    const handlePageChange = async (evt: any, page: number) => {
        setPage(page);

        topOfSearchList.current?.scrollIntoView({
            behavior: "auto",
            block: "start"
        })
    }

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

    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);
    
    arrBreadcrumbs.push({
        linkText: "Scope / Access Control ",
        href: null
    });

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.message || "Unknown Error Occurred."} componentSize='lg' />
    if (data) return (

        <main>
            <Typography component={"div"} >
                <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />
                <Stack ref={topOfSearchList} spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                        <span>New Application Scope</span>
                    </div>
                </Stack>
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
                    <div  style={{ display: "inline-flex", alignItems: "center" }}>
                        <TextField
                            label={"Filter"}
                            size={"small"}
                            name={"filter"}
                            value={filterValue}
                            onChange={handleFilterChange}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CloseOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => setFilerValue("")}
                                            />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </div>
                </Stack>
                    {!c.isMedium &&
                        <>
                           <Typography  component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                                <Grid2 container spacing={2} marginBottom={"16px"}>
                                    <Grid2 size={0.3}></Grid2>
                                    <Grid2 size={2.3}>Name</Grid2>
                                    <Grid2 size={3.7}>Description</Grid2>
                                    <Grid2 size={2}>Use</Grid2>
                                    <Grid2 size={2.7}>Object ID</Grid2>
                                    <Grid2 size={1}></Grid2>
                                </Grid2>
                           </Typography>
                           {data.getScope.length < 1 &&
                                <Typography component={"div"} fontSize={"0.9em"}>
                                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                        No scope values to display
                                    </Grid2>
                                </Typography>
                           }
                           {data.getScope.slice(page * 20, (page + 1) * 20).map(
                                (scope: Scope, idx: number) => (
                                    <Typography key={scope.scopeId} component={"div"} fontSize={"0.9em"} noWrap>
                                        <Divider></Divider>
                                        <Grid2 sx={{backgroundColor: idx %2 === 0 ? "#fafafa": "white"}} padding={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                            <Grid2 size={0.3}><DeleteForeverOutlinedIcon /></Grid2>
                                            <Grid2 sx={{textOverflow: "ellipsis", overflow: "hidden"}} size={2.3}><Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/scope-access-control/${scope.scopeId}`}>{scope.scopeName}</Link></Grid2>
                                            <Grid2 size={3.7}>{scope.scopeDescription}</Grid2>
                                            <Grid2 size={2}>{scope.scopeUse}</Grid2>
                                            <Grid2 sx={{textOverflow: "ellipsis", overflow: "hidden"}}  size={2.7}>{scope.scopeId}</Grid2>
                                            <Grid2 size={1}><ContentCopyIcon /></Grid2>
                                        </Grid2>
                                    </Typography>
                                )
                           )}
                    
                        </>
                    }
                    {c.isMedium &&
                        <>
                            <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                                <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                    <Grid2 size={1}></Grid2>
                                    <Grid2 size={10}>Name</Grid2>                                    
                                    <Grid2 size={1}></Grid2>
                                </Grid2>
                            </Typography>
                            <Divider></Divider>
                            {data.getScope.length < 1 &&
                                <Typography component={"div"} fontSize={"0.9em"}>
                                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                        No scope values to display
                                    </Grid2>
                                </Typography>
                            }
                            {data.getScope.slice(page * 20, (page + 1) * 20).map(
                                (scope: Scope, idx: number) => (
                                    <Typography key={`${scope.scopeId}`} component={"div"} fontSize={"0.9em"}>
                                        <Divider></Divider>
                                        <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                            <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                            <Grid2 size={10}><Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/scope-access-control/${scope.scopeId}`}>{scope.scopeName}</Link></Grid2>                                            
                                            <Grid2 size={1}>
                                                {mapViewExpanded.has(scope.scopeId) &&
                                                    <UnfoldLessOutlinedIcon
                                                        sx={{ cursor: "pointer" }}
                                                        onClick={() => removeExpanded(scope.scopeId)}
                                                    />
                                                }
                                                {!mapViewExpanded.has(scope.scopeId) &&
                                                    <UnfoldMoreOutlinedIcon
                                                        sx={{ cursor: "pointer" }}
                                                        onClick={() => setExpanded(scope.scopeId)}
                                                    />
                                                }
                                            </Grid2>
                                        </Grid2>
                                        {mapViewExpanded.has(scope.scopeId) &&
                                            <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                                <Grid2 size={1}></Grid2>
                                                <Grid2 size={11} container>
                                                    <Grid2 sx={{ textDecoration: "underline" }} size={12}>Description</Grid2>
                                                    <Grid2 size={12}>{scope.scopeDescription}</Grid2>
                                                    <Grid2 sx={{ textDecoration: "underline" }} size={12}>Use</Grid2>
                                                    <Grid2 size={12}>{scope.scopeUse}</Grid2>
                                                    <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                                    <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{scope.scopeId}</div><ContentCopyIcon /></Grid2>
                                                </Grid2>
                                            </Grid2>
                                        }
                                    </Typography>
                                )
                            )}
                        </>
                    }
                    {data && data.getScope && data.getScope.length > 20 &&
                        <TablePagination
                            component={"div"}
                            page={page}
                            rowsPerPage={20}
                            count={data.getScope.length}
                            onPageChange={handlePageChange}
                            rowsPerPageOptions={[]}
                        />
                    }
            </Typography>

        </main>
    )
}

export default ScopeList;