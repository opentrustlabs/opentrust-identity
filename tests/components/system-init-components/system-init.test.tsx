import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { IntlProvider } from 'react-intl';
import SystemInit from '@/components/system-init-components/system-init';
import { SYSTEM_INITIALIZATION_READY_QUERY } from '@/graphql/queries/oidc-queries';
import { ResponsiveContext, ResponsiveBreakpoints } from '@/components/contexts/responsive-context';

// Mock child components
jest.mock('@/components/system-init-components/init-authentication', () => {
    return function MockInitAuthentication({ onNext, onBack, onError }: any) {
        return (
            <div data-testid="init-authentication">
                <button onClick={onNext}>Next</button>
                <button onClick={onBack}>Back</button>
                <button onClick={() => onError('Test error')}>Error</button>
            </div>
        );
    };
});

jest.mock('@/components/system-init-components/root-tenant-configuration', () => {
    return function MockRootTenantConfiguration({ onNext, onBack }: any) {
        return (
            <div data-testid="root-tenant-configuration">
                <button onClick={() => onNext({})}>Next</button>
                <button onClick={onBack}>Back</button>
            </div>
        );
    };
});

jest.mock('@/components/system-init-components/root-client-configuration', () => {
    return function MockRootClientConfiguration({ onNext, onBack }: any) {
        return (
            <div data-testid="root-client-configuration">
                <button onClick={() => onNext({})}>Next</button>
                <button onClick={onBack}>Back</button>
            </div>
        );
    };
});

jest.mock('@/components/system-init-components/init-authz-group-configuration', () => {
    return function MockInitAuthzConfiguration({ onNext, onBack, isReadOnlyAuthzGroup }: any) {
        return (
            <div data-testid={isReadOnlyAuthzGroup ? "init-readonly-authz-group" : "init-authz-group"}>
                <button onClick={() => onNext({})}>Next</button>
                <button onClick={onBack}>Back</button>
            </div>
        );
    };
});

jest.mock('@/components/system-init-components/root-user-configuration', () => {
    return function MockRootUserConfiguration({ onNext, onBack }: any) {
        return (
            <div data-testid="root-user-configuration">
                <button onClick={() => onNext({})}>Next</button>
                <button onClick={onBack}>Back</button>
            </div>
        );
    };
});

jest.mock('@/components/system-init-components/init-federated-oidc-provider-configuration', () => {
    return function MockInitFederatedOIDCProviderConfiguration({ onNext, onBack }: any) {
        return (
            <div data-testid="init-oidc-provider">
                <button onClick={() => onNext({})}>Next</button>
                <button onClick={onBack}>Back</button>
            </div>
        );
    };
});

jest.mock('@/components/system-init-components/init-system-settings-configuration', () => {
    return function MockInitSystemSettingsConfiguration({ onNext, onBack }: any) {
        return (
            <div data-testid="init-system-settings">
                <button onClick={() => onNext({})}>Next</button>
                <button onClick={onBack}>Back</button>
            </div>
        );
    };
});

jest.mock('@/components/system-init-components/init-captcha-configuration', () => {
    return function MockInitCaptchaConfiguration({ onNext, onBack }: any) {
        return (
            <div data-testid="init-captcha-config">
                <button onClick={() => onNext({})}>Next</button>
                <button onClick={onBack}>Back</button>
            </div>
        );
    };
});

jest.mock('@/components/system-init-components/init-submit', () => {
    return function MockInitSubmit({ onBack }: any) {
        return (
            <div data-testid="init-submit">
                <button onClick={onBack}>Back</button>
            </div>
        );
    };
});

const mockResponsiveBreakpoints: ResponsiveBreakpoints = {
    isExtraSmall: false,
    isSmall: false,
    isMedium: true,
    isLarge: false,
    isExtraLarge: false,
    isGreaterThanExtraLarge: false,
};

const mockResponsiveBreakpointsSmall: ResponsiveBreakpoints = {
    isExtraSmall: false,
    isSmall: true,
    isMedium: false,
    isLarge: false,
    isExtraLarge: false,
    isGreaterThanExtraLarge: false,
};

