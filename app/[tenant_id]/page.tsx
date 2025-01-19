"use client";
import React, { useContext } from "react";
import { useSearchParams } from 'next/navigation';
import TenantList from "@/components/tenants/tenant-list";
import ClientList from "@/components/clients/client-list";
import AuthorizationGroupList from "@/components/authorization-groups/authorization-group-list";
import { ResponsiveBreakpoints, ResponsiveContext } from "@/components/contexts/responsive-context";
import { TenantContext, TenantMetaDataBean } from "@/components/contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import TenantDetail from "@/components/tenants/tenant-detail";


const TenantLandingPage: React.FC = () => {

    // CONTEXT HOOKS
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
    
     // QUERY PARAMS
    const params = useSearchParams();
    const section = params?.get("section");
    


    /*
        In the content section for the landing page for the tenant, we will
        decide which component to include based on the section value, defaulting
        to either the tenant list (for root tenant admins) or the tenant
        detail page (for tenants which allow specific admin users to access the
        management screens).

        section = search | tenants | clients | users | scope/access rules | authn groups | authz groups | federated oidc providers | rate limits | keys 
    
    
    */

    return (
        <>
            {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT && (section === null || section === "tenants") &&
                <TenantList />
            }
            {tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT && (section === null || section === "tenants") &&
                <TenantDetail tenantId={tenantBean.getTenantMetaData().tenant.tenantId} />
            }
            {section === "clients" &&
                <ClientList />
            }
            {section === "authorization-groups" &&
                <AuthorizationGroupList />
            }
        </>
    )


}


// interface NavigationProps {
//     section: string | null,
//     tenantMetaData: TenantMetaData
// }

// const NavigationFull: React.FC<NavigationProps> = ({section, tenantMetaData}) => {

//     const [searchTerm, setSearchTerm] = React.useState<string | null>(null);

//     const handleKeyPressSearch = (evt: React.KeyboardEvent) => {        
//         if (evt.key.valueOf().toLowerCase() === "enter") {
//             if(searchTerm && searchTerm.length > 2){
//                 // DO SEARCH
//                 console.log("will do search")
//             }
//         }
//     }

//     const handleSearch = (evt: any) => {
//         console.log("search button was clicked");
//     }
    

//     return (
//         <>
//             <Stack spacing={0} fontSize={"0.8em"}  direction={"row"} paddingTop={"8px"}>
//                 <div>
//                     <TextField   
//                         size="small"
//                         name="searchinput"
//                         id="searchinput"
//                         onKeyDown={handleKeyPressSearch}
//                         onChange={(evt) => setSearchTerm(evt.target.value)}
//                         fullWidth={true}
//                         label={"Search"}
//                         slotProps={{
//                             input: {
//                                 endAdornment: (
//                                     <InputAdornment position="end">
//                                         <SearchIcon 
//                                             onClick={handleSearch}
//                                             sx={{cursor: "pointer"}}
//                                         />
//                                     </InputAdornment>
//                                 )
//                             }
//                         }}                                    
//                     />
//                 </div>
//             </Stack>

//             <Stack spacing={2} padding={"8px"} fontSize={"0.85em"} fontWeight={"bolder"} marginTop={"8px"} >
//                 <Divider />
//                 {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
//                     <div style={{display: "inline-flex", alignItems: "center", textDecoration: section === "tenants" ? "underline" : ""}}>
//                         <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
//                         <Link href={`?section=tenants`} >Tenants</Link>                        
//                     </div>                
//                 }      
//                 {tenantMetaData.tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
//                     <div style={{display: "inline-flex", alignItems: "center", textDecoration: section === "tenants" ? "underline" : ""}}>
//                         <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
//                         <Link href={`?section=tenants`} >My Tenant</Link>                        
//                     </div>                
//                 }           
//                 <div style={{display: "inline-flex", alignItems: "center"}}>
//                     <SettingsSystemDaydreamIcon sx={{marginRight: "8px"}}/>
//                     <Link href={`?section=clients`} >Clients</Link>
//                 </div>
//                 <div style={{display: "inline-flex", alignItems: "center"}}>
//                     <PersonIcon sx={{marginRight: "8px"}} />
//                     <Link href={`?section=users`} >Users</Link>
//                 </div>
//                 <div style={{display: "inline-flex", alignItems: "center"}}>
//                     <PeopleIcon sx={{marginRight: "8px"}} />
//                     <Link href={`?section=authorization-groups`} >Authorization Groups</Link>
//                 </div>
//                 <div style={{display: "inline-flex", alignItems: "center"}}>
//                     <GroupIcon sx={{marginRight: "8px"}} />
//                     <Link href={`?section=authentication-groups`} >Authentication Groups</Link>
//                 </div>
//                 <div style={{display: "inline-flex", alignItems: "center"}}>
//                     <SettingsIcon sx={{marginRight: "8px"}} />
//                     <Link href={`?section=scope-access-control`} >Scope/Access Control</Link>
//                 </div>
//                 <div style={{display: "inline-flex", alignItems: "center"}}>
//                     <AutoAwesomeMosaicIcon sx={{marginRight: "8px"}} />
//                     <Link href={`?section=oidc-providers`} >OIDC Providers</Link>
//                 </div>
//                 <div style={{display: "inline-flex", alignItems: "center"}}>
//                     <SpeedIcon sx={{marginRight: "8px"}} />
//                     <Link href={`?section=rate-limits`} >Rate Limits</Link>
//                 </div>
//                 <div style={{display: "inline-flex", alignItems: "center"}}>
//                     <KeyIcon sx={{marginRight: "8px"}} />
//                     <Link href={`?section=keys`} >Keys</Link>
//                 </div>
//             </Stack>
//         </>
        
