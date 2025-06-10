"use client";
import React from "react";
import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';


const RadioStyledCheckbox: React.FC<CheckboxProps> = ({
    ...props
}) => {
    

    return (
        <Checkbox
            icon={<RadioButtonUncheckedOutlinedIcon />}
            checkedIcon={<RadioButtonCheckedIcon />}
            sx={{cursor: "pointer"}}
            {...props}         
        />
    )
}

export default RadioStyledCheckbox;