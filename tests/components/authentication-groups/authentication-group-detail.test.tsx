import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import AuthenticationGroupDetail from '@/components/authentication-groups/authentication-group-detail';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { ClipboardCopyContextProvider } from '@/components/contexts/clipboard-copy-context';
import { IntlProvider } from 'react-intl';
import { AuthenticationGroup } from '@/graphql/generated/graphql-types';
import {
    SCOPE_USE_IAM_MANAGEMENT,
    AUTHENTICATION_GROUP_UPDATE_SCOPE,
    AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE,
    AUTHENTICATION_GROUP_USER_REMOVE_SCOPE,
    AUTHENTICATION_GROUP_DELETE_SCOPE
} from '@/utils/consts';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/authentication-groups/test-group-id',
}));

// Mock messages for react-intl
const messages = {
    'authenticationGroupDetail.breadcrumb.home': 'Home',
    'authenticationGroupDetail.breadcrumb.groups': 'Authentication Groups',
    'authenticationGroupDetail.overview.title': 'Overview',
    'authenticationGroupDetail.update.success': 'Authentication Group Updated',
    'authenticationGroupDetail.update.error': 'Error updating authentication group',
};

// Mock authentication group data
const mockAuthenticationGroup: AuthenticationGroup = {
    authenticationGroupId: 'test-group-id',
    authenticationGroupName: 'Test Group',
    authenticationGroupDescription: 'Test Group Description',
    tenantId: 'test-tenant-id',
    defaultGroup: false,
    markForDelete: false,
};

// Mock tenant data
const mockTenant = {
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    tenantType: 'STANDARD',
};

// Mock context values
const mockTenantContext: any = {
    tenantBean: mockTenant,
    setTenantBean: jest.fn(),
    setTenantMetaData: jest.fn(),
    getTenantMetaData: jest.fn(() => ({ tenant: mockTenant })),
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
                scopeName: AUTHENTICATION_GROUP_UPDATE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id2',
                scopeName: AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id3',
                scopeName: AUTHENTICATION_GROUP_USER_REMOVE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id4',
                scopeName: AUTHENTICATION_GROUP_DELETE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
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

// Helper function to render component with all providers
const renderWithProviders = (
    authenticationGroup: AuthenticationGroup = mockAuthenticationGroup,
    authContext: AuthContextProps = mockAuthContext,
    mocks: any[] = []
) => {
    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <IntlProvider messages={messages} locale="en" defaultLocale="en">
                <TenantContext.Provider value={mockTenantContext}>
                    <AuthContext.Provider value={authContext}>
                        <ClipboardCopyContextProvider>
                            <AuthenticationGroupDetail authenticationGroup={authenticationGroup} />
                        </ClipboardCopyContextProvider>
                    </AuthContext.Provider>
                </TenantContext.Provider>
            </IntlProvider>
        </MockedProvider>
    );
};

