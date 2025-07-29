"use client";
import { CategoryEntry, SystemCategory, SystemSettings } from "@/graphql/generated/graphql-types";
import { Button, Checkbox, Grid2, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { DetailPageContainer, DetailPageMainContentContainer } from "../layout/detail-page-container";

export interface SystemSettingsDetailProps {
    systemSettings: SystemSettings
}

const SystemSettingsDetail: React.FC<SystemSettingsDetailProps> = ({
    systemSettings
}) => {

    const categoriesMidpoint = Math.floor(systemSettings.systemCategories.length / 2);

    return (
        <Typography component={"div"}>
            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" alignItems={"center"} sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} container size={12}>
                            <Grid2 size={12}>System Settings</Grid2>
                        </Grid2>
                    </Grid2>
                    <Grid2 container spacing={1} >
                        <Grid2 marginTop={"8px"} size={{ sm: 12, md: 6 }}>
                            <Paper sx={{ padding: "8px", marginTop: "16px" }} elevation={2}>
                                <Grid2 alignItems={"stretch"} container size={12} spacing={1}>
                                    <Grid2 size={11}>
                                        Software version:
                                    </Grid2>
                                    <Grid2 size={1}>
                                        {systemSettings.softwareVersion}
                                    </Grid2>
                                    <Grid2 size={11}>
                                        Allow backup emails
                                    </Grid2>
                                    <Grid2 size={1}>
                                        <Checkbox
                                            sx={{ height: "25px", width: "25px" }}
                                            value={systemSettings.allowBackupEmail}
                                        />
                                    </Grid2>
                                    <Grid2 size={11}>
                                        Allow duress passwords:
                                    </Grid2>
                                    <Grid2 size={1}>
                                        <Checkbox
                                            sx={{ height: "25px", width: "25px" }}
                                            value={systemSettings.allowDuressPassword}
                                        />
                                    </Grid2>
                                    <Stack
                                        marginTop={"8px"}
                                        width={"100%"}
                                        direction={"row-reverse"}
                                    >
                                        <Button>Update</Button>
                                    </Stack>
                                </Grid2>
                            </Paper>
                            {systemSettings.systemCategories.slice(0, categoriesMidpoint).map(
                                (systemCategory: SystemCategory) => (
                                    <Paper sx={{ padding: "8px", marginTop: "16px" }} elevation={2} key={systemCategory.categoryName}>
                                        <Grid2 sx={{ textDecoration: "underline" }} size={12} fontWeight={"bold"}>
                                            {systemCategory.categoryName}
                                        </Grid2>
                                        {systemCategory.categoryEntries.map(
                                            (categoryEntry: CategoryEntry) => (
                                                <Grid2 size={12} paddingTop={"4px"} container key={categoryEntry.categoryKey}>
                                                    <Grid2 size={6}>
                                                        {categoryEntry.categoryKey}
                                                    </Grid2>
                                                    <Grid2 size={6}>
                                                        {categoryEntry.categoryValue}
                                                    </Grid2>
                                                </Grid2>
                                            )
                                        )}
                                    </Paper>
                                )
                            )}
                        </Grid2>
                    
                        <Grid2 marginTop={"8px"} size={{ sm: 6, md: 6 }}>
                            {systemSettings.systemCategories.slice(categoriesMidpoint).map(
                                (systemCategory: SystemCategory) => (                                
                                    <Paper sx={{ padding: "8px", marginTop: "16px"}} elevation={2} key={systemCategory.categoryName}>
                                        <Grid2 sx={{ textDecoration: "underline" }} size={12} fontWeight={"bold"}>
                                            {systemCategory.categoryName}
                                        </Grid2>
                                        {systemCategory.categoryEntries.map(
                                            (categoryEntry: CategoryEntry) => (
                                                <Grid2 size={12} paddingTop={"4px"} container key={categoryEntry.categoryKey}>
                                                    <Grid2 size={6}>
                                                        {categoryEntry.categoryKey}
                                                    </Grid2>
                                                    <Grid2 size={6}>
                                                        {categoryEntry.categoryValue}
                                                    </Grid2>
                                                </Grid2>
                                            )
                                        )}
                                    </Paper>
                                )
                            )}
                        </Grid2>
                    </Grid2>
                </DetailPageMainContentContainer>
            </DetailPageContainer>
        </Typography>
    )
}

export default SystemSettingsDetail;