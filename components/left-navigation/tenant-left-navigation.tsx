"use client";
import React, { useContext, useEffect } from "react";
import { Autocomplete, Divider, Drawer, Grid2, Paper, Popper, Stack, TextField } from "@mui/material";
import Link from "next/link";
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
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { ResponsiveBreakpoints } from "@/components/contexts/responsive-context";
import { LookaheadItem, LookaheadResult, SearchResultType, TenantMetaData } from "@/graphql/generated/graphql-types";
import AddBoxIcon from '@mui/icons-material/AddBox';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Logout from '@mui/icons-material/Logout';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import { AUTHENTICATION_GROUP_CREATE_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE, AUTHORIZATION_GROUP_CREATE_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE, CLIENT_CREATE_SCOPE, CLIENT_READ_SCOPE, FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, FEDERATED_OIDC_PROVIDER_READ_SCOPE, JOBS_READ_SCOPE, KEY_CREATE_SCOPE, KEY_READ_SCOPE, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, RATE_LIMIT_CREATE_SCOPE, RATE_LIMIT_READ_SCOPE, SCOPE_CREATE_SCOPE, SCOPE_READ_SCOPE, SYSTEM_SETTINGS_READ_SCOPE, TENANT_CREATE_SCOPE, TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE, TENANT_TYPE_ROOT_TENANT, USER_READ_SCOPE } from "@/utils/consts";
import CreateNewDialog from "../dialogs/create-new-dialog";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { LOOKAHEAD_SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import SearchResultIconRenderer, { displaySearchCategory, getUriSection } from "../search/search-result-icon-renderer";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { AuthSessionProps, useAuthSessionContext } from "../contexts/auth-session-context";
import { useIntl } from 'react-intl';


interface NavigationProps {
    section: string | null,
    tenantMetaData: TenantMetaData,
    breakPoints: ResponsiveBreakpoints
}

const TenantLeftNavigation: React.FC<NavigationProps> = ({section, tenantMetaData, breakPoints}) => {

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const router = useRouter();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const authSessionProps: AuthSessionProps = useAuthSessionContext();
    const intl = useIntl();
    

    // STATE VARIABLES
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const [highlightedTerm, setHighlightedTerm] = React.useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [openCreateNewDialog, setOpenCreateNewDialog] = React.useState<boolean>(false);
    const [lookaheadOptions, setLookaheadOptions] = React.useState<Array<{category: SearchResultType, displayCategory: string, id: string, displayValue: string}>>([]);
    const [mobileSearchOpen, setMobileSearchOpen] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const {} = useQuery(LOOKAHEAD_SEARCH_QUERY, {
        variables: {
            term: searchTerm
        },
        skip: searchTerm.length < 3,
        onCompleted(data) {
            const arrLookaheadResults: Array<LookaheadResult> = data.lookahead;
            const arr: Array<{category: SearchResultType, displayCategory: string, id: string, displayValue: string}> = [];
            arrLookaheadResults.forEach(
                (r: LookaheadResult) => {
                    r.resultList.forEach(
                        (i: LookaheadItem) => {
                            arr.push({
                                category: r.category,
                                displayCategory: displaySearchCategory(r.category),
                                id: i.id,
                                displayValue: i.displayValue
                            });                            
                        }
                    )
                }
            );
            setLookaheadOptions(arr);
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"
    });

    // HANDLER FUNCTIONS
    useEffect(() => {
        if(section !== "search"){
            setSearchTerm("");
        }

    }, [section]);

    
    const toggleDrawer = (newOpen: boolean) => () => {
        setDrawerOpen(newOpen);
    }

    const showMenuItems = () => {
        setDrawerOpen(true);
    }

    const handleKeyPressSearch = (evt: React.KeyboardEvent) => {        
        if (evt.key.valueOf().toLowerCase() === "enter") {
            // give preference to the highlighted term over the search term
            // for cases where the user hits the enter button.
            let term: string | null = highlightedTerm;
            if(!term){
                term = searchTerm;
            }
            else{
                setSearchTerm(term);
            }
            if(term && term.length > 2){
                router.push(`/${tenantBean.getTenantMetaData().tenant.tenantId}?term=${term}&section=search`);
                setLookaheadOptions([]);
            }
        }
    }
    

    return (
        <>
            {!breakPoints.isMedium && 
                <div style={{position: "sticky", top: "5px"}}>  
                    <Stack spacing={0} fontSize={"0.9em"}  direction={"row"} paddingTop={"8px"}>                                              
                        <Autocomplete 
                            disabled={profile === null || !containsScope([TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], profile.scope)}
                            freeSolo={true}
                            value={searchTerm}
                            filterOptions={(x) => x}
                            size="small"
                            id="searchinput2"
                            onKeyDown={handleKeyPressSearch}
                            onInputChange={(_, newInputValue) => {
                                setSearchTerm(newInputValue);
                            }}
                            onHighlightChange={(_, option) => {
                                if(option !== null){
                                    if(typeof option === "string"){
                                        setHighlightedTerm(option)
                                     }
                                     else{
                                        setHighlightedTerm(option.displayValue);
                                     }
                                }
                                else {
                                    setHighlightedTerm(null);
                                }
                            }}
                            onChange={(_, value, reason) => {
                                if(reason === "clear"){
                                    setLookaheadOptions([]);
                                }
                                else if(reason === "selectOption" && value !== null){                                    
                                    if(typeof value === "string"){
                                        setSearchTerm(value);
                                    }
                                    else{
                                        setSearchTerm(value.displayValue);
                                    }
                                }
                            } }
                            groupBy={(option) => option.displayCategory}
                            includeInputInList
                            fullWidth={true}
                            autoComplete={true}
                            forcePopupIcon={false}
                            clearOnEscape={true}
                            slots={{ popper: Popper, paper: Paper }}                                
                            renderOption={(props, option) => {
                                const { ...optionProps } = props;
                                return (
                                    <li {...optionProps} key={option.id}>
                                        <Grid2  alignItems={"center"} size={12} container spacing={0} >
                                            <Grid2 sx={{ display: 'flex', width: 35 }}><SearchResultIconRenderer objectType={option.category}/></Grid2>
                                            <Grid2 sx={{ width: 'calc(100% - 35px)', wordWrap: 'break-word' }}>
                                                <Link className="undecorated" href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/${getUriSection(option.category)}/${option.id}`}>{option.displayValue}</Link>
                                            </Grid2>
                                        </Grid2>
                                    </li>
                                    
                                )
                            }}
                            popupIcon={ <CloseOutlinedIcon /> }                                
                            getOptionLabel={(option) => typeof option === "string" ? option : option.displayValue}
                            slotProps={{                                    
                                paper: {
                                    sx: {
                                        width: 350
                                    }
                                }
                            }} 
                            renderInput={(params) => {
                                return <TextField 
                                        {...params} 
                                        size="small" 
                                        multiline={false} 
                                        label={intl.formatMessage({id: "SEARCH"})}
                                        fullWidth={true}
                                    />
                            }}
                            options={lookaheadOptions}                            
                        />                        
                    </Stack>

                    <Stack spacing={0} padding={"8px"} color={"#616161"} fontSize={"0.9em"} fontWeight={"bolder"} marginTop={"8px"} >
                        <Divider />
                        {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT && containsScope([TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], profile?.scope || []) &&
                            <div  className="left-navigation">
                                <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} >Tenants</Link>                        
                            </div>                
                        }      
                        {tenantMetaData.tenant.tenantType !== TENANT_TYPE_ROOT_TENANT && containsScope([TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], profile?.scope || []) &&
                            <div className="left-navigation">
                                <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} >My Tenant</Link>                        
                            </div>                
                        }
                        {containsScope([TENANT_READ_ALL_SCOPE, CLIENT_READ_SCOPE], profile?.scope || []) &&
                            <div className="left-navigation" >
                                <SettingsSystemDaydreamIcon sx={{marginRight: "8px"}}/>
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=clients`} >Clients</Link>
                            </div>
                        }                        
                        {containsScope([TENANT_READ_ALL_SCOPE, USER_READ_SCOPE], profile?.scope || []) &&
                            <div className="left-navigation" >
                                <PersonIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=users`} >Users</Link>
                            </div>
                        }
                        {containsScope([TENANT_READ_ALL_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE], profile?.scope || []) &&
                            <div className="left-navigation" >
                                <PeopleIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=authorization-groups`} >Authorization Groups</Link>
                            </div>
                        }
                        {containsScope([TENANT_READ_ALL_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE], profile?.scope || []) &&
                            <div className="left-navigation" >
                                <GroupIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=authentication-groups`} >Authentication Groups</Link>
                            </div>
                        }
                        {containsScope([TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], profile?.scope || []) &&
                            <div className="left-navigation" >
                                <PolicyIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=scope-access-control`} >Scope/Access Control</Link>
                            </div>
                        }
                        {containsScope([TENANT_READ_ALL_SCOPE, FEDERATED_OIDC_PROVIDER_READ_SCOPE], profile?.scope || []) &&
                            <div className="left-navigation" >
                                <AutoAwesomeMosaicIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=oidc-providers`} >OIDC Providers</Link>
                            </div>
                        }
                        {containsScope([TENANT_READ_ALL_SCOPE, RATE_LIMIT_READ_SCOPE], profile?.scope || []) &&
                            <div className="left-navigation">
                                <SpeedIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=rate-limits`} >Rate Limits</Link>
                            </div>
                        }
                        {containsScope([TENANT_READ_ALL_SCOPE, KEY_READ_SCOPE], profile?.scope || []) &&
                            <div className="left-navigation">
                                <KeyIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=signing-keys`} >Keys</Link>
                            </div>
                        }
                        {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT && containsScope([SYSTEM_SETTINGS_READ_SCOPE, JOBS_READ_SCOPE], profile?.scope) &&
                            <Divider />
                        }
                        {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT && containsScope(SYSTEM_SETTINGS_READ_SCOPE, profile?.scope) &&
                            <div style={{marginTop: "8px", width: "100%"}} className="left-navigation" >
                                <SettingsOutlinedIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}/system-settings`}>System Settings</Link>
                            </div>                            
                        }
                        {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT && containsScope([JOBS_READ_SCOPE], profile?.scope) &&
                            <div style={{marginTop: "8px", width: "100%"}} className="left-navigation" >
                                <WorkHistoryOutlinedIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}/jobs`}>Running Jobs</Link>
                            </div>
                        }                        
                        {containsScope([TENANT_CREATE_SCOPE, CLIENT_CREATE_SCOPE, AUTHORIZATION_GROUP_CREATE_SCOPE, AUTHENTICATION_GROUP_CREATE_SCOPE, SCOPE_CREATE_SCOPE, FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, RATE_LIMIT_CREATE_SCOPE, KEY_CREATE_SCOPE], profile?.scope) &&
                            <div style={{marginTop: "8px", width: "100%"}} >
                                <Divider />
                                <div className="left-navigation" onClick={() => setOpenCreateNewDialog(true)}  style={{marginTop: "8px", cursor: "pointer", width: "100%"}}>
                                    <AddBoxIcon sx={{marginRight: "8px"}} />
                                    <div>Create New...</div>
                                </div>
                            </div>
                        }                        
                    </Stack>
                </div>
            }
            {breakPoints.isMedium &&
                <>
                    <Grid2 
                        container 
                        size={12}
                        color={"white"} 
                        padding={"8px"}
                        spacing={2}
                        alignItems={"center"}
                        sx={{boxShadow: "0px 0px 1vh 0px grey", backgroundColor: "#1976d2", backgroundImage: "linear-gradient(#34111194, #1976d2)",}}

                    >
                        {mobileSearchOpen === false &&
                            <React.Fragment>
                                <Grid2 size={1}>
                                    <MenuIcon 
                                        sx={{cursor: "pointer"}}
                                        onClick={showMenuItems}
                                    />    
                                </Grid2>
                                <Grid2 size={10}>
                                    OpenTrust Identity
                                </Grid2>
                                <Grid2 size={1} >
                                    <SearchOutlinedIcon
                                        sx={{cursor: "pointer"}}
                                        onClick={() => {
                                            setMobileSearchOpen(true);
                                        }}
                                    />
                                </Grid2>
                            </React.Fragment>
                        }
                        {mobileSearchOpen === true &&                        
                            <Grid2  size={12} >                            
                                <Autocomplete
                                    disabled={profile === null || !containsScope([TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], profile.scope)}
                                    freeSolo={true}
                                    value={searchTerm}
                                    filterOptions={(x) => x}
                                    size="small"
                                    id="searchinput"
                                    onKeyDown={handleKeyPressSearch}
                                    // @typescript-eslint/no-unused-vars
                                    onInputChange={(evt, newInputValue) => {                                    
                                        setSearchTerm(newInputValue);
                                    }}
                                    groupBy={(option) => option.displayCategory}
                                    includeInputInList
                                    filterSelectedOptions
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    onChange={(evt, value, reason) => {
                                        if(reason === "clear"){
                                            setLookaheadOptions([]);
                                            // Note that closing the search box is ONLY for the mobile view
                                            // because there does not seem to be another way to (elegantly)
                                            // indicate a "close" action. Do this action when the user click
                                            // on the close "X" button, but not when the user removes the
                                            // search term.
                                            if(evt.type === "click"){
                                                setMobileSearchOpen(false);
                                            }
                                        }
                                    }}
                                    fullWidth={true}
                                    autoComplete={true}
                                    forcePopupIcon={false}
                                    slots={{ popper: Popper, paper: Paper }}                                
                                    renderOption={(props, option) => {
                                        const { ...optionProps } = props;
                                        return (
                                            <li {...optionProps} key={option.id}>
                                                <Grid2  alignItems={"center"} size={12} container spacing={0} >
                                                    <Grid2 sx={{ display: 'flex', width: 35 }}><SearchResultIconRenderer objectType={option.category}/></Grid2>
                                                    <Grid2 sx={{ width: 'calc(100% - 35px)', wordWrap: 'break-word' }}>
                                                        <Link className="undecorated" href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/${getUriSection(option.category)}/${option.id}`}>{option.displayValue}</Link>
                                                    </Grid2>
                                                </Grid2>
                                            </li>
                                            
                                        )
                                    }}
                                    onClose={() => setMobileSearchOpen(false)}
                                    popupIcon={ <CloseOutlinedIcon /> }
                                    getOptionLabel={(option) => typeof option === "string" ? option : option.displayValue}
                                    slotProps={{
                                        paper: {
                                            sx: {
                                                width: 350                                            
                                            }
                                        }
                                    }}
                                    
                                    renderInput={(params) => {
                                        return <TextField 
                                                {...params} 
                                                size="small" 
                                                multiline={false} 
                                                label="" 
                                                fullWidth={true} 
                                                sx={{
                                                    '& .MuiInputBase-root': {
                                                        backgroundColor: 'white', // <-- This controls the whole textbox "container"
                                                        borderRadius: '4px',      // <-- You can also fix the radius here
                                                    }
                                                }}
                                            />
                                    }}
                                    options={lookaheadOptions}
                                />  
                            </Grid2>
                        }
                    </Grid2>
                    <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
                        <Stack spacing={2} padding={"8px"} fontSize={"0.85em"} fontWeight={"bolder"} marginTop={"8px"} >
                            {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT && containsScope([TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], profile?.scope || []) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>                
                                    <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} onClick={() => setDrawerOpen(false)} >Tenants</Link>                
                                </div>
                            }
                            {tenantMetaData.tenant.tenantType !== TENANT_TYPE_ROOT_TENANT && containsScope([TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], profile?.scope || []) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>
                                    <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} >My Tenant</Link>                        
                                </div>                
                            }
                            {containsScope([TENANT_READ_ALL_SCOPE, CLIENT_READ_SCOPE], profile?.scope || []) &&   
                                <div style={{display: "inline-flex", alignItems: "center"}}>
                                    <SettingsSystemDaydreamIcon sx={{marginRight: "8px"}}/>
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=clients`} onClick={() => setDrawerOpen(false)}>Clients</Link>
                                </div>
                            }
                            {containsScope([TENANT_READ_ALL_SCOPE, USER_READ_SCOPE], profile?.scope || []) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>
                                    <PersonIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=users`} onClick={() => setDrawerOpen(false)}>Users</Link>
                                </div>
                            }
                            {containsScope([TENANT_READ_ALL_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE], profile?.scope || []) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>
                                    <PeopleIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=authorization-groups`} onClick={() => setDrawerOpen(false)}>Authorization Groups</Link>
                                </div>
                            }
                            {containsScope([TENANT_READ_ALL_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE], profile?.scope || []) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>
                                    <GroupIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=authentication-groups`} onClick={() => setDrawerOpen(false)}>Authentication Groups</Link>
                                </div>
                            }
                            {containsScope([TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], profile?.scope || []) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>
                                    <SettingsIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=scope-access-control`} onClick={() => setDrawerOpen(false)}>Scope/Access Control</Link>
                                </div>
                            }
                            {containsScope([TENANT_READ_ALL_SCOPE, FEDERATED_OIDC_PROVIDER_READ_SCOPE], profile?.scope || []) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>
                                    <AutoAwesomeMosaicIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=oidc-providers`} onClick={() => setDrawerOpen(false)}>OIDC Providers</Link>
                                </div>
                            }
                            {containsScope([TENANT_READ_ALL_SCOPE, RATE_LIMIT_READ_SCOPE], profile?.scope || []) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>
                                    <SpeedIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=rate-limits`} onClick={() => setDrawerOpen(false)}>Rate Limits</Link>
                                </div>
                            }
                            {containsScope([TENANT_READ_ALL_SCOPE, KEY_READ_SCOPE], profile?.scope || []) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}> 
                                    <KeyIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=signing-keys`} onClick={() => setDrawerOpen(false)}>Keys</Link>
                                </div>
                            }
                            {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT && containsScope([SYSTEM_SETTINGS_READ_SCOPE, JOBS_READ_SCOPE], profile?.scope) &&
                                <Divider />
                            }
                            {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT && containsScope(SYSTEM_SETTINGS_READ_SCOPE, profile?.scope) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}> 
                                    <SettingsOutlinedIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}/system-settings`} onClick={() => setDrawerOpen(false)}>System Settings</Link>
                                </div>                            
                            }
                            {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT && containsScope([JOBS_READ_SCOPE], profile?.scope) &&
                                <div style={{display: "inline-flex", alignItems: "center"}}> 
                                    <WorkHistoryOutlinedIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}/jobs`} onClick={() => setDrawerOpen(false)}>Running Jobs</Link>
                                </div>
                            }
                            {containsScope([TENANT_CREATE_SCOPE, CLIENT_CREATE_SCOPE, AUTHORIZATION_GROUP_CREATE_SCOPE, AUTHENTICATION_GROUP_CREATE_SCOPE, SCOPE_CREATE_SCOPE, FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, RATE_LIMIT_CREATE_SCOPE, KEY_CREATE_SCOPE], profile?.scope || []) &&
                                <React.Fragment>
                                    <Divider />
                                    <div onClick={() => {setOpenCreateNewDialog(true); setDrawerOpen(false)}} style={{display: "inline-flex", alignItems: "center", cursor: "pointer"}}>
                                        <AddBoxIcon sx={{marginRight: "8px"}} />
                                    <div>Create New...</div>
                                    </div>
                                    <Divider />
                                </React.Fragment>
                            }
                            <div style={{marginTop: "16px"}}>
                                <div 
                                    onClick={() => {
                                        setDrawerOpen(false);
                                        authSessionProps.deleteAuthSessionData();
                                        router.push(`/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`);  
                                    }}
                                    style={{display: "inline-flex", alignItems: "center", cursor: "pointer"}}
                                >
                                    <Logout sx={{marginRight: "8px"}} />
                                    <span>Logout</span>
                                </div>
                            </div>


                        </Stack>
                    </Drawer>
                </>            
            }
            {openCreateNewDialog &&
                <CreateNewDialog 
                    open={openCreateNewDialog} 
                    onCancel={() => setOpenCreateNewDialog(false)} 
                    onClose={() => setOpenCreateNewDialog(false)}
                    breakPoints={breakPoints}
                />
            }
        </>
        
    )
}


export default TenantLeftNavigation;