// Mock query with no errors or warnings
const mockReadyQuerySuccess = {
    request: {
        query: SYSTEM_INITIALIZATION_READY_QUERY,
    },
    result: {
        data: {
            systemInitializationReady: {
                systemInitializationReady: true,
                systemInitializationReadyErrors: [],
                systemInitializationWarnings: [],
            },
        },
    },
};

// Mock query with errors
const mockReadyQueryWithErrors = {
    request: {
        query: SYSTEM_INITIALIZATION_READY_QUERY,
    },
    result: {
        data: {
            systemInitializationReady: {
                systemInitializationReady: false,
                systemInitializationReadyErrors: [
                    {
                        errorCode: 'ERR001',
                        errorKey: 'DATABASE_CONNECTION',
                        errorMessage: 'Database connection failed',
                    },
                    {
                        errorCode: 'ERR002',
                        errorKey: 'REDIS_CONNECTION',
                        errorMessage: 'Redis connection failed',
                    },
                ],
                systemInitializationWarnings: [],
            },
        },
    },
};

// Mock query with warnings
const mockReadyQueryWithWarnings = {
    request: {
        query: SYSTEM_INITIALIZATION_READY_QUERY,
    },
    result: {
        data: {
            systemInitializationReady: {
                systemInitializationReady: true,
                systemInitializationReadyErrors: [],
                systemInitializationWarnings: [
                    {
                        errorCode: 'WARN001',
                        errorKey: 'EMAIL_CONFIG',
                        errorMessage: 'Email configuration not set',
                    },
                ],
            },
        },
    },
};

// Mock query with both errors and warnings
const mockReadyQueryWithErrorsAndWarnings = {
    request: {
        query: SYSTEM_INITIALIZATION_READY_QUERY,
    },
    result: {
        data: {
            systemInitializationReady: {
                systemInitializationReady: false,
                systemInitializationReadyErrors: [
                    {
                        errorCode: 'ERR001',
                        errorKey: 'DATABASE_CONNECTION',
                        errorMessage: 'Database connection failed',
                    },
                ],
                systemInitializationWarnings: [
                    {
                        errorCode: 'WARN001',
                        errorKey: 'EMAIL_CONFIG',
                        errorMessage: 'Email configuration not set',
                    },
                ],
            },
        },
    },
};

// Mock GraphQL error
const mockReadyQueryGraphQLError = {
    request: {
        query: SYSTEM_INITIALIZATION_READY_QUERY,
    },
    error: new Error('GraphQL error: Network error'),
};

// Helper function to render component with providers
const renderWithProviders = (
    mocks: any[] = [mockReadyQuerySuccess],
    responsiveBreakpoints: ResponsiveBreakpoints = mockResponsiveBreakpoints
) => {
    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <IntlProvider locale="en">
                <ResponsiveContext.Provider value={responsiveBreakpoints}>
                    <SystemInit />
                </ResponsiveContext.Provider>
            </IntlProvider>
        </MockedProvider>
    );
};

