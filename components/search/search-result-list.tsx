"use client";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { Typography, Divider, Grid2, IconButton, Paper, Stack } from "@mui/material";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResultListProps } from "../layout/search-result-list-layout";
import SearchResultIconRenderer, { getUriSection } from "./search-result-icon-renderer";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";

const SearchResultList: React.FC<ResultListProps> = ({
    searchResults
}) => {

    // CONTEXT HOOKS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
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
        <>
            {c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={1}></Grid2>
                            <Grid2 size={8}>Name</Grid2>
                            <Grid2 size={2}>Type</Grid2>
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
                                No records to display
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
                                    className="search-row-container"
                                >
                                    <Grid2 container size={12} spacing={1} alignItems="center">
                                        <Grid2 size={1}><SearchResultIconRenderer objectType={item.objecttype} /></Grid2>
                                        <Grid2 size={8}>
                                            <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/${getUriSection(item.objecttype)}/${item.objectid}`}>
                                                <Typography fontWeight={600}>{item.name}</Typography>
                                            </Link>
                                        </Grid2>
                                        <Grid2 size={2}>
                                            <Typography variant="body2">{item.subtype}</Typography>
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
                                        <Stack className="search-row-mobile-expanded-container" spacing={2}>
                                            <div>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    Description
                                                </Typography>
                                                <Typography variant="body2">
                                                    {item.description || 'No description provided'}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    Object ID
                                                </Typography>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2" className="monospace-font">
                                                        {item.objectid}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            copyContentToClipboard(item.objectid, "ID copied to clipboard");
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
                            <Grid2 size={0.3}></Grid2>
                            <Grid2 size={2.7}>Name</Grid2>
                            <Grid2 size={3}>Description</Grid2>
                            <Grid2 size={2}>Type</Grid2>
                            <Grid2 size={3.5}>Object ID</Grid2>
                            <Grid2 size={0.5}></Grid2>
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
                                No records to display
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
                                    className="search-row-container"
                                >
                                    <Grid2 container size={12} spacing={1} alignItems="center">
                                        <Grid2 size={0.3}><SearchResultIconRenderer objectType={item.objecttype} /></Grid2>
                                        <Grid2 size={2.7}>
                                            <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/${getUriSection(item.objecttype)}/${item.objectid}`}>
                                                <Typography fontWeight={600} noWrap>{item.name}</Typography>
                                            </Link>
                                        </Grid2>
                                        <Grid2 size={3}>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {item.description || 'No description'}
                                            </Typography>
                                        </Grid2>
                                        <Grid2 size={2}>
                                            <Typography variant="body2">{item.subtype}</Typography>
                                        </Grid2>
                                        <Grid2 size={3.5}>
                                            <Typography variant="body2" className="monospace-font" noWrap>
                                                {item.objectid}
                                            </Typography>
                                        </Grid2>
                                        <Grid2 size={0.5}>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    copyContentToClipboard(item.objectid, "ID copied to clipboard");
                                                }}
                                            >
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            )
                        )}
                    </Stack>
                </>
            }

        </>

    )
}

export default SearchResultList;