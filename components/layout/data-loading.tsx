"use client";
import { Box, CircularProgress } from "@mui/material";
import React from "react";


export type DataLoadingSizeType = "full-page" | "xl" | "lg" | "md" | "sm" | "xs";

export interface DataLoadingProps {
    dataLoadingSize: DataLoadingSizeType,
    color: string | null
}


const DataLoading: React.FC<DataLoadingProps> = ({
    dataLoadingSize,
    color
}) => {

    let height = "86vh"; // default is full page height
    let circularProgressSize = "40px"; // default for full page down to md
    switch (dataLoadingSize) {
        case "lg" : {
            height = "70vh";
            break;
        }
        case "md" : {
            height = "60vh";
            break;
        }
        case "sm" : {
            height = "30vh";
            circularProgressSize = "30px";
            break;
        }
        case "xs" : {
            height = "15vh";
            circularProgressSize = "20px";
            break;
        }
    }

    
    
    
    return (
        <Box display={"flex"} height={height} justifyContent={"center"} alignItems={"center"}>
            <CircularProgress   size={circularProgressSize}   />                
        </Box>
    )

}

export default DataLoading;