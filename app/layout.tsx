"use client";
//import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ApolloProvider } from '@apollo/client';
import client from "@/components/apollo-client/apollo-client";
import { usePathname } from 'next/navigation'
import AuthenticationLayout from "@/components/layout/authentication-layout";
import ManagementLayout from "@/components/layout/management-layout";
import { AUTHENTICATION_LAYOUT_PAGES } from "@/utils/consts";
import PageTitleContextProvider from "@/components/contexts/page-title-context";
import AuthContextProvider from "@/components/contexts/auth-context";
import ResponsiveContextProvider from "@/components/contexts/responsive-context";
import TenantContextProvider from "@/components/contexts/tenant-context";
import ManagementTenantFilter from "@/components/contexts/management-tenant-filter";
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';

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
                },
                
            }

        },
        MuiAccordion: {
            styleOverrides: {
                heading: {
                    backgroundColor: "#f8f8f8",
                    
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
    const isAuthenticationLayoutPage: boolean = AUTHENTICATION_LAYOUT_PAGES.includes(pathName || "");

    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <ApolloProvider client={client}>
                    <ResponsiveContextProvider>
                        <PageTitleContextProvider>
                            {isAuthenticationLayoutPage &&
                                <AuthenticationLayout>{children}</AuthenticationLayout>
                            }
                            {!isAuthenticationLayoutPage &&
                                <AuthContextProvider>
                                    <TenantContextProvider>
                                        <ManagementTenantFilter>
                                            <ThemeProvider theme={theme}>
                                                <ManagementLayout>{children}</ManagementLayout>
                                            </ThemeProvider>
                                        </ManagementTenantFilter>
                                    </TenantContextProvider>
                                </AuthContextProvider>
                            }
                        </PageTitleContextProvider>
                    </ResponsiveContextProvider>
                </ApolloProvider>
            </body>
        </html>
    );
}
