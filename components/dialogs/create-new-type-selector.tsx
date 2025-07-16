"use client";
import { Button, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { useContext } from "react";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { AUTHENTICATION_GROUP_CREATE_SCOPE, AUTHORIZATION_GROUP_CREATE_SCOPE, CLIENT_CREATE_SCOPE, FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, KEY_CREATE_SCOPE, RATE_LIMIT_CREATE_SCOPE, SCOPE_CREATE_SCOPE, TENANT_CREATE_SCOPE } from "@/utils/consts";



export interface CreateNewSelectorProps {
    onCancel: () => void,
    onNext: (typeSelected: string) => void
}


const CreateNewTypeSelector: React.FC<CreateNewSelectorProps> = ({ 
    onCancel,
    onNext
 }) => {

    // CONTEXTS
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    // STATE
    const [createNewType, setCreateNewType] = React.useState<string | null>(null);

    // HANDLER FUNCTIONS
    const handleSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCreateNewType(event.target.value);
    };


    return (
        <>
            <DialogTitle sx={{fontWeight: "bold"}}>Create New</DialogTitle>            
            <DialogContent >
                
                    <FormControl>                    
                        <RadioGroup
                            name="create-new-radio-group"
                            onChange={handleSelection}
                        >
                            {containsScope(TENANT_CREATE_SCOPE, profile?.scope || []) &&
                                <FormControlLabel value="tenant" control={<Radio />} label="Tenant" />
                            }
                            {containsScope(CLIENT_CREATE_SCOPE, profile?.scope || []) &&
                                <FormControlLabel value="client" control={<Radio />} label="Client" />
                            }
                            {containsScope(AUTHORIZATION_GROUP_CREATE_SCOPE, profile?.scope || []) &&
                                <FormControlLabel value="authorization-group" control={<Radio />} label="Authorization Group" />
                            }
                            {containsScope(AUTHENTICATION_GROUP_CREATE_SCOPE, profile?.scope || []) &&
                                <FormControlLabel value="authentication-group" control={<Radio />} label="Authentication Group" />
                            }
                            {containsScope(SCOPE_CREATE_SCOPE, profile?.scope || []) &&
                                <FormControlLabel value="scope-access-control" control={<Radio />} label="Scope / Access Control" />
                            }
                            {containsScope(FEDERATED_OIDC_PROVIDER_CREATE_SCOPE, profile?.scope || []) &&
                                <FormControlLabel value="oidc-provider" control={<Radio />} label="OIDC Provider" />
                            }
                            {containsScope(RATE_LIMIT_CREATE_SCOPE, profile?.scope || []) &&
                                <FormControlLabel value="rate-limit" control={<Radio />} label="Rate Limit" />
                            }
                            {containsScope(KEY_CREATE_SCOPE, profile?.scope || []) &&
                                <FormControlLabel value="key" control={<Radio />} label="Key" />
                            }
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