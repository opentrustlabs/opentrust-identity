"use client";
import { TenantPasswordConfig } from "@/graphql/generated/graphql-types";
import React from "react";

export interface PasswordRulesDisplayProps {
    passwordConfig: TenantPasswordConfig
}

const PasswordRulesDisplay: React.FC<PasswordRulesDisplayProps> = ({
    passwordConfig
}) => {


    return (
        <>
            <div style={{ paddingLeft: "16px", textDecoration: "underline" }}>The following are required for all passwords</div>
            <ul style={{ paddingLeft: "32px", marginBottom: "8px" }}>
                {passwordConfig.requireNumbers &&
                    <li>Numbers</li>
                }
                {passwordConfig.requireSpecialCharacters &&
                    <li>Special Characters: <pre style={{ letterSpacing: "5px" }}>{passwordConfig.specialCharactersAllowed}</pre></li>
                }
                <li>Minimum Length: {passwordConfig.passwordMinLength}</li>
                <li>Maximum Length: {passwordConfig.passwordMaxLength}</li>
                {passwordConfig.maxRepeatingCharacterLength &&
                    <li>Maximum repeating character length: {passwordConfig.maxRepeatingCharacterLength}</li>
                }
                <li>Leading and trailing spaces are not allowed</li>
            </ul>
            {(passwordConfig.requireLowerCase || passwordConfig.requireUpperCase) &&
                <>
                    <div style={{ paddingLeft: "16px", textDecoration: "underline" }}>The following are required for passwords with ASCII characters</div>
                    <ul style={{ paddingLeft: "32px", marginBottom: "8px" }}>
                        {passwordConfig.requireLowerCase &&
                            <li>Lowercase</li>
                        }
                        {passwordConfig.requireUpperCase &&
                            <li>Uppercase</li>
                        }
                    </ul>
                </>
            }
            {!passwordConfig.requireSpecialCharacters &&
                <>
                    {passwordConfig.specialCharactersAllowed &&
                        <>
                            <div style={{ paddingLeft: "16px", textDecoration: "underline" }}>The following special characters are allowed:</div>
                            <div style={{ paddingLeft: "16px", marginBottom: "16px" }}>
                                <pre style={{ letterSpacing: "5px" }}>{passwordConfig.specialCharactersAllowed}</pre>
                            </div>
                        </>
                    }

                </>
            }
        </>
    )
}

export default PasswordRulesDisplay;