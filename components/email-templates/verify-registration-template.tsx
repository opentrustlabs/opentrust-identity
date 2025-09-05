import * as React from 'react';
import { Body, Container, Head, Html, Preview, Text, Row, Column, Section } from '@react-email/components';
import { TenantLookAndFeel } from '@/graphql/generated/graphql-types';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from '@/utils/consts';





export interface VerifyRegistrationProps {
    token: string,
    name: string,
    tenantLookAndFeel: TenantLookAndFeel,
    contactEmail?: string
}

export const VerifyRegistration: React.FC<VerifyRegistrationProps> = ({
    token,
    name,
    tenantLookAndFeel,
    contactEmail
}) => {

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
            <Preview>Welcome {name}</Preview>
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
                        Use the following code to confirm your email address:
                    </Text>
                    <Text>
                        <pre>{token}</pre>
                    </Text>
                </Container>
                <Container style={{marginBottom: "24px"}}>
                    {contactEmail &&
                        <Text>
                            <span>If you did not register this email address, please </span><a href={`mailto:${contactEmail}?subject=Unauthorized Account Registration`}>report it</a>
                        </Text>
                    }
                </Container>
            </Body>
        </Html>
    )
}

