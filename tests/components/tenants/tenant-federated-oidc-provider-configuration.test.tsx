import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import TenantFederatedOIDCProviderConfiguration from '@/components/tenants/tenant-federated-oidc-provider-configuration';
import { FEDERATED_OIDC_PROVIDERS_QUERY } from '@/graphql/queries/oidc-queries';
import { ASSIGN_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION, REMOVE_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { TenantContext } from '@/components/contexts/tenant-context';
import { IntlProvider } from 'react-intl';
import {
    FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE,
    FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE,
    FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL,
    FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE,
    SCOPE_USE_IAM_MANAGEMENT,
    TENANT_TYPE_ROOT_TENANT
} from '@/utils/consts';

// Mock Next.js Link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock authz-utils
jest.mock('@/utils/authz-utils', () => ({
    containsScope: (scope: string, scopes: any[]) => {
        if (!scopes) return false;
        return scopes.some((s: any) => s.scopeName === scope);
    }
}));

// Mock GeneralSelector
jest.mock('@/components/dialogs/general-selector', () => {
    return function MockGeneralSelector({ onCancel, onSelected, selectorLabel, helpText }: any) {
        return (
            <div data-testid="general-selector">
                <div>{selectorLabel}</div>
                <div>{helpText}</div>
                <button data-testid="selector-cancel" onClick={onCancel}>Cancel</button>
                <button data-testid="selector-select" onClick={() => onSelected('provider-3')}>
                    Select Provider
                </button>
            </div>
        );
    };
});

const messages = {
    'error.default': 'An error occurred',
};

const mockTenantId = 'test-tenant-id';

const mockProviders = [
    {
        federatedOIDCProviderId: 'provider-1',
        federatedOIDCProviderName: 'Google',
        federatedOIDCProviderType: FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL,
        enabled: true
    },
    {
        federatedOIDCProviderId: 'provider-2',
        federatedOIDCProviderName: 'Facebook',
        federatedOIDCProviderType: FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL,
        enabled: true
    },
    {
        federatedOIDCProviderId: 'provider-ent-1',
        federatedOIDCProviderName: 'Azure AD',
        federatedOIDCProviderType: FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE,
        enabled: true
    }
];

const mockTenantContext: any = {
    tenantBean: {
        tenantId: mockTenantId,
        tenantName: 'Test Tenant',
        tenantType: 'STANDARD'
    },
    setTenantBean: jest.fn(),
    setTenantMetaData: jest.fn(),
    getTenantMetaData: jest.fn(() => ({
        tenant: {
            tenantId: mockTenantId,
            tenantName: 'Test Tenant',
            tenantType: 'STANDARD'
        }
    }))
};

const mockRootTenantContext: any = {
    ...mockTenantContext,
    getTenantMetaData: jest.fn(() => ({
        tenant: {
            tenantId: mockTenantId,
            tenantName: 'Root Tenant',
            tenantType: TENANT_TYPE_ROOT_TENANT
        }
    }))
};

const mockAuthContext: AuthContextProps = {
    portalUserProfile: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        userId: 'test-user-id',
        scope: [
            {
                scopeId: 'id1',
                scopeName: FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id2',
                scopeName: FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            }
        ],
        domain: '',
        emailVerified: false,
        enabled: false,
        expiresAtMs: 0,
        locked: false,
        nameOrder: '',
        principalType: '',
        tenantId: '',
        tenantName: ''
    },
    forceProfileRefetch: jest.fn()
};

const mockQuerySuccess = {
    request: {
        query: FEDERATED_OIDC_PROVIDERS_QUERY,
        variables: {
            tenantId: mockTenantId
        }
    },
    result: {
        data: {
            getFederatedOIDCProviders: mockProviders
        }
    }
};

const mockQueryEmpty = {
    request: {
        query: FEDERATED_OIDC_PROVIDERS_QUERY,
        variables: {
            tenantId: mockTenantId
        }
    },
    result: {
        data: {
            getFederatedOIDCProviders: []
        }
    }
};

const mockQueryError = {
    request: {
        query: FEDERATED_OIDC_PROVIDERS_QUERY,
        variables: {
            tenantId: mockTenantId
        }
    },
    error: new Error('Query failed')
};

const mockAssignMutation = {
    request: {
        query: ASSIGN_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION,
        variables: {
            tenantId: mockTenantId,
            federatedOIDCProviderId: 'provider-3'
        }
    },
    result: {
        data: {
            assignTenantFederatedOIDCProvider: true
        }
    }
};

const mockRemoveMutation = {
    request: {
        query: REMOVE_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION,
        variables: {
            tenantId: mockTenantId,
            federatedOIDCProviderId: 'provider-1'
        }
    },
    result: {
        data: {
            removeTenantFederatedOIDCProvider: true
        }
    }
};

