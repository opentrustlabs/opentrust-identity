"use client";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import Typography from "@mui/material/Typography";
import { InputAdornment, Stack, TextField } from "@mui/material";
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


const ScopeList: React.FC = () => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    const [filterValue, setFilerValue] = React.useState("");

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
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                        <span>New Application Scope</span>
                    </div>
                </Stack>
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
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
                           
                    
                        </>
                    }
                    {c.isMedium &&
                        <></>
                    }
            </Typography>

        </main>
    )
}

export default ScopeList;