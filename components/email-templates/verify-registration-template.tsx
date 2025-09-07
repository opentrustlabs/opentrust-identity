import * as React from 'react';
import { Body, Container, Head, Html, Preview, Text, Row, Column, Section, Button } from '@react-email/components';
import { TenantLookAndFeel } from '@/graphql/generated/graphql-types';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from '@/utils/consts';
import { IntlProvider, useIntl } from "react-intl";
import { DEFAULT_LANGUAGE, messages } from '@/locales/localization-utils';

export interface VerifyRegistrationProps {
    token: string,
    name: string,
    tenantLookAndFeel: TenantLookAndFeel,
    languageCode: string,
    contactEmail?: string
}

export const VerifyRegistration: React.FC<VerifyRegistrationProps> = ({
    token,
    name,
    tenantLookAndFeel,
    languageCode,
    contactEmail
}) => {


    return (
        <IntlProvider locale={languageCode} messages={messages[languageCode]} defaultLocale={DEFAULT_LANGUAGE}>
            <InnerComponent
                token={token}
                name={name}
                tenantLookAndFeel={tenantLookAndFeel}
                contactEmail={contactEmail}
            />
        </IntlProvider>        
    )
}

const InnerComponent: React.FC<{token: string, name: string, tenantLookAndFeel: TenantLookAndFeel, contactEmail?: string}> = ({
    token,
    name,
    tenantLookAndFeel,
    contactEmail
}) => {

    const intl = useIntl();

    const headerStyle = {
        minHeight: "55px",
        padding: "4px 8px",
        backgroundColor: tenantLookAndFeel.authenticationheaderbackgroundcolor || DEFAULT_BACKGROUND_COLOR,
        color: tenantLookAndFeel.authenticationheadertextcolor || DEFAULT_TEXT_COLOR,
        marginBottom: "24px",
        borderBottom: "solid 2px lightgrey",
        borderRadius: "8px"
    }

    return (
        <Html>
            <Head />
            <Preview>{intl.formatMessage({id: "WELCOME"})} {name}</Preview>
            <Body style={{fontFamily: "Arial, sans-serif", fontSize: "16px"}}>
                <Container style={headerStyle}>
                    <Section>
                        <Row dir='row'>
                            {tenantLookAndFeel.authenticationlogo &&
                                <Column>{tenantLookAndFeel.authenticationlogo}</Column>
                            }
                            {tenantLookAndFeel.authenticationlogouri &&
                                <Column><img height={"45px"} src={`${tenantLookAndFeel.authenticationlogouri}`}></img></Column>
                            }
                            
                            {tenantLookAndFeel.authenticationheadertext &&
                                <Column>{tenantLookAndFeel.authenticationheadertext}</Column>
                            }
                        </Row>
                    </Section>                    
                </Container>
                <Container style={{marginBottom: "24px"}}>
                    <Text>
                        {intl.formatMessage({id: "USE_THE_FOLLOWING_CODE_TO_CONFIRM_YOUR_EMAIL"})}
                    </Text>
                    <Text>
                        <pre>{token}</pre>
                    </Text>
                </Container>
                <Container style={{marginBottom: "24px"}}>                    
                    <Text>
                        {intl.formatMessage({id: "UNAUTHORIZED_REGISTRATION"})}
                    </Text>
                    
                </Container>                
                {contactEmail &&
                    <Container style={{marginBottom: "24px"}}>
                        <Button
                            href={`mailto:${contactEmail}?subject=Unauthorized Account Registration`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: "8px 16px",
                                backgroundColor: tenantLookAndFeel.authenticationheaderbackgroundcolor || DEFAULT_BACKGROUND_COLOR,
                                color: tenantLookAndFeel.authenticationheadertextcolor || DEFAULT_TEXT_COLOR,
                                borderRadius: "8px",
                                border: "solid 1px lightgrey"
                            }}
                        >
                            {intl.formatMessage({id: "REPORT_UNAUTHORIZED_REGISTRATION"})}
                        </Button>
                    </Container>
                }
            </Body>
        </Html>
    )
}

