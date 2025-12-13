"use client";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import Typography from "@mui/material/Typography";
import { Divider, Grid2, IconButton, Paper, Stack } from "@mui/material";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import Link from "next/link";
import { ResultListProps } from "../layout/search-result-list-layout";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";


const ScopeList: React.FC<ResultListProps> = ({
    searchResults
}) => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    

    // HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

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


    /*
        TODO
        For users who belong to the root tenant, create a link to the scope detail page and
        for those who have scope delete permissions show a delete icon for those APPLICATION_MANAGEMENT
        use-types of scope

        For non-root tenants, do NOT create a link to the scope detail page.
        If a non-root user tries to access a scope detail page, return an access error message.
    */
    return (
        
        <main>
            {!c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container spacing={2} marginBottom={"16px"}>
                            <Grid2 size={2.3}>Name</Grid2>
                            <Grid2 size={4}>Description</Grid2>
                            <Grid2 size={2}>Use</Grid2>
                            <Grid2 size={2.7}>Object ID</Grid2>
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
                                No scope values to display
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
                                        <Grid2 size={2.3}>
                                            <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/scope-access-control/${item.objectid}`}>
                                                <Typography fontWeight={600} noWrap>{item.name}</Typography>
                                            </Link>
                                        </Grid2>
                                        <Grid2 size={4}>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {item.description || 'No description'}
                                            </Typography>
                                        </Grid2>
                                        <Grid2 size={2}>
                                            <Typography variant="body2">{item.subtype}</Typography>
                                        </Grid2>
                                        <Grid2 size={2.7}>
                                            <Typography variant="body2" className="monospace-font" noWrap>
                                                {item.objectid}
                                            </Typography>
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    copyContentToClipboard(item.objectid, "Scope ID copied to clipboard");
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
            {c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={11}>Name</Grid2>
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
                                No scope values to display
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
                                        <Grid2 size={11}>
                                            <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/scope-access-control/${item.objectid}`}>
                                                <Typography fontWeight={600}>{item.name}</Typography>
                                            </Link>
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
                                                    Use
                                                </Typography>
                                                <Typography variant="body2">{item.subtype}</Typography>
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
                                                            copyContentToClipboard(item.objectid, "Scope ID copied to clipboard");
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
        </main>
    )
}

export default ScopeList;