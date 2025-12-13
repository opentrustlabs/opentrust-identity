import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import ClientAuthenticationGroupConfiguration from '@/components/clients/client-authentication-group-configuration';
import { AUTHENTICATION_GROUPS_QUERY } from '@/graphql/queries/oidc-queries';
import { ASSIGN_AUTHENTICATION_GROUP_TO_CLIENT_MUTATION, REMOVE_AUTHENTICATION_GROUP_FROM_CLIENT_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { TenantContext } from '@/components/contexts/tenant-context';
import { IntlProvider } from 'react-intl';
import {
    AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE,
    AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE,
    SCOPE_USE_IAM_MANAGEMENT
} from '@/utils/consts';

// Mock Next.js Link
jest.mock('next/link', () => {
    return ({ children, href, target }: { children: React.ReactNode; href: string; target?: string }) => {
        return <a href={href} target={target}>{children}</a>;
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
                <button data-testid="selector-select" onClick={() => onSelected('group-3')}>
                    Select Group
                </button>
            </div>
        );
    };
});

const messages = {
    'error.default': 'An error occurred',
};

const mockTenantId = 'test-tenant-id';
const mockClientId = 'test-client-id';

const mockAuthenticationGroups = [
    {
        authenticationGroupId: 'group-1',
        authenticationGroupName: 'Admin Group',
        authenticationGroupDescription: 'Administrator group',
        tenantId: mockTenantId
    },
    {
        authenticationGroupId: 'group-2',
        authenticationGroupName: 'User Group',
        authenticationGroupDescription: 'Standard user group',
        tenantId: mockTenantId
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

const mockAuthContext: AuthContextProps = {
    portalUserProfile: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        userId: 'test-user-id',
        scope: [
            {
                scopeId: 'id1',
                scopeName: AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id2',
                scopeName: AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE,
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
        query: AUTHENTICATION_GROUPS_QUERY,
        variables: {
            clientId: mockClientId
        }
    },
    result: {
        data: {
            getAuthenticationGroups: mockAuthenticationGroups
        }
    }
};

const mockQueryEmpty = {
    request: {
        query: AUTHENTICATION_GROUPS_QUERY,
        variables: {
            clientId: mockClientId
        }
    },
    result: {
        data: {
            getAuthenticationGroups: []
        }
    }
};

const mockQueryError = {
    request: {
        query: AUTHENTICATION_GROUPS_QUERY,
        variables: {
            clientId: mockClientId
        }
    },
    error: new Error('Query failed')
};

const mockAssignMutation = {
    request: {
        query: ASSIGN_AUTHENTICATION_GROUP_TO_CLIENT_MUTATION,
        variables: {
            clientId: mockClientId,
            authenticationGroupId: 'group-3'
        }
    },
    result: {
        data: {
            assignAuthenticationGroupToClient: true
        }
    }
};

const mockRemoveMutation = {
    request: {
        query: REMOVE_AUTHENTICATION_GROUP_FROM_CLIENT_MUTATION,
        variables: {
            clientId: mockClientId,
            authenticationGroupId: 'group-1'
        }
    },
    result: {
        data: {
            removeAuthenticationGroupFromClient: true
        }
    }
};

const renderWithProviders = (
    mocks: any[] = [mockQuerySuccess],
    authContext: AuthContextProps = mockAuthContext,
    tenantContext: any = mockTenantContext
) => {
    const onUpdateStart = jest.fn();
    const onUpdateEnd = jest.fn();

    return {
        ...render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <IntlProvider messages={messages} locale="en" defaultLocale="en">
                    <TenantContext.Provider value={tenantContext}>
                        <AuthContext.Provider value={authContext}>
                            <ClientAuthenticationGroupConfiguration
                                tenantId={mockTenantId}
                                clientId={mockClientId}
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

describe('ClientAuthenticationGroupConfiguration', () => {
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

        it('should not display group list when query fails', async () => {
            renderWithProviders([mockQueryError]);
            await waitFor(() => {
                expect(screen.queryByText('Add Authentication Group')).not.toBeInTheDocument();
            });
        });
    });

    describe('Empty Group List', () => {
        it('should display empty state message when no groups assigned', async () => {
            renderWithProviders([mockQueryEmpty]);
            await waitFor(() => {
                expect(screen.getByText('No Authentication Groups Assigned')).toBeInTheDocument();
            });
        });

        it('should still show Add Authentication Group button when list is empty', async () => {
            renderWithProviders([mockQueryEmpty]);
            await waitFor(() => {
                expect(screen.getByText('Add Authentication Group')).toBeInTheDocument();
            });
        });
    });

    describe('Group List Display', () => {
        it('should display group names as links', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const adminLink = screen.getByRole('link', { name: 'Admin Group' });
                const userLink = screen.getByRole('link', { name: 'User Group' });
                expect(adminLink).toBeInTheDocument();
                expect(userLink).toBeInTheDocument();
                expect(adminLink).toHaveAttribute('href', expect.stringContaining('/authentication-groups/group-1'));
                expect(adminLink).toHaveAttribute('target', '_blank');
            });
        });

        it('should display column header', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Group name')).toBeInTheDocument();
            });
        });

        it('should display all groups in the list', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Admin Group')).toBeInTheDocument();
                expect(screen.getByText('User Group')).toBeInTheDocument();
            });
        });
    });

    describe('Add Group Dialog', () => {
        it('should display Add Authentication Group button when user has permission', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Authentication Group')).toBeInTheDocument();
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });
        });

        it('should open GeneralSelector dialog when Add button is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Authentication Group')).toBeInTheDocument();
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
                expect(screen.getByText('Add Authentication Group')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByText('Select a group')).toBeInTheDocument();
                expect(screen.getByText('Select a valid group')).toBeInTheDocument();
            });
        });

        it('should close dialog when Cancel is clicked in selector', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Add Authentication Group')).toBeInTheDocument();
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

        it('should call onUpdateStart when group is selected', async () => {
            const { onUpdateStart } = renderWithProviders([mockQuerySuccess, mockAssignMutation]);
            await waitFor(() => {
                expect(screen.getByText('Add Authentication Group')).toBeInTheDocument();
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
    });

    describe('Remove Group Dialog', () => {
        it('should display remove icons for groups', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
                expect(removeIcons.length).toBe(2);
            });
        });

        it('should open confirmation dialog when remove icon is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Admin Group')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of group:/i)).toBeInTheDocument();
                const groupNames = screen.getAllByText('Admin Group');
                expect(groupNames.length).toBe(2); // Once in list, once in dialog
            });
        });

        it('should close confirmation dialog when Cancel is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Admin Group')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of group:/i)).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm removal of group:/i)).not.toBeInTheDocument();
            });
        });

        it('should call onUpdateStart when removal is confirmed', async () => {
            const { onUpdateStart } = renderWithProviders([mockQuerySuccess, mockRemoveMutation]);
            await waitFor(() => {
                expect(screen.getByText('Admin Group')).toBeInTheDocument();
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
                expect(screen.getByText('Admin Group')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm removal of group:/i)).not.toBeInTheDocument();
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
                expect(screen.queryByText('Add Authentication Group')).not.toBeInTheDocument();
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
                            scopeName: AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE,
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
                expect(screen.getByText('Add Authentication Group')).toBeInTheDocument();
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

    describe('Error Handling', () => {
        it('should display error alert when mutation fails', async () => {
            const mockAssignMutationError = {
                request: {
                    query: ASSIGN_AUTHENTICATION_GROUP_TO_CLIENT_MUTATION,
                    variables: {
                        clientId: mockClientId,
                        authenticationGroupId: 'group-3'
                    }
                },
                error: new Error('error.default')
            };

            renderWithProviders([mockQuerySuccess, mockAssignMutationError]);
            await waitFor(() => {
                expect(screen.getByText('Add Authentication Group')).toBeInTheDocument();
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
                    query: ASSIGN_AUTHENTICATION_GROUP_TO_CLIENT_MUTATION,
                    variables: {
                        clientId: mockClientId,
                        authenticationGroupId: 'group-3'
                    }
                },
                error: new Error('error.default')
            };

            renderWithProviders([mockQuerySuccess, mockAssignMutationError]);
            await waitFor(() => {
                expect(screen.getByText('Add Authentication Group')).toBeInTheDocument();
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

            const closeButton = screen.getByTestId('CloseIcon').parentElement as HTMLElement;
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText('An error occurred')).not.toBeInTheDocument();
            });
        });
    });
});
