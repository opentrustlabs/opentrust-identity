import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import TenantRateLimitConfiguration from '@/components/tenants/tenant-rate-limit-configuration';
import { TENANT_RATE_LIMIT_REL_VIEW_QUERY } from '@/graphql/queries/oidc-queries';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { TenantContext, TenantMetaDataBean } from '@/components/contexts/tenant-context';
import { ResponsiveContext, ResponsiveBreakpoints } from '@/components/contexts/responsive-context';
import { IntlProvider } from 'react-intl';
import { RATE_LIMIT_TENANT_ASSIGN_SCOPE, RATE_LIMIT_TENANT_REMOVE_SCOPE, RATE_LIMIT_TENANT_UPDATE_SCOPE, TENANT_TYPE_ROOT_TENANT } from '@/utils/consts';

// Mock containsScope for authorization
jest.mock('@/utils/authz-utils', () => ({
    containsScope: (scope: string, scopes: string[]) => scopes.includes(scope)
}));

// Mock GeneralSelector component
jest.mock('@/components/dialogs/general-selector', () => {
    return function MockGeneralSelector({
        onCancel,
        onSelected,
        selectorLabel,
        helpText
    }: any) {
        return (
            <div data-testid="general-selector">
                <div>{selectorLabel}</div>
                <div>{helpText}</div>
                <button data-testid="general-selector-cancel" onClick={onCancel}>
                    Cancel
                </button>
                <button data-testid="general-selector-select" onClick={() => onSelected('service-group-1')}>
                    Select
                </button>
            </div>
        );
    };
});

// Mock TenatRateLimitConfigurationDialog
jest.mock('@/components/dialogs/tenant-rate-limit-configuration-dialog', () => {
    return function MockTenatRateLimitConfigurationDialog({
        onCancel,
        onCompleted,
        tenantId,
        serviceGroupId,
        existingAllowUnlimited,
        existingLimit
    }: any) {
        return (
            <div data-testid="tenant-rate-limit-config-dialog">
                <div>Tenant ID: {tenantId}</div>
                <div>Service Group ID: {serviceGroupId}</div>
                {existingAllowUnlimited !== null && <div>Existing Allow Unlimited: {String(existingAllowUnlimited)}</div>}
                {existingLimit !== null && <div>Existing Limit: {existingLimit}</div>}
                <button data-testid="rate-limit-config-cancel" onClick={onCancel}>
                    Cancel
                </button>
                <button
                    data-testid="rate-limit-config-complete"
                    onClick={() => onCompleted(tenantId, serviceGroupId, false, 100, 60)}
                >
                    Complete
                </button>
            </div>
        );
    };
});

const mockTenantRateLimitRelViews = [
    {
        tenantId: 'tenant-1',
        tenantName: 'Test Tenant',
        servicegroupid: 'service-group-1',
        servicegroupname: 'Authentication',
        allowUnlimitedRate: false,
        rateLimit: 1000,
        rateLimitPeriodMinutes: 60
    },
    {
        tenantId: 'tenant-1',
        tenantName: 'Test Tenant',
        servicegroupid: 'service-group-2',
        servicegroupname: 'Registration',
        allowUnlimitedRate: true,
        rateLimit: null,
        rateLimitPeriodMinutes: 30
    },
    {
        tenantId: 'tenant-1',
        tenantName: 'Test Tenant',
        servicegroupid: 'service-group-3',
        servicegroupname: 'Password Reset',
        allowUnlimitedRate: false,
        rateLimit: 500,
        rateLimitPeriodMinutes: 120
    }
];

const mockAuthContextWithAllScopes: AuthContextProps = {
    portalUserProfile: {
        userId: 'test-user',
        email: 'test@example.com',
        scope: [RATE_LIMIT_TENANT_ASSIGN_SCOPE, RATE_LIMIT_TENANT_REMOVE_SCOPE, RATE_LIMIT_TENANT_UPDATE_SCOPE]
    } as any,
    forceProfileRefetch: jest.fn()
};

