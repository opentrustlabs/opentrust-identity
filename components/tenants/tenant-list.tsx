"use client";
import React, { useContext, useRef } from "react";
import { SearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { Divider, Grid2, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { TENANT_TYPE_ROOT_TENANT, TENANT_TYPES_DISPLAY } from "@/utils/consts";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";


export interface TenantListProps {
    page: number | null,
    perPage: number | null,
    embedded: boolean
}

const TenantList: React.FC<TenantListProps> = ({ 
    page: p, 
    perPage: pp }) => {

    // REF OBJECTS
    const topOfSearchList = useRef<HTMLDivElement | null>(null);

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    const [filterTerm, setFilterTerm] = React.useState<string>("");
    const [page, setPage] = React.useState<number>(p  || 0);
    const [perPage, setPerPage] = React.useState<number>(pp || 30);

    // HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // GRAPHQL FUNCTION
    // const { data, error, loading } = useQuery(SEARCH_QUERY, {

    // });

    let { data, loading, error, refetch, previousData } = useQuery(SEARCH_QUERY, {
        variables: {
            searchInput: {
                term: filterTerm,
                page: page,
                perPage: perPage,
                resultType: SearchResultType.Tenant
            }
        },

    })


    // HANDLER FUNCTIONS
    // const handleFilterChange = (evt: any) => {
    //     setFilterTerm(evt.target.value);
    // }

    const handlePageChange = async (evt: any, page: number) => {
        setPage(page);

        await refetch({
            searchInput: {
                term: filterTerm,
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
        const term = evt.target.value || "";        
        setFilterTerm(term);      
        if (term && term.length >= 3) {
            setPage(0);
        }
        if (!term || term.length < 3) {
            setPage(0);
        }
    }

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
    });    


    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.stack || "Unknown Error Occurred."} componentSize='lg' />

    if (data) return (

        <main >
            <Typography component={"div"}>
                <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                        <span>New Tenant</span>
                    </div>
                </Stack>

                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <TextField
                            label={"Filter"}
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
                                                onClick={() => setFilterTerm("")}
                                            />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </div>
                    <div ref={topOfSearchList}></div>
                </Stack>
                {c.isMedium &&
                    <>
                        <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                            <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                <Grid2 size={9}>Tenant Name</Grid2>
                                <Grid2 size={2}>Enabled</Grid2>
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>

                        {data.search.resultList.map(
                            (tenant: SearchResultItem) => (
                                <Typography key={`${tenant.objectId}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={9}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${tenant.objectId}`}>{tenant.name}</Link></Grid2>
                                        <Grid2 size={2}>
                                            {tenant.enabled &&
                                                <CheckOutlinedIcon />
                                            }
                                        </Grid2>
                                        <Grid2 size={1}>
                                            {mapViewExpanded.has(tenant.objectId) &&
                                                <UnfoldLessOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => removeExpanded(tenant.objectId)}
                                                />
                                            }
                                            {!mapViewExpanded.has(tenant.objectId) &&
                                                <UnfoldMoreOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => setExpanded(tenant.objectId)}
                                                />
                                            }
                                        </Grid2>
                                    </Grid2>
                                    {mapViewExpanded.has(tenant.objectId) &&
                                        <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                            <Grid2 size={1}></Grid2>
                                            <Grid2 size={11} container>
                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Description</Grid2>
                                                <Grid2 size={12}>{tenant.description}</Grid2>

                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Tenant Type</Grid2>
                                                <Grid2 size={12}>{tenant.subType}</Grid2>

                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                                <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{tenant.objectId}</div><ContentCopyIcon /></Grid2>
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
                                <Grid2 size={2}>Tenant Name</Grid2>
                                <Grid2 size={3.6}>Tenant Description</Grid2>
                                <Grid2 size={2}>Tenant Type</Grid2>
                                <Grid2 size={1}>Enabled</Grid2>
                                <Grid2 size={3}>Object ID</Grid2>
                                <Grid2 size={0.4}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>

                        {data.search.resultList.map(
                            (tenant: SearchResultItem) => (
                                <Typography key={`${tenant.objectId}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={2}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${tenant.objectId}`}>{tenant.name}</Link></Grid2>
                                        <Grid2 size={3.6}>{tenant.description}</Grid2>
                                        <Grid2 size={2}>{tenant.subType}</Grid2>
                                        <Grid2 size={1}>
                                            {tenant.enabled &&
                                                <CheckOutlinedIcon />
                                            }
                                        </Grid2>
                                        <Grid2 size={3} columnGap={1} >{tenant.objectId}</Grid2>
                                        <Grid2 size={0.4}><ContentCopyIcon /></Grid2>
                                    </Grid2>
                                </Typography>
                            )
                        )}
                    </>
                }
            </Typography>
        </main>
    )
}

export default TenantList;