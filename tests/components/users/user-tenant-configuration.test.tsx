import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { IntlProvider } from 'react-intl';
import UserTenantConfiguration from '@/components/users/user-tenant-configuration';
import { USER_TENANT_RELS_QUERY } from '@/graphql/queries/oidc-queries';
import { USER_TENANT_REL_ASSIGN_MUTATION, USER_TENANT_REL_REMOVE_MUTATION, USER_TENANT_REL_UPDATE_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext } from '@/components/contexts/auth-context';
import { TENANT_USER_ASSIGN_SCOPE, TENANT_USER_REMOVE_SCOPE, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY } from '@/utils/consts';
import { UserTenantRelView } from '@/graphql/generated/graphql-types';

// Mock Next.js Link
jest.mock('next/link', () => {
    return ({ children, href }: any) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock TenantSelector component
jest.mock('@/components/dialogs/tenant-selector', () => {
    return function MockTenantSelector({ onCancel, onSelected, submitButtonText }: any) {
        return (
            <div data-testid="tenant-selector">
                <div>Tenant Selector</div>
                <button onClick={() => onSelected('new-tenant-123')}>
                    {submitButtonText}
                </button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        );
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

const mockUserTenantRels: UserTenantRelView[] = [
    {
        userId: mockUserId,
        tenantId: 'tenant-1',
        tenantName: 'Primary Tenant',
        relType: USER_TENANT_REL_TYPE_PRIMARY
    },
    {
        userId: mockUserId,
        tenantId: 'tenant-2',
        tenantName: 'Guest Tenant 1',
        relType: USER_TENANT_REL_TYPE_GUEST
    },
    {
        userId: mockUserId,
        tenantId: 'tenant-3',
        tenantName: 'Guest Tenant 2',
        relType: USER_TENANT_REL_TYPE_GUEST
    }
];

const mockUserTenantRelsQuery = {
    request: {
        query: USER_TENANT_RELS_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    result: {
        data: {
            getUserTenantRels: mockUserTenantRels
        }
    }
};

const mockEmptyUserTenantRelsQuery = {
    request: {
        query: USER_TENANT_RELS_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    result: {
        data: {
            getUserTenantRels: []
        }
    }
};

const mockUserTenantRelsError = {
    request: {
        query: USER_TENANT_RELS_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    error: new Error('Failed to load tenant relationships')
};

const mockUpdateMutation = {
    request: {
        query: USER_TENANT_REL_UPDATE_MUTATION,
        variables: {
            userId: mockUserId,
            tenantId: 'tenant-2',
            relType: USER_TENANT_REL_TYPE_PRIMARY
        }
    },
    result: {
        data: {
            updateUserTenantRel: true
        }
    }
};

const mockUpdateMutationError = {
    request: {
        query: USER_TENANT_REL_UPDATE_MUTATION,
        variables: {
            userId: mockUserId,
            tenantId: 'tenant-2',
            relType: USER_TENANT_REL_TYPE_PRIMARY
        }
    },
    error: new Error('Failed to update tenant relationship')
};

const mockRemoveMutation = {
    request: {
        query: USER_TENANT_REL_REMOVE_MUTATION,
        variables: {
            userId: mockUserId,
            tenantId: 'tenant-2'
        }
    },
    result: {
        data: {
            removeUserFromTenant: true
        }
    }
};

const mockRemoveMutationError = {
    request: {
        query: USER_TENANT_REL_REMOVE_MUTATION,
        variables: {
            userId: mockUserId,
            tenantId: 'tenant-2'
        }
    },
    error: new Error('Failed to remove tenant relationship')
};

const mockAssignMutation = {
    request: {
        query: USER_TENANT_REL_ASSIGN_MUTATION,
        variables: {
            userId: mockUserId,
            tenantId: 'new-tenant-123',
            relType: USER_TENANT_REL_TYPE_GUEST
        }
    },
    result: {
        data: {
            assignUserToTenant: true
        }
    }
};

const mockAssignMutationPrimary = {
    request: {
        query: USER_TENANT_REL_ASSIGN_MUTATION,
        variables: {
            userId: mockUserId,
            tenantId: 'new-tenant-123',
            relType: USER_TENANT_REL_TYPE_PRIMARY
        }
    },
    result: {
        data: {
            assignUserToTenant: true
        }
    }
};

describe('UserTenantConfiguration', () => {
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
        const onLoadCompleted = jest.fn();
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
                                <UserTenantConfiguration
                                    userId={mockUserId}
                                    onLoadCompleted={onLoadCompleted}
                                    onUpdateStart={onUpdateStart}
                                    onUpdateEnd={onUpdateEnd}
                                />
                            </AuthContext.Provider>
                        </TenantContext.Provider>
                    </MockedProvider>
                </IntlProvider>
            ),
            onLoadCompleted,
            onUpdateStart,
            onUpdateEnd
        };
    };

    describe('Loading and Error States', () => {
        it('should display loading state initially', () => {
            renderWithProviders([mockUserTenantRelsQuery]);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should display error message when query fails', async () => {
            renderWithProviders([mockUserTenantRelsError]);

            await waitFor(() => {
                expect(screen.getByText('Failed to load tenant relationships')).toBeInTheDocument();
            });
        });

        it('should call onLoadCompleted when data is loaded', async () => {
            const { onLoadCompleted } = renderWithProviders([mockUserTenantRelsQuery]);

            await waitFor(() => {
                expect(onLoadCompleted).toHaveBeenCalledWith(mockUserTenantRels);
            });
        });
    });

    describe('Display', () => {
        it('should display column headers', async () => {
            renderWithProviders([mockUserTenantRelsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Primary Tenant')).toBeInTheDocument();
            });

            // "Primary" appears as both header and membership type
            const primaryElements = screen.getAllByText('Primary');
            expect(primaryElements.length).toBeGreaterThan(0);
            expect(screen.getByText('Tenant Name')).toBeInTheDocument();
            expect(screen.getByText('Membership Type')).toBeInTheDocument();
        });

        it('should display all tenant relationships', async () => {
            renderWithProviders([mockUserTenantRelsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Primary Tenant')).toBeInTheDocument();
            });

            expect(screen.getByText('Primary Tenant')).toBeInTheDocument();
            expect(screen.getByText('Guest Tenant 1')).toBeInTheDocument();
            expect(screen.getByText('Guest Tenant 2')).toBeInTheDocument();
        });

        it('should display tenant names as links', async () => {
            renderWithProviders([mockUserTenantRelsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Primary Tenant')).toBeInTheDocument();
            });

            const primaryTenantLink = screen.getByRole('link', { name: 'Primary Tenant' });
            expect(primaryTenantLink).toHaveAttribute('href', `/${mockTenantId}/tenants/tenant-1`);
        });

        it('should display membership types', async () => {
            renderWithProviders([mockUserTenantRelsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Primary Tenant')).toBeInTheDocument();
            });

            // Check that "Primary" and "Guest" membership types are displayed
            const primaryType = screen.getAllByText('Primary');
            expect(primaryType.length).toBeGreaterThan(1); // Header + membership type

            const guestTypes = screen.getAllByText('Guest');
            expect(guestTypes.length).toBe(2); // Two guest tenants
        });

        it('should display primary tenant icon for primary relationship', async () => {
            renderWithProviders([mockUserTenantRelsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Primary Tenant')).toBeInTheDocument();
            });

            const gradeIcons = screen.getAllByTestId('GradeIcon');
            expect(gradeIcons).toHaveLength(1); // Only one primary tenant
        });

        it('should display star outline icons for guest relationships', async () => {
            renderWithProviders([mockUserTenantRelsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Primary Tenant')).toBeInTheDocument();
            });

            const starOutlineIcons = screen.getAllByTestId('StarOutlineOutlinedIcon');
            expect(starOutlineIcons).toHaveLength(2); // Two guest tenants
        });
    });

    describe('Add Tenant Functionality', () => {
        it('should display add button when user has assign permission', async () => {
            renderWithProviders([mockUserTenantRelsQuery], [
                { scopeName: TENANT_USER_ASSIGN_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Add User To Tenant')).toBeInTheDocument();
            });

            expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
        });

        it('should not display add button when user lacks assign permission', async () => {
            renderWithProviders([mockUserTenantRelsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Primary Tenant')).toBeInTheDocument();
            });

            expect(screen.queryByText('Add User To Tenant')).not.toBeInTheDocument();
        });

        it('should open tenant selector dialog when add button is clicked', async () => {
            renderWithProviders([mockUserTenantRelsQuery], [
                { scopeName: TENANT_USER_ASSIGN_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Add User To Tenant')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
            });
        });

        it('should close dialog when cancel is clicked in tenant selector', async () => {
            renderWithProviders([mockUserTenantRelsQuery], [
                { scopeName: TENANT_USER_ASSIGN_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Add User To Tenant')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByTestId('tenant-selector')).not.toBeInTheDocument();
            });
        });

        it('should assign user to tenant as GUEST when user has existing tenants', async () => {
            renderWithProviders([
                mockUserTenantRelsQuery,
                mockAssignMutation,
                mockUserTenantRelsQuery
            ], [
                { scopeName: TENANT_USER_ASSIGN_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Add User To Tenant')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
            });

            const submitButton = screen.getByRole('button', { name: /submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.queryByTestId('tenant-selector')).not.toBeInTheDocument();
            });
        });

        it('should assign user to tenant as PRIMARY when user has no existing tenants', async () => {
            renderWithProviders([
                mockEmptyUserTenantRelsQuery,
                mockAssignMutationPrimary,
                mockUserTenantRelsQuery
            ], [
                { scopeName: TENANT_USER_ASSIGN_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Add User To Tenant')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('tenant-selector')).toBeInTheDocument();
            });

            const submitButton = screen.getByRole('button', { name: /submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.queryByTestId('tenant-selector')).not.toBeInTheDocument();
            });
        });
    });

    describe('Update Tenant Relationship', () => {
        it('should update guest tenant to primary when star icon is clicked', async () => {
            const { onUpdateStart, onUpdateEnd } = renderWithProviders([
                mockUserTenantRelsQuery,
                mockUpdateMutation,
                mockUserTenantRelsQuery
            ]);

            await waitFor(() => {
                expect(screen.getByText('Guest Tenant 1')).toBeInTheDocument();
            });

            const starIcons = screen.getAllByTestId('StarOutlineOutlinedIcon');
            fireEvent.click(starIcons[0]);

            await waitFor(() => {
                expect(onUpdateStart).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(onUpdateEnd).toHaveBeenCalledWith(true);
            });
        });

        it('should display error when update mutation fails', async () => {
            const { onUpdateEnd } = renderWithProviders([
                mockUserTenantRelsQuery,
                mockUpdateMutationError
            ]);

            await waitFor(() => {
                expect(screen.getByText('Guest Tenant 1')).toBeInTheDocument();
            });

            const starIcons = screen.getAllByTestId('StarOutlineOutlinedIcon');
            fireEvent.click(starIcons[0]);

            await waitFor(() => {
                expect(onUpdateEnd).toHaveBeenCalledWith(false);
            });

            await waitFor(() => {
                expect(screen.getByText('Failed to update tenant relationship')).toBeInTheDocument();
            });
        });

        it('should close error alert when close icon is clicked', async () => {
            renderWithProviders([
                mockUserTenantRelsQuery,
                mockUpdateMutationError
            ]);

            await waitFor(() => {
                expect(screen.getByText('Guest Tenant 1')).toBeInTheDocument();
            });

            const starIcons = screen.getAllByTestId('StarOutlineOutlinedIcon');
            fireEvent.click(starIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Failed to update tenant relationship')).toBeInTheDocument();
            });

            const closeIcon = screen.getByTestId('CloseIcon').parentElement;
            if (closeIcon) {
                fireEvent.click(closeIcon);
            }

            await waitFor(() => {
                expect(screen.queryByText('Failed to update tenant relationship')).not.toBeInTheDocument();
            });
        });
    });

    describe('Remove Tenant Relationship', () => {
        it('should display remove icons for guest tenants when user has remove permission', async () => {
            renderWithProviders([mockUserTenantRelsQuery], [
                { scopeName: TENANT_USER_REMOVE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Guest Tenant 1')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(2); // Two guest tenants
        });

        it('should not display remove icons when user lacks remove permission', async () => {
            renderWithProviders([mockUserTenantRelsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Guest Tenant 1')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
        });

        it('should not display remove icon for primary tenant', async () => {
            renderWithProviders([mockUserTenantRelsQuery], [
                { scopeName: TENANT_USER_REMOVE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Primary Tenant')).toBeInTheDocument();
            });

            // Should only have 2 remove icons (for guest tenants), not 3
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(2);
        });

        it('should remove user from tenant when remove icon is clicked', async () => {
            const { onUpdateStart, onUpdateEnd } = renderWithProviders([
                mockUserTenantRelsQuery,
                mockRemoveMutation,
                mockUserTenantRelsQuery
            ], [
                { scopeName: TENANT_USER_REMOVE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Guest Tenant 1')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(onUpdateStart).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(onUpdateEnd).toHaveBeenCalledWith(true);
            });
        });

        it('should display error when remove mutation fails', async () => {
            const { onUpdateEnd } = renderWithProviders([
                mockUserTenantRelsQuery,
                mockRemoveMutationError
            ], [
                { scopeName: TENANT_USER_REMOVE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Guest Tenant 1')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(onUpdateEnd).toHaveBeenCalledWith(false);
            });

            await waitFor(() => {
                expect(screen.getByText('Failed to remove tenant relationship')).toBeInTheDocument();
            });
        });
    });

    describe('Empty State', () => {
        it('should display empty message when user has no tenant relationships', async () => {
            renderWithProviders([mockEmptyUserTenantRelsQuery]);

            await waitFor(() => {
                expect(screen.getByText('This user does not belong to any tenants.')).toBeInTheDocument();
            });
        });

        it('should still show add button in empty state when user has permission', async () => {
            renderWithProviders([mockEmptyUserTenantRelsQuery], [
                { scopeName: TENANT_USER_ASSIGN_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('This user does not belong to any tenants.')).toBeInTheDocument();
            });

            expect(screen.getByText('Add User To Tenant')).toBeInTheDocument();
        });
    });

    describe('Star Icon Tooltips', () => {
        it('should display tooltip on star outline icon hover', async () => {
            renderWithProviders([mockUserTenantRelsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Guest Tenant 1')).toBeInTheDocument();
            });

            const starIcons = screen.getAllByTestId('StarOutlineOutlinedIcon');
            fireEvent.mouseOver(starIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Assign as primary tenant')).toBeInTheDocument();
            });
        });
    });
});
