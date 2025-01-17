"use client";
import React, { useContext } from "react";
import { Client, Tenant } from "@/graphql/generated/graphql-types";
import { CLIENTS_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { CircularProgress, Divider, Grid2, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { CLIENT_TYPES_DISPLAY } from "@/utils/consts";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";

const ClientList: React.FC = () => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    const [filterValue, setFilerValue] = React.useState("");
    
    // CONTEXT HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);

    // GRAPHQL FUNCTION
    const {data, error, loading } = useQuery(CLIENTS_QUERY, {

    });

    // HANDLER FUNCTIONS

    const handleFilterChange = (evt: any) => {
        setFilerValue(evt.target.value);
    }

    const isExpanded = (section: string): boolean => {
        console.log("is expanded")
        if(mapViewExpanded.has(section)){
            return true;
        }
        return false;
    }

    const setExpanded = (section: string): void => {
        console.log("set is expanded")
        mapViewExpanded.set(section, true);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    const removeExpanded = (section: string): void => {
        console.log("remove is expanded")
        mapViewExpanded.delete(section);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    if(loading) return <CircularProgress />
    if(error) return <div>There was an error. ${error.stack}</div>
    if(data) return (
      
        <main >
            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                <div style={{display: "inline-flex", alignItems: "center"}}>    
                    <AddBoxIcon sx={{marginRight: "8px", cursor: "pointer"}} />
                    <span>New Client</span>
                </div>                
            </Stack>
            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                <div style={{display: "inline-flex", alignItems: "center"}}>    
                    <TextField 
                        label={"Filter"}
                        size={"small"}
                        name={"filter"}
                        value={filterValue}
                        onChange={handleFilterChange}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">                                        
                                        <CloseOutlinedIcon 
                                            sx={{cursor: "pointer"}}
                                            onClick={() => setFilerValue("")}                                            
                                        />                                        
                                    </InputAdornment>
                                )
                            }
                        }} 
                    />
                </div>           
            </Stack>
            {c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={1}></Grid2>
                            <Grid2 size={8}>Client Name</Grid2>
                            <Grid2 size={2}>Enabled</Grid2>
                            <Grid2 size={1}></Grid2>                                
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {data.getClients.length < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2  margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No clients to display
                            </Grid2>
                        </Typography>
                    }
            
                    {data.getClients.map(
                        (client: Client) => (
                            <Typography key={`${client.clientId}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>                        
                                <Grid2  margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={8}><Link style={{color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/clients/${client.clientId}`}>{client.clientName}</Link></Grid2>
                                    <Grid2 size={2}>
                                        {client.enabled  &&
                                            <CheckOutlinedIcon />    
                                        }
                                    </Grid2>
                                    <Grid2 size={1}>
                                        {mapViewExpanded.has(client.clientId) && 
                                            <UnfoldLessOutlinedIcon 
                                                sx={{cursor: "pointer"}}
                                                onClick={() => removeExpanded(client.clientId)}
                                            />
                                        }
                                        {!mapViewExpanded.has(client.clientId) &&
                                            <UnfoldMoreOutlinedIcon 
                                                sx={{cursor: "pointer"}}
                                                onClick={() => setExpanded(client.clientId)}
                                            />
                                        }                                        
                                    </Grid2>
                                </Grid2>
                                {mapViewExpanded.has(client.clientId) &&
                                    <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                        <Grid2 size={1}></Grid2>
                                        <Grid2 size={11} container>
                                            <Grid2 sx={{textDecoration: "underline"}} size={12}>Description</Grid2>
                                            <Grid2 size={12}>{client.clientDescription}</Grid2>
                                            
                                            <Grid2 sx={{textDecoration: "underline"}} size={12}>Client Type</Grid2>
                                            <Grid2 size={12}>{CLIENT_TYPES_DISPLAY.get(client.clientType)}</Grid2>
                                            
                                            <Grid2 sx={{textDecoration: "underline"}}  size={12}>Object ID</Grid2>
                                            <Grid2 size={12} display={"inline-flex"}><div style={{marginRight: "8px"}}>{client.clientId}</div><ContentCopyIcon /></Grid2>
                                        </Grid2>
                                    </Grid2>
                                }
                            </Typography>                                
                        )
                    )}
                </>
            }
            {!c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >                
                                <Grid2 size={0.3}></Grid2>
                                <Grid2 size={2.7}>Client Name</Grid2>
                                <Grid2 size={3}>Description</Grid2>
                                <Grid2 size={2}>Client Type</Grid2>
                                <Grid2 size={1}>Enabled</Grid2>
                                <Grid2 size={3}>Object ID</Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {data.getClients.length < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2  margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No clients to display
                            </Grid2>
                        </Typography>
                    }
            
                    {data.getClients.map(
                        (client: Client) => (
                            <Typography key={`${client.clientId}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>                        
                                <Grid2  margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={0.3}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={2.7}><Link style={{color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/clients/${client.clientId}`}>{client.clientName}</Link></Grid2>
                                    <Grid2 size={3}>{client.clientDescription}</Grid2>
                                    <Grid2 size={2}>{CLIENT_TYPES_DISPLAY.get(client.clientType)}</Grid2>
                                    <Grid2 size={1}>
                                        {client.enabled  &&
                                            <CheckOutlinedIcon />    
                                        }
                                    </Grid2>
                                    <Grid2 size={3} display={"inline-flex"} columnGap={1} ><div>{client.clientId}</div><div><ContentCopyIcon /></div></Grid2>
                                </Grid2>
                            </Typography>
                                
                        )
                    )}
                </>
            }

        </main>
    )
}

export default ClientList;