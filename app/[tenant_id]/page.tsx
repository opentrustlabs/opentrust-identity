"use client";
import React, { useContext } from "react";
import { Box, Divider, Drawer, Grid2, InputAdornment, Stack, TextField } from "@mui/material";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import SpeedIcon from '@mui/icons-material/Speed';
import TenantList from "@/components/tenants/tenant-list";
import ClientList from "@/components/clients/client-list";
import AuthorizationGroupList from "@/components/authorization-groups/authorization-group-list";
import { ResponsiveBreakpoints, ResponsiveContext } from "@/components/contexts/responsive-context";


const TenantLandingPage: React.FC = () => {

    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
    
     // QUERY PARAMS
    const params = useSearchParams();
    const section = params?.get("section");
    

    //const maxWidth = isSm ? "90vw" : isMd ? "80vw" : "650px";

    /*
        In the content section for the landing page for the tenant, we will
        decide which component to include based on the section value, defaulting
        to either the tenant list (for root tenant admins) or the tenant
        detail page (for tenants which allow specific admin users to access the
        management screens).

        section = search | tenants | clients | users | scope/access rules | authn groups | authz groups | federated oidc providers | rate limits | keys 
    
    
    */

    return (
        <Box sx={{ flexGrow: 1,  }}>
            <Grid2 size={12} container spacing={1} sx={{}}>                
                <Grid2 size={{xs: 12, sm: 12, md: 3, lg: 2, xl: 2}} 
                    sx={{
                        backgroundColor: "#fefefe", 
                        padding: "8px",
                        borderBottom: breakPoints.isMedium ? "solid 1px lightgrey" : "",
                        borderRight: !breakPoints.isMedium? "solid 1px lightgrey" : ""
                    }
                }>
                    {breakPoints.isMedium &&
                        <NavigationMobile section={section || "tenants"} />
                    }
                    {!breakPoints.isMedium &&
                        <NavigationFull section={section || "tenants"} />
                    }
                </Grid2>
                <Grid2  size={{xs: 12, sm: 12, md: 9, lg: 10, xl: 10}} sx={{padding: "8px", minHeight: breakPoints.isMedium ? "86vh" : "94vh"}}>
                    {(section === null || section === "tenants") &&
                        <TenantList />
                    }
                    {section === "clients" &&
                        <ClientList />
                    }
                    {section === "authorization-groups" &&
                        <AuthorizationGroupList />
                    }
                </Grid2>

            </Grid2>
        </Box>
    )

    
}


interface NavigationProps {
    section: string | null
}

const NavigationFull: React.FC<NavigationProps> = ({section}) => {

    const [searchTerm, setSearchTerm] = React.useState<string | null>(null);

    const handleKeyPressSearch = (evt: React.KeyboardEvent) => {        
        if (evt.key.valueOf().toLowerCase() === "enter") {
            if(searchTerm && searchTerm.length > 2){
                // DO SEARCH
                console.log("will do search")
            }
        }
    }

    const handleSearch = (evt: any) => {
        console.log("search button was clicked");
    }
    

    return (
        <>
            <Stack spacing={0} fontSize={"0.8em"}  direction={"row"} paddingTop={"8px"}>
                <div>
                    <TextField   
                        size="small"
                        name="searchinput"
                        id="searchinput"
                        onKeyDown={handleKeyPressSearch}
                        onChange={(evt) => setSearchTerm(evt.target.value)}
                        fullWidth={true}
                        label={"Search"}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon 
                                            onClick={handleSearch}
                                            sx={{cursor: "pointer"}}
                                        />
                                    </InputAdornment>
                                )
                            }
                        }}                                    
                    />
                </div>
            </Stack>

            <Stack spacing={2} padding={"8px"} fontSize={"0.85em"} fontWeight={"bolder"} marginTop={"8px"} >
                <Divider />
                <div style={{display: "inline-flex", alignItems: "center", textDecoration: section === "tenants" ? "underline" : ""}}>
                    <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                    <Link href={`?section=tenants`} >Tenants</Link>
                    
                </div>                
                <div style={{display: "inline-flex", alignItems: "center"}}>
                    <SettingsSystemDaydreamIcon sx={{marginRight: "8px"}}/>
                    <Link href={`?section=clients`} >Clients</Link>
                </div>
                <div style={{display: "inline-flex", alignItems: "center"}}>
                    <PersonIcon sx={{marginRight: "8px"}} />
                    <Link href={`?section=users`} >Users</Link>
                </div>
                <div style={{display: "inline-flex", alignItems: "center"}}>
                    <PeopleIcon sx={{marginRight: "8px"}} />
                    <Link href={`?section=authorization-groups`} >Authorization Groups</Link>
                </div>
                <div style={{display: "inline-flex", alignItems: "center"}}>
                    <GroupIcon sx={{marginRight: "8px"}} />
                    <Link href={`?section=authentication-groups`} >Authentication Groups</Link>
                </div>
                <div style={{display: "inline-flex", alignItems: "center"}}>
                    <SettingsIcon sx={{marginRight: "8px"}} />
                    <Link href={`?section=scope-access-control`} >Scope/Access Control</Link>
                </div>
                <div style={{display: "inline-flex", alignItems: "center"}}>
                    <AutoAwesomeMosaicIcon sx={{marginRight: "8px"}} />
                    <Link href={`?section=oidc-providers`} >OIDC Providers</Link>
                </div>
                <div style={{display: "inline-flex", alignItems: "center"}}>
                    <SpeedIcon sx={{marginRight: "8px"}} />
                    <Link href={`?section=rate-limits`} >Rate Limits</Link>
                </div>
                <div style={{display: "inline-flex", alignItems: "center"}}>
                    <KeyIcon sx={{marginRight: "8px"}} />
                    <Link href={`?section=keys`} >Keys</Link>
                </div>
            </Stack>
        </>
        
    )
}

