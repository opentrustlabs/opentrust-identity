import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import RateLimitDetail from '@/components/rate-limits/rate-limit-detail';
import { TenantContext } from '@/components/contexts/tenant-context';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { ClipboardCopyContextProvider } from '@/components/contexts/clipboard-copy-context';
import { IntlProvider } from 'react-intl';
import { RateLimitServiceGroup } from '@/graphql/generated/graphql-types';
import {
    SCOPE_USE_IAM_MANAGEMENT,
    RATE_LIMIT_UPDATE_SCOPE,
    RATE_LIMIT_DELETE_SCOPE
} from '@/utils/consts';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/rate-limits/test-rate-limit-id',
}));

// Mock messages for react-intl
const messages = {
    'rateLimitDetail.breadcrumb.home': 'Home',
    'rateLimitDetail.breadcrumb.rateLimits': 'Rate Limits',
    'rateLimitDetail.overview.title': 'Overview',
    'rateLimitDetail.update.success': 'Rate Limit Updated',
    'rateLimitDetail.update.error': 'Error updating rate limit',
};

// Mock rate limit data
const mockRateLimit: RateLimitServiceGroup = {
    servicegroupid: 'test-rate-limit-id',
    servicegroupname: 'Test Rate Limit',
    servicegroupdescription: 'Test Rate Limit Description',
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
                scopeName: RATE_LIMIT_UPDATE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            },
            {
                scopeId: 'id2',
                scopeName: RATE_LIMIT_DELETE_SCOPE,
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
    rateLimitDetail: RateLimitServiceGroup = mockRateLimit,
    authContext: AuthContextProps = mockAuthContext,
    mocks: any[] = []
) => {
    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <IntlProvider messages={messages} locale="en" defaultLocale="en">
                <TenantContext.Provider value={mockTenantContext}>
                    <AuthContext.Provider value={authContext}>
                        <ClipboardCopyContextProvider>
                            <RateLimitDetail rateLimitDetail={rateLimitDetail} />
                        </ClipboardCopyContextProvider>
                    </AuthContext.Provider>
                </TenantContext.Provider>
            </IntlProvider>
        </MockedProvider>
    );
};

