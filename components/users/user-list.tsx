"use client";
import React, { useContext } from "react";
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import { Chip, Divider, Grid2, IconButton, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResultListProps } from "../layout/search-result-list-layout";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";

const UserResultList: React.FC<ResultListProps> = ({
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
                            <Grid2 size={9}>User Name</Grid2>
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
                                No users to display
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                Try adjusting your search filters
                            </Typography>
                        </Paper>
                    }

                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {searchResults.resultlist.map(
                            (user: ObjectSearchResultItem) => (
                                <Paper
                                    key={user.objectid}
                                    elevation={0}
                                    className="search-row-container"
                                >
                                    <Grid2 container size={12} spacing={1} alignItems="center">
                                        <Grid2 size={9}>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.objectid}`}>
                                                    <Typography fontWeight={600}>{user.name}</Typography>
                                                </Link>
                                            </Stack>
                                        </Grid2>
                                        <Grid2 size={2}>
                                            {user.enabled ? (
                                                <Chip
                                                    label="Active"
                                                    size="small"
                                                    color="success"
                                                    className="chip-item-enabled"
                                                />
                                            ) : (
                                                <Chip
                                                    label="Disabled"
                                                    size="small"
                                                    variant="outlined"
                                                    className="chip-item-disabled"
                                                />
                                            )}
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <IconButton
                                                size="small"
                                                onClick={() => mapViewExpanded.has(user.objectid) ? removeExpanded(user.objectid) : setExpanded(user.objectid)}
                                            >
                                                {mapViewExpanded.has(user.objectid) ?
                                                    <UnfoldLessOutlinedIcon fontSize="small" /> :
                                                    <UnfoldMoreOutlinedIcon fontSize="small" />
                                                }
                                            </IconButton>
                                        </Grid2>
                                    </Grid2>
                                    {mapViewExpanded.has(user.objectid) &&
                                        <Stack className="search-row-mobile-expanded-container" spacing={2}>
                                            <div>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    Email
                                                </Typography>
                                                <Typography variant="body2">
                                                    {user.email || 'No email provided'}
                                                </Typography>
                                            </div>

                                            <div>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    Object ID
                                                </Typography>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2" className="monospace-font">
                                                        {user.objectid}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            copyContentToClipboard(user.objectid, "User ID copied to clipboard");
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
                            <Grid2 size={3}>User Name</Grid2>
                            <Grid2 size={4}>Email</Grid2>
                            <Grid2 size={1}>Status</Grid2>
                            <Grid2 size={4}>Object ID</Grid2>
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
                                No users to display
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                Try adjusting your search filters
                            </Typography>
                        </Paper>
                    }

                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {searchResults.resultlist.map(
                            (user: ObjectSearchResultItem) => (
                                <Paper
                                    key={user.objectid}
                                    elevation={0}
                                    className="search-row-container"
                                >
                                    <Grid2 container size={12} spacing={1} alignItems="center">
                                        <Grid2 size={3}>
                                            <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.objectid}`}>
                                                <Typography fontWeight={600} noWrap>{user.name}</Typography>
                                            </Link>
                                        </Grid2>
                                        <Grid2 size={4}>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {user.email || 'No email'}
                                            </Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            {user.enabled ? (
                                                <Chip
                                                    label="Active"
                                                    size="small"
                                                    color="success"
                                                    className="chip-item-enabled"
                                                />
                                            ) : (
                                                <Chip
                                                    label="Disabled"
                                                    size="small"
                                                    variant="outlined"
                                                    className="chip-item-disabled"
                                                />
                                            )}
                                        </Grid2>
                                        <Grid2 size={4}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography variant="body2" className="monospace-font" noWrap>
                                                    {user.objectid}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        copyContentToClipboard(user.objectid, "User ID copied to clipboard");
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

export default UserResultList;
