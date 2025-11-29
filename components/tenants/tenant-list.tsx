"use client";
import React, { useContext } from "react";
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import { Chip, Divider, Grid2, IconButton, Paper, Stack, Typography } from "@mui/material";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { ResultListProps } from "../layout/search-result-list-layout";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import { DEFAULT_BACKGROUND_COLOR } from "@/utils/consts";


const TenantResultList: React.FC<ResultListProps> = ({
    searchResults
}) => {

    // CONTEXT HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

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
        <main>
            {c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={9}>Tenant Name</Grid2>
                            <Grid2 size={2}>Status</Grid2>
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider />
                    {searchResults.total < 1 &&
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                mt: 2,
                                textAlign: 'center',
                                bgcolor: 'grey.50',
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="body1" color="text.secondary">
                                No tenants to display
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                Try adjusting your search filters
                            </Typography>
                        </Paper>
                    }

                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {searchResults.resultlist.map(
                            (tenant: ObjectSearchResultItem) => (
                                <Paper
                                    key={tenant.objectid}
                                    elevation={0}
                                    sx={{
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            borderColor: DEFAULT_BACKGROUND_COLOR,
                                            boxShadow: 1,
                                        }
                                    }}
                                >
                                    <Grid2 container size={12} spacing={1} alignItems="center">
                                        <Grid2 size={9}>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${tenant.objectid}`}>
                                                    <Typography fontWeight={600}>{tenant.name}</Typography>
                                                </Link>
                                            </Stack>
                                        </Grid2>
                                        <Grid2 size={2}>
                                            {tenant.enabled ? (
                                                <Chip
                                                    label="Active"
                                                    size="small"
                                                    color="success"
                                                    sx={{ borderRadius: 1, fontWeight: 600 }}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Disabled"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ borderRadius: 1 }}
                                                />
                                            )}
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <IconButton
                                                size="small"
                                                onClick={() => mapViewExpanded.has(tenant.objectid) ? removeExpanded(tenant.objectid) : setExpanded(tenant.objectid)}
                                            >
                                                {mapViewExpanded.has(tenant.objectid) ?
                                                    <UnfoldLessOutlinedIcon fontSize="small" /> :
                                                    <UnfoldMoreOutlinedIcon fontSize="small" />
                                                }
                                            </IconButton>
                                        </Grid2>
                                    </Grid2>
                                    {mapViewExpanded.has(tenant.objectid) &&
                                        <Stack sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }} spacing={2}>
                                            <div>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    Description
                                                </Typography>
                                                <Typography variant="body2">
                                                    {tenant.description || 'No description provided'}
                                                </Typography>
                                            </div>

                                            <div>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    Tenant Type
                                                </Typography>
                                                <Typography variant="body2">{tenant.subtype}</Typography>
                                            </div>

                                            <div>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    Object ID
                                                </Typography>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                        {tenant.objectid}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            copyContentToClipboard(tenant.objectid, "Tenant ID copied to clipboard");
                                                        }}
                                                    >
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </div>
                                        </Stack>
                                    }
                                </Paper>
                            )
                        )}
                    </Stack>
                </>
            }
            {!c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={2}>Tenant Name</Grid2>
                            <Grid2 size={3.6}>Tenant Description</Grid2>
                            <Grid2 size={2}>Tenant Type</Grid2>
                            <Grid2 size={1}>Status</Grid2>
                            <Grid2 size={3.4}>Object ID</Grid2>
                        </Grid2>
                    </Typography>
                    <Divider />
                    {searchResults.total < 1 &&
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                mt: 2,
                                textAlign: 'center',
                                bgcolor: 'grey.50',
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="body1" color="text.secondary">
                                No tenants to display
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                Try adjusting your search filters
                            </Typography>
                        </Paper>
                    }

                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {searchResults.resultlist.map(
                            (tenant: ObjectSearchResultItem) => (
                                <Paper
                                    key={tenant.objectid}
                                    elevation={0}
                                    sx={{
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            borderColor: DEFAULT_BACKGROUND_COLOR,
                                            boxShadow: 1,
                                        }
                                    }}
                                >
                                    <Grid2 container size={12} spacing={1} alignItems="center">
                                        <Grid2 size={2}>
                                            <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${tenant.objectid}`}>
                                                <Typography fontWeight={600} noWrap>{tenant.name}</Typography>
                                            </Link>
                                        </Grid2>
                                        <Grid2 size={3.6}>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {tenant.description || 'No description'}
                                            </Typography>
                                        </Grid2>
                                        <Grid2 size={2}>
                                            <Typography variant="body2">{tenant.subtype}</Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            {tenant.enabled ? (
                                                <Chip
                                                    label="Active"
                                                    size="small"
                                                    color="success"
                                                    sx={{ borderRadius: 1, fontWeight: 600 }}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Disabled"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ borderRadius: 1 }}
                                                />
                                            )}
                                        </Grid2>
                                        <Grid2 size={3.4}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }} noWrap>
                                                    {tenant.objectid}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        copyContentToClipboard(tenant.objectid, "Tenant ID copied to clipboard");
                                                    }}
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            )
                        )}
                    </Stack>
                </>
            }
        </main>

    )
}

export default TenantResultList;