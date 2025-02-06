"use client";
import React from "react";
import { Divider, Drawer, Grid2, Icon, InputAdornment, Stack, TextField } from "@mui/material";
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
import PolicyIcon from '@mui/icons-material/Policy';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import SpeedIcon from '@mui/icons-material/Speed';
import { ResponsiveBreakpoints } from "@/components/contexts/responsive-context";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';


interface NavigationProps {
    section: string | null,
    tenantMetaData: TenantMetaData,
    breakPoints: ResponsiveBreakpoints
}

const TenantLeftNavigation: React.FC<NavigationProps> = ({section, tenantMetaData, breakPoints}) => {

    // STATE VARIABLES
    const [searchTerm, setSearchTerm] = React.useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = React.useState(false);


    // HANDLER FUNCTIONS
    const toggleDrawer = (newOpen: boolean) => () => {
        setDrawerOpen(newOpen);
    }

    const showMenuItems = () => {
        console.log("will show menu items")
        setDrawerOpen(true);
    }

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
            {!breakPoints.isMedium && 
                <>
                    <Stack spacing={0} fontSize={"0.9em"}  direction={"row"} paddingTop={"8px"}>
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

                    <Stack spacing={2} padding={"8px"} color={"#616161"} fontSize={"0.9em"} fontWeight={"bolder"} marginTop={"8px"} >
                        <Divider />
                        {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                            <div style={{display: "inline-flex", alignItems: "center", textDecoration: section === "tenants" ? "underline" : ""}}>
                                <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                <Link href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} >Tenants</Link>                        
                            </div>                
                        }      
                        {tenantMetaData.tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                            <div style={{display: "inline-flex", alignItems: "center", textDecoration: section === "tenants" ? "underline" : ""}}>
                                <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                <Link href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} >My Tenant</Link>                        
                            </div>                
                        }           
                        <div style={{display: "inline-flex", alignItems: "center"}}>
                            <SettingsSystemDaydreamIcon sx={{marginRight: "8px"}}/>
                            <Link href={`/${tenantMetaData.tenant.tenantId}?section=clients`} >Clients</Link>
                        </div>
                        <div style={{display: "inline-flex", alignItems: "center"}}>
                            <PersonIcon sx={{marginRight: "8px"}} />
                            <Link href={`/${tenantMetaData.tenant.tenantId}?section=users`} >Users</Link>
                        </div>
                        <div style={{display: "inline-flex", alignItems: "center"}}>
                            <PeopleIcon sx={{marginRight: "8px"}} />
                            <Link href={`/${tenantMetaData.tenant.tenantId}?section=authorization-groups`} >Authorization Groups</Link>
                        </div>
                        <div style={{display: "inline-flex", alignItems: "center"}}>
                            <GroupIcon sx={{marginRight: "8px"}} />
                            <Link href={`/${tenantMetaData.tenant.tenantId}?section=authentication-groups`} >Authentication Groups</Link>
                        </div>
                        <div style={{display: "inline-flex", alignItems: "center"}}>
                            <PolicyIcon sx={{marginRight: "8px"}} />
                            <Link href={`/${tenantMetaData.tenant.tenantId}?section=scope-access-control`} >Scope/Access Control</Link>
                        </div>
                        <div style={{display: "inline-flex", alignItems: "center"}}>
                            <AutoAwesomeMosaicIcon sx={{marginRight: "8px"}} />
                            <Link href={`/${tenantMetaData.tenant.tenantId}?section=oidc-providers`} >OIDC Providers</Link>
                        </div>
                        <div style={{display: "inline-flex", alignItems: "center"}}>
                            <SpeedIcon sx={{marginRight: "8px"}} />
                            <Link href={`/${tenantMetaData.tenant.tenantId}?section=rate-limits`} >Rate Limits</Link>
                        </div>
                        <div style={{display: "inline-flex", alignItems: "center"}}>
                            <KeyIcon sx={{marginRight: "8px"}} />
                            <Link href={`/${tenantMetaData.tenant.tenantId}?section=signing-keys`} >Keys</Link>
                        </div>
                    </Stack>
                </>
            }
            {breakPoints.isMedium &&
                <>
                    <Grid2 
                        container 
                        size={12}
                        color={"white"} 
                        padding={"4px"}
                        spacing={2}
                        alignItems={"center"}
                        sx={{boxShadow: "0px 0px 1vh 0px grey", backgroundColor: "#1976d2", backgroundImage: "linear-gradient(#34111194, #1976d2)",}}

                    >
                        <Grid2 size={1}>
                            <MenuIcon 
                                sx={{cursor: "pointer"}}
                                onClick={showMenuItems}
                            />    
                        </Grid2>
                        <Grid2 size={breakPoints.isSmall ? 5 : 4}>
                            OpenTrust Identity
                        </Grid2>
                        <Grid2 size={breakPoints.isSmall? 6: 7}>
                            <TextField   
                                size="small"
                                name="searchinput"
                                id="searchinput"
                                onKeyDown={handleKeyPressSearch}
                                onChange={(evt) => setSearchTerm(evt.target.value)}
                                fullWidth={true}                                
                                slotProps={{                                    
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <SearchIcon 
                                                    onClick={handleSearch}
                                                    sx={{cursor: "pointer"}}
                                                />
                                            </InputAdornment>
                                        ),
                                        style: {
                                            backgroundColor: "white"
                                        }
                                    }
                                }}                                    
                            />                            
                        </Grid2>
                    </Grid2>
                    <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
                        <Stack spacing={2} padding={"8px"} fontSize={"0.85em"} fontWeight={"bolder"} marginTop={"8px"} >
                            {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>                
                                    <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                    <Link href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} onClick={() => setDrawerOpen(false)} >Tenants</Link>                
                                </div>
                            }
                            {tenantMetaData.tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                                <div style={{display: "inline-flex", alignItems: "center", textDecoration: section === "tenants" ? "underline" : ""}}>
                                    <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                    <Link href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} >My Tenant</Link>                        
                                </div>                
                            }   
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <SettingsSystemDaydreamIcon sx={{marginRight: "8px"}}/>
                                <Link href={`/${tenantMetaData.tenant.tenantId}?section=clients`} onClick={() => setDrawerOpen(false)}>Clients</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <PersonIcon sx={{marginRight: "8px"}} />
                                <Link href={`/${tenantMetaData.tenant.tenantId}?section=users`} onClick={() => setDrawerOpen(false)}>Users</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <PeopleIcon sx={{marginRight: "8px"}} />
                                <Link href={`/${tenantMetaData.tenant.tenantId}?section=authorization-groups`} onClick={() => setDrawerOpen(false)}>Authorization Groups</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <GroupIcon sx={{marginRight: "8px"}} />
                                <Link href={`/${tenantMetaData.tenant.tenantId}?section=authentication-groups`} onClick={() => setDrawerOpen(false)}>Authentication Groups</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <SettingsIcon sx={{marginRight: "8px"}} />
                                <Link href={`/${tenantMetaData.tenant.tenantId}?section=scope-access-control`} onClick={() => setDrawerOpen(false)}>Scope/Access Control</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <AutoAwesomeMosaicIcon sx={{marginRight: "8px"}} />
                                <Link href={`/${tenantMetaData.tenant.tenantId}?section=oidc-providers`} onClick={() => setDrawerOpen(false)}>OIDC Providers</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <SpeedIcon sx={{marginRight: "8px"}} />
                                <Link href={`/${tenantMetaData.tenant.tenantId}?section=rate-limits`} onClick={() => setDrawerOpen(false)}>Rate Limits</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}> 
                                <KeyIcon sx={{marginRight: "8px"}} />
                                <Link href={`/${tenantMetaData.tenant.tenantId}?section=signing-keys`} onClick={() => setDrawerOpen(false)}>Keys</Link>
                            </div>
                        </Stack>
                    </Drawer>
                </>            
            }
        </>
        
    )
}


export default TenantLeftNavigation;