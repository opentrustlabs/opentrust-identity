"use client";
import { RateLimitServiceGroup, Tenant, TenantRateLimitRel } from "@/graphql/generated/graphql-types";
import { TENANT_DETAIL_QUERY, TENANT_RATE_LIMIT_REL_QUERY } from "@/graphql/queries/oidc-queries";
import { DEFAULT_RATE_LIMIT_PERIOD_MINUTES } from "@/utils/consts";
import { useQuery } from "@apollo/client";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid2 from "@mui/material/Grid2";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";



export interface TenatRateLimitConfigurationDialogProps {
    existingLimit: number | null,
    existingAllowUnlimited: boolean | null,
    tenantId: string,
    tenant?: Tenant,
    serviceGroupId: string,
    serviceGroup?: RateLimitServiceGroup,
    totalUsed?: number,
    onCancel: () => void,
    onCompleted: (tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null) => void
}


const TenatRateLimitConfigurationDialog: React.FC<TenatRateLimitConfigurationDialogProps> = ({
    existingAllowUnlimited,
    existingLimit,
    tenantId,
    tenant,
    serviceGroupId,
    totalUsed,
    onCancel,
    onCompleted
}) => {

    // STATE VARIABLES    
    const [allowUnlimited, setAllowUnlimited] = React.useState<boolean>(existingAllowUnlimited ? existingAllowUnlimited : false);
    const [limit, setLimit] = React.useState<number | null>(existingLimit || null);
    const [rateLimitPeriodMinutes, setRateLimitPeriodMinutes] = React.useState<number | null>( DEFAULT_RATE_LIMIT_PERIOD_MINUTES);
    const [total, setTotal] = React.useState<number | null>(totalUsed ? totalUsed : null);
    const [tenantDetailData, setTenantDetailData] = React.useState<Tenant | null>(tenant ? tenant : null);

    // GRAPHQL FUNCTIONS
    const { data } = useQuery(TENANT_RATE_LIMIT_REL_QUERY, {
        variables: {
            tenantId: tenantId
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache",
        skip: !(totalUsed === null || totalUsed === undefined),
        onCompleted(data) {
            setTotal(
                getTotalUsed(data.getRateLimitTenantRels)
            )
        },
    });

    const {  } = useQuery(TENANT_DETAIL_QUERY, {
        variables: {
            tenantId: tenantId
        },
        skip: !(tenant === null || tenant === undefined),
        onCompleted(data) {
            setTenantDetailData(data.getTenantById);
        },
    });

    const getTotalUsed = (arr: Array<TenantRateLimitRel>): number => {
        let used: number = 0;
        if (arr && arr.length > 0) {
            arr.forEach(
                (rel: TenantRateLimitRel) => {
                    if (rel.rateLimit) {
                        used = used + rel.rateLimit;
                    }
                }
            )
        }
        return used;
    }

    if(data && tenantDetailData) return (
        <Typography component="div">
            <DialogContent>
                <Grid2 size={12} container spacing={1}>
                    <Grid2 marginBottom={"8px"} size={3} fontWeight={"bold"}>
                        <span style={{ textDecoration: "underline" }}>Tenant: </span>
                    </Grid2>
                    <Grid2 marginBottom={"8px"} size={9} fontWeight={"bold"}>
                        <span>{tenantDetailData.tenantName} </span>
                    </Grid2>                    
                    <Grid2 marginBottom={"0px"} sx={{ textDecoration: "underline" }} size={3} >
                        <span>Total limit:</span>
                    </Grid2>
                    <Grid2 marginBottom={"0px"} size={9} >
                        {tenantDetailData.allowUnlimitedRate &&
                            <span>Unlimited</span>    
                        }
                        {!tenantDetailData.allowUnlimitedRate &&
                            <span>{tenantDetailData.defaultRateLimit}</span>
                        }                                
                    </Grid2>
                    <Grid2 marginBottom={"16px"} sx={{ textDecoration: "underline" }} size={3} >
                        <span>Used to date:</span>
                    </Grid2>
                    <Grid2 marginBottom={"16px"} size={9} >
                        <span>{total || 0}</span>
                    </Grid2>
                    <Grid2 size={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    name="allowUnlimited"
                                    checked={allowUnlimited}
                                    onChange={(_, checked: boolean) => {
                                        setAllowUnlimited(checked);
                                        if (checked) {
                                            setLimit(null);
                                            setRateLimitPeriodMinutes(null);
                                        }
                                        else {
                                            setRateLimitPeriodMinutes(DEFAULT_RATE_LIMIT_PERIOD_MINUTES);
                                        }
                                    }}
                                />
                            }
                            label="Allow unlimited"
                            sx={{ margin: "4px", fontSize: "1.1em", justifyContent: 'space-between', width: '100%' }}
                            labelPlacement="start"
                        />
                    </Grid2>
                    
                    <Grid2 size={12}>Limit</Grid2>
                    <Grid2 size={12} marginBottom={"16px"}>
                        <TextField
                            name="limit"
                            type="number"
                            fullWidth={true}
                            size="small"
                            onChange={(evt) => {
                                if (!tenantDetailData.allowUnlimitedRate && tenantDetailData.defaultRateLimit) {
                                    const used: number = data && data.getRateLimitTenantRels ? getTotalUsed(data.getRateLimitTenantRels) : 0;
                                    let limit: number = 0;
                                    try {
                                        limit = parseInt(evt.target.value)
                                    }
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    catch (err) { limit = 0 }
                                    if ((limit + used) > tenantDetailData.defaultRateLimit) {
                                        setLimit(tenantDetailData.defaultRateLimit - used);
                                    }
                                    else {
                                        setLimit(limit);
                                    }
                                }
                                else {
                                    setLimit(parseInt(evt.target.value));
                                }
                            }}
                            value={limit || ""}
                            disabled={allowUnlimited === true}
                        />
                    </Grid2>
                    <Grid2 size={12}>Rate Limit Period (minutes)</Grid2>
                    <Grid2 size={12}>
                        <TextField
                            name="limitPeriod"
                            type="number"
                            fullWidth={true}
                            size="small"
                            value={rateLimitPeriodMinutes || ""}
                            onChange={(evt) => setRateLimitPeriodMinutes(parseInt(evt.target.value))}
                            disabled={true}
                        />
                    </Grid2>
                </Grid2>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    onCancel()
                }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={() => {                        
                        onCompleted(tenantId, serviceGroupId, allowUnlimited, limit, rateLimitPeriodMinutes);
                    }}
                >
                    Submit
                </Button>
            </DialogActions>
        </Typography>
    )
}

export default TenatRateLimitConfigurationDialog;