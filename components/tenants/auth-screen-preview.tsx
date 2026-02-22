"use client";
import React from "react";
import { TenantLookAndFeelInput } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR, IMAGE_PANEL_LEFT, LAYOUT_TYPE_TWO_COLUMN, LOGO_HEADER_POSITION_CENTER, LOGO_HEADER_POSITION_RIGHT } from "@/utils/consts";

export interface AuthScreenPreviewProps {
    config: TenantLookAndFeelInput;
    width?: string | number;
    mobile?: boolean;
}

const AuthScreenPreview: React.FC<AuthScreenPreviewProps> = ({ config, width = "100%", mobile = false }) => {

    const headerBg = config.headerbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
    const headerTextColor = config.headertextcolor || DEFAULT_TEXT_COLOR;
    const buttonBg = config.buttonbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
    const buttonText = config.buttontextcolor || "white";
    const buttonRadius = config.buttonborderradius || "4px";
    const inputBorder = config.inputbordercolor || "#c4c4c4";
    const pageBg = config.pagebackgroundcolor || "#f5f5f5";
    const footerBg = config.footerbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
    const footerTextColor = config.footertextcolor || "white";
    const linkColor = config.linkcolor || buttonBg;
    const logoPosition = config.headerlogoposition || "LEFT";
    const isTwoColumn = !mobile && config.layouttype === LAYOUT_TYPE_TWO_COLUMN;
    const marketingOnLeft = (config.imagepanelposition || IMAGE_PANEL_LEFT) === IMAGE_PANEL_LEFT;

    const headerJustify =
        logoPosition === LOGO_HEADER_POSITION_CENTER ? "center" :
        logoPosition === LOGO_HEADER_POSITION_RIGHT ? "flex-end" : "flex-start";

    const loginCardContent = (
        <>
            <div style={{ fontWeight: 600, fontSize: "1.2em", marginBottom: 20, color: "#333" }}>
                Sign In
            </div>
            {/* Email field */}
            <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: "0.75em", color: "#666", marginBottom: 4 }}>Email</div>
                <div style={{
                    border: `1px solid ${inputBorder}`,
                    borderRadius: "4px",
                    padding: "8px 10px",
                    fontSize: "0.8em",
                    color: "#999",
                    backgroundColor: "#fafafa"
                }}>
                    user@example.com
                </div>
            </div>
            {/* Password field */}
            <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: "0.75em", color: "#666", marginBottom: 4 }}>Password</div>
                <div style={{
                    border: `1px solid ${inputBorder}`,
                    borderRadius: "4px",
                    padding: "8px 10px",
                    fontSize: "0.8em",
                    color: "#999",
                    backgroundColor: "#fafafa"
                }}>
                    ••••••••
                </div>
            </div>
            {/* Forgot password link */}
            <div style={{ marginBottom: 18, textAlign: "right" }}>
                <span style={{ fontSize: "0.7em", color: linkColor, cursor: "default" }}>
                    Forgot password?
                </span>
            </div>
            {/* Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
                <div style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "8px 16px",
                    backgroundColor: "#e0e0e0",
                    color: "#555",
                    borderRadius: buttonRadius,
                    fontSize: "0.8em",
                    fontWeight: 600
                }}>
                    Cancel
                </div>
                <div style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "8px 16px",
                    backgroundColor: buttonBg,
                    color: buttonText,
                    borderRadius: buttonRadius,
                    fontSize: "0.8em",
                    fontWeight: 600
                }}>
                    Sign In
                </div>
            </div>
        </>
    );

    const loginCard = (
        <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            padding: "32px 28px",
            maxWidth: 360,
            width: "100%",
            boxSizing: "border-box"
        }}>
            {loginCardContent}
        </div>
    );

    const marketingPanel = (
        <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: pageBg,
            minHeight: 200
        }}>
            {config.marketingimageuri && (
                <img
                    src={config.marketingimageuri}
                    alt="Marketing"
                    style={{ maxWidth: "80%", maxHeight: 180, objectFit: "contain", marginBottom: 12 }}
                />
            )}
            {config.marketingtext && (
                <div style={{ fontSize: "0.85em", color: "#444", textAlign: "center", lineHeight: 1.4 }}>
                    {config.marketingtext}
                </div>
            )}
            {!config.marketingimageuri && !config.marketingtext && (
                <div style={{ fontSize: "0.8em", color: "#aaa", fontStyle: "italic" }}>
                    Marketing Panel
                </div>
            )}
        </div>
    );

    return (
        <div style={{
            width: typeof width === "number" ? `${width}px` : width,
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            overflow: "hidden",
            fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            fontSize: "14px",
            boxSizing: "border-box"
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: headerBg,
                color: headerTextColor,
                padding: "0 16px",
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: headerJustify,
                gap: 12
            }}>
                {config.logouri && (
                    <img
                        src={config.logouri}
                        alt="Logo"
                        style={{ height: 32, objectFit: "contain" }}
                    />
                )}
                {config.headertext && (
                    <span style={{ fontWeight: 600, fontSize: "0.95em" }}>
                        {config.headertext}
                    </span>
                )}
                {!config.logouri && !config.headertext && (
                    <span style={{ fontWeight: 600, fontSize: "0.95em", opacity: 0.7 }}>
                        Header
                    </span>
                )}
            </div>

            {/* Content area */}
            <div style={{
                backgroundColor: pageBg,
                minHeight: 380,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 16px"
            }}>
                {isTwoColumn ? (
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        display: "flex",
                        flexDirection: "row",
                        overflow: "hidden",
                        maxWidth: 700,
                        width: "100%"
                    }}>
                        {marketingOnLeft && marketingPanel}
                        <div style={{
                            flex: 1,
                            padding: "32px 28px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center"
                        }}>
                            {loginCardContent}
                        </div>
                        {!marketingOnLeft && marketingPanel}
                    </div>
                ) : (
                    loginCard
                )}
            </div>

            {/* Footer */}
            <div style={{
                backgroundColor: footerBg,
                color: footerTextColor,
                padding: "8px 16px",
                minHeight: 32,
                display: "flex",
                alignItems: "center",
                fontSize: "0.75em",
                gap: 16
            }}>
                {config.footerlinks && config.footerlinks.length > 0 ? (
                    config.footerlinks.map((link, idx) => (
                        <span key={idx} style={{ textDecoration: "underline", cursor: "default" }}>
                            {link?.linktext || "Link"}
                        </span>
                    ))
                ) : (
                    <span style={{ opacity: 0.6 }}>Footer</span>
                )}
            </div>
        </div>
    );
};

export default AuthScreenPreview;