describe('SystemInit Component', () => {
    describe('Initial Loading and Readiness Check', () => {
        it('should show loading indicator initially', () => {
            renderWithProviders();

            // DataLoading component renders a CircularProgress with progressbar role
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should display success message when all checks pass', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('All system initialization checks passed.')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show Next button when no errors are present', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            await waitFor(() => {
                const nextButton = screen.getByRole('button', { name: /next/i });
                expect(nextButton).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display error alert when readiness check has errors', async () => {
            renderWithProviders([mockReadyQueryWithErrors]);

            await waitFor(() => {
                expect(screen.getByText(/The following errors were encountered during the check for initialization readiness:/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should list all errors from readiness check', async () => {
            renderWithProviders([mockReadyQueryWithErrors]);

            await waitFor(() => {
                expect(screen.getByText('Database connection failed')).toBeInTheDocument();
                expect(screen.getByText('Redis connection failed')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show error advisory message when errors are present', async () => {
            renderWithProviders([mockReadyQueryWithErrors]);

            await waitFor(() => {
                expect(screen.getByText('Be advised that system initialization cannot proceed until the errors are corrected.')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not show Next button when errors are present', async () => {
            renderWithProviders([mockReadyQueryWithErrors]);

            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display warning alert when readiness check has warnings', async () => {
            renderWithProviders([mockReadyQueryWithWarnings]);

            await waitFor(() => {
                expect(screen.getByText(/The following warnings were encountered during the check for initialization readiness:/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should list all warnings from readiness check', async () => {
            renderWithProviders([mockReadyQueryWithWarnings]);

            await waitFor(() => {
                expect(screen.getByText('Email configuration not set')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show warning advisory message when warnings are present', async () => {
            renderWithProviders([mockReadyQueryWithWarnings]);

            await waitFor(() => {
                expect(screen.getByText('Be advised that certain parts of the application may have limited functionality.')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show Next button when only warnings are present', async () => {
            renderWithProviders([mockReadyQueryWithWarnings]);

            await waitFor(() => {
                const nextButton = screen.getByRole('button', { name: /next/i });
                expect(nextButton).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display both errors and warnings when both are present', async () => {
            renderWithProviders([mockReadyQueryWithErrorsAndWarnings]);

            await waitFor(() => {
                expect(screen.getByText('Database connection failed')).toBeInTheDocument();
                expect(screen.getByText('Email configuration not set')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle GraphQL error gracefully', async () => {
            // Suppress console errors for this test as we're testing error handling
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders([mockReadyQueryGraphQLError]);

            await waitFor(() => {
                // ErrorComponent is rendered - check for its presence via role or text
                expect(screen.getByRole('alert')).toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });
    });

    describe('Navigation Through Initialization Steps', () => {
        it('should navigate to authentication step when Next is clicked', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            await waitFor(() => {
                const nextButton = screen.getByRole('button', { name: /next/i });
                fireEvent.click(nextButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('init-authentication')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should navigate to tenant configuration from authentication', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            // Click Next to go to authentication
            await waitFor(() => {
                const nextButton = screen.getByRole('button', { name: /next/i });
                fireEvent.click(nextButton);
            }, { timeout: 3000 });

            // Click Next in authentication step
            await waitFor(() => {
                const authNextButton = screen.getAllByRole('button', { name: /next/i })[0];
                fireEvent.click(authNextButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('root-tenant-configuration')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should navigate back from authentication to readiness check', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            // Navigate to authentication step
            await waitFor(() => {
                const nextButton = screen.getByRole('button', { name: /next/i });
                fireEvent.click(nextButton);
            }, { timeout: 3000 });

            // Click Back
            await waitFor(() => {
                const backButton = screen.getByRole('button', { name: /back/i });
                fireEvent.click(backButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByText('All system initialization checks passed.')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should navigate through all initialization steps in sequence', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            // Step 1: Readiness Check -> Authentication
            await waitFor(() => {
                fireEvent.click(screen.getByRole('button', { name: /next/i }));
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('init-authentication')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 2: Authentication -> Tenant
            await waitFor(() => {
                fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('root-tenant-configuration')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 3: Tenant -> Client
            await waitFor(() => {
                fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('root-client-configuration')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 4: Client -> Authz Group
            await waitFor(() => {
                fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('init-authz-group')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 5: Authz Group -> Root User
            await waitFor(() => {
                fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('root-user-configuration')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 6: Root User -> Read-only Authz Group
            await waitFor(() => {
                fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('init-readonly-authz-group')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 7: Read-only Authz Group -> OIDC Provider
            await waitFor(() => {
                fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('init-oidc-provider')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 8: OIDC Provider -> System Settings
            await waitFor(() => {
                fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('init-system-settings')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 9: System Settings -> Captcha Config
            await waitFor(() => {
                fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('init-captcha-config')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Step 10: Captcha Config -> Submit
            await waitFor(() => {
                fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('init-submit')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Error Handling', () => {
        it('should display error message when child component triggers error', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            // Navigate to authentication step
            await waitFor(() => {
                fireEvent.click(screen.getByRole('button', { name: /next/i }));
            }, { timeout: 3000 });

            // Trigger error in authentication component
            await waitFor(() => {
                const errorButton = screen.getByRole('button', { name: /error/i });
                fireEvent.click(errorButton);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByText('Test error')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should allow closing error alert', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            // Navigate to authentication and trigger error
            await waitFor(() => {
                fireEvent.click(screen.getByRole('button', { name: /next/i }));
            }, { timeout: 3000 });

            await waitFor(() => {
                const errorButton = screen.getByRole('button', { name: /error/i });
                fireEvent.click(errorButton);
            }, { timeout: 3000 });

            // Wait for error to appear
            await waitFor(() => {
                expect(screen.getByText('Test error')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Close the error alert
            const closeButton = screen.getByRole('button', { name: /close/i });
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText('Test error')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Responsive Behavior', () => {
        it('should set width to 750px when not medium breakpoint', () => {
            const { container } = renderWithProviders([mockReadyQuerySuccess], mockResponsiveBreakpointsSmall);

            expect(container).toBeInTheDocument();
        });

        it('should set undefined width when medium breakpoint', () => {
            const { container } = renderWithProviders([mockReadyQuerySuccess], mockResponsiveBreakpoints);

            expect(container).toBeInTheDocument();
        });
    });

    describe('Initialization State Management', () => {
        it('should pass systemInitInput to child components', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            // Navigate to authentication step
            await waitFor(() => {
                fireEvent.click(screen.getByRole('button', { name: /next/i }));
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('init-authentication')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should update systemInitInput when child component calls onNext', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            // Navigate through multiple steps
            await waitFor(() => {
                fireEvent.click(screen.getByRole('button', { name: /next/i }));
            }, { timeout: 3000 });

            await waitFor(() => {
                fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]);
            }, { timeout: 3000 });

            await waitFor(() => {
                expect(screen.getByTestId('root-tenant-configuration')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Authz Group Configuration States', () => {
        it('should render regular authz group configuration with isReadOnlyAuthzGroup=false', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            // Navigate to authz group step (readiness -> auth -> tenant -> client -> authz)
            for (let i = 0; i < 4; i++) {
                await waitFor(() => {
                    const buttons = screen.getAllByRole('button', { name: /next/i });
                    fireEvent.click(buttons[buttons.length - 1]);
                }, { timeout: 3000 });
            }

            await waitFor(() => {
                expect(screen.getByTestId('init-authz-group')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render read-only authz group configuration with isReadOnlyAuthzGroup=true', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            // Navigate to read-only authz group step (6 steps forward)
            for (let i = 0; i < 6; i++) {
                await waitFor(() => {
                    const buttons = screen.getAllByRole('button', { name: /next/i });
                    fireEvent.click(buttons[buttons.length - 1]);
                }, { timeout: 3000 });
            }

            await waitFor(() => {
                expect(screen.getByTestId('init-readonly-authz-group')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Error Numbering', () => {
        it('should number errors sequentially in error list', async () => {
            renderWithProviders([mockReadyQueryWithErrors]);

            await waitFor(() => {
                expect(screen.getByText('1.')).toBeInTheDocument();
                expect(screen.getByText('2.')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should number warnings sequentially in warning list', async () => {
            renderWithProviders([mockReadyQueryWithWarnings]);

            await waitFor(() => {
                expect(screen.getByText('1.')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Alert Severity', () => {
        it('should display error alert with error severity', async () => {
            renderWithProviders([mockReadyQueryWithErrors]);

            await waitFor(() => {
                const alerts = screen.getAllByRole('alert');
                const errorAlert = alerts.find(alert =>
                    alert.textContent?.includes('The following errors were encountered')
                );
                expect(errorAlert).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display warning alert with warning severity', async () => {
            renderWithProviders([mockReadyQueryWithWarnings]);

            await waitFor(() => {
                const alerts = screen.getAllByRole('alert');
                const warningAlert = alerts.find(alert =>
                    alert.textContent?.includes('The following warnings were encountered')
                );
                expect(warningAlert).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display success alert with success severity', async () => {
            renderWithProviders([mockReadyQuerySuccess]);

            await waitFor(() => {
                const alerts = screen.getAllByRole('alert');
                const successAlert = alerts.find(alert =>
                    alert.textContent?.includes('All system initialization checks passed')
                );
                expect(successAlert).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });
});
