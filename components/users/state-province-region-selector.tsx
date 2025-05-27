"use client";
import { StateProvinceRegion } from "@/graphql/generated/graphql-types";
import { STATE_PROVINCE_REGIONS_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import React from "react";

interface StateProvinceRegionSelectorProps {
    countryCode?: string
    initValue?: string,
    isDisabled: boolean,
    onChange: (stateProvinceRegion: StateProvinceRegion | null) => void
}

const StateProvinceRegionSelector: React.FC<StateProvinceRegionSelectorProps> = ({
    countryCode,
    initValue,
    isDisabled,
    onChange
}) => {

    // STATE VARIABLES
    const [stateProvinceRegion, setStateProvinceRegion] = React.useState({id: initValue || "", label: ""});

    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(STATE_PROVINCE_REGIONS_QUERY, {
        variables: {
            countryCode: countryCode
        },
        onCompleted(data) {
            setStateProvinceRegion(getInitValue(data.getStateProvinceRegions));
        }
    });

    // HANDLER FUNCTIONS
    const getInitValue = (stateProvinceRegions: Array<StateProvinceRegion>) => {        
        let v = {id: "", label: ""};
        if(initValue){
            const stateProvinceRegion: StateProvinceRegion | undefined = stateProvinceRegions.find(
                (s: StateProvinceRegion) => s.isoEntryCode === initValue
            );
            if(stateProvinceRegion){
                v = {id: stateProvinceRegion.isoEntryCode, label: stateProvinceRegion.isoEntryName}
            }
        }
        return v;        
    }

    return (
        <React.Fragment>
            {error &&
                <Alert severity="error" >{error.message}</Alert>
            }            
            <Autocomplete
                disabled={isDisabled}
                id="stateProvinceRegion"                                                
                sx={{paddingTop: "8px"}}
                size="small"
                freeSolo={true}
                renderInput={(params) => <TextField {...params} label="" />}
                options={
                    loading ? [] : 
                    data && data.getStateProvinceRegions === null ? [] :
                    [{isoEntryCode: "", isoEntryName: ""}, ...data.getStateProvinceRegions].map(
                        (stateProvinceRegion: StateProvinceRegion) => {
                            return {id: stateProvinceRegion.isoEntryCode, label: stateProvinceRegion.isoEntryName}
                        }
                    )
                }                        
                value={data && data.getStateProvinceRegions ? getInitValue(data.getStateProvinceRegions) : stateProvinceRegion}
                onChange={ (_, value: any) => {      
                    setStateProvinceRegion(value || {id: "", label: ""});
                    if(value){
                        const stateProvinceRegion: StateProvinceRegion | undefined = data.getStateProvinceRegions.find(
                            (s: StateProvinceRegion) => s.isoEntryCode === value.id                        
                        )
                        if((stateProvinceRegion)){
                            onChange(stateProvinceRegion);
                        }
                    }
                    else{
                        onChange(null);
                    }
                }}                        
            />             
        </React.Fragment>
    )

}

export default StateProvinceRegionSelector;

 