"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";
import { AuthorizationGroupCreateInput } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export interface InitAuthzConfigurationProps extends SystemInitializationConfigProps {
    isReadOnlyAuthzGroup: boolean
}

const InitAuthzConfiguration: React.FC<InitAuthzConfigurationProps> = ({
    onBack,
    onNext,
    systemInitInput,
    isReadOnlyAuthzGroup
}) => {

    // STATE VARIABLES        
    const initInput: AuthorizationGroupCreateInput = {
        groupName: isReadOnlyAuthzGroup ? systemInitInput.rootReadOnlyAuthorizationGroupInput?.groupName || "" : systemInitInput.rootAuthorizationGroupInput.groupName,
        groupDescription: isReadOnlyAuthzGroup ? systemInitInput.rootReadOnlyAuthorizationGroupInput?.groupDescription || "" : systemInitInput.rootAuthorizationGroupInput.groupDescription,
        default: isReadOnlyAuthzGroup,
        tenantId: "",
        allowForAnonymousUsers: false
    };
    const [authzGroupInput, setAuthzGroupInput] = React.useState<AuthorizationGroupCreateInput>(initInput);
    
    return (
        <Typography component="div">
            <Paper
                elevation={1}
                sx={{ padding: "8px", border: "solid 1px lightgrey" }}
            >
                <Grid2 container size={12} spacing={1}>
                    <Grid2 fontWeight={"bold"} size={12} marginBottom={"8px"}>
                        {!isReadOnlyAuthzGroup && `Configure the admin authorization group. Note that this group has full permissions within the IAM tool and the user you create in the next steps will be assigned to this group`}
                        {isReadOnlyAuthzGroup && `Optional - Configure a read-only authorization group. This gives all users who login read-only access to the IAM tool if they are not assigned to other groups.`}
                    </Grid2>
                    <Grid2 size={12} marginBottom={"8px"}>
                        {!isReadOnlyAuthzGroup &&
                            <div>Group Name (Should include your organization name and environment. Example: MyOrg PROD Root Admin Authz Group)</div>
                        }
                        {isReadOnlyAuthzGroup &&
                            <div>Group Name (Should include your organization name and environment. Example: MyOrg PROD Root Default Read-Only Authz Group)</div>
                        }                        
                        <TextField required name="groupName" id="groupName" 
                            onChange={(evt) => { authzGroupInput.groupName = evt?.target.value; setAuthzGroupInput({ ...authzGroupInput}) }} 
                            value={authzGroupInput.groupName} fullWidth={true} size="small" />
                    </Grid2>
                    <Grid2 size={12}  marginBottom={"8px"}>
                        <div>Group Descripton</div>
                        <TextField
                            name="groupDescription" id="groupDescription"
                            value={authzGroupInput.groupDescription} fullWidth={true} size="small" multiline={true} rows={2}
                            onChange={(evt) => { authzGroupInput.groupDescription = evt?.target.value; setAuthzGroupInput({ ...authzGroupInput}) }}
                        />
                    </Grid2>
                </Grid2>
                <Stack sx={{ width: "100%" }} direction={"row-reverse"}>
                    <Button
                        onClick={() => {
                            if(isReadOnlyAuthzGroup){
                                systemInitInput.rootReadOnlyAuthorizationGroupInput = authzGroupInput;
                            }
                            else{
                                systemInitInput.rootAuthorizationGroupInput = authzGroupInput;
                            }
                            onNext(systemInitInput);
                        }}
                        disabled={authzGroupInput.groupName.length < 4 || !authzGroupInput.groupDescription || authzGroupInput.groupDescription?.length < 4}
                    >
                        Next
                    </Button>
                    {isReadOnlyAuthzGroup &&
                        <Button
                            onClick={() => {
                                onNext(systemInitInput);
                            }}
                        >
                            Skip
                        </Button>
                    }
                    <Button
                        onClick={() => {
                            onBack();
                        }}
                    >
                        Back
                    </Button>
                </Stack>
            </Paper>
        </Typography>
    )
}

export default InitAuthzConfiguration;