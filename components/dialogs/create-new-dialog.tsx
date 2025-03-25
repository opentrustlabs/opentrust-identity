"use client";
import { Backdrop, CircularProgress, Dialog, Snackbar } from "@mui/material";
import React, { useContext } from "react";
import { ResponsiveBreakpoints } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import TenantSelector from "./tenant-selector";
import NewTenantDialog from "./new-tenant-dialog";
import CreateNewTypeSelector from "./create-new-type-selector";
import NewClientDialog from "./new-client-dialog";
import NewOIDCProviderDialog from "./new-oidc-provider-dialog";
import NewSigningKeyDialog from "./new-signing-key-dialog";
import NewAuthenticationGroupDialog from "./new-authentication-group-dialog";
import NewAuthorizationGroupDialog from "./new-authorization-group-dialog";
import NewRateLimitDialog from "./new-rate-limit-dialog";

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
    );
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);

    const ARR_TYPES_REQUIRING_PARENT_TENANT = ["client", "authorization-group", "authentication-group", "key"];
    const requiresParentTenant = (type: string): boolean => {
        return ARR_TYPES_REQUIRING_PARENT_TENANT.includes(type);
    }

    return (
        <>
            <Dialog
                draggable={true}
                open={open}
                onClose={() => { setCreateNewType(null); onClose(); }}
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
                    <TenantSelector onSelected={setSelectedTenant} onCancel={onCancel} />
                }
                {createNewType === "tenant" &&
                    <NewTenantDialog
                        onCancel={onCancel}
                        onClose={onClose}
                        onCreateEnd={(success: boolean) => {
                            setShowMutationBackdrop(false);
                            if(success){
                                onClose();
                            }
                        }}
                        onCreateStart={() => {
                            setShowMutationBackdrop(true);
                        }}
                    />
                }
                {createNewType === "client" && selectedTenant !== null &&
                    <NewClientDialog
                        tenantId={selectedTenant}
                        onCancel={onCancel}
                        onClose={onClose}
                        onCreateEnd={() => {
                            setShowMutationBackdrop(false);                            
                        }}
                        onCreateStart={() => {
                            setShowMutationBackdrop(true);
                        }}
                    />
                }
                {createNewType === "authorization-group" && selectedTenant !== null &&
                    <NewAuthorizationGroupDialog
                        tenantId={selectedTenant}
                        onCancel={onCancel}
                        onClose={onClose}
                        onCreateEnd={() => {
                            setShowMutationBackdrop(false);                            
                        }}
                        onCreateStart={() => {
                            setShowMutationBackdrop(true);
                        }}
                    />
                }
                {createNewType === "authentication-group" && selectedTenant !== null &&
                    <NewAuthenticationGroupDialog
                        tenantId={selectedTenant}
                        onCancel={onCancel}
                        onClose={onClose}
                        onCreateEnd={() => {
                            setShowMutationBackdrop(false);                            
                        }}
                        onCreateStart={() => {
                            setShowMutationBackdrop(true);
                        }}
                    />
                }
                {createNewType === "scope-access-control" &&
                    <div>You want to create a new scope-access-control</div>
                }
                {createNewType === "oidc-provider" &&
                    <NewOIDCProviderDialog
                        onCancel={onCancel}
                        onClose={onClose}
                        onCreateEnd={(success: boolean) => {
                            setShowMutationBackdrop(false);
                            if(success){
                                onClose();
                            }
                        }}
                        onCreateStart={() => {
                            setShowMutationBackdrop(true);
                        }}
                    />
                }
                {createNewType === "rate-limit" &&
                    <NewRateLimitDialog
                        onCancel={onCancel}
                        onClose={onClose}
                        onCreateEnd={(success: boolean) => {
                            setShowMutationBackdrop(false);
                            if(success){
                                onClose();
                            }
                        }}
                        onCreateStart={() => {
                            setShowMutationBackdrop(true);
                        }}
                    />
                    
                }
                {createNewType === "key" && selectedTenant !== null &&
                    <NewSigningKeyDialog
                        tenantId={selectedTenant}
                        onCancel={onCancel}
                        onClose={onClose}
                        onCreateEnd={() => {
                            setShowMutationBackdrop(false);                            
                        }}
                        onCreateStart={() => {
                            setShowMutationBackdrop(true);
                        }}
                    />                    
                }

            </Dialog>
            <Backdrop
                sx={{ color: '#fff' }}
                open={showMutationBackdrop}
                onClick={() => setShowMutationBackdrop(false)}
            >
                <CircularProgress color="info" />
            </Backdrop>
        </>
    )
}

export default CreateNewDialog;