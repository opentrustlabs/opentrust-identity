import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import FederatedOIDCProviderDomainConfiguration from '@/components/oidc-providers/oidc-provider-domain-configuration';
import { FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY } from '@/graphql/queries/oidc-queries';
import { ASSIGN_DOMAIN_TO_FEDERATED_OIDC_PROVIDER_MUTATION, REMOVE_DOMAIN_FROM_FEDERATED_OIDC_PROVIDER_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { TenantContext } from '@/components/contexts/tenant-context';
import { IntlProvider } from 'react-intl';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockedLink({ children, href }: any) {
        return <a href={href}>{children}</a>;
    };
});

const mockProviderId = 'provider-123';
const mockTenantId = 'tenant-123';

const mockDomains = [
    {
        domain: 'example.com',
        federatedOIDCProviderId: mockProviderId
    },
    {
        domain: 'test.example.com',
        federatedOIDCProviderId: mockProviderId
    },
    {
        domain: 'app.example.org',
        federatedOIDCProviderId: mockProviderId
    }
];

const mockTenantBean = {
    getTenantMetaData: () => ({
        tenant: {
            tenantId: mockTenantId,
            tenantName: 'Test Tenant',
            tenantType: 'regular'
        }
    })
};

const renderWithProviders = (
    component: React.ReactElement,
    mocks: any[] = []
) => {
    return render(
        <IntlProvider locale="en" messages={{}}>
            <TenantContext.Provider value={mockTenantBean as any}>
                <MockedProvider mocks={mocks} addTypename={false}>
                    {component}
                </MockedProvider>
            </TenantContext.Provider>
        </IntlProvider>
    );
};

describe('FederatedOIDCProviderDomainConfiguration - Loading State', () => {
    it('should show loading indicator while fetching domains', () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                },
                delay: 100
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should hide loading indicator after data is loaded', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderDomainConfiguration - Error State', () => {
    it('should display error message when query fails', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                error: new Error('Failed to fetch domains')
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch domains')).toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderDomainConfiguration - Empty Domain List', () => {
    it('should display "No domains found" when list is empty', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: []
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('No domains found')).toBeInTheDocument();
        });
    });

    it('should show add button when list is empty', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: []
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderDomainConfiguration - Domain List Display', () => {
    it('should display all domains', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            mockDomains.forEach(domain => {
                expect(screen.getByText(domain.domain)).toBeInTheDocument();
            });
        });
    });

    it('should display remove icons for each domain when not read-only', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(mockDomains.length);
        });
    });

    it('should not display "No domains found" when domains exist', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.queryByText('No domains found')).not.toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderDomainConfiguration - Add Domain Dialog', () => {
    it('should open add domain dialog when Add button is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add domain')).toBeInTheDocument();
        });
    });

    it('should have Submit button disabled initially in add dialog', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).toBeDisabled();
        });
    });

    it('should enable Submit button when valid domain is entered', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add domain')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'newdomain.com' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).not.toBeDisabled();
        });
    });

    it('should keep Submit button disabled for invalid domain (no TLD)', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add domain')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'invalid' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).toBeDisabled();
        });
    });

    it('should keep Submit button disabled for invalid domain (spaces)', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add domain')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'invalid domain.com' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).toBeDisabled();
        });
    });

    it('should call assignDomainMutation when Submit is clicked with valid domain and no conflicts', async () => {
        const mockLazyQuery = {
            request: {
                query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                variables: { domain: 'newdomain.com' }
            },
            result: {
                data: {
                    getFederatedOIDCProviderDomainRels: []
                }
            }
        };

        const mockAddMutation = {
            request: {
                query: ASSIGN_DOMAIN_TO_FEDERATED_OIDC_PROVIDER_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    domain: 'newdomain.com'
                }
            },
            result: {
                data: {
                    assignDomainToFederatedOIDCProvider: true
                }
            }
        };

        const mockRefetchQuery = {
            request: {
                query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                variables: { federatedOIDCProviderId: mockProviderId }
            },
            result: {
                data: {
                    getFederatedOIDCProviderDomainRels: [...mockDomains, { domain: 'newdomain.com', federatedOIDCProviderId: mockProviderId }]
                }
            }
        };

        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            },
            mockLazyQuery,
            mockAddMutation,
            mockRefetchQuery
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add domain')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'newdomain.com' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockUpdateStart).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockUpdateEnd).toHaveBeenCalledWith(true);
        });
    });

    it('should show error when trying to add duplicate domain in current provider', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add domain')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'example.com' } }); // Existing domain

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('The domain is already attached to this provider')).toBeInTheDocument();
        });

        expect(mockUpdateStart).not.toHaveBeenCalled();
    });

    it('should show error with link when domain is attached to different provider', async () => {
        const otherProviderId = 'other-provider-456';

        const mockLazyQuery = {
            request: {
                query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                variables: { domain: 'conflict.com' }
            },
            result: {
                data: {
                    getFederatedOIDCProviderDomainRels: [
                        { domain: 'conflict.com', federatedOIDCProviderId: otherProviderId }
                    ]
                }
            }
        };

        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            },
            mockLazyQuery
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add domain')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'conflict.com' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('The domain is already attached to a different OIDC provider')).toBeInTheDocument();
            expect(screen.getByText('here')).toBeInTheDocument();
            const link = screen.getByText('here').closest('a');
            expect(link).toHaveAttribute('href', `/${mockTenantId}/oidc-providers/${otherProviderId}`);
        });

        await waitFor(() => {
            expect(mockUpdateEnd).toHaveBeenCalledWith(false);
        });
    });

    it('should close add dialog when Cancel is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add domain')).toBeInTheDocument();
        });

        const cancelButtons = screen.getAllByText('Cancel');
        fireEvent.click(cancelButtons[0]);

        await waitFor(() => {
            expect(screen.queryByText('Add domain')).not.toBeInTheDocument();
        });
    });

    it('should clear error message when closing error alert in add dialog', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Domain')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add domain')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'example.com' } }); // Duplicate

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('The domain is already attached to this provider')).toBeInTheDocument();
        });

        const closeButton = screen.getByTestId('CloseIcon').parentElement as HTMLElement;
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('The domain is already attached to this provider')).not.toBeInTheDocument();
        });
    });
});

