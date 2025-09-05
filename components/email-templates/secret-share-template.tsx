import * as React from 'react';
import { Body, Container, Head, Html, Preview, Text, Row, Column, Section, Button } from '@react-email/components';
import { TenantLookAndFeel } from '@/graphql/generated/graphql-types';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from '@/utils/consts';



export interface SecretShareProps {
    url: string,    
    tenantLookAndFeel: TenantLookAndFeel    
}

export const SecretShare: React.FC<SecretShareProps> = ({
    url,
    tenantLookAndFeel    
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
            <Preview>Enter your secret</Preview>
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
                        Click the link below to enter the secret value:
                    </Text>
                </Container>
                <Container style={{marginBottom: "24px"}}>
                    <Button
                        href={url}
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
                        Enter secret
                    </Button>
                </Container>
            </Body>
        </Html>
    )
}

