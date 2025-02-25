"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import React, { useContext } from "react";
import { ResponsiveBreakpoints } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import TenantSelector from "./tenant-selector";
import NewTenantDialog from "./new-tenant-dialog";


export interface CreateNewSelectorProps {
    onCancel: () => void,
    onNext: (typeSelected: string) => void
}


const CreateNewTypeSelector: React.FC<CreateNewSelectorProps> = ({ 
    onCancel,
    onNext
 }) => {

    // CONTEXTS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE
    const [createNewType, setCreateNewType] = React.useState<string | null>(null);

    // HANDLER FUNCTIONS
    const handleSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCreateNewType(event.target.value);
    };

    // const ARR_TYPES_REQUIRING_PARENT_TENANT = ["client", "authorization-group", "authentication-group", "key"];
    // const requiresParentTenant = (type: string): boolean => {
    //     return ARR_TYPES_REQUIRING_PARENT_TENANT.includes(type);
    // }

    // maxWidth={breakPoints.isMedium ? "lg" : createNewType === null || selectedTenant === null ? "xs" : "lg"}
    return (
        <>
            <DialogTitle sx={{fontWeight: "bold"}}>Create New</DialogTitle>            
            <DialogContent >
                
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
                
                
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {onCancel(); setCreateNewType(null);}}>Cancel</Button>                
                <Button onClick={() => onNext(createNewType || "")} disabled={createNewType === null}>Next</Button>
            </DialogActions>
        </>
    )

}

export default CreateNewTypeSelector