const NavigationMobile: React.FC<NavigationProps> = ({section}) => {

    const [searchTerm, setSearchTerm] = React.useState<string | null>(null);

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setDrawerOpen(newOpen);
    };

    const handleKeyPressSearch = (evt: React.KeyboardEvent) => {        
        if (evt.key.valueOf().toLowerCase() === "enter") {
            if(searchTerm && searchTerm.length > 2){
                // DO SEARCH
                console.log("will do search")
            }
        }
    }

    const handleSearch = (evt: any) => {
        console.log("search button was clicked");
    }

    const showMenuItems = () => {
        console.log("will show menu items")
        setDrawerOpen(true);
    }


    return (
        <>
            <Stack direction={"row"}  spacing={2} alignItems={"center"}>
                <MenuIcon 
                    sx={{cursor: "pointer"}}
                    onClick={showMenuItems}
                />
                <TextField   
                        size="small"
                        name="searchinput"
                        id="searchinput"
                        onKeyDown={handleKeyPressSearch}
                        onChange={(evt) => setSearchTerm(evt.target.value)}
                        fullWidth={true}
                        label={"Search"}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon 
                                            onClick={handleSearch}
                                            sx={{cursor: "pointer"}}
                                        />
                                    </InputAdornment>
                                )
                            }
                        }}                                    
                    />
            </Stack>
            <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
                <Stack spacing={2} padding={"8px"} fontSize={"0.85em"} fontWeight={"bolder"} marginTop={"8px"} >
                    
                    <div style={{display: "inline-flex", alignItems: "center"}}>                
                        <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                        <Link href={`?section=tenants`} onClick={() => setDrawerOpen(false)} >Tenants</Link>                
                    </div>
                    <div style={{display: "inline-flex", alignItems: "center"}}>
                        <SettingsSystemDaydreamIcon sx={{marginRight: "8px"}}/>
                        <Link href={`?section=clients`} onClick={() => setDrawerOpen(false)}>Clients</Link>
                    </div>
                    <div style={{display: "inline-flex", alignItems: "center"}}>
                        <PersonIcon sx={{marginRight: "8px"}} />
                        <Link href={`?section=users`} onClick={() => setDrawerOpen(false)}>Users</Link>
                    </div>
                    <div style={{display: "inline-flex", alignItems: "center"}}>
                        <PeopleIcon sx={{marginRight: "8px"}} />
                        <Link href={`?section=authorization-groups`} onClick={() => setDrawerOpen(false)}>Authorization Groups</Link>
                    </div>
                    <div style={{display: "inline-flex", alignItems: "center"}}>
                        <GroupIcon sx={{marginRight: "8px"}} />
                        <Link href={`?section=authentication-groups`} onClick={() => setDrawerOpen(false)}>Authentication Groups</Link>
                    </div>
                    <div style={{display: "inline-flex", alignItems: "center"}}>
                        <SettingsIcon sx={{marginRight: "8px"}} />
                        <Link href={`?section=scope-access-control`} onClick={() => setDrawerOpen(false)}>Scope/Access Control</Link>
                    </div>
                    <div style={{display: "inline-flex", alignItems: "center"}}>
                        <AutoAwesomeMosaicIcon sx={{marginRight: "8px"}} />
                        <Link href={`?section=oidc-providers`} onClick={() => setDrawerOpen(false)}>OIDC Providers</Link>
                    </div>
                    <div style={{display: "inline-flex", alignItems: "center"}}>
                        <SpeedIcon sx={{marginRight: "8px"}} />
                        <Link href={`?section=rate-limits`} onClick={() => setDrawerOpen(false)}>Rate Limits</Link>
                    </div>
                    <div style={{display: "inline-flex", alignItems: "center"}}>
                        <KeyIcon sx={{marginRight: "8px"}} />
                        <Link href={`?section=keys`} onClick={() => setDrawerOpen(false)}>Keys</Link>
                    </div>
                </Stack>
            </Drawer>
        </>
        
    )
}


export default TenantLandingPage;