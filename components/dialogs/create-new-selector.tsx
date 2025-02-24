"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import React, { useContext } from "react";
import { ResponsiveBreakpoints } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import TenantSelector from "./tenant-selector";


export interface CreateNewSelectorProps {
    open: boolean,
    onCancel: () => void,
    onClose: () => void,
    breakPoints: ResponsiveBreakpoints
}


const CreateNewSelector: React.FC<CreateNewSelectorProps> = ({ 
    open,
    onCancel,
    onClose,
    breakPoints
 }) => {

    // CONTEXTS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE
    const [createNewType, setCreateNewType] = React.useState<string | null>(null);
    const [selectedTenant, setSelectedTenant] = React.useState<string | null>(
        tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? 
            null :
            tenantBean.getTenantMetaData().tenant.tenantId
    )

    // HANDLER FUNCTIONS
    const handleSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("in handle selection")
        setCreateNewType(event.target.value);
    };

    const ARR_TYPES_REQUIRING_PARENT_TENANT = ["client", "authorization-group", "authentication-group", "key"];
    const requiresParentTenant = (type: string): boolean => {
        return ARR_TYPES_REQUIRING_PARENT_TENANT.includes(type);
    }

    return (
        <Dialog
            draggable={true}
            open={open}
            onClose={() => {setCreateNewType(null); onClose();}}
            fullScreen={false}
            maxWidth={breakPoints.isMedium ? "lg" : createNewType === null || selectedTenant === null ? "xs" : "lg"}
            fullWidth={breakPoints.isMedium ? true : true}
        >
            <DialogTitle sx={{fontWeight: "bold"}}>Create New</DialogTitle>            
            <DialogContent>
                {createNewType === null &&
                    <FormControl>                    
                        <RadioGroup
                            name="create-new-radio-group"
                            onChange={handleSelection}
                        >
                            {/** TODO handle conditional display based on what the user has access to do */}
                            <FormControlLabel value="tenant" control={<Radio />} label="Tenant" />
                            <FormControlLabel value="client" control={<Radio />} label="Client" />
                            <FormControlLabel value="authorization-group" control={<Radio />} label="Authorization Group" />
                            <FormControlLabel value="authentication-group" control={<Radio />} label="Authentication Group" />
                            <FormControlLabel value="scope-access-control" control={<Radio />} label="Scope / Access Control" />
                            <FormControlLabel value="oidc-provider" control={<Radio />} label="OIDC Provider" />
                            <FormControlLabel value="rate-limit" control={<Radio />} label="Rate Limit" />
                            <FormControlLabel value="key" control={<Radio />} label="Key" />                        
                        </RadioGroup>
                    </FormControl>
                }
                {createNewType !== null && requiresParentTenant(createNewType) && selectedTenant === null &&
                    <TenantSelector onSelected={setSelectedTenant} />
                }
                {createNewType === "tenant" &&
                    <div>You want to create a new tenant</div>
                }
                {createNewType === "client" && selectedTenant !== null &&
                    <div>You want to create a new client</div>
                }
                {createNewType === "authorization-group" && selectedTenant !== null &&
                    <div>You want to create a new authorization-group</div>
                }
                {createNewType === "authentication-group" && selectedTenant !== null &&
                    <div>You want to create a new authentication-group</div>
                }
                {createNewType === "scope-access-control" &&
                    <div>You want to create a new scope-access-control</div>
                }
                {createNewType === "oidc-provider" && 
                    <div>You want to create a new oidc-provider</div>
                }
                {createNewType === "rate-limit" && 
                    <div>You want to create a new rate-limit</div>
                }
                {createNewType === "key" && selectedTenant !== null &&
                    <div>You want to create a new key</div>
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {setCreateNewType(null); onCancel()}}>Cancel</Button>
                
                {createNewType !== null && selectedTenant !== null &&
                    <Button disabled={createNewType === null}>Finish</Button>
                }
                {createNewType !== null && selectedTenant === null &&
                    <Button disabled={createNewType === null}>Next</Button>
                }                
            </DialogActions>
        </Dialog>
    )

}

export default CreateNewSelector