//     )
// }

// const NavigationMobile: React.FC<NavigationProps> = ({section, tenantMetaData}) => {

//     const [searchTerm, setSearchTerm] = React.useState<string | null>(null);

//     const [drawerOpen, setDrawerOpen] = React.useState(false);

//     const toggleDrawer = (newOpen: boolean) => () => {
//         setDrawerOpen(newOpen);
//     };

//     const handleKeyPressSearch = (evt: React.KeyboardEvent) => {        
//         if (evt.key.valueOf().toLowerCase() === "enter") {
//             if(searchTerm && searchTerm.length > 2){
//                 // DO SEARCH
//                 console.log("will do search")
//             }
//         }
//     }

//     const handleSearch = (evt: any) => {
//         console.log("search button was clicked");
//     }

//     const showMenuItems = () => {
//         console.log("will show menu items")
//         setDrawerOpen(true);
//     }


//     return (
//         <>
//             <Stack direction={"row"}  spacing={2} alignItems={"center"}>
//                 <MenuIcon 
//                     sx={{cursor: "pointer"}}
//                     onClick={showMenuItems}
//                 />
//                 <TextField   
//                         size="small"
//                         name="searchinput"
//                         id="searchinput"
//                         onKeyDown={handleKeyPressSearch}
//                         onChange={(evt) => setSearchTerm(evt.target.value)}
//                         fullWidth={true}
//                         label={"Search"}
//                         slotProps={{
//                             input: {
//                                 endAdornment: (
//                                     <InputAdornment position="end">
//                                         <SearchIcon 
//                                             onClick={handleSearch}
//                                             sx={{cursor: "pointer"}}
//                                         />
//                                     </InputAdornment>
//                                 )
//                             }
//                         }}                                    
//                     />
//             </Stack>
//             <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
//                 <Stack spacing={2} padding={"8px"} fontSize={"0.85em"} fontWeight={"bolder"} marginTop={"8px"} >
//                     {tenantMetaData.tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
//                         <div style={{display: "inline-flex", alignItems: "center"}}>                
//                             <SettingsApplicationsIcon sx={{marginRight: "8px"}} />
//                             <Link href={`?section=tenants`} onClick={() => setDrawerOpen(false)} >Tenants</Link>                
//                         </div>
//                     }
//                     <div style={{display: "inline-flex", alignItems: "center"}}>
//                         <SettingsSystemDaydreamIcon sx={{marginRight: "8px"}}/>
//                         <Link href={`?section=clients`} onClick={() => setDrawerOpen(false)}>Clients</Link>
//                     </div>
//                     <div style={{display: "inline-flex", alignItems: "center"}}>
//                         <PersonIcon sx={{marginRight: "8px"}} />
//                         <Link href={`?section=users`} onClick={() => setDrawerOpen(false)}>Users</Link>
//                     </div>
//                     <div style={{display: "inline-flex", alignItems: "center"}}>
//                         <PeopleIcon sx={{marginRight: "8px"}} />
//                         <Link href={`?section=authorization-groups`} onClick={() => setDrawerOpen(false)}>Authorization Groups</Link>
//                     </div>
//                     <div style={{display: "inline-flex", alignItems: "center"}}>
//                         <GroupIcon sx={{marginRight: "8px"}} />
//                         <Link href={`?section=authentication-groups`} onClick={() => setDrawerOpen(false)}>Authentication Groups</Link>
//                     </div>
//                     <div style={{display: "inline-flex", alignItems: "center"}}>
//                         <SettingsIcon sx={{marginRight: "8px"}} />
//                         <Link href={`?section=scope-access-control`} onClick={() => setDrawerOpen(false)}>Scope/Access Control</Link>
//                     </div>
//                     <div style={{display: "inline-flex", alignItems: "center"}}>
//                         <AutoAwesomeMosaicIcon sx={{marginRight: "8px"}} />
//                         <Link href={`?section=oidc-providers`} onClick={() => setDrawerOpen(false)}>OIDC Providers</Link>
//                     </div>
//                     <div style={{display: "inline-flex", alignItems: "center"}}>
//                         <SpeedIcon sx={{marginRight: "8px"}} />
//                         <Link href={`?section=rate-limits`} onClick={() => setDrawerOpen(false)}>Rate Limits</Link>
//                     </div>
//                     <div style={{display: "inline-flex", alignItems: "center"}}>
//                         <KeyIcon sx={{marginRight: "8px"}} />
//                         <Link href={`?section=keys`} onClick={() => setDrawerOpen(false)}>Keys</Link>
//                     </div>
//                 </Stack>
//             </Drawer>
//         </>
        
//     )
// }


export default TenantLandingPage;