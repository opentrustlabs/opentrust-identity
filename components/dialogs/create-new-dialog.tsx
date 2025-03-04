"use client";
import { Dialog } from "@mui/material";
import React, { useContext } from "react";
import { ResponsiveBreakpoints } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import TenantSelector from "./tenant-selector";
import NewTenantDialog from "./new-tenant-dialog";
import CreateNewTypeSelector from "./create-new-type-selector";
import NewClientDialog from "./new-client-dialog";

export interface CreateNewSelectorProps {
    open: boolean,
    onCancel: () => void,
    onClose: () => void,
    breakPoints: ResponsiveBreakpoints
}


const CreateNewDialog: React.FC<CreateNewSelectorProps> = ({ 
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
            maxWidth={breakPoints.isMedium ? "lg" : createNewType === null || selectedTenant === null ? "sm" : "sm"}
            fullWidth={breakPoints.isMedium ? true : true}
        >
            {createNewType === null &&
                <CreateNewTypeSelector  
                    onCancel={onCancel}
                    onNext={(selectedType: string) => setCreateNewType(selectedType)}
                />
            }
                {createNewType !== null && requiresParentTenant(createNewType) && selectedTenant === null &&
                    <TenantSelector onSelected={setSelectedTenant} onCancel={onCancel}/>
                }
                {createNewType === "tenant" &&
                    <NewTenantDialog 
                        onCancel={onCancel}
                        onClose={onClose}
                    />
                }
                {createNewType === "client" && selectedTenant !== null &&
                    <NewClientDialog
                        tenantId={selectedTenant}
                        onCancel={onCancel}
                        onClose={onClose}
                    />
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


        </Dialog>
    )
}

export default CreateNewDialog;