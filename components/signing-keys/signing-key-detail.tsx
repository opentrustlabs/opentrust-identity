"use client";
import { SigningKey } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import React, { useContext } from "react";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import { TENANT_TYPE_ROOT_TENANT, NAME_ORDER_WESTERN } from "@/utils/consts";
import { Grid2, Paper, TextField } from "@mui/material";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";


export interface SigningKeyDetailProps {
    signingKey: SigningKey
}
const SigningKeyDetail: React.FC<SigningKeyDetailProps> = ({ signingKey }) => {

    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={[
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
                    linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
                },
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=signing-keys`,
                    linkText: "Signing Keys"
                },
                {
                    href: null,
                    linkText: signingKey.keyName
                }
            ]} />

            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2
                            className="detail-page-subheader"
                            sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }}
                            fontWeight={"bold"}
                            size={12}
                        >
                            Overview
                        </Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={1}>
                                <Grid2 container size={12} spacing={2}>                                    
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Key Name / Alias</div>
                                            <TextField name="keyName" id="keyName" value={""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Key Use</div>
                                            <TextField name="tenantDescription" id="tenantDescription" value={""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Key Type</div>
                                            <TextField name="tenantDescription" id="tenantDescription" value={""} fullWidth={true} size="small" />
                                        </Grid2>                                        
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Status</div>
                                            <TextField name="keyName" id="keyName" value={""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Expires</div>
                                            <TextField name="tenantDescription" id="tenantDescription" value={""} fullWidth={true} size="small" />
                                        </Grid2>                                       
                                    </Grid2>
                                </Grid2>
                            </Paper>
                        </Grid2>
                        <div>{JSON.stringify(signingKey)}</div>


                    </Grid2>
                </DetailPageMainContentContainer>
                <DetailPageRightNavContainer><div></div></DetailPageRightNavContainer>


            </DetailPageContainer>
        </Typography>
    )

}

export default SigningKeyDetail;