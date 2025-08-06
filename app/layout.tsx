"use client";
import localFont from "next/font/local";
import "./globals.css";
import { ApolloProvider } from '@apollo/client';
import client from "@/components/apollo-client/apollo-client";
import { usePathname } from 'next/navigation'
import AuthenticationLayout from "@/components/layout/authentication-layout";
import ManagementLayout from "@/components/layout/management-layout";
import { AUTHORIZATION_LAYOUT_PAGES, PROFILE_LAYOUT_PAGES } from "@/utils/consts";
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


const theme = createTheme({    
    components: {
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
                    backgroundColor: "#1976d2"                    
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
                    <PageTitleContextProvider>
                        <ClipboardCopyContextProvider>
                            <AuthenSessionContextProvider>
                                <ApolloProvider client={client}>
                                    {isProfileLayoutPage &&
                                        <ProfilePreProcessorContextProvider>
                                            <TenantContextProvider>
                                                <AuthenticationLayout>{children}</AuthenticationLayout>
                                            </TenantContextProvider>                                            
                                        </ProfilePreProcessorContextProvider>
                                    }
                                    {!isProfileLayoutPage &&
                                        <AuthContextProvider>
                                            <TenantContextProvider>
                                                {isAuthenticationLayoutPage &&                                         
                                                    <AuthenticationLayout>{children}</AuthenticationLayout>                                        
                                                }
                                                {!isAuthenticationLayoutPage &&                                        
                                                    <ManagementTenantFilter>
                                                        <ThemeProvider theme={theme}>
                                                            <ManagementLayout>{children}</ManagementLayout>
                                                        </ThemeProvider>
                                                    </ManagementTenantFilter>                                                                            
                                                }
                                            </TenantContextProvider>
                                        </AuthContextProvider>
                                    }
                                </ApolloProvider>
                            </AuthenSessionContextProvider>
                        </ClipboardCopyContextProvider>
                    </PageTitleContextProvider>
                </ResponsiveContextProvider>                
            </body>
        </html>
    );
}