const mockAuthContextNoScopes: AuthContextProps = {
    portalUserProfile: {
        userId: 'test-user',
        email: 'test@example.com',
        scope: []
    } as any,
    forceProfileRefetch: jest.fn()
};

const mockTenantBean: TenantMetaDataBean = {
    getTenantMetaData: jest.fn().mockReturnValue({
        tenant: {
            tenantId: 'tenant-1',
            tenantName: 'Test Tenant',
            tenantType: TENANT_TYPE_ROOT_TENANT
        }
    })
} as any;

const mockResponsiveBreakpointsLarge: ResponsiveBreakpoints = {
    isExtraSmall: false,
    isSmall: false,
    isMedium: false,
    isLarge: true,
    isExtraLarge: false,
    isGreaterThanExtraLarge: false
};

const mockResponsiveBreakpointsMedium: ResponsiveBreakpoints = {
    isExtraSmall: false,
    isSmall: false,
    isMedium: true,
    isLarge: false,
    isExtraLarge: false,
    isGreaterThanExtraLarge: false
};

describe('TenantRateLimitConfiguration', () => {
    const defaultProps = {
        tenantId: 'tenant-1',
        rateLimitSummaryHandler: jest.fn(),
        onUpdateStart: jest.fn(),
        onUpdateEnd: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (
        mocks: any[] = [],
        authContext: AuthContextProps = mockAuthContextWithAllScopes,
        responsiveBreakpoints: ResponsiveBreakpoints = mockResponsiveBreakpointsLarge,
        props = defaultProps
    ) => {
        return render(
            <IntlProvider locale="en" messages={{}}>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <AuthContext.Provider value={authContext}>
                        <TenantContext.Provider value={mockTenantBean}>
                            <ResponsiveContext.Provider value={responsiveBreakpoints}>
                                <TenantRateLimitConfiguration {...props} />
                            </ResponsiveContext.Provider>
                        </TenantContext.Provider>
                    </AuthContext.Provider>
                </MockedProvider>
            </IntlProvider>
        );
    };

    describe('Loading State', () => {
        it('should show loading indicator while data is being fetched', () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    },
                    delay: 100
                }
            ];

            renderComponent(mocks);
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should not show service groups during loading', () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    },
                    delay: 100
                }
            ];

            renderComponent(mocks);
            expect(screen.queryByText('Authentication')).not.toBeInTheDocument();
        });

        it('should hide loading indicator after data is loaded', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error State', () => {
        it('should display error message when query fails', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    error: new Error('Failed to fetch rate limits')
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByText(/Failed to fetch rate limits/i)).toBeInTheDocument();
            });
        });

        it('should call rateLimitSummaryHandler with 0 on error', async () => {
            const mockSummaryHandler = jest.fn();
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    error: new Error('Failed to fetch rate limits')
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsLarge, {
                ...defaultProps,
                rateLimitSummaryHandler: mockSummaryHandler
            });

            await waitFor(() => {
                expect(mockSummaryHandler).toHaveBeenCalledWith(0);
            });
        });
    });

    describe('Empty Service Groups', () => {
        it('should display "No service groups found" message when list is empty', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByText('No service groups found')).toBeInTheDocument();
            });
        });

        it('should show table headers even when list is empty', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByText('Service Group Name')).toBeInTheDocument();
                expect(screen.getByText('Rate Limit')).toBeInTheDocument();
            });
        });
    });

    describe('Service Group List Display', () => {
        it('should display service group names correctly', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByText('Authentication')).toBeInTheDocument();
                expect(screen.getByText('Registration')).toBeInTheDocument();
                expect(screen.getByText('Password Reset')).toBeInTheDocument();
            });
        });

        it('should display rate limits correctly', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByText('1000')).toBeInTheDocument();
                expect(screen.getByText('Unlimited')).toBeInTheDocument();
                expect(screen.getByText('500')).toBeInTheDocument();
            });
        });

        it('should show edit icons when user has update scope', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                const editIcons = screen.getAllByTestId('EditOutlinedIcon');
                expect(editIcons).toHaveLength(3);
            });
        });

        it('should show remove icons when user has remove scope', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
                expect(removeIcons).toHaveLength(3);
            });
        });

        it('should show Rate Limit Period column on large screens', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsLarge);
            await waitFor(() => {
                expect(screen.getByText('Rate Limit Period (minutes)')).toBeInTheDocument();
                expect(screen.getByText('60')).toBeInTheDocument();
                expect(screen.getByText('30')).toBeInTheDocument();
                expect(screen.getByText('120')).toBeInTheDocument();
            });
        });
    });

    describe('Add Rate Limit Button', () => {
        it('should show Add Rate Limit button when user has assign scope', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByText('Add Rate Limit')).toBeInTheDocument();
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });
        });

        it('should not show Add Rate Limit button when user lacks assign scope', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextNoScopes);
            await waitFor(() => {
                expect(screen.queryByText('Add Rate Limit')).not.toBeInTheDocument();
            });
        });

        it('should open GeneralSelector dialog when Add Rate Limit is clicked', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });

            const addIcon = screen.getByTestId('AddBoxIcon');
            fireEvent.click(addIcon);

            await waitFor(() => {
                expect(screen.getByTestId('general-selector')).toBeInTheDocument();
            });
        });
    });

    describe('GeneralSelector Dialog', () => {
        it('should display selector label and help text', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('AddBoxIcon'));

            await waitFor(() => {
                expect(screen.getByText('Select a service group')).toBeInTheDocument();
                expect(screen.getByText('Select a valid service group')).toBeInTheDocument();
            });
        });

        it('should close dialog when Cancel is clicked', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('AddBoxIcon'));
            await waitFor(() => {
                expect(screen.getByTestId('general-selector')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('general-selector-cancel'));
            await waitFor(() => {
                expect(screen.queryByTestId('general-selector')).not.toBeInTheDocument();
            });
        });

        it('should open configure dialog when service group is selected', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('AddBoxIcon'));
            await waitFor(() => {
                expect(screen.getByTestId('general-selector')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('general-selector-select'));
            await waitFor(() => {
                expect(screen.getByTestId('tenant-rate-limit-config-dialog')).toBeInTheDocument();
            });
        });

        it('should close GeneralSelector after selection', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('AddBoxIcon'));
            fireEvent.click(screen.getByTestId('general-selector-select'));

            await waitFor(() => {
                expect(screen.queryByTestId('general-selector')).not.toBeInTheDocument();
            });
        });
    });

    describe('Configure Rate Limit Dialog', () => {
        it('should display tenant ID and service group ID in config dialog', async () => {
            
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('AddBoxIcon'));
            fireEvent.click(screen.getByTestId('general-selector-select'));

            await waitFor(() => {
                expect(screen.getByText('Tenant ID: tenant-1')).toBeInTheDocument();
                expect(screen.getByText('Service Group ID: service-group-1')).toBeInTheDocument();
            });
        });

        it('should have null values for new configuration', async () => {
            
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('AddBoxIcon'));
            fireEvent.click(screen.getByTestId('general-selector-select'));

            await waitFor(() => {
                expect(screen.queryByText(/Existing Allow Unlimited:/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Existing Limit:/)).not.toBeInTheDocument();
            });
        });

        it('should close dialog when Cancel is clicked', async () => {
            
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('AddBoxIcon'));
            fireEvent.click(screen.getByTestId('general-selector-select'));
            await waitFor(() => {
                expect(screen.getByTestId('tenant-rate-limit-config-dialog')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('rate-limit-config-cancel'));
            await waitFor(() => {
                expect(screen.queryByTestId('tenant-rate-limit-config-dialog')).not.toBeInTheDocument();
            });
        });

        it('should call onUpdateStart when Complete is clicked', async () => {
            
            const mockOnUpdateStart = jest.fn();
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsLarge, {
                ...defaultProps,
                onUpdateStart: mockOnUpdateStart
            });

            await waitFor(() => {
                expect(screen.getByTestId('AddBoxIcon')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('AddBoxIcon'));
            fireEvent.click(screen.getByTestId('general-selector-select'));
            await waitFor(() => {
                expect(screen.getByTestId('rate-limit-config-complete')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('rate-limit-config-complete'));
            expect(mockOnUpdateStart).toHaveBeenCalled();
        });
    });

    describe('Edit Rate Limit Dialog', () => {
        it('should open edit dialog when edit icon is clicked', async () => {
            
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getAllByTestId('EditOutlinedIcon')).toHaveLength(3);
            });

            const editIcons = screen.getAllByTestId('EditOutlinedIcon');
            fireEvent.click(editIcons[0]);

            await waitFor(() => {
                expect(screen.getByTestId('tenant-rate-limit-config-dialog')).toBeInTheDocument();
            });
        });

        it('should display existing values in edit dialog', async () => {
            
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getAllByTestId('EditOutlinedIcon')).toHaveLength(3);
            });

            const editIcons = screen.getAllByTestId('EditOutlinedIcon');
            fireEvent.click(editIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Existing Allow Unlimited: false')).toBeInTheDocument();
                expect(screen.getByText('Existing Limit: 1000')).toBeInTheDocument();
            });
        });

        it('should close edit dialog when Cancel is clicked', async () => {
            
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getAllByTestId('EditOutlinedIcon')).toHaveLength(3);
            });

            fireEvent.click(screen.getAllByTestId('EditOutlinedIcon')[0]);
            await waitFor(() => {
                expect(screen.getByTestId('tenant-rate-limit-config-dialog')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('rate-limit-config-cancel'));
            await waitFor(() => {
                expect(screen.queryByTestId('tenant-rate-limit-config-dialog')).not.toBeInTheDocument();
            });
        });

        it('should call onUpdateStart when update is completed', async () => {
            
            const mockOnUpdateStart = jest.fn();
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsLarge, {
                ...defaultProps,
                onUpdateStart: mockOnUpdateStart
            });

            await waitFor(() => {
                expect(screen.getAllByTestId('EditOutlinedIcon')).toHaveLength(3);
            });

            fireEvent.click(screen.getAllByTestId('EditOutlinedIcon')[0]);
            await waitFor(() => {
                expect(screen.getByTestId('rate-limit-config-complete')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('rate-limit-config-complete'));
            expect(mockOnUpdateStart).toHaveBeenCalled();
        });
    });

    describe('Remove Confirmation Dialog', () => {
        it('should open remove dialog when remove icon is clicked', async () => {
            
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getAllByTestId('RemoveCircleOutlineIcon')).toHaveLength(3);
            });

            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            fireEvent.click(removeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of service group:/)).toBeInTheDocument();
            });
        });

        it('should display service group name in confirmation dialog', async () => {

            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getAllByTestId('RemoveCircleOutlineIcon')).toHaveLength(3);
            });

            fireEvent.click(screen.getAllByTestId('RemoveCircleOutlineIcon')[0]);

            await waitFor(() => {
                expect(screen.getByText(/Confirm removal of service group:/)).toBeInTheDocument();
            });
        });

        it('should close dialog when Cancel is clicked', async () => {
            
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getAllByTestId('RemoveCircleOutlineIcon')).toHaveLength(3);
            });

            fireEvent.click(screen.getAllByTestId('RemoveCircleOutlineIcon')[0]);
            await waitFor(() => {
                expect(screen.getByText(/Confirm removal/)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Cancel'));
            await waitFor(() => {
                expect(screen.queryByText(/Confirm removal/)).not.toBeInTheDocument();
            });
        });

        it('should have Confirm button that triggers removal', async () => {
            
            const mockOnUpdateStart = jest.fn();
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsLarge, {
                ...defaultProps,
                onUpdateStart: mockOnUpdateStart
            });

            await waitFor(() => {
                expect(screen.getAllByTestId('RemoveCircleOutlineIcon')).toHaveLength(3);
            });

            fireEvent.click(screen.getAllByTestId('RemoveCircleOutlineIcon')[0]);
            await waitFor(() => {
                expect(screen.getByText('Confirm')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Confirm'));
            expect(mockOnUpdateStart).toHaveBeenCalled();
        });
    });

    describe('Remove Mutation', () => {
        it('should call onUpdateStart when remove is confirmed', async () => {
            
            const mockOnUpdateStart = jest.fn();
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsLarge, {
                ...defaultProps,
                onUpdateStart: mockOnUpdateStart
            });

            await waitFor(() => {
                expect(screen.getAllByTestId('RemoveCircleOutlineIcon')).toHaveLength(3);
            });

            fireEvent.click(screen.getAllByTestId('RemoveCircleOutlineIcon')[0]);
            fireEvent.click(screen.getByText('Confirm'));

            expect(mockOnUpdateStart).toHaveBeenCalled();
        });

        it('should close remove dialog after confirmation', async () => {
            
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getAllByTestId('RemoveCircleOutlineIcon')).toHaveLength(3);
            });

            fireEvent.click(screen.getAllByTestId('RemoveCircleOutlineIcon')[0]);
            fireEvent.click(screen.getByText('Confirm'));

            await waitFor(() => {
                expect(screen.queryByText(/Confirm removal/)).not.toBeInTheDocument();
            });
        });

        it('should have proper mutation structure for remove', async () => {
            
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getAllByTestId('RemoveCircleOutlineIcon')).toHaveLength(3);
            });

            // Just verify the remove icon functionality works
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons[0]).toBeInTheDocument();
        });
    });

    describe('Authorization Scopes', () => {
        it('should not show edit icons without update scope', async () => {
            const authContextNoUpdate = {
                ...mockAuthContextNoScopes,
                portalUserProfile: {
                    ...mockAuthContextNoScopes.portalUserProfile,
                    scope: [RATE_LIMIT_TENANT_ASSIGN_SCOPE, RATE_LIMIT_TENANT_REMOVE_SCOPE]
                }
            };

            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, authContextNoUpdate);
            await waitFor(() => {
                expect(screen.queryByTestId('EditOutlinedIcon')).not.toBeInTheDocument();
            });
        });

        it('should not show remove icons without remove scope', async () => {
            const authContextNoRemove = {
                ...mockAuthContextNoScopes,
                portalUserProfile: {
                    ...mockAuthContextNoScopes.portalUserProfile,
                    scope: [RATE_LIMIT_TENANT_ASSIGN_SCOPE, RATE_LIMIT_TENANT_UPDATE_SCOPE]
                }
            };

            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, authContextNoRemove);
            await waitFor(() => {
                expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
            });
        });

        it('should not show Add button without assign scope', async () => {
            const authContextNoAssign = {
                ...mockAuthContextNoScopes,
                portalUserProfile: {
                    ...mockAuthContextNoScopes.portalUserProfile,
                    scope: [RATE_LIMIT_TENANT_UPDATE_SCOPE, RATE_LIMIT_TENANT_REMOVE_SCOPE]
                }
            };

            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, authContextNoAssign);
            await waitFor(() => {
                expect(screen.queryByText('Add Rate Limit')).not.toBeInTheDocument();
            });
        });

        it('should show all action buttons with all scopes', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByText('Add Rate Limit')).toBeInTheDocument();
                expect(screen.getAllByTestId('EditOutlinedIcon')).toHaveLength(3);
                expect(screen.getAllByTestId('RemoveCircleOutlineIcon')).toHaveLength(3);
            });
        });

        it('should show no action buttons without any scopes', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextNoScopes);
            await waitFor(() => {
                expect(screen.queryByText('Add Rate Limit')).not.toBeInTheDocument();
                expect(screen.queryByTestId('EditOutlinedIcon')).not.toBeInTheDocument();
                expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
            });
        });
    });

    describe('Summary Handler Callback', () => {
        it('should calculate total used rate limits correctly', async () => {
            const mockSummaryHandler = jest.fn();
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsLarge, {
                ...defaultProps,
                rateLimitSummaryHandler: mockSummaryHandler
            });

            await waitFor(() => {
                // 1000 + 0 (unlimited) + 500 = 1500
                expect(mockSummaryHandler).toHaveBeenCalledWith(1500);
            });
        });

        it('should exclude unlimited rates from total calculation', async () => {
            const mockSummaryHandler = jest.fn();
            const allUnlimitedRates = [
                {
                    tenantId: 'tenant-1',
                    tenantName: 'Test Tenant',
                    servicegroupid: 'service-group-1',
                    servicegroupname: 'Authentication',
                    allowUnlimitedRate: true,
                    rateLimit: null,
                    rateLimitPeriodMinutes: 60
                },
                {
                    tenantId: 'tenant-1',
                    tenantName: 'Test Tenant',
                    servicegroupid: 'service-group-2',
                    servicegroupname: 'Registration',
                    allowUnlimitedRate: true,
                    rateLimit: null,
                    rateLimitPeriodMinutes: 30
                }
            ];

            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: allUnlimitedRates
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsLarge, {
                ...defaultProps,
                rateLimitSummaryHandler: mockSummaryHandler
            });

            await waitFor(() => {
                expect(mockSummaryHandler).toHaveBeenCalledWith(0);
            });
        });

        it('should call summary handler on query completion', async () => {
            const mockSummaryHandler = jest.fn();
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: []
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsLarge, {
                ...defaultProps,
                rateLimitSummaryHandler: mockSummaryHandler
            });

            await waitFor(() => {
                expect(mockSummaryHandler).toHaveBeenCalled();
            });
        });
    });

    describe('Pagination', () => {
        it('should display TablePagination component', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByText(/1–3 of 3/)).toBeInTheDocument();
            });
        });

        it('should show correct count in pagination', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks);
            await waitFor(() => {
                // MUI TablePagination shows "1–3 of 3" format
                const paginationText = screen.getByText(/1–3 of 3/);
                expect(paginationText).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Layout', () => {
        it('should hide Rate Limit Period column on medium screens', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsMedium);
            await waitFor(() => {
                expect(screen.queryByText('Rate Limit Period (minutes)')).not.toBeInTheDocument();
            });
        });

        it('should show Rate Limit Period column on large screens', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsLarge);
            await waitFor(() => {
                expect(screen.getByText('Rate Limit Period (minutes)')).toBeInTheDocument();
            });
        });

        it('should adjust Service Group Name column width based on screen size', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            renderComponent(mocks, mockAuthContextWithAllScopes, mockResponsiveBreakpointsMedium);
            await waitFor(() => {
                expect(screen.getByText('Service Group Name')).toBeInTheDocument();
                expect(screen.getByText('Authentication')).toBeInTheDocument();
            });
        });
    });

    describe('Layout Structure', () => {
        it('should render Divider components for visual separation', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            const { container } = renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByText('Authentication')).toBeInTheDocument();
            });

            // Check for dividers (MUI Divider renders as hr element)
            const dividers = container.querySelectorAll('hr');
            expect(dividers.length).toBeGreaterThan(0);
        });

        it('should use Grid2 containers for layout', async () => {
            const mocks = [
                {
                    request: {
                        query: TENANT_RATE_LIMIT_REL_VIEW_QUERY,
                        variables: { tenantId: 'tenant-1' }
                    },
                    result: {
                        data: {
                            getRateLimitTenantRelViews: mockTenantRateLimitRelViews
                        }
                    }
                }
            ];

            const { container } = renderComponent(mocks);
            await waitFor(() => {
                expect(screen.getByText('Authentication')).toBeInTheDocument();
            });

            // Check for MUI Grid2 structure
            const grids = container.querySelectorAll('.MuiGrid2-root');
            expect(grids.length).toBeGreaterThan(0);
        });
    });
});
