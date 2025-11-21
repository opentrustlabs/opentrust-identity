"use client";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { Avatar, Container, Divider, IconButton, ListItemIcon, MenuItem, Stack, Tooltip, Menu, Dialog, DialogContent } from "@mui/material";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import SessionTimerCountdown from "./session-timer-countdown";
import Logout from '@mui/icons-material/Logout';
import { AuthSessionProps, useAuthSessionContext } from "../contexts/auth-session-context";
import { useRouter } from "next/navigation";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TENANT_META_DATA, DEFAULT_TEXT_COLOR, QUERY_PARAM_AUTHENTICATE_TO_PORTAL } from "@/utils/consts";
import Link from "next/link";
import { TenantMetaDataBean } from "../contexts/tenant-context";
import SelectLanguage from "../authentication-components/select-language";
import LanguageIcon from '@mui/icons-material/Language';

export interface ManagementHeaderProps {
    tenantBean: TenantMetaDataBean,
    profile: PortalUserProfile | null
}

const ManagementHeader: React.FC<ManagementHeaderProps> = ({
    tenantBean,
    profile
}) => {

    // CONTEXT VARIABLES
    const responsiveBreakpoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const authSessionProps: AuthSessionProps = useAuthSessionContext();
    const router = useRouter();
    
    // STATE VARIABLES
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [openLanguageSelector, setOpenLanguageSelector] = React.useState<boolean>(false);
    const open = Boolean(anchorEl);


    // HANDLER FUNCTIONS
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div
            style={{
                backgroundColor: DEFAULT_BACKGROUND_COLOR,
                backgroundImage: `linear-gradient(#34111194, ${DEFAULT_BACKGROUND_COLOR})`,
                width: "100%",
                height: responsiveBreakpoints.isMedium ? "0vh" : "5vh",
                minHeight: "55px",
                color: DEFAULT_TEXT_COLOR,
                borderBottom: "1px solid lightgray",
                boxShadow: "0px 0px 2vh 0px grey",
                display: responsiveBreakpoints.isMedium ? "none" : "inherit",
            }}

        >
            <Container
                maxWidth={responsiveBreakpoints.isGreaterThanExtraLarge ? "xl" : "xl"}
                disableGutters={true}
                sx={{ height: "100%", alignItems: "center", display: "flex", justifyContent: "space-between" }}
            >
                <Dialog 
                    open={openLanguageSelector}
                    onClose={() => setOpenLanguageSelector(false)}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <SelectLanguage 
                            onLanguageChanged={() => setOpenLanguageSelector(false)}
                            allowCancel={true}
                            cancelCallback={() => setOpenLanguageSelector(false)}
                        />
                    </DialogContent>
                </Dialog>
                <Stack
                    direction={"row"}
                    justifyItems={"center"}
                    alignItems={"center"}
                >
                    {tenantBean.getTenantMetaData().tenantLookAndFeel?.adminheadertext &&
                        <div style={{ verticalAlign: "center", fontWeight: "bold", marginLeft: "8px" }}>{tenantBean.getTenantMetaData().tenantLookAndFeel?.adminheadertext}</div>
                    }
                    {!tenantBean.getTenantMetaData().tenantLookAndFeel?.adminheadertext &&
                        <div style={{ verticalAlign: "center", fontWeight: "bold", padding: "8px" }}>OpenTrust Identity</div>
                    }
                </Stack>
                <Stack
                    direction={"row"}
                    justifyItems={"center"}
                    alignItems={"center"}
                >
                    <SessionTimerCountdown />
                    <Tooltip title="Account">
                        <IconButton
                            onClick={handleClick}
                            size="small"
                            sx={{ ml: 2 }}
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                        >
                            <Avatar sx={{ fontWeight: "bold", backgroundColor: DEFAULT_TEXT_COLOR, color: DEFAULT_BACKGROUND_COLOR}}>
                                {profile ? profile.firstName.toUpperCase().charAt(0) + profile.lastName.toUpperCase().charAt(0) : "X"}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        slotProps={{
                            paper: {
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    '& .MuiAvatar-root': {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    '&::before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleClose}>
                            <Avatar /> 
                            <Link className="undecorated" href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${profile?.userId}`}>Profile</Link>
                        </MenuItem>

                        <Divider></Divider>
                        
                        <MenuItem 
                            onClick={() => {
                                setOpenLanguageSelector(true);
                            }}
                        >
                            <ListItemIcon>
                                <LanguageIcon fontSize="small" />
                            </ListItemIcon>
                            <span>Language</span>
                        </MenuItem>

                        <MenuItem onClick={() => {
                            handleClose();
                            authSessionProps.deleteAuthSessionData();
                            tenantBean.setTenantMetaData(DEFAULT_TENANT_META_DATA);
                            router.push(`/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`);                            
                        }}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>                        
                    </Menu>
                </Stack>
            </Container>
        </div>

    )
}

export default ManagementHeader;