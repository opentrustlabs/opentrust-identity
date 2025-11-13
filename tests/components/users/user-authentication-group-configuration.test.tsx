import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { IntlProvider } from 'react-intl';
import UserAuthenticationGroupConfiguration from '@/components/users/user-authentication-group-configuration';
import { AUTHENTICATION_GROUPS_QUERY, USER_TENANT_RELS_QUERY, SEARCH_QUERY } from '@/graphql/queries/oidc-queries';
import { AUTHENTICATION_GROUP_USER_ADD_MUTATION, AUTHENTICATION_GROUP_USER_REMOVE_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext } from '@/components/contexts/auth-context';
import { AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, AUTHENTICATION_GROUP_USER_REMOVE_SCOPE, TENANT_TYPE_ROOT_TENANT, TENANT_TYPE_SERVICES } from '@/utils/consts';
import { AuthenticationGroup, SearchResultType, SearchFilterInputObjectType, UserTenantRelView } from '@/graphql/generated/graphql-types';

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
const mockStandardTenantId = 'tenant-standard';

const mockAuthenticationGroups: AuthenticationGroup[] = [
    {
        tenantId: mockTenantId,
        authenticationGroupId: 'group-1',
        authenticationGroupName: 'Admins',
        authenticationGroupDescription: 'Admin group',
        defaultGroup: false,
        markForDelete: false
    },
    {
        tenantId: mockTenantId,
        authenticationGroupId: 'group-2',
        authenticationGroupName: 'Users',
        authenticationGroupDescription: 'User group',
        defaultGroup: true,
        markForDelete: false
    },
    {
        tenantId: mockStandardTenantId,
        authenticationGroupId: 'group-3',
        authenticationGroupName: 'Developers',
        authenticationGroupDescription: 'Developer group',
        defaultGroup: false,
        markForDelete: false
    }
];

const mockUserTenantRels: UserTenantRelView[] = [
    {
        userId: mockUserId,
        tenantId: mockTenantId,
        tenantName: 'Root Tenant',
        relType: 'STANDARD'
    },
    {
        userId: mockUserId,
        tenantId: mockStandardTenantId,
        tenantName: 'Standard Tenant',
        relType: 'STANDARD'
    }
];

const mockSearchResults = {
    endtime: Date.now(),
    page: 1,
    perpage: 10,
    resultlist: [
        {
            objectid: 'group-new-1',
            name: 'New Group 1',
            type: 'AuthenticationGroup'
        },
        {
            objectid: 'group-new-2',
            name: 'New Group 2',
            type: 'AuthenticationGroup'
        }
    ],
    starttime: Date.now(),
    took: 50,
    total: 2
};

