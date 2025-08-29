"use client";
import Container from "@mui/material/Container";
import Grid2 from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import React from "react";

const LandingPage: React.FC = () => {


    return (
        <Grid2
            container
            spacing={0}
            alignItems={"center"}
            justifyContent={"center"}
            sx={{ minHeight: "90vh" }}
        >

            <Grid2>
                <Paper
                    elevation={4}
                    sx={{ padding: 2, height: "100%", maxWidth: "650px", width: "650px" }}
                >
                    <div>Welcome</div>
                </Paper>
            </Grid2>
        </Grid2>
    )
}


export default LandingPage;