"use client";
import React, { useContext } from "react";
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import { Box, Chip, Divider, Grid2, IconButton, Paper, Stack, Typography } from "@mui/material";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { ResultListProps } from "../layout/search-result-list-layout";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import { DEFAULT_BACKGROUND_COLOR } from "@/utils/consts";


const ClientResultList: React.FC<ResultListProps> = ({
    searchResults
}) => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());

    // CONTEXT HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

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
                            <Grid2 size={9}>Client Name</Grid2>
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
                                No clients to display
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                Try adjusting your search filters
                            </Typography>
                        </Paper>
                    }

                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {searchResults.resultlist.map(
                            (item: ObjectSearchResultItem) => (
                                <Paper
                                    key={item.objectid}
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
                                                <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/clients/${item.objectid}`}>
                                                    <Typography fontWeight={600}>{item.name}</Typography>
                                                </Link>
                                            </Stack>
                                        </Grid2>
                                        <Grid2 size={2}>
                                            {item.enabled ? (
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
                                                onClick={() => mapViewExpanded.has(item.objectid) ? removeExpanded(item.objectid) : setExpanded(item.objectid)}
                                            >
                                                {mapViewExpanded.has(item.objectid) ?
                                                    <UnfoldLessOutlinedIcon fontSize="small" /> :
                                                    <UnfoldMoreOutlinedIcon fontSize="small" />
                                                }
                                            </IconButton>
                                        </Grid2>
                                    </Grid2>
                                    {mapViewExpanded.has(item.objectid) &&
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                            <Grid2 container size={12} spacing={2}>
                                                <Grid2 size={12}>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        Description
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {item.description || 'No description provided'}
                                                    </Typography>
                                                </Grid2>

                                                <Grid2 size={12}>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        Client Type
                                                    </Typography>
                                                    <Typography variant="body2">{item.subtype}</Typography>
                                                </Grid2>

                                                <Grid2 size={12}>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        Object ID
                                                    </Typography>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                            {item.objectid}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                copyContentToClipboard(item.objectid, "Client ID copied to clipboard");
                                                            }}
                                                        >
                                                            <ContentCopyIcon fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                </Grid2>
                                            </Grid2>
                                        </Box>
                                    }
                                </Paper>
                            )
                        )}
                    </Stack>
                </>
            }
            {
                !c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={3}>Client Name</Grid2>
                            <Grid2 size={3}>Description</Grid2>
                            <Grid2 size={2}>Client Type</Grid2>
                            <Grid2 size={1}>Status</Grid2>
                            <Grid2 size={3}>Object ID</Grid2>
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
                                No clients to display
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                Try adjusting your search filters
                            </Typography>
                        </Paper>
                    }

                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {searchResults.resultlist.map(
                            (item: ObjectSearchResultItem) => (
                                <Paper
                                    key={item.objectid}
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
                                        <Grid2 size={3}>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                
                                                <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/clients/${item.objectid}`}>
                                                    <Typography fontWeight={600} noWrap>{item.name}</Typography>
                                                </Link>
                                            </Stack>
                                        </Grid2>
                                        <Grid2 size={3}>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {item.description || 'No description'}
                                            </Typography>
                                        </Grid2>
                                        <Grid2 size={2}>
                                            <Typography variant="body2">{item.subtype}</Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            {item.enabled ? (
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
                                        <Grid2 size={3}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }} noWrap>
                                                    {item.objectid}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        copyContentToClipboard(item.objectid, "Client ID copied to clipboard");
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

export default ClientResultList;
