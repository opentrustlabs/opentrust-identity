"use client";
import localFont from "next/font/local";
import "./globals.css";
import { ApolloProvider } from '@apollo/client';
import client from "@/components/apollo-client/apollo-client";
import { usePathname } from 'next/navigation'
import AuthenticationLayout from "@/components/layout/authentication-layout";
import ManagementLayout from "@/components/layout/management-layout";
import { AUTHORIZATION_LAYOUT_PAGES, DEFAULT_BACKGROUND_COLOR, PROFILE_LAYOUT_PAGES } from "@/utils/consts";
import PageTitleContextProvider from "@/components/contexts/page-title-context";
import AuthContextProvider from "@/components/contexts/auth-context";
import ResponsiveContextProvider from "@/components/contexts/responsive-context";
import TenantContextProvider from "@/components/contexts/tenant-context";
import ManagementTenantFilter from "@/components/contexts/management-tenant-filter";
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { ClipboardCopyContextProvider } from "@/components/contexts/clipboard-copy-context";
import { AuthenSessionContextProvider } from "@/components/contexts/auth-session-context";
import ProfilePreProcessorContextProvider from "@/components/contexts/my-profile-preprocessor";
import { InternationalizationContextProvider } from "@/components/contexts/internationalization-context";


const theme = createTheme({    
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                    },
                    '& .MuiFilledInput-root': {
                        borderRadius: '16px 16px 0 0',
                    }
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 2,
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                inputRoot: {
                    borderRadius: 2,
                }
            }
        },
        MuiButton: {
            defaultProps: {
                
            },            
            styleOverrides: {
                root: {
                    "&:disabled": {
                        color: "white",
                        backgroundColor: "lightgrey"
                    },
                    variants: [
                        {

                        }
                    ],
                    color: "white",
                    backgroundColor: DEFAULT_BACKGROUND_COLOR
                }                
            }
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    "&.Mui-checked": {
                        color: `${DEFAULT_BACKGROUND_COLOR} !important`
                    }
                }
            }
        },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    // Controls the thumb (circle) color when checked
                    "&.Mui-checked": {
                        color: DEFAULT_BACKGROUND_COLOR,
                    },
                    // Controls the track color when checked
                    "&.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: `${DEFAULT_BACKGROUND_COLOR} !important`,
                        opacity: 0.5,
                    }
                },
                track: {
                    // Default unchecked track styling is fine
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    // Focused
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: DEFAULT_BACKGROUND_COLOR,
                    }
                }
            }
        },
        MuiAccordion: {
            styleOverrides: {
                heading: {
                    backgroundColor: "#f8f8f8"
                }                
            }
        },
        MuiAccordionSummary: {           
            styleOverrides: { 
                root: {
                    backgroundColor: "#f8f8f8"                    
                },
                content: {
                    backgroundColor: "#f8f8f8"
                }
            }
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontSize: "0.9em"
                }
            },
            defaultProps: {                
                fontSize: "0.9em"
            }
        }
    },
    typography: {        
      fontSize: 12
    },
  });

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {



    const pathName = usePathname();
    const isAuthenticationLayoutPage: boolean = AUTHORIZATION_LAYOUT_PAGES.includes(pathName || "");
    const isProfileLayoutPage: boolean = PROFILE_LAYOUT_PAGES.includes(pathName || "");
    

    return (
        <html lang="en">
            <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
                <ResponsiveContextProvider>
                    <InternationalizationContextProvider>
                        <PageTitleContextProvider>
                            <ClipboardCopyContextProvider>
                                <AuthenSessionContextProvider>
                                    <ApolloProvider client={client}>                                        
                                        <AuthContextProvider>
                                            <TenantContextProvider>
                                                {isProfileLayoutPage &&
                                                    <ProfilePreProcessorContextProvider>
                                                        <AuthenticationLayout>{children}</AuthenticationLayout>
                                                    </ProfilePreProcessorContextProvider>
                                                }
                                                {!isProfileLayoutPage && isAuthenticationLayoutPage &&                                                         
                                                    <AuthenticationLayout>{children}</AuthenticationLayout>                                                        
                                                }
                                                {!isProfileLayoutPage && !isAuthenticationLayoutPage &&
                                                    <ManagementTenantFilter>
                                                        <ThemeProvider theme={theme}>
                                                            <ManagementLayout>{children}</ManagementLayout>
                                                        </ThemeProvider>
                                                    </ManagementTenantFilter>                                                                            
                                                }
                                            </TenantContextProvider>
                                        </AuthContextProvider>                                        
                                    </ApolloProvider>
                                </AuthenSessionContextProvider>
                            </ClipboardCopyContextProvider>
                        </PageTitleContextProvider>
                    </InternationalizationContextProvider>
                </ResponsiveContextProvider>                
            </body>
        </html>
    );
}
