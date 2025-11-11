import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import TenantManagementDomainConfiguration from '@/components/tenants/tenant-management-domain-configuration';
import { TENANT_DOMAIN_MANAGEMENT_REL_QUERY } from '@/graphql/queries/oidc-queries';
import { TENANT_DOMAIN_MANAGEMENT_REL_ADD_MUTATION, TENANT_DOMAIN_MANAGEMENT_REL_REMOVE_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { IntlProvider } from 'react-intl';

// Mock data for domain management
const mockDomainRels = [
    { tenantId: 'test-tenant-id', domain: 'example.com' },
    { tenantId: 'test-tenant-id', domain: 'test.com' },
    { tenantId: 'test-tenant-id', domain: 'demo.org' },
];

const mockSingleDomainRel = [
    { tenantId: 'test-tenant-id', domain: 'example.com' },
];

const mockEmptyDomainRels: any[] = [];

// GraphQL mock for successful query with multiple domains
const mockDomainManagementRelQuerySuccess = {
    request: {
        query: TENANT_DOMAIN_MANAGEMENT_REL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getDomainsForTenantManagement: mockDomainRels,
        },
    },
};

// GraphQL mock with single domain
const mockDomainManagementRelQuerySingleDomain = {
    request: {
        query: TENANT_DOMAIN_MANAGEMENT_REL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getDomainsForTenantManagement: mockSingleDomainRel,
        },
    },
};

// GraphQL mock with empty domain list
const mockDomainManagementRelQueryEmpty = {
    request: {
        query: TENANT_DOMAIN_MANAGEMENT_REL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getDomainsForTenantManagement: mockEmptyDomainRels,
        },
    },
};

// GraphQL mock for error scenario
const mockDomainManagementRelQueryError = {
    request: {
        query: TENANT_DOMAIN_MANAGEMENT_REL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    error: new Error('Failed to fetch domains'),
};

// GraphQL mock for add domain mutation success
const mockAddDomainMutationSuccess = {
    request: {
        query: TENANT_DOMAIN_MANAGEMENT_REL_ADD_MUTATION,
        variables: { tenantId: 'test-tenant-id', domain: 'newdomain.com' },
    },
    result: {
        data: {
            addDomainToTenantManagement: {
                tenantId: 'test-tenant-id',
                domain: 'newdomain.com',
            },
        },
    },
};

// GraphQL mock for add domain mutation error
const mockAddDomainMutationError = {
    request: {
        query: TENANT_DOMAIN_MANAGEMENT_REL_ADD_MUTATION,
        variables: { tenantId: 'test-tenant-id', domain: 'invalid-domain' },
    },
    error: new Error('DOMAIN_ALREADY_EXISTS'),
};

// GraphQL mock for remove domain mutation success
const mockRemoveDomainMutationSuccess = {
    request: {
        query: TENANT_DOMAIN_MANAGEMENT_REL_REMOVE_MUTATION,
        variables: { tenantId: 'test-tenant-id', domain: 'example.com' },
    },
    result: {
        data: {
            removeDomainFromTenantManagement: true,
        },
    },
};

// GraphQL mock for remove domain mutation error
const mockRemoveDomainMutationError = {
    request: {
        query: TENANT_DOMAIN_MANAGEMENT_REL_REMOVE_MUTATION,
        variables: { tenantId: 'test-tenant-id', domain: 'example.com' },
    },
    error: new Error('DOMAIN_NOT_FOUND'),
};

// Mock updated query after adding domain
const mockDomainManagementRelQueryAfterAdd = {
    request: {
        query: TENANT_DOMAIN_MANAGEMENT_REL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getDomainsForTenantManagement: [
                ...mockDomainRels,
                { tenantId: 'test-tenant-id', domain: 'newdomain.com' },
            ],
        },
    },
};

// Mock updated query after removing domain
const mockDomainManagementRelQueryAfterRemove = {
    request: {
        query: TENANT_DOMAIN_MANAGEMENT_REL_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getDomainsForTenantManagement: mockDomainRels.slice(1),
        },
    },
};

// Helper function to render component with providers
const renderWithProviders = (
    tenantId: string,
    mocks: any[] = [mockDomainManagementRelQuerySuccess],
    readOnly: boolean = false,
    onUpdateStart: jest.Mock = jest.fn(),
    onUpdateEnd: jest.Mock = jest.fn()
) => {
    const messages = {
        DOMAIN_ALREADY_EXISTS: 'Domain already exists',
        DOMAIN_NOT_FOUND: 'Domain not found',
    };

    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <IntlProvider locale="en" messages={messages}>
                <TenantManagementDomainConfiguration
                    tenantId={tenantId}
                    onUpdateStart={onUpdateStart}
                    onUpdateEnd={onUpdateEnd}
                    readOnly={readOnly}
                />
            </IntlProvider>
        </MockedProvider>
    );
};