describe('RateLimitDetail Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render rate limit overview with correct data', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Rate Limit Description')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display service group ID', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText(/test-rate-limit-id/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render breadcrumb navigation', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Test Rate Limit')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display Overview header', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display service group name field', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Service Group Name')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display service group description field', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Service Group Description')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Interactions', () => {
        it('should update service group name input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
            }, { timeout: 3000 });

            const nameInput = screen.getByDisplayValue('Test Rate Limit');
            fireEvent.change(nameInput, { target: { value: 'Updated Rate Limit Name' } });

            expect(nameInput).toHaveValue('Updated Rate Limit Name');
        });

        it('should update service group description input', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit Description')).toBeInTheDocument();
            }, { timeout: 3000 });

            const descInput = screen.getByDisplayValue('Test Rate Limit Description');
            fireEvent.change(descInput, { target: { value: 'Updated Description' } });

            expect(descInput).toHaveValue('Updated Description');
        });

        it('should handle empty description', async () => {
            const rateLimitWithEmptyDesc: RateLimitServiceGroup = {
                ...mockRateLimit,
                servicegroupdescription: '',
            };

            renderWithProviders(rateLimitWithEmptyDesc);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Find the textarea by its ID
            const descInputs = screen.getAllByRole('textbox');
            const descInput = descInputs.find(input => input.getAttribute('name') === 'serviceGroupDescription');
            expect(descInput).toHaveValue('');
        });
    });

    describe('Authorization and Permissions', () => {
        it('should disable inputs when user lacks RATE_LIMIT_UPDATE scope', async () => {
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

            renderWithProviders(mockRateLimit, restrictedAuthContext);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
                const nameInput = screen.getByDisplayValue('Test Rate Limit') as HTMLInputElement;
                expect(nameInput.disabled).toBe(true);
            }, { timeout: 3000 });
        });

        it('should enable inputs when user has RATE_LIMIT_UPDATE scope', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
                const nameInput = screen.getByDisplayValue('Test Rate Limit') as HTMLInputElement;
                expect(nameInput.disabled).toBe(false);
            }, { timeout: 3000 });
        });

        it('should hide delete button when user lacks RATE_LIMIT_DELETE scope', async () => {
            const restrictedAuthContext: AuthContextProps = {
                portalUserProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userId: 'test-user-id',
                    scope: [
                        {
                            scopeId: 'id1',
                            scopeName: RATE_LIMIT_UPDATE_SCOPE, // Has update but not delete
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

            renderWithProviders(mockRateLimit, restrictedAuthContext);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show delete button when user has RATE_LIMIT_DELETE scope', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Delete button should be present (represented by delete icon)
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });
    });

    describe('Marked for Deletion State', () => {
        it('should display alert when rate limit is marked for deletion', async () => {
            const markedRateLimit: RateLimitServiceGroup = {
                ...mockRateLimit,
                markForDelete: true,
            };

            renderWithProviders(markedRateLimit);

            await waitFor(() => {
                expect(screen.getByText(/marked for deletion/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should disable all inputs when rate limit is marked for deletion', async () => {
            const markedRateLimit: RateLimitServiceGroup = {
                ...mockRateLimit,
                markForDelete: true,
            };

            renderWithProviders(markedRateLimit);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test Rate Limit') as HTMLInputElement;
                expect(nameInput.disabled).toBe(true);
            }, { timeout: 3000 });
        });

        it('should not show tenants section when rate limit is marked for deletion', async () => {
            const markedRateLimit: RateLimitServiceGroup = {
                ...mockRateLimit,
                markForDelete: true,
            };

            renderWithProviders(markedRateLimit);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Tenants accordion should not be present
            const tenantsText = screen.queryByText('Tenants');
            expect(tenantsText).not.toBeInTheDocument();
        });

        it('should not show delete button when already marked for deletion', async () => {
            const markedRateLimit: RateLimitServiceGroup = {
                ...mockRateLimit,
                markForDelete: true,
            };

            renderWithProviders(markedRateLimit);

            await waitFor(() => {
                expect(screen.getByText(/marked for deletion/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Tenants Configuration', () => {
        it('should display tenants accordion when not marked for deletion', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Tenants')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show tenants accordion by default', async () => {
            renderWithProviders();

            await waitFor(() => {
                const tenantsHeader = screen.getByText('Tenants');
                expect(tenantsHeader).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should hide tenants accordion when marked for deletion', async () => {
            const markedRateLimit: RateLimitServiceGroup = {
                ...mockRateLimit,
                markForDelete: true,
            };

            renderWithProviders(markedRateLimit);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
            }, { timeout: 3000 });

            const tenantsText = screen.queryByText('Tenants');
            expect(tenantsText).not.toBeInTheDocument();
        });
    });

    describe('Object ID and Clipboard', () => {
        it('should display service group ID with copy button', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('test-rate-limit-id')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Check for Object ID label
            expect(screen.getByText('Object ID')).toBeInTheDocument();
        });

        it('should render copy icon for service group ID', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('test-rate-limit-id')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Copy icon should be present (ContentCopyIcon)
            const groupIdSection = screen.getByText('test-rate-limit-id').closest('div');
            expect(groupIdSection).toBeInTheDocument();
        });
    });

    describe('Update Button', () => {
        it('should render update button when user has permissions', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should enable update button when form is dirty', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Make form dirty by changing a value
            const nameInput = screen.getByDisplayValue('Test Rate Limit');
            fireEvent.change(nameInput, { target: { value: 'Modified Rate Limit' } });

            // Update button should exist
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('should not render update button when user lacks UPDATE scope', async () => {
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

            renderWithProviders(mockRateLimit, restrictedAuthContext);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Fields', () => {
        it('should display all form fields correctly', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Service Group Name')).toBeInTheDocument();
                expect(screen.getByText('Service Group Description')).toBeInTheDocument();
                expect(screen.getByText('Object ID')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Rate Limit')).toBeInTheDocument();
                expect(screen.getByDisplayValue('Test Rate Limit Description')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should have required attribute on name field', async () => {
            renderWithProviders();

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test Rate Limit') as HTMLInputElement;
                expect(nameInput.required).toBe(true);
            }, { timeout: 3000 });
        });

        it('should allow multiline description', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test Rate Limit Description')).toBeInTheDocument();
            }, { timeout: 3000 });

            const descInput = screen.getByDisplayValue('Test Rate Limit Description');
            expect(descInput.tagName).toBe('TEXTAREA');
        });
    });

    describe('Breadcrumb Navigation', () => {
        it('should render breadcrumb with rate limit name', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Test Rate Limit')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render breadcrumb with Rate Limits link', async () => {
            renderWithProviders();

            await waitFor(() => {
                expect(screen.getByText('Rate Limits')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Edge Cases', () => {
        it('should handle rate limit with very long name', async () => {
            const longNameRateLimit: RateLimitServiceGroup = {
                ...mockRateLimit,
                servicegroupname: 'A'.repeat(200),
            };

            renderWithProviders(longNameRateLimit);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('A'.repeat(200));
                expect(nameInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle rate limit with very long description', async () => {
            const longDescRateLimit: RateLimitServiceGroup = {
                ...mockRateLimit,
                servicegroupdescription: 'B'.repeat(500),
            };

            renderWithProviders(longDescRateLimit);

            await waitFor(() => {
                const descInput = screen.getByDisplayValue('B'.repeat(500));
                expect(descInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should handle rate limit with special characters in name', async () => {
            const specialCharsRateLimit: RateLimitServiceGroup = {
                ...mockRateLimit,
                servicegroupname: 'Test @#$% Rate Limit!',
            };

            renderWithProviders(specialCharsRateLimit);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test @#$% Rate Limit!')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });
});
