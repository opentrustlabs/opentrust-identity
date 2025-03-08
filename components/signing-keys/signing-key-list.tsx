"use client";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { useQuery } from "@apollo/client";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import { SIGNING_KEYS_QUERY } from "@/graphql/queries/oidc-queries";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import Typography from "@mui/material/Typography";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import AddBoxIcon from '@mui/icons-material/AddBox';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import UnfoldMoreOutlinedIcon from "@mui/icons-material/UnfoldMoreOutlined";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Divider from "@mui/material/Divider";
import Grid2 from "@mui/material/Grid2";
import Link from "next/link";
import { SigningKey } from "@/graphql/generated/graphql-types";
import { formatISODateFromMs } from "@/utils/date-utils";


const SigningKeyList: React.FC = () => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    const [filterValue, setFilerValue] = React.useState("");

    // HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // GRAPHQL FUNCTION
    const { data, error, loading } = useQuery(SIGNING_KEYS_QUERY, {
        variables: {
            tenantId: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? null : tenantBean.getTenantMetaData().tenant.tenantId
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

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.stack || "Unknown Error Occurred."} componentSize='lg' />

    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);
    arrBreadcrumbs.push({
        linkText: "Signing Keys",
        href: null
    });

    if (data) return (

        <main >
            <Typography component={"div"}>
                <BreadcrumbComponent breadCrumbs={arrBreadcrumbs}></BreadcrumbComponent>
                
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
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
                {c.isMedium &&
                    <>
                        <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                            <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                <Grid2 size={1}></Grid2>
                                <Grid2 size={7}>Key Name</Grid2>
                                <Grid2 size={3}>Key Type</Grid2>                                
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>

                        {data.getSigningKeys.map(
                            (signingKey: SigningKey) => (
                                <Typography key={`${signingKey.keyId}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                        <Grid2 size={7}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/signing-keys/${signingKey.keyId}`}>{signingKey.keyName}</Link></Grid2>
                                        <Grid2 size={3}>{signingKey.keyType}</Grid2>
                                        <Grid2 size={1}>
                                            {mapViewExpanded.has(signingKey.keyId) &&
                                                <UnfoldLessOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => removeExpanded(signingKey.keyId)}
                                                />
                                            }
                                            {!mapViewExpanded.has(signingKey.keyId) &&
                                                <UnfoldMoreOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => setExpanded(signingKey.keyId)}
                                                />
                                            }
                                        </Grid2>
                                    </Grid2>
                                    {mapViewExpanded.has(signingKey.keyId) &&
                                        <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                            <Grid2 size={1}></Grid2>
                                            <Grid2 size={11} container>

                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Status</Grid2>
                                                <Grid2 size={12}>{signingKey.status}</Grid2>

                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Expires</Grid2>
                                                <Grid2 size={12}>{formatISODateFromMs(signingKey.expiresAtMs, "")}</Grid2>


                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                                <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{signingKey.keyId}</div><ContentCopyIcon /></Grid2>
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
                                <Grid2 size={3.7}>Key Name</Grid2>
                                <Grid2 size={3}>Key Type</Grid2>
                                <Grid2 size={2}>Status</Grid2>
                                <Grid2 size={2}>Expires</Grid2>
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>

                        {data.getSigningKeys.map(
                            (signingKey: SigningKey) => (
                                <Typography key={`${signingKey.keyId}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={0.3}><DeleteForeverOutlinedIcon /></Grid2>
                                        <Grid2 size={3.7}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/signing-keys/${signingKey.keyId}`}>{signingKey.keyName}</Link></Grid2>
                                        <Grid2 size={3}>{signingKey.keyType}</Grid2>
                                        <Grid2 size={2}>{signingKey.status}</Grid2>
                                        <Grid2 size={2}>{formatISODateFromMs(signingKey.expiresAtMs, "")}</Grid2>
                                        {/* <Grid2 size={3}>{signingKey.keyId}</Grid2> */}
                                        <Grid2 size={1}><ContentCopyIcon /></Grid2>
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

export default SigningKeyList