const mockAuthenticationGroupsQuery = {
    request: {
        query: AUTHENTICATION_GROUPS_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    result: {
        data: {
            getAuthenticationGroups: mockAuthenticationGroups
        }
    }
};

const mockEmptyAuthenticationGroupsQuery = {
    request: {
        query: AUTHENTICATION_GROUPS_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    result: {
        data: {
            getAuthenticationGroups: []
        }
    }
};

const mockAuthenticationGroupsError = {
    request: {
        query: AUTHENTICATION_GROUPS_QUERY,
        variables: {
            userId: mockUserId
        }
    },
    error: new Error('Failed to load authentication groups')
};

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

const mockSearchQuery = {
    request: {
        query: SEARCH_QUERY,
        variables: {
            searchInput: {
                term: '',
                filters: mockUserTenantRels.map(rel => ({
                    objectType: SearchFilterInputObjectType.TenantId,
                    objectValue: rel.tenantId
                })),
                page: 1,
                perPage: 10,
                resultType: SearchResultType.AuthenticationGroup
            }
        }
    },
    result: {
        data: {
            search: mockSearchResults
        }
    }
};

const mockSearchQueryFiltered = {
    request: {
        query: SEARCH_QUERY,
        variables: {
            searchInput: {
                term: 'New Group 1',
                filters: mockUserTenantRels.map(rel => ({
                    objectType: SearchFilterInputObjectType.TenantId,
                    objectValue: rel.tenantId
                })),
                page: 1,
                perPage: 10,
                resultType: SearchResultType.AuthenticationGroup
            }
        }
    },
    result: {
        data: {
            search: {
                ...mockSearchResults,
                resultlist: [mockSearchResults.resultlist[0]],
                total: 1
            }
        }
    }
};

const mockAddMutation = {
    request: {
        query: AUTHENTICATION_GROUP_USER_ADD_MUTATION,
        variables: {
            userId: mockUserId,
            authenticationGroupId: 'group-new-1'
        }
    },
    result: {
        data: {
            addUserToAuthenticationGroup: {
                userId: mockUserId,
                authenticationGroupId: 'group-new-1'
            }
        }
    }
};

const mockRemoveMutation = {
    request: {
        query: AUTHENTICATION_GROUP_USER_REMOVE_MUTATION,
        variables: {
            userId: mockUserId,
            authenticationGroupId: 'group-1'
        }
    },
    result: {
        data: {
            removeUserFromAuthenticationGroup: true
        }
    }
};

const mockAddMutationError = {
    request: {
        query: AUTHENTICATION_GROUP_USER_ADD_MUTATION,
        variables: {
            userId: mockUserId,
            authenticationGroupId: 'group-new-1'
        }
    },
    error: new Error('Failed to add user to group')
};

const mockRemoveMutationError = {
    request: {
        query: AUTHENTICATION_GROUP_USER_REMOVE_MUTATION,
        variables: {
            userId: mockUserId,
            authenticationGroupId: 'group-1'
        }
    },
    error: new Error('Failed to remove user from group')
};

describe('UserAuthenticationGroupConfiguration', () => {
    const mockTenantBean = {
        getTenantMetaData: jest.fn(() => ({
            tenant: {
                tenantId: mockTenantId,
                tenantName: 'Root Tenant',
                tenantType: TENANT_TYPE_ROOT_TENANT
            }
        }))
    };

    const renderWithProviders = (
        mocks: any[],
        scopes: Array<{ scopeName: string }> = [],
        tenantType: string = TENANT_TYPE_ROOT_TENANT
    ) => {
        const onUpdateStart = jest.fn();
        const onUpdateEnd = jest.fn();

        mockTenantBean.getTenantMetaData.mockReturnValue({
            tenant: {
                tenantId: tenantType === TENANT_TYPE_ROOT_TENANT ? mockTenantId : mockStandardTenantId,
                tenantName: tenantType === TENANT_TYPE_ROOT_TENANT ? 'Root Tenant' : 'Standard Tenant',
                tenantType: tenantType
            }
        });

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
                                <UserAuthenticationGroupConfiguration
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
            renderWithProviders([mockAuthenticationGroupsQuery]);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should display error message when query fails', async () => {
            renderWithProviders([mockAuthenticationGroupsError]);

            await waitFor(() => {
                expect(screen.getByText('Failed to load authentication groups')).toBeInTheDocument();
            });
        });
    });

    describe('Display - Root Tenant', () => {
        it('should display column headers for root tenant', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Group Name')).toBeInTheDocument();
                expect(screen.getByText('Tenant')).toBeInTheDocument();
            });
        });

        it('should display all authentication group names as links', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            mockAuthenticationGroups.forEach(group => {
                const link = screen.getByText(group.authenticationGroupName);
                expect(link).toBeInTheDocument();
                expect(link.closest('a')).toHaveAttribute(
                    'href',
                    `/${mockTenantId}/authentication-groups/${group.authenticationGroupId}`
                );
            });
        });

        it('should display info icons for tenant info in root tenant', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            const infoIcons = screen.getAllByTestId('InfoOutlinedIcon');
            expect(infoIcons).toHaveLength(mockAuthenticationGroups.length);
        });

        it('should open tenant info dialog when info icon is clicked', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            const infoIcons = screen.getAllByTestId('InfoOutlinedIcon');
            fireEvent.click(infoIcons[0]);

            await waitFor(() => {
                expect(screen.getByTestId('tenant-quick-info')).toBeInTheDocument();
                expect(screen.getByText(`Tenant Info: ${mockTenantId}`)).toBeInTheDocument();
            });
        });

        it('should close tenant info dialog when close button is clicked', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
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

    describe('Display - Non-Root Tenant', () => {
        it('should have tenant column with zero size for non-root tenant', async () => {
            renderWithProviders(
                [mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery],
                [],
                TENANT_TYPE_SERVICES
            );

            await waitFor(() => {
                expect(screen.getByText('Group Name')).toBeInTheDocument();
            });

            // The "Tenant" text is in a Grid2 with size 0, so it's in the document but not visible
            const tenantElement = screen.getByText('Tenant');
            expect(tenantElement).toBeInTheDocument();
            // The parent Grid2 should have size 0 class
            const parentGrid = tenantElement.closest('.MuiGrid2-root');
            expect(parentGrid).toHaveClass('MuiGrid2-grid-xs-0');
        });

        it('should not display info icons in non-root tenant', async () => {
            renderWithProviders(
                [mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery],
                [],
                TENANT_TYPE_SERVICES
            );

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            // Check that InfoOutlinedIcon is not visible
            const infoIcons = screen.queryAllByTestId('InfoOutlinedIcon');
            // Icons should not be rendered in non-root tenant
            expect(infoIcons.length).toBe(0);
        });
    });

    describe('Add Authentication Group Functionality', () => {
        it('should display add button when user has assign permission', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery], [
                { scopeName: AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Assign User To Authentication Group')).toBeInTheDocument();
            });

            expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
        });

        it('should not display add button when user lacks assign permission', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            expect(screen.queryByText('Assign User To Authentication Group')).not.toBeInTheDocument();
        });
    });

    describe('Remove Authentication Group Functionality', () => {
        it('should display remove icons when user has remove permission', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery], [
                { scopeName: AUTHENTICATION_GROUP_USER_REMOVE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(mockAuthenticationGroups.length);
        });

        it('should not display remove icons when user lacks remove permission', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery]);

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
        });

        it('should open remove confirmation dialog when remove icon is clicked', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery], [
                { scopeName: AUTHENTICATION_GROUP_USER_REMOVE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm removal of authentication group')).toBeInTheDocument();
            });
        });

        it('should close remove dialog when cancel is clicked', async () => {
            renderWithProviders([mockAuthenticationGroupsQuery, mockAuthenticationGroupsQuery], [
                { scopeName: AUTHENTICATION_GROUP_USER_REMOVE_SCOPE }
            ]);

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm removal of authentication group')).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText('Confirm removal of authentication group')).not.toBeInTheDocument();
            });
        });

        it('should call remove mutation when confirmed', async () => {
            const { onUpdateStart, onUpdateEnd } = renderWithProviders(
                [
                    mockAuthenticationGroupsQuery,
                    mockAuthenticationGroupsQuery,
                    mockRemoveMutation,
                    mockAuthenticationGroupsQuery
                ],
                [{ scopeName: AUTHENTICATION_GROUP_USER_REMOVE_SCOPE }]
            );

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm removal of authentication group')).toBeInTheDocument();
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
                    mockAuthenticationGroupsQuery,
                    mockAuthenticationGroupsQuery,
                    mockRemoveMutationError
                ],
                [{ scopeName: AUTHENTICATION_GROUP_USER_REMOVE_SCOPE }]
            );

            await waitFor(() => {
                expect(screen.getByText('Admins')).toBeInTheDocument();
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Confirm removal of authentication group')).toBeInTheDocument();
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
    });

    describe('Empty State', () => {
        it('should display empty message when no authentication groups are assigned', async () => {
            renderWithProviders([mockEmptyAuthenticationGroupsQuery]);

            await waitFor(() => {
                expect(screen.getByText('No authentication groups')).toBeInTheDocument();
            });
        });
    });

});