describe('FederatedOIDCProviderDomainConfiguration - Remove Domain Dialog', () => {
    it('should open remove confirmation dialog when remove icon is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockDomains[0].domain)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of domain:')).toBeInTheDocument();
            const allMatches = screen.getAllByText(mockDomains[0].domain);
            expect(allMatches.length).toBeGreaterThan(0);
        });
    });

    it('should call removeDomainMutation when Confirm is clicked', async () => {
        const mockRemoveMutation = {
            request: {
                query: REMOVE_DOMAIN_FROM_FEDERATED_OIDC_PROVIDER_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    domain: mockDomains[0].domain
                }
            },
            result: {
                data: {
                    removeDomainFromFederatedOIDCProvider: true
                }
            }
        };

        const mockRefetchQuery = {
            request: {
                query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                variables: { federatedOIDCProviderId: mockProviderId }
            },
            result: {
                data: {
                    getFederatedOIDCProviderDomainRels: mockDomains.slice(1)
                }
            }
        };

        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            },
            mockRemoveMutation,
            mockRefetchQuery
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockDomains[0].domain)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of domain:')).toBeInTheDocument();
        });

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockUpdateStart).toHaveBeenCalled();
            expect(mockUpdateEnd).toHaveBeenCalledWith(true);
        });
    });

    it('should close remove confirmation dialog when Cancel is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockDomains[0].domain)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of domain:')).toBeInTheDocument();
        });

        const cancelButtons = screen.getAllByText('Cancel');
        fireEvent.click(cancelButtons[0]);

        await waitFor(() => {
            expect(screen.queryByText('Confirm removal of domain:')).not.toBeInTheDocument();
        });
    });

    it('should not call mutation if dialog is closed without confirming', async () => {
        const mockRemoveMutation = {
            request: {
                query: REMOVE_DOMAIN_FROM_FEDERATED_OIDC_PROVIDER_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    domain: mockDomains[0].domain
                }
            },
            result: {
                data: {
                    removeDomainFromFederatedOIDCProvider: true
                }
            }
        };

        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            },
            mockRemoveMutation
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockDomains[0].domain)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of domain:')).toBeInTheDocument();
        });

        const cancelButtons = screen.getAllByText('Cancel');
        fireEvent.click(cancelButtons[0]);

        await waitFor(() => {
            expect(mockUpdateStart).not.toHaveBeenCalled();
            expect(mockUpdateEnd).not.toHaveBeenCalled();
        });
    });
});

describe('FederatedOIDCProviderDomainConfiguration - Read-Only Mode', () => {
    it('should not display add button in read-only mode', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={true}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockDomains[0].domain)).toBeInTheDocument();
        });

        expect(screen.queryByText('Add Domain')).not.toBeInTheDocument();
    });

    it('should not display remove icons in read-only mode', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={true}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockDomains[0].domain)).toBeInTheDocument();
        });

        expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
    });

    it('should display domains in read-only mode', async () => {
        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={true}
            />,
            mocks
        );

        await waitFor(() => {
            mockDomains.forEach(domain => {
                expect(screen.getByText(domain.domain)).toBeInTheDocument();
            });
        });
    });
});

describe('FederatedOIDCProviderDomainConfiguration - Error Handling', () => {
    it('should display error alert when remove mutation fails', async () => {
        const mockRemoveMutation = {
            request: {
                query: REMOVE_DOMAIN_FROM_FEDERATED_OIDC_PROVIDER_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    domain: mockDomains[0].domain
                }
            },
            error: new Error('FAILED_TO_REMOVE_DOMAIN')
        };

        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            },
            mockRemoveMutation
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockDomains[0].domain)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of domain:')).toBeInTheDocument();
        });

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockUpdateEnd).toHaveBeenCalledWith(false);
            expect(screen.getByText('FAILED_TO_REMOVE_DOMAIN')).toBeInTheDocument();
        });
    });

    it('should dismiss error alert when close button is clicked', async () => {
        const mockRemoveMutation = {
            request: {
                query: REMOVE_DOMAIN_FROM_FEDERATED_OIDC_PROVIDER_MUTATION,
                variables: {
                    federatedOIDCProviderId: mockProviderId,
                    domain: mockDomains[0].domain
                }
            },
            error: new Error('FAILED_TO_REMOVE_DOMAIN')
        };

        const mocks = [
            {
                request: {
                    query: FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY,
                    variables: { federatedOIDCProviderId: mockProviderId }
                },
                result: {
                    data: {
                        getFederatedOIDCProviderDomainRels: mockDomains
                    }
                }
            },
            mockRemoveMutation
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <FederatedOIDCProviderDomainConfiguration
                federatedOIDCProviderId={mockProviderId}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockDomains[0].domain)).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of domain:')).toBeInTheDocument();
        });

        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(screen.getByText('FAILED_TO_REMOVE_DOMAIN')).toBeInTheDocument();
        });

        const closeButtons = screen.getAllByTestId('CloseIcon');
        const errorCloseButton = closeButtons[0].parentElement as HTMLElement;
        fireEvent.click(errorCloseButton);

        await waitFor(() => {
            expect(screen.queryByText('FAILED_TO_REMOVE_DOMAIN')).not.toBeInTheDocument();
        });
    });
});