const renderWithProviders = (
    mocks: any[] = [mockQuerySuccess],
    authContext: AuthContextProps = mockAuthContext,
    tenantContext: any = mockTenantContext,
    allowSocialLogin: boolean = true
) => {
    const onUpdateStart = jest.fn();
    const onUpdateEnd = jest.fn();

    return {
        ...render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <IntlProvider messages={messages} locale="en" defaultLocale="en">
                    <TenantContext.Provider value={tenantContext}>
                        <AuthContext.Provider value={authContext}>
                            <TenantFederatedOIDCProviderConfiguration
                                tenantId={mockTenantId}
                                allowSocialLogin={allowSocialLogin}
                                onUpdateStart={onUpdateStart}
                                onUpdateEnd={onUpdateEnd}
                            />
                        </AuthContext.Provider>
                    </TenantContext.Provider>
                </IntlProvider>
            </MockedProvider>
        ),
        onUpdateStart,
        onUpdateEnd
    };
};

describe('TenantFederatedOIDCProviderConfiguration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should display loading spinner while fetching data', () => {
            renderWithProviders([mockQuerySuccess]);
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should hide loading spinner after data is loaded', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error State', () => {
        it('should display error component when query fails', async () => {
            renderWithProviders([mockQueryError]);
            await waitFor(() => {
                expect(screen.getByText(/Query failed/i)).toBeInTheDocument();
            });
        });

        it('should not display provider list when query fails', async () => {
            renderWithProviders([mockQueryError]);
            await waitFor(() => {
                expect(screen.queryByText('Add Social OIDC Provider')).not.toBeInTheDocument();
            });
        });
    });

    describe('Empty Provider List', () => {
        it('should display empty state message when no providers assigned', async () => {
            renderWithProviders([mockQueryEmpty]);
            await waitFor(() => {
                expect(screen.getByText('No Social OIDC Providers')).toBeInTheDocument();
            });
        });

        it('should still show Add Social OIDC Provider button when list is empty', async () => {
            renderWithProviders([mockQueryEmpty]);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });
        });
    });

    describe('Provider List Display', () => {
        it('should display provider names', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Google')).toBeInTheDocument();
                expect(screen.getByText('Facebook')).toBeInTheDocument();
                expect(screen.getByText('Azure AD')).toBeInTheDocument();
            });
        });

        it('should display provider types', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const socialTexts = screen.getAllByText('Social');
                expect(socialTexts.length).toBe(2);
                expect(screen.getByText('Enterprise')).toBeInTheDocument();
            });
        });

        it('should display column headers', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Provider Name')).toBeInTheDocument();
                expect(screen.getByText('Type')).toBeInTheDocument();
            });
        });

        it('should display providers as plain text for non-root tenants', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const links = screen.queryAllByRole('link');
                expect(links.length).toBe(0);
            });
        });

        it('should show TablePagination component', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText(/1–3 of 3/i)).toBeInTheDocument();
            });
        });
    });

    describe('Add Provider Dialog', () => {
        it('should display Add Social OIDC Provider button when user has permission', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });
        });

        it('should open GeneralSelector dialog when Add button is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('general-selector')).toBeInTheDocument();
            });
        });

        it('should display selector label and help text', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByText('Select a social provider')).toBeInTheDocument();
                expect(screen.getByText('Select a valid provider')).toBeInTheDocument();
            });
        });

        it('should close dialog when Cancel is clicked in selector', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('general-selector')).toBeInTheDocument();
            });

            const cancelButton = screen.getByTestId('selector-cancel');
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByTestId('general-selector')).not.toBeInTheDocument();
            });
        });

        it('should call onUpdateStart when provider is selected', async () => {
            const { onUpdateStart } = renderWithProviders([mockQuerySuccess, mockAssignMutation]);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('selector-select')).toBeInTheDocument();
            });

            const selectButton = screen.getByTestId('selector-select');
            fireEvent.click(selectButton);

            await waitFor(() => {
                expect(onUpdateStart).toHaveBeenCalled();
            });
        });

        it('should close dialog after provider selection', async () => {
            renderWithProviders([mockQuerySuccess, mockAssignMutation]);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('selector-select')).toBeInTheDocument();
            });

            const selectButton = screen.getByTestId('selector-select');
            fireEvent.click(selectButton);

            await waitFor(() => {
                expect(screen.queryByTestId('general-selector')).not.toBeInTheDocument();
            });
        });
    });

    describe('Remove Provider Dialog', () => {
        it('should display remove icons for providers', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
                expect(removeIcons.length).toBeGreaterThan(0);
            });
        });

        it('should open confirmation dialog when remove icon is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Google')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of Social OIDC provider:/i)).toBeInTheDocument();
                const googleTexts = screen.getAllByText('Google');
                expect(googleTexts.length).toBe(2); // Once in list, once in dialog
            });
        });

        it('should close confirmation dialog when Cancel is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Google')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of Social OIDC provider:/i)).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm removal of Social OIDC provider:/i)).not.toBeInTheDocument();
            });
        });

        it('should call onUpdateStart when removal is confirmed', async () => {
            const { onUpdateStart } = renderWithProviders([mockQuerySuccess, mockRemoveMutation]);
            await waitFor(() => {
                expect(screen.getByText('Google')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(onUpdateStart).toHaveBeenCalled();
            });
        });

        it('should close dialog after confirmation', async () => {
            renderWithProviders([mockQuerySuccess, mockRemoveMutation]);
            await waitFor(() => {
                expect(screen.getByText('Google')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm removal of Social OIDC provider:/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Authorization', () => {
        it('should hide Add button when user lacks assign permission', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [],
                    domain: '',
                    emailVerified: false,
                    enabled: false,
                    expiresAtMs: 0,
                    locked: false,
                    nameOrder: '',
                    principalType: '',
                    tenantId: '',
                    tenantName: ''
                },
                forceProfileRefetch: jest.fn()
            };

            renderWithProviders([mockQuerySuccess], restrictedAuthContext);
            await waitFor(() => {
                expect(screen.queryByText('Add Social OIDC Provider')).not.toBeInTheDocument();
            });
        });

        it('should hide remove icons when user lacks remove permission', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [
                        {
                            scopeId: 'id1',
                            scopeName: FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE,
                            markForDelete: false,
                            scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                            scopeDescription: ''
                        }
                    ],
                    domain: '',
                    emailVerified: false,
                    enabled: false,
                    expiresAtMs: 0,
                    locked: false,
                    nameOrder: '',
                    principalType: '',
                    tenantId: '',
                    tenantName: ''
                },
                forceProfileRefetch: jest.fn()
            };

            renderWithProviders([mockQuerySuccess], restrictedAuthContext);
            await waitFor(() => {
                expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
            });
        });

        it('should show Add button when user has assign permission', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });
        });

        it('should show remove icons when user has remove permission', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
                expect(removeIcons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Social Login Restriction', () => {
        it('should show Add button when social login is allowed', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, mockTenantContext, true);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });
        });

        it('should show Add button even when social login is disabled', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, mockTenantContext, false);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });
        });
    });

    describe('Root Tenant Links', () => {
        it('should display providers as links for root tenant', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, mockRootTenantContext);
            await waitFor(() => {
                const links = screen.getAllByRole('link');
                expect(links.length).toBeGreaterThan(0);
                expect(links[0]).toHaveAttribute('href', expect.stringContaining('/oidc-providers/'));
            });
        });

        it('should display providers as plain text for non-root tenant', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, mockTenantContext);
            await waitFor(() => {
                const links = screen.queryAllByRole('link');
                expect(links.length).toBe(0);
            });
        });
    });

    describe('Pagination', () => {
        it('should display correct page information', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText(/1–3 of 3/i)).toBeInTheDocument();
            });
        });

        it('should handle pagination with many providers', async () => {
            const manyProviders = Array.from({ length: 15 }, (_, i) => ({
                federatedOIDCProviderId: `provider-${i}`,
                federatedOIDCProviderName: `Provider ${i}`,
                federatedOIDCProviderType: FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL,
                enabled: true
            }));

            const mockQueryManyProviders = {
                request: {
                    query: FEDERATED_OIDC_PROVIDERS_QUERY,
                    variables: {
                        tenantId: mockTenantId
                    }
                },
                result: {
                    data: {
                        getFederatedOIDCProviders: manyProviders
                    }
                }
            };

            renderWithProviders([mockQueryManyProviders]);
            await waitFor(() => {
                expect(screen.getByText('Provider 0')).toBeInTheDocument();
                expect(screen.queryByText('Provider 14')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error alert when mutation fails', async () => {
            const mockAssignMutationError = {
                request: {
                    query: ASSIGN_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION,
                    variables: {
                        tenantId: mockTenantId,
                        federatedOIDCProviderId: 'provider-3'
                    }
                },
                error: new Error('error.default')
            };

            renderWithProviders([mockQuerySuccess, mockAssignMutationError]);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('selector-select')).toBeInTheDocument();
            });

            const selectButton = screen.getByTestId('selector-select');
            fireEvent.click(selectButton);

            await waitFor(() => {
                expect(screen.getByText('An error occurred')).toBeInTheDocument();
            });
        });

        it('should allow dismissing error alert', async () => {
            const mockAssignMutationError = {
                request: {
                    query: ASSIGN_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION,
                    variables: {
                        tenantId: mockTenantId,
                        federatedOIDCProviderId: 'provider-3'
                    }
                },
                error: new Error('error.default')
            };

            renderWithProviders([mockQuerySuccess, mockAssignMutationError]);
            await waitFor(() => {
                expect(screen.getByText('Add Social OIDC Provider')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('selector-select')).toBeInTheDocument();
            });

            const selectButton = screen.getByTestId('selector-select');
            fireEvent.click(selectButton);

            await waitFor(() => {
                expect(screen.getByText('An error occurred')).toBeInTheDocument();
            });

            const closeButton = screen.getByRole('button', { name: /close/i });
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText('An error occurred')).not.toBeInTheDocument();
            });
        });
    });
});
