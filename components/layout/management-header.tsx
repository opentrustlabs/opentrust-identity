"use client";
import { PortalUserProfile, TenantMetaData } from "@/graphql/generated/graphql-types";
import { Avatar, Container, Divider, IconButton, ListItemIcon, MenuItem, Stack, Tooltip, Menu } from "@mui/material";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import SessionTimerCountdown from "./session-timer-countdown";
import Logout from '@mui/icons-material/Logout';
import { AuthSessionProps, useAuthSessionContext } from "../contexts/auth-session-context";
import { useRouter } from "next/navigation";
import { QUERY_PARAM_AUTHENTICATE_TO_PORTAL } from "@/utils/consts";
import Link from "next/link";

export interface ManagementHeaderProps {
    tenantMetaData: TenantMetaData,
    profile: PortalUserProfile | null
}

const ManagementHeader: React.FC<ManagementHeaderProps> = ({
    tenantMetaData,
    profile
}) => {

    // CONTEXT VARIABLES
    const responsiveBreakpoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const authSessionProps: AuthSessionProps = useAuthSessionContext();
    const router = useRouter();

    // STATE VARIABLES
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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
                backgroundColor: "#1976d2",
                backgroundImage: "linear-gradient(#34111194, #1976d2)",
                width: "100%",
                height: responsiveBreakpoints.isMedium ? "0vh" : "5vh",
                minHeight: "55px",
                color: "white",
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
                <Stack
                    direction={"row"}
                    justifyItems={"center"}
                    alignItems={"center"}
                >
                    {tenantMetaData.tenantLookAndFeel?.adminheadertext &&
                        <div style={{ verticalAlign: "center", fontWeight: "bold", marginLeft: "8px" }}>{tenantMetaData.tenantLookAndFeel?.adminheadertext}</div>
                    }
                    {!tenantMetaData.tenantLookAndFeel?.adminheadertext &&
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
                            <Avatar sx={{ fontWeight: "bold", backgroundColor: "white", color: "#1976d2" }}>
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
                            <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}/users/${profile?.userId}`}>Profile</Link>
                        </MenuItem>

                        <Divider></Divider>
                        
                        <MenuItem onClick={() => {
                            handleClose();
                            authSessionProps.deleteAuthSessionData();
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