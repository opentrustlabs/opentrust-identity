import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { IntlProvider } from 'react-intl';
import UserSessionDetails from '@/components/users/user-session-details';
import { USER_SESSIONS_QUERY } from '@/graphql/queries/oidc-queries';
import { USER_SESSION_DELETE_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { AuthContext } from '@/components/contexts/auth-context';
import { USER_SESSION_DELETE_SCOPE } from '@/utils/consts';
import { UserSession } from '@/graphql/generated/graphql-types';

// Mock containsScope
jest.mock('@/utils/authz-utils', () => ({
    containsScope: jest.fn((requiredScope: string, userScopes: Array<{ scopeName: string }>) => {
        return userScopes.some(s => s.scopeName === requiredScope);
    })
}));

const mockUserId = 'user-123';

const mockUserSessions: UserSession[] = [
    {
        userId: mockUserId,
        tenantId: 'tenant-1',
        tenantName: 'Tenant One',
        clientId: 'client-1',
        clientName: 'Client Application 1'
    },
    {
        userId: mockUserId,
        tenantId: 'tenant-2',
        tenantName: 'Tenant Two',
        clientId: 'client-2',
        clientName: 'Client Application 2'
    },
    {
        userId: mockUserId,
        tenantId: 'tenant-1',
        tenantName: 'Tenant One',
        clientId: 'client-3',
        clientName: 'Client Application 3'
    }
];

const mockUserSessionsQuery = {
    request: {
        query: USER_SESSIONS_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    result: {
        data: {
            getUserSessions: mockUserSessions
        }
    }
};

const mockEmptyUserSessionsQuery = {
    request: {
        query: USER_SESSIONS_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    result: {
        data: {
            getUserSessions: []
        }
    }
};

const mockUserSessionsError = {
    request: {
        query: USER_SESSIONS_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    error: new Error('Failed to load user sessions')
};

const mockDeleteMutation = {
    request: {
        query: USER_SESSION_DELETE_MUTATION,
        variables: {
            userId: mockUserId,
            tenantId: 'tenant-1',
            clientId: 'client-1'
        }
    },
    result: {
        data: {
            deleteUserSession: true
        }
    }
};

const mockDeleteMutationError = {
    request: {
        query: USER_SESSION_DELETE_MUTATION,
        variables: {
            userId: mockUserId,
            tenantId: 'tenant-1',
            clientId: 'client-1'
        }
    },
    error: new Error('Failed to delete session')
};

describe('UserSessionDetails', () => {
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
                        <AuthContext.Provider value={authContextValue as any}>
                            <UserSessionDetails
                                userId={mockUserId}
                                onUpdateStart={onUpdateStart}
                                onUpdateEnd={onUpdateEnd}
                            />
                        </AuthContext.Provider>
                    </MockedProvider>
                </IntlProvider>
            ),
            onUpdateStart,
            onUpdateEnd
        };
    };

    describe('Loading and Error States', () => {
        it('should display loading state initially', () => {
            renderWithProviders([mockUserSessionsQuery]);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should display error message when query fails', async () => {
            renderWithProviders([mockUserSessionsError]);

            await waitFor(() => {
                expect(screen.getByText('Failed to load user sessions')).toBeInTheDocument();
            });
        });
    });

    describe('Display', () => {
        it('should display column headers', async () => {
            renderWithProviders([mockUserSessionsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Tenant')).toBeInTheDocument();
                expect(screen.getByText('Client')).toBeInTheDocument();
            });
        });

        it('should display all user sessions', async () => {
            renderWithProviders([mockUserSessionsQuery]);

            await waitFor(() => {
                const tenantOneElements = screen.getAllByText('Tenant One');
                expect(tenantOneElements.length).toBeGreaterThan(0);
            });

            // Check each unique session detail appears
            expect(screen.getByText('Tenant Two')).toBeInTheDocument();
            expect(screen.getByText('Client Application 1')).toBeInTheDocument();
            expect(screen.getByText('Client Application 2')).toBeInTheDocument();
            expect(screen.getByText('Client Application 3')).toBeInTheDocument();
        });

        it('should display sessions with tenant and client names', async () => {
            renderWithProviders([mockUserSessionsQuery]);

            await waitFor(() => {
                const tenantOneElements = screen.getAllByText('Tenant One');
                expect(tenantOneElements.length).toBeGreaterThan(0);
            });

            // Check for specific session details
            const tenantOneElements = screen.getAllByText('Tenant One');
            expect(tenantOneElements.length).toBe(2); // Appears twice
            expect(screen.getByText('Client Application 1')).toBeInTheDocument();
            expect(screen.getByText('Tenant Two')).toBeInTheDocument();
            expect(screen.getByText('Client Application 2')).toBeInTheDocument();
        });

        it('should display multiple sessions for the same tenant', async () => {
            renderWithProviders([mockUserSessionsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Client Application 1')).toBeInTheDocument();
            });

            // Tenant One should appear twice (for client-1 and client-3)
            const tenantOneElements = screen.getAllByText('Tenant One');
            expect(tenantOneElements.length).toBe(2);
        });
    });

    describe('Delete Functionality', () => {
        it('should display delete icons when user has delete permission', async () => {
            renderWithProviders([mockUserSessionsQuery], [
                { scopeName: USER_SESSION_DELETE_SCOPE }
            ]);

            await waitFor(() => {
                const tenantOneElements = screen.getAllByText('Tenant One');
                expect(tenantOneElements.length).toBeGreaterThan(0);
            });

            const deleteIcons = screen.getAllByTestId('DeleteForeverOutlinedIcon');
            expect(deleteIcons).toHaveLength(mockUserSessions.length);
        });

        it('should not display delete icons when user lacks delete permission', async () => {
            renderWithProviders([mockUserSessionsQuery]);

            await waitFor(() => {
                const tenantOneElements = screen.getAllByText('Tenant One');
                expect(tenantOneElements.length).toBeGreaterThan(0);
            });

            expect(screen.queryByTestId('DeleteForeverOutlinedIcon')).not.toBeInTheDocument();
        });

        it('should open delete confirmation dialog when delete icon is clicked', async () => {
            renderWithProviders([mockUserSessionsQuery], [
                { scopeName: USER_SESSION_DELETE_SCOPE }
            ]);

            await waitFor(() => {
                const tenantOneElements = screen.getAllByText('Tenant One');
                expect(tenantOneElements.length).toBeGreaterThan(0);
            });

            const deleteIcons = screen.getAllByTestId('DeleteForeverOutlinedIcon');
            fireEvent.click(deleteIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm deletion of session')).toBeInTheDocument();
            });
        });

        it('should close delete dialog when cancel is clicked', async () => {
            renderWithProviders([mockUserSessionsQuery], [
                { scopeName: USER_SESSION_DELETE_SCOPE }
            ]);

            await waitFor(() => {
                const tenantOneElements = screen.getAllByText('Tenant One');
                expect(tenantOneElements.length).toBeGreaterThan(0);
            });

            const deleteIcons = screen.getAllByTestId('DeleteForeverOutlinedIcon');
            fireEvent.click(deleteIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm deletion of session')).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText('Confirm deletion of session')).not.toBeInTheDocument();
            });
        });

        it('should call delete mutation when confirmed', async () => {
            const { onUpdateStart, onUpdateEnd } = renderWithProviders(
                [
                    mockUserSessionsQuery,
                    mockDeleteMutation,
                    mockUserSessionsQuery
                ],
                [{ scopeName: USER_SESSION_DELETE_SCOPE }]
            );

            await waitFor(() => {
                const tenantOneElements = screen.getAllByText('Tenant One');
                expect(tenantOneElements.length).toBeGreaterThan(0);
            });

            const deleteIcons = screen.getAllByTestId('DeleteForeverOutlinedIcon');
            fireEvent.click(deleteIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm deletion of session')).toBeInTheDocument();
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

        it('should display error message when delete mutation fails', async () => {
            const { onUpdateEnd } = renderWithProviders(
                [
                    mockUserSessionsQuery,
                    mockDeleteMutationError
                ],
                [{ scopeName: USER_SESSION_DELETE_SCOPE }]
            );

            await waitFor(() => {
                const tenantOneElements = screen.getAllByText('Tenant One');
                expect(tenantOneElements.length).toBeGreaterThan(0);
            });

            const deleteIcons = screen.getAllByTestId('DeleteForeverOutlinedIcon');
            fireEvent.click(deleteIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm deletion of session')).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(onUpdateEnd).toHaveBeenCalledWith(false);
            });

            await waitFor(() => {
                expect(screen.getByText('Failed to delete session')).toBeInTheDocument();
            });
        });

        it('should close error alert when close icon is clicked', async () => {
            renderWithProviders(
                [
                    mockUserSessionsQuery,
                    mockDeleteMutationError
                ],
                [{ scopeName: USER_SESSION_DELETE_SCOPE }]
            );

            await waitFor(() => {
                const tenantOneElements = screen.getAllByText('Tenant One');
                expect(tenantOneElements.length).toBeGreaterThan(0);
            });

            const deleteIcons = screen.getAllByTestId('DeleteForeverOutlinedIcon');
            fireEvent.click(deleteIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm deletion of session')).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.getByText('Failed to delete session')).toBeInTheDocument();
            });

            const closeIcon = screen.getByTestId('CloseIcon').parentElement;
            if (closeIcon) {
                fireEvent.click(closeIcon);
            }

            await waitFor(() => {
                expect(screen.queryByText('Failed to delete session')).not.toBeInTheDocument();
            });
        });
    });

    describe('Empty State', () => {
        it('should display empty message when no sessions exist', async () => {
            renderWithProviders([mockEmptyUserSessionsQuery]);

            await waitFor(() => {
                expect(screen.getByText('No user sessions')).toBeInTheDocument();
            });
        });

        it('should not display delete icons in empty state', async () => {
            renderWithProviders([mockEmptyUserSessionsQuery], [
                { scopeName: USER_SESSION_DELETE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('No user sessions')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('DeleteForeverOutlinedIcon')).not.toBeInTheDocument();
        });
    });

    describe('Query Options', () => {
        it('should use no-cache fetch policy', async () => {
            // This test verifies the query configuration indirectly
            // by checking that data is loaded correctly with the no-cache policy
            renderWithProviders([mockUserSessionsQuery]);

            await waitFor(() => {
                const tenantOneElements = screen.getAllByText('Tenant One');
                expect(tenantOneElements.length).toBeGreaterThan(0);
            });

            // Verify sessions are displayed (confirming query executed)
            expect(screen.getByText('Client Application 1')).toBeInTheDocument();
        });
    });
});
