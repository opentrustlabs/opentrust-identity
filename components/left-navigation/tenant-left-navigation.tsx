"use client";
import React, { useContext, useEffect, useRef } from "react";
import { Autocomplete, AutocompleteRenderGroupParams, AutocompleteRenderInputParams, Divider, Drawer, Grid2, InputAdornment, Paper, Popper, Stack, TextField } from "@mui/material";
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
import { LookaheadItem, LookaheadResult, SearchResultType, TenantMetaData } from "@/graphql/generated/graphql-types";
import AddBoxIcon from '@mui/icons-material/AddBox';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import CreateNewDialog from "../dialogs/create-new-dialog";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { LOOKAHEAD_SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import SearchResultIconRenderer, { displaySearchCategory, getUriSection } from "../search/search-result-icon-renderer";

const options = [{"category":"TENANT","id":"3847389283489234","displayValue":"Bioreliance"},{"category":"TENANT","id":"3847389283489235","displayValue":"Pfizer"},{"category":"TENANT","id":"3847389283489236","displayValue":"Amgen"},{"category":"TENANT","id":"3847389283489237","displayValue":"Lowes"},{"category":"CLIENT","id":"3847389283489238","displayValue":"Biorelianch"},{"category":"CLIENT","id":"3847389283489239","displayValue":"Pizer"},{"category":"AUTHORIZATION_GROUP","id":"3847389283489214","displayValue":"US Users"},{"category":"AUTHORIZATION_GROUP","id":"3847389283489224","displayValue":"EU Users"},{"category":"AUTHORIZATION_GROUP","id":"3847389283489244","displayValue":"Project management team - Within the US"}]
interface NavigationProps {
    section: string | null,
    tenantMetaData: TenantMetaData,
    breakPoints: ResponsiveBreakpoints
}

const TenantLeftNavigation: React.FC<NavigationProps> = ({section, tenantMetaData, breakPoints}) => {

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const router = useRouter();

    // STATE VARIABLES
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [openCreateNewDialog, setOpenCreateNewDialog] = React.useState<boolean>(false);
    const [lookaheadOptions, setLookaheadOptions] = React.useState<Array<{category: SearchResultType, displayCategory: string, id: string, displayValue: string}>>([]);


    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(LOOKAHEAD_SEARCH_QUERY, {
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
            if(searchTerm && searchTerm.length > 2){
                router.push(`/${tenantBean.getTenantMetaData().tenant.tenantId}?term=${searchTerm}&section=search`);
                setLookaheadOptions([]);
            }
        }
    }

    const handleSearch = (evt: any) => {
        if(searchTerm && searchTerm.length > 2){
            router.push(`/${tenantBean.getTenantMetaData().tenant.tenantId}?term=${searchTerm}&section=search`)            
        }
    }
    

    return (
        <>
            {!breakPoints.isMedium && 
                <>                    
                    {/* <Stack spacing={0} fontSize={"0.9em"}  direction={"row"} paddingTop={"8px"}>
                        <div>
                        
                            <TextField   
                                ref={searchInputBox}
                                value={searchTerm}
                                size="small"
                                name="searchinput"
                                id="searchinput"
                                onKeyDown={handleKeyPressSearch}
                                onChange={(evt) => {
                                    setSearchTerm(evt.target.value);
                                    setShowSearchIcon(true);
                                }}
                                fullWidth={true}
                                label={"Search"}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {showSearchIcon &&
                                                    <SearchIcon 
                                                        onClick={(evt) => {
                                                            setShowSearchIcon(false);
                                                            handleSearch(evt);
                                                        }}
                                                        sx={{cursor: "pointer"}}
                                                    />
                                                }
                                                {!showSearchIcon &&
                                                    <CloseOutlinedIcon
                                                        onClick={() => {
                                                            setSearchTerm("");
                                                            setShowSearchIcon(true);
                                                        }}
                                                        sx={{cursor: "pointer"}}
                                                    />
                                                }
                                            </InputAdornment>
                                        )
                                    }
                                }}                                    
                            />
                        </div>
                    </Stack> */}
                    <Stack spacing={0} fontSize={"0.9em"}  direction={"row"} paddingTop={"8px"}>                                              
                            <Autocomplete
                                
                                freeSolo={true}
                                value={searchTerm}
                                filterOptions={(x) => x}
                                size="small"
                                id="searchinput2"
                                onKeyDown={handleKeyPressSearch}
                                onInputChange={(evt, newInputValue, reason: string) => {
                                    console.log("in onInputChange");
                                    console.log(newInputValue);
                                    console.log(reason);
                                    setSearchTerm(newInputValue);
                                }}
                                groupBy={(option) => option.displayCategory}
                                includeInputInList
                                filterSelectedOptions
                                onChange={(evt, value, reason) => {
                                    console.log("in onChange");
                                    console.log(value);
                                    console.log(reason);
                                    if(reason === "clear"){
                                        setLookaheadOptions([]);
                                    }
                                } }
                                // renderGroup={(params: AutocompleteRenderGroupParams) => {
                                //     {category, id, displayValue} = params;
                                //     return (

                                //     )
                                // }}
                                fullWidth={true}
                                autoComplete={true}
                                forcePopupIcon={false}
                                slots={{ popper: Popper, paper: Paper }}
                                
                                renderOption={(props, option) => {
                                    const { key, ...optionProps } = props;
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
                                            label="Search" 
                                            fullWidth={true} 
                                            
                                    
                                        />
                                }}
                                options={lookaheadOptions}
                            />
                        
                    </Stack>

                    <Stack spacing={0} padding={"8px"} color={"#616161"} fontSize={"0.9em"} fontWeight={"bolder"} marginTop={"8px"} >
                        <Divider />
                        {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                            <div  className="left-navigation">
                                <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} >Tenants</Link>                        
                            </div>                
                        }      
                        {tenantMetaData.tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                            <div className="left-navigation">
                                <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} >My Tenant</Link>                        
                            </div>                
                        }           
                        <div className="left-navigation" >
                            <SettingsSystemDaydreamIcon sx={{marginRight: "8px"}}/>
                            <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=clients`} >Clients</Link>
                        </div>
                        <div className="left-navigation" >
                            <PersonIcon sx={{marginRight: "8px"}} />
                            <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=users`} >Users</Link>
                        </div>
                        <div className="left-navigation" >
                            <PeopleIcon sx={{marginRight: "8px"}} />
                            <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=authorization-groups`} >Authorization Groups</Link>
                        </div>
                        <div className="left-navigation" >
                            <GroupIcon sx={{marginRight: "8px"}} />
                            <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=authentication-groups`} >Authentication Groups</Link>
                        </div>
                        <div className="left-navigation" >
                            <PolicyIcon sx={{marginRight: "8px"}} />
                            <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=scope-access-control`} >Scope/Access Control</Link>
                        </div>
                        <div className="left-navigation" >
                            <AutoAwesomeMosaicIcon sx={{marginRight: "8px"}} />
                            <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=oidc-providers`} >OIDC Providers</Link>
                        </div>
                        <div className="left-navigation">
                            <SpeedIcon sx={{marginRight: "8px"}} />
                            <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=rate-limits`} >Rate Limits</Link>
                        </div>
                        <div className="left-navigation">
                            <KeyIcon sx={{marginRight: "8px"}} />
                            <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=signing-keys`} >Keys</Link>
                        </div>
                        {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                            <>                                
                                <div className="left-navigation" >
                                    <VerifiedIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}/catpcha-config`}>Captcha</Link>
                                </div>                            
                            </>                        
                        }                        
                        <Divider />
                        <div className="left-navigation" onClick={() => setOpenCreateNewDialog(true)}  style={{marginTop: "8px", cursor: "pointer"}}>
                            <AddBoxIcon sx={{marginRight: "8px"}} />
                            <div>Create New...</div>
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
                            {/* <TextField 
                                value={searchTerm}
                                size="small"
                                name="searchinput"
                                id="searchinput"
                                onKeyDown={handleKeyPressSearch}
                                onChange={(evt) => {
                                    setSearchTerm(evt.target.value);
                                    setShowSearchIcon(true);
                                }}
                                fullWidth={true}                                
                                slotProps={{                                    
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {showSearchIcon &&
                                                    <SearchIcon 
                                                        onClick={(evt) => {
                                                            setShowSearchIcon(false);
                                                            handleSearch(evt);
                                                        }}
                                                        sx={{cursor: "pointer"}}
                                                    />
                                                }
                                                {!showSearchIcon &&
                                                    <CloseOutlinedIcon
                                                        onClick={() => {
                                                            setSearchTerm("");
                                                            setShowSearchIcon(true);
                                                        }}
                                                        sx={{cursor: "pointer"}}
                                                    />
                                                }
                                            </InputAdornment>
                                        ),
                                        style: {
                                            backgroundColor: "white"
                                        }
                                    }
                                }}                                    
                            />                             */}
                        </Grid2>
                    </Grid2>
                    <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
                        <Stack spacing={2} padding={"8px"} fontSize={"0.85em"} fontWeight={"bolder"} marginTop={"8px"} >
                            {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>                
                                    <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} onClick={() => setDrawerOpen(false)} >Tenants</Link>                
                                </div>
                            }
                            {tenantMetaData.tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                                <div style={{display: "inline-flex", alignItems: "center"}}>
                                    <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
                                    <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=tenants`} >My Tenant</Link>                        
                                </div>                
                            }   
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <SettingsSystemDaydreamIcon sx={{marginRight: "8px"}}/>
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=clients`} onClick={() => setDrawerOpen(false)}>Clients</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <PersonIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=users`} onClick={() => setDrawerOpen(false)}>Users</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <PeopleIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=authorization-groups`} onClick={() => setDrawerOpen(false)}>Authorization Groups</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <GroupIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=authentication-groups`} onClick={() => setDrawerOpen(false)}>Authentication Groups</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <SettingsIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=scope-access-control`} onClick={() => setDrawerOpen(false)}>Scope/Access Control</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <AutoAwesomeMosaicIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=oidc-providers`} onClick={() => setDrawerOpen(false)}>OIDC Providers</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}>
                                <SpeedIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=rate-limits`} onClick={() => setDrawerOpen(false)}>Rate Limits</Link>
                            </div>
                            <div style={{display: "inline-flex", alignItems: "center"}}> 
                                <KeyIcon sx={{marginRight: "8px"}} />
                                <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}?section=signing-keys`} onClick={() => setDrawerOpen(false)}>Keys</Link>
                            </div>
                            {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                <>                                
                                    <div style={{display: "inline-flex", alignItems: "center"}}>
                                        <VerifiedIcon sx={{marginRight: "8px"}} />
                                        <Link className="undecorated" href={`/${tenantMetaData.tenant.tenantId}/catpcha-config`}>Captcha</Link>
                                    </div>                            
                                </>                        
                            }  
                            <Divider />
                            <div onClick={() => {setOpenCreateNewDialog(true); setDrawerOpen(false)}} style={{display: "inline-flex", alignItems: "center", cursor: "pointer"}}>
                                <AddBoxIcon sx={{marginRight: "8px"}} />
                                <div>Create New...</div>
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