describe('TenantManagementDomainConfiguration Component', () => {
    describe('Loading State', () => {
        it('should display loading indicator while fetching data', () => {
            renderWithProviders('test-tenant-id');

            // CircularProgress should be present (from DataLoading component)
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should not display domain list during loading', () => {
            renderWithProviders('test-tenant-id');

            expect(screen.queryByText('example.com')).not.toBeInTheDocument();
        });

        it('should not display add icon during loading', () => {
            const { container } = renderWithProviders('test-tenant-id');

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            expect(addIcon).not.toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should display error message when query fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders('test-tenant-id', [mockDomainManagementRelQueryError]);

            await waitFor(() => {
                expect(screen.getByText(/Failed to fetch domains/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });

        it('should not display domain list when query fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders('test-tenant-id', [mockDomainManagementRelQueryError]);

            await waitFor(() => {
                expect(screen.queryByText('example.com')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });

        it('should not display add icon when query fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQueryError]);

            await waitFor(() => {
                const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
                expect(addIcon).not.toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });
    });

    describe('Domain List Display', () => {
        it('should display all domains in the list', async () => {
            renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
                expect(screen.getByText('test.com')).toBeInTheDocument();
                expect(screen.getByText('demo.org')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display single domain correctly', async () => {
            renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySingleDomain]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display remove icon for each domain when not read-only', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
                expect(removeIcons.length).toBe(3);
            }, { timeout: 3000 });
        });

        it('should not display loading indicator after data loads', async () => {
            renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.queryByTestId('data-loading')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display domains in grid layout', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const gridElements = container.querySelectorAll('[class*="MuiGrid2"]');
            expect(gridElements.length).toBeGreaterThan(0);
        });
    });

    describe('Empty Domain List', () => {
        it('should display empty state message when no domains', async () => {
            renderWithProviders('test-tenant-id', [mockDomainManagementRelQueryEmpty]);

            await waitFor(() => {
                expect(screen.getByText('No domains for tenant management')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should still display add icon when list is empty', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQueryEmpty]);

            await waitFor(() => {
                const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
                expect(addIcon).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display remove icons when list is empty', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQueryEmpty]);

            await waitFor(() => {
                const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
                expect(removeIcons.length).toBe(0);
            }, { timeout: 3000 });
        });
    });

    describe('Add Domain Dialog', () => {
        it('should open add dialog when add icon is clicked', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
            });
        });

        it('should display text field in add dialog', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                const textField = screen.getByRole('textbox');
                expect(textField).toBeInTheDocument();
            });
        });

        it('should display Cancel button in add dialog', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
            });
        });

        it('should display Submit button in add dialog', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
            });
        });

        it('should close add dialog when Cancel button is clicked', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /Cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText('Add domain')).not.toBeInTheDocument();
            });
        });

        it('should update text field value when typing', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
            });

            const textField = screen.getByRole('textbox');
            fireEvent.change(textField, { target: { value: 'newdomain.com' } });

            expect(textField).toHaveValue('newdomain.com');
        });
    });

    describe('Add Domain Mutation', () => {
        it('should call onUpdateStart when Submit is clicked', async () => {
            const mockOnUpdateStart = jest.fn();
            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockAddDomainMutationSuccess, mockDomainManagementRelQueryAfterAdd],
                false,
                mockOnUpdateStart
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
            });

            const textField = screen.getByRole('textbox');
            fireEvent.change(textField, { target: { value: 'newdomain.com' } });

            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);

            expect(mockOnUpdateStart).toHaveBeenCalled();
        });

        it('should call onUpdateEnd with true on successful mutation', async () => {
            const mockOnUpdateEnd = jest.fn();
            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockAddDomainMutationSuccess, mockDomainManagementRelQueryAfterAdd],
                false,
                jest.fn(),
                mockOnUpdateEnd
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
            });

            const textField = screen.getByRole('textbox');
            fireEvent.change(textField, { target: { value: 'newdomain.com' } });

            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnUpdateEnd).toHaveBeenCalledWith(true);
            }, { timeout: 3000 });
        });

        it('should close dialog after successful mutation', async () => {
            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockAddDomainMutationSuccess, mockDomainManagementRelQueryAfterAdd]
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
            });

            const textField = screen.getByRole('textbox');
            fireEvent.change(textField, { target: { value: 'newdomain.com' } });

            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.queryByText('Add domain')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display error message when mutation fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockAddDomainMutationError]
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
            });

            const textField = screen.getByRole('textbox');
            fireEvent.change(textField, { target: { value: 'invalid-domain' } });

            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Domain already exists')).toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });

        it('should call onUpdateEnd with false when mutation fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const mockOnUpdateEnd = jest.fn();
            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockAddDomainMutationError],
                false,
                jest.fn(),
                mockOnUpdateEnd
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
            });

            const textField = screen.getByRole('textbox');
            fireEvent.change(textField, { target: { value: 'invalid-domain' } });

            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnUpdateEnd).toHaveBeenCalledWith(false);
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });
    });

    describe('Delete Domain Dialog', () => {
        it('should open delete dialog when remove icon is clicked', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of domain:/)).toBeInTheDocument();
            });
        });

        it('should display domain name in delete confirmation dialog', async () => {
            renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = document.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                // Check both parts of the confirmation message appear
                expect(screen.getByText(/Confirm removal of domain:/)).toBeInTheDocument();
                // Check that example.com appears multiple times (in list and in dialog)
                const domainTexts = screen.getAllByText('example.com');
                expect(domainTexts.length).toBeGreaterThanOrEqual(2);
            });
        });

        it('should display Cancel button in delete dialog', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
            });
        });

        it('should display Confirm button in delete dialog', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
            });
        });

        it('should close delete dialog when Cancel button is clicked', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of domain:/)).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /Cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm removal of domain:/)).not.toBeInTheDocument();
            });
        });
    });

    describe('Remove Domain Mutation', () => {
        it('should call onUpdateStart when Confirm is clicked', async () => {
            const mockOnUpdateStart = jest.fn();
            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockRemoveDomainMutationSuccess, mockDomainManagementRelQueryAfterRemove],
                false,
                mockOnUpdateStart
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of domain:/)).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /Confirm/i });
            fireEvent.click(confirmButton);

            expect(mockOnUpdateStart).toHaveBeenCalled();
        });

        it('should call onUpdateEnd with true on successful removal', async () => {
            const mockOnUpdateEnd = jest.fn();
            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockRemoveDomainMutationSuccess, mockDomainManagementRelQueryAfterRemove],
                false,
                jest.fn(),
                mockOnUpdateEnd
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of domain:/)).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /Confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(mockOnUpdateEnd).toHaveBeenCalledWith(true);
            }, { timeout: 3000 });
        });

        it('should close dialog after successful removal', async () => {
            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockRemoveDomainMutationSuccess, mockDomainManagementRelQueryAfterRemove]
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of domain:/)).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /Confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm removal of domain:/)).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display error message when removal fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockRemoveDomainMutationError]
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of domain:/)).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /Confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.getByText('Domain not found')).toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });

        it('should call onUpdateEnd with false when removal fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const mockOnUpdateEnd = jest.fn();
            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockRemoveDomainMutationError],
                false,
                jest.fn(),
                mockOnUpdateEnd
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of domain:/)).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /Confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(mockOnUpdateEnd).toHaveBeenCalledWith(false);
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });
    });

    describe('Read-Only Mode', () => {
        it('should not display add icon in read-only mode', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess], true);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            expect(addIcon).not.toBeInTheDocument();
        });

        it('should not display remove icons in read-only mode', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess], true);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            expect(removeIcons.length).toBe(0);
        });

        it('should still display domain list in read-only mode', async () => {
            renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess], true);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
                expect(screen.getByText('test.com')).toBeInTheDocument();
                expect(screen.getByText('demo.org')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display empty message in read-only mode with no domains', async () => {
            renderWithProviders('test-tenant-id', [mockDomainManagementRelQueryEmpty], true);

            await waitFor(() => {
                expect(screen.getByText('No domains for tenant management')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Error Alert', () => {
        it('should display close button on error alert', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockAddDomainMutationError]
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
            });

            const textField = screen.getByRole('textbox');
            fireEvent.change(textField, { target: { value: 'invalid-domain' } });

            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Domain already exists')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Alert should have a close button
            const closeButton = container.querySelector('[aria-label="Close"]');
            expect(closeButton).toBeInTheDocument();

            consoleSpy.mockRestore();
        });

        it('should dismiss error alert when close button is clicked', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const { container } = renderWithProviders(
                'test-tenant-id',
                [mockDomainManagementRelQuerySuccess, mockAddDomainMutationError]
            );

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
            });

            const textField = screen.getByRole('textbox');
            fireEvent.change(textField, { target: { value: 'invalid-domain' } });

            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Domain already exists')).toBeInTheDocument();
            }, { timeout: 3000 });

            const closeButton = container.querySelector('[aria-label="Close"]');
            fireEvent.click(closeButton!);

            await waitFor(() => {
                expect(screen.queryByText('Domain already exists')).not.toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Layout Structure', () => {
        it('should render Grid2 container for domain list', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const gridElements = container.querySelectorAll('[class*="MuiGrid2"]');
            expect(gridElements.length).toBeGreaterThan(0);
        });

        it('should render Divider element', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const dividers = container.querySelectorAll('hr');
            expect(dividers.length).toBeGreaterThan(0);
        });

        it('should wrap content in Typography component', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const typographyElements = container.querySelectorAll('[class*="MuiTypography"]');
            expect(typographyElements.length).toBeGreaterThan(0);
        });
    });

    describe('Dialog Behavior', () => {
        it('should open add dialog with proper structure', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const addIcon = container.querySelector('[data-testid="AddBoxIcon"]');
            fireEvent.click(addIcon!);

            await waitFor(() => {
                expect(screen.getByText('Add domain')).toBeInTheDocument();
                expect(screen.getByRole('textbox')).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
            });
        });

        it('should open delete dialog with proper structure', async () => {
            const { container } = renderWithProviders('test-tenant-id', [mockDomainManagementRelQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('example.com')).toBeInTheDocument();
            }, { timeout: 3000 });

            const removeIcons = container.querySelectorAll('[data-testid="RemoveCircleOutlineIcon"]');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of domain:/)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
            });
        });
    });
});
