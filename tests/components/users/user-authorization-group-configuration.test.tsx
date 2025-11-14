import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { IntlProvider } from 'react-intl';
import UserAuthorizationGroupConfiguration from '@/components/users/user-authorization-group-configuration';
import { USER_AUTHORIZATION_GROUP_QUERY } from '@/graphql/queries/oidc-queries';
import { AUTHORIZATION_GROUP_USER_ADD_MUTATION, AUTHORIZATION_GROUP_USER_REMOVE_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext } from '@/components/contexts/auth-context';
import { AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, AUTHORIZATION_GROUP_USER_REMOVE_SCOPE } from '@/utils/consts';
import { AuthorizationGroup } from '@/graphql/generated/graphql-types';

// Mock Next.js Link
jest.mock('next/link', () => {
    return ({ children, href }: any) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock TenantQuickInfo component
jest.mock('@/components/tenants/tenant-quick-info', () => {
    return function MockTenantQuickInfo({ tenantId }: any) {
        return <div data-testid="tenant-quick-info">Tenant Info: {tenantId}</div>;
    };
});

// Mock containsScope
jest.mock('@/utils/authz-utils', () => ({
    containsScope: jest.fn((requiredScope: string, userScopes: Array<{ scopeName: string }>) => {
        return userScopes.some(s => s.scopeName === requiredScope);
    })
}));

const mockUserId = 'user-123';
const mockTenantId = 'tenant-root';

const mockAuthorizationGroups: AuthorizationGroup[] = [
    {
        tenantId: mockTenantId,
        groupId: 'group-1',
        groupName: 'Administrators',
        groupDescription: 'Admin group',
        markForDelete: false,
        allowForAnonymousUsers: false,
        default: false
    },
    {
        tenantId: mockTenantId,
        groupId: 'group-2',
        groupName: 'Developers',
        groupDescription: 'Developer group',
        markForDelete: false,
        allowForAnonymousUsers: false,
        default: false
    },
    {
        tenantId: 'tenant-other',
        groupId: 'group-3',
        groupName: 'Viewers',
        groupDescription: 'Viewer group',
        markForDelete: false,
        allowForAnonymousUsers: false,
        default: false
    }
];

const mockUserAuthorizationGroupQuery = {
    request: {
        query: USER_AUTHORIZATION_GROUP_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    result: {
        data: {
            getUserAuthorizationGroups: mockAuthorizationGroups
        }
    }
};

const mockEmptyUserAuthorizationGroupQuery = {
    request: {
        query: USER_AUTHORIZATION_GROUP_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    result: {
        data: {
            getUserAuthorizationGroups: []
        }
    }
};

const mockUserAuthorizationGroupError = {
    request: {
        query: USER_AUTHORIZATION_GROUP_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    error: new Error('Failed to load authorization groups')
};

const mockRemoveMutation = {
    request: {
        query: AUTHORIZATION_GROUP_USER_REMOVE_MUTATION,
        variables: {
            userId: mockUserId,
            groupId: 'group-1'
        }
    },
    result: {
        data: {
            removeUserFromAuthorizationGroup: true
        }
    }
};

const mockRemoveMutationError = {
    request: {
        query: AUTHORIZATION_GROUP_USER_REMOVE_MUTATION,
        variables: {
            userId: mockUserId,
            groupId: 'group-1'
        }
    },
    error: new Error('Failed to remove user from group')
};

describe('UserAuthorizationGroupConfiguration', () => {
    const mockTenantBean = {
        getTenantMetaData: jest.fn(() => ({
            tenant: {
                tenantId: mockTenantId,
                tenantName: 'Root Tenant'
            }
        }))
    };

    const renderWithProviders = (
        mocks: any[],
        scopes: Array<{ scopeName: string }> = []
    ) => {
        const onUpdateStart = jest.fn();
        const onUpdateEnd = jest.fn();

        const authContextValue = {
            portalUserProfile: {
                scope: scopes
            }
        };

        return {
            ...render(
                <IntlProvider locale="en" messages={{}}>
                    <MockedProvider mocks={mocks} addTypename={false}>
                        <TenantContext.Provider value={mockTenantBean as any}>
                            <AuthContext.Provider value={authContextValue as any}>
                                <UserAuthorizationGroupConfiguration
                                    userId={mockUserId}
                                    onUpdateStart={onUpdateStart}
                                    onUpdateEnd={onUpdateEnd}
                                />
                            </AuthContext.Provider>
                        </TenantContext.Provider>
                    </MockedProvider>
                </IntlProvider>
            ),
            onUpdateStart,
            onUpdateEnd
        };
    };

    describe('Loading and Error States', () => {
        it('should display loading state initially', () => {
            renderWithProviders([mockUserAuthorizationGroupQuery]);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should display error message when query fails', async () => {
            renderWithProviders([mockUserAuthorizationGroupError]);

            await waitFor(() => {
                expect(screen.getByText('Failed to load authorization groups')).toBeInTheDocument();
            });
        });
    });

    describe('Display', () => {
        it('should display column headers', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery]);

            await waitFor(() => {
                expect(screen.getByText('Group Name')).toBeInTheDocument();
                expect(screen.getByText('Tenant')).toBeInTheDocument();
            });
        });

        it('should display all authorization group names as links', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery]);

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            mockAuthorizationGroups.forEach(group => {
                const link = screen.getByText(group.groupName);
                expect(link).toBeInTheDocument();
                expect(link.closest('a')).toHaveAttribute(
                    'href',
                    `/${mockTenantId}/authorization-groups/${group.groupId}`
                );
            });
        });

        it('should display info icons for tenant information', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery]);

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            const infoIcons = screen.getAllByTestId('InfoOutlinedIcon');
            expect(infoIcons).toHaveLength(mockAuthorizationGroups.length);
        });

        it('should open tenant info dialog when info icon is clicked', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery]);

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            const infoIcons = screen.getAllByTestId('InfoOutlinedIcon');
            fireEvent.click(infoIcons[0]);

            await waitFor(() => {
                expect(screen.getByTestId('tenant-quick-info')).toBeInTheDocument();
                expect(screen.getByText(`Tenant Info: ${mockTenantId}`)).toBeInTheDocument();
            });
        });

        it('should close tenant info dialog when close button is clicked', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery]);

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            const infoIcons = screen.getAllByTestId('InfoOutlinedIcon');
            fireEvent.click(infoIcons[0]);

            await waitFor(() => {
                expect(screen.getByTestId('tenant-quick-info')).toBeInTheDocument();
            });

            const closeButton = screen.getByRole('button', { name: /close/i });
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByTestId('tenant-quick-info')).not.toBeInTheDocument();
            });
        });
    });

    describe('Add Authorization Group Functionality', () => {
        it('should display add button when user has assign permission', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery], [
                { scopeName: AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Assign User To Authorization Group')).toBeInTheDocument();
            });

            expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
        });

        it('should not display add button when user lacks assign permission', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery]);

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            expect(screen.queryByText('Assign User To Authorization Group')).not.toBeInTheDocument();
        });
    });

    describe('Remove Authorization Group Functionality', () => {
        it('should display remove icons when user has remove permission', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery], [
                { scopeName: AUTHORIZATION_GROUP_USER_REMOVE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(mockAuthorizationGroups.length);
        });

        it('should not display remove icons when user lacks remove permission', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery]);

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
        });

        it('should open remove confirmation dialog when remove icon is clicked', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery], [
                { scopeName: AUTHORIZATION_GROUP_USER_REMOVE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm removal of authorization group')).toBeInTheDocument();
            });
        });

        it('should close remove dialog when cancel is clicked', async () => {
            renderWithProviders([mockUserAuthorizationGroupQuery, mockUserAuthorizationGroupQuery], [
                { scopeName: AUTHORIZATION_GROUP_USER_REMOVE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm removal of authorization group')).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText('Confirm removal of authorization group')).not.toBeInTheDocument();
            });
        });

        it('should call remove mutation when confirmed', async () => {
            const { onUpdateStart, onUpdateEnd } = renderWithProviders(
                [
                    mockUserAuthorizationGroupQuery,
                    mockUserAuthorizationGroupQuery,
                    mockRemoveMutation,
                    mockUserAuthorizationGroupQuery
                ],
                [{ scopeName: AUTHORIZATION_GROUP_USER_REMOVE_SCOPE }]
            );

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm removal of authorization group')).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(onUpdateStart).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(onUpdateEnd).toHaveBeenCalledWith(true);
            });
        });

        it('should display error message when remove mutation fails', async () => {
            const { onUpdateEnd } = renderWithProviders(
                [
                    mockUserAuthorizationGroupQuery,
                    mockUserAuthorizationGroupQuery,
                    mockRemoveMutationError
                ],
                [{ scopeName: AUTHORIZATION_GROUP_USER_REMOVE_SCOPE }]
            );

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm removal of authorization group')).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(onUpdateEnd).toHaveBeenCalledWith(false);
            });

            await waitFor(() => {
                expect(screen.getByText('Failed to remove user from group')).toBeInTheDocument();
            });
        });

        it('should close error alert when close icon is clicked', async () => {
            renderWithProviders(
                [
                    mockUserAuthorizationGroupQuery,
                    mockUserAuthorizationGroupQuery,
                    mockRemoveMutationError
                ],
                [{ scopeName: AUTHORIZATION_GROUP_USER_REMOVE_SCOPE }]
            );

            await waitFor(() => {
                expect(screen.getByText('Administrators')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm removal of authorization group')).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.getByText('Failed to remove user from group')).toBeInTheDocument();
            });

            const closeIcon = screen.getByTestId('CloseIcon').parentElement;
            if (closeIcon) {
                fireEvent.click(closeIcon);
            }

            await waitFor(() => {
                expect(screen.queryByText('Failed to remove user from group')).not.toBeInTheDocument();
            });
        });
    });

    describe('Empty State', () => {
        it('should display empty message when no authorization groups are assigned', async () => {
            renderWithProviders([mockEmptyUserAuthorizationGroupQuery]);

            await waitFor(() => {
                expect(screen.getByText('No authorization groups')).toBeInTheDocument();
            });
        });
    });
});
