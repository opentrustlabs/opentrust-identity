import * as React from 'react';
import { Body, Container, Head, Html, Preview, Text, Row, Column, Section, Button } from '@react-email/components';
import { TenantLookAndFeel } from '@/graphql/generated/graphql-types';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from '@/utils/consts';
import { IntlProvider, useIntl } from "react-intl";
import { DEFAULT_LANGUAGE, messages } from '@/locales/localization-utils';


export interface SecretShareProps {
    url: string,    
    tenantLookAndFeel: TenantLookAndFeel,
    languageCode: string
}

export const SecretShare: React.FC<SecretShareProps> = ({
    url,
    tenantLookAndFeel,
    languageCode
}) => {

    return (
        <IntlProvider locale={languageCode} messages={messages[languageCode]} defaultLocale={DEFAULT_LANGUAGE}>
            <InnerComponent
                url={url}
                tenantLookAndFeel={tenantLookAndFeel}
            />
        </IntlProvider>
    )
}

const InnerComponent: React.FC<{url: string, tenantLookAndFeel: TenantLookAndFeel}> = ({
    url,
    tenantLookAndFeel
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
            <Preview>{intl.formatMessage({id: "ENTER_SECRET"})}</Preview>
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
                        {intl.formatMessage({id: "CLICK_LINK_TO_ENTER_SECRET_VALUE"})}
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
                        {intl.formatMessage({id: "ENTER_SECRET"})}
                    </Button>
                </Container>
            </Body>
        </Html>
    )
}