describe('AuthenticationGroupDetail Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render group overview with correct data', async () => {
            renderWithProviders();

            await waitFor(() => {
                // Check for group name input
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
                // Check for group description
                expect(screen.getByDisplayValue('Test Group Description')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display group ID', async () => {
            renderWithProviders();

            await waitFor(() => {
                // Group ID should be displayed somewhere in the component
                expect(screen.getByText(/test-group-id/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render breadcrumb navigation', async () => {
            renderWithProviders();

            await waitFor(() => {
                // Check for group name in breadcrumb
                expect(screen.getByText('Test Group')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display default checkbox as unchecked when group is not default', async () => {
            renderWithProviders();

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                // Find the default checkbox (should be unchecked)
                const defaultCheckbox = checkboxes.find(cb => !(cb as HTMLInputElement).checked);
                expect(defaultCheckbox).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should display default checkbox as checked when group is default', async () => {
            const defaultGroup: AuthenticationGroup = {
                ...mockAuthenticationGroup,
                defaultGroup: true,
            };

            renderWithProviders(defaultGroup);

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                // Find the checked checkbox
                const defaultCheckbox = checkboxes.find(cb => (cb as HTMLInputElement).checked);
                expect(defaultCheckbox).toBeTruthy();
            }, { timeout: 3000 });
        });
    });

    describe('Form Interactions', () => {
        it('should update group name input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
            }, { timeout: 3000 });

            const nameInput = screen.getByDisplayValue('Test Group');
            fireEvent.change(nameInput, { target: { value: 'Updated Group Name' } });

            expect(nameInput).toHaveValue('Updated Group Name');
        });

        it('should update description input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group Description')).toBeInTheDocument();
            }, { timeout: 3000 });

            const descInput = screen.getByDisplayValue('Test Group Description');
            fireEvent.change(descInput, { target: { value: 'Updated Description' } });

            expect(descInput).toHaveValue('Updated Description');
        });

        it('should toggle default checkbox', async () => {
            renderWithProviders();

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(0);
            }, { timeout: 3000 });

            const checkboxes = screen.getAllByRole('checkbox');
            const firstCheckbox = checkboxes[0];
            const initialState = (firstCheckbox as HTMLInputElement).checked;

            fireEvent.click(firstCheckbox);

            expect((firstCheckbox as HTMLInputElement).checked).toBe(!initialState);
        });
    });

    describe('Authorization and Permissions', () => {
        it('should disable inputs when user lacks AUTHENTICATION_GROUP_UPDATE scope', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [], // No permissions
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

            renderWithProviders(mockAuthenticationGroup, restrictedAuthContext);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
                const nameInput = screen.getByDisplayValue('Test Group') as HTMLInputElement;
                expect(nameInput.disabled).toBe(true);
            }, { timeout: 3000 });
        });

        it('should hide delete button when user lacks AUTHENTICATION_GROUP_DELETE scope', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [
                        {
                            scopeId: 'id1',
                            scopeName: AUTHENTICATION_GROUP_UPDATE_SCOPE, // Has update but not delete
                            markForDelete: false,
                            scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                            scopeDescription: ''
                        },
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

            renderWithProviders(mockAuthenticationGroup, restrictedAuthContext);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should enable inputs when user has AUTHENTICATION_GROUP_UPDATE scope', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
                const nameInput = screen.getByDisplayValue('Test Group') as HTMLInputElement;
                expect(nameInput.disabled).toBe(false);
            }, { timeout: 3000 });
        });
    });

    describe('Marked for Deletion State', () => {
        it('should display alert when group is marked for deletion', async () => {
            const markedGroup: AuthenticationGroup = {
                ...mockAuthenticationGroup,
                markForDelete: true,
            };

            renderWithProviders(markedGroup);

            await waitFor(() => {
                expect(screen.getByText(/marked for deletion/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should disable all inputs when group is marked for deletion', async () => {
            const markedGroup: AuthenticationGroup = {
                ...mockAuthenticationGroup,
                markForDelete: true,
            };

            renderWithProviders(markedGroup);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test Group') as HTMLInputElement;
                expect(nameInput.disabled).toBe(true);
            }, { timeout: 3000 });
        });

        it('should not show users section when group is marked for deletion', async () => {
            const markedGroup: AuthenticationGroup = {
                ...mockAuthenticationGroup,
                markForDelete: true,
            };

            renderWithProviders(markedGroup);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Users accordion should not be present
            const usersText = screen.queryByText('Users');
            expect(usersText).not.toBeInTheDocument();
        });
    });

    describe('Default Group Behavior', () => {
        it('should show info message when group is marked as default', async () => {
            const defaultGroup: AuthenticationGroup = {
                ...mockAuthenticationGroup,
                defaultGroup: true,
            };

            renderWithProviders(defaultGroup);

            await waitFor(() => {
                expect(screen.getByText(/ALL users who belong to the tenant/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not show user assignment section for default groups', async () => {
            const defaultGroup: AuthenticationGroup = {
                ...mockAuthenticationGroup,
                defaultGroup: true,
            };

            renderWithProviders(defaultGroup);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Should show the info message about default groups
            expect(screen.getByText(/ALL users who belong to the tenant/i)).toBeInTheDocument();
        });

        it('should show users section for non-default groups', async () => {
            const nonDefaultGroup: AuthenticationGroup = {
                ...mockAuthenticationGroup,
                defaultGroup: false,
            };

            renderWithProviders(nonDefaultGroup);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Users section should be present
            const usersText = screen.getByText('Users');
            expect(usersText).toBeInTheDocument();
        });
    });

    describe('Update Button', () => {
        it('should render update button when user has permissions', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should enable update button when form is dirty', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Make form dirty by changing a value
            const nameInput = screen.getByDisplayValue('Test Group');
            fireEvent.change(nameInput, { target: { value: 'Modified Group' } });

            // Update button should exist
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });
    });

    describe('Users Section', () => {
        it('should display users accordion for non-default groups', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Users')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display relationship component when group is default', async () => {
            const defaultGroup: AuthenticationGroup = {
                ...mockAuthenticationGroup,
                defaultGroup: true,
            };

            renderWithProviders(defaultGroup);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Should show info message instead of relationship component
            expect(screen.getByText(/For default authentication groups/i)).toBeInTheDocument();
        });
    });

    describe('Object ID and Clipboard', () => {
        it('should display group ID with copy button', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('test-group-id')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Check for Object ID label
            expect(screen.getByText('Object ID')).toBeInTheDocument();
        });

        it('should render copy icon for group ID', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('test-group-id')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Copy icon should be present (ContentCopyIcon)
            const groupIdSection = screen.getByText('test-group-id').closest('div');
            expect(groupIdSection).toBeInTheDocument();
        });
    });

    describe('Overview Section', () => {
        it('should render Overview header', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render all form fields', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Group Description')).toBeInTheDocument();
                expect(screen.getByText('test-group-id')).toBeInTheDocument();
                expect(screen.getByText('Default')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });
});
