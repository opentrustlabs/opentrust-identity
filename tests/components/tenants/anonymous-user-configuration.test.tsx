import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import AnonymousUserConfiguration from '@/components/tenants/anonymous-user-configuration';
import { TENANT_ANONYMOUS_USER_CONFIGURATION_QUERY } from '@/graphql/queries/oidc-queries';
import { TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION, REMOVE_TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { Tenant } from '@/graphql/generated/graphql-types';
import { IntlProvider } from 'react-intl';

// Mock DetailSectionActionHandler
jest.mock('@/components/layout/detail-section-action-handler', () => {
    return function MockDetailSectionActionHandler({
        onUpdateClickedHandler,
        onDiscardClickedHandler,
        markDirty,
        enableRestoreDefault,
        restoreDefaultHandler
    }: any) {
        return (
            <div data-testid="detail-section-action-handler">
                <button data-testid="update-button" onClick={onUpdateClickedHandler}>
                    Update
                </button>
                <button data-testid="discard-button" onClick={onDiscardClickedHandler}>
                    Discard
                </button>
                {enableRestoreDefault && (
                    <button data-testid="restore-default-button" onClick={restoreDefaultHandler}>
                        Restore Default
                    </button>
                )}
                <span data-testid="mark-dirty">{markDirty ? 'dirty' : 'clean'}</span>
            </div>
        );
    };
});

// Mock getDefaultCountryCodeDef and getDefaultLanguageCodeDef
jest.mock('@/utils/client-utils', () => ({
    getDefaultCountryCodeDef: (code: string) => {
        if (code === 'US') return { id: 'US', label: 'United States' };
        if (code === 'CA') return { id: 'CA', label: 'Canada' };
        return { id: '', label: '' };
    },
    getDefaultLanguageCodeDef: (code: string) => {
        if (code === 'en') return { id: 'en', label: 'English' };
        if (code === 'fr') return { id: 'fr', label: 'French' };
        return { id: '', label: '' };
    }
}));

const mockTenant: Tenant = {
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    tenantDescription: 'Test Description',
    enabled: true,
    allowAnonymousUsers: true,
    allowForgotPassword: false,
    allowLoginByPhoneNumber: false,
    allowSocialLogin: false,
    allowUnlimitedRate: false,
    allowUserSelfRegistration: false,
    defaultRateLimit: null,
    defaultRateLimitPeriodMinutes: null,
    federatedAuthenticationConstraint: '',
    federatedauthenticationconstraintid: null,
    markForDelete: false,
    migrateLegacyUsers: false,
    registrationRequireCaptcha: false,
    registrationRequireTermsAndConditions: false,
    tenantType: 'STANDARD',
    verifyEmailOnSelfRegistration: false
};

const mockAnonymousUserConfig = {
    tenantId: 'test-tenant-id',
    defaultcountrycode: 'US',
    defaultlanguagecode: 'en',
    tokenttlseconds: 3600
};

const mockConfigQuerySuccess = {
    request: {
        query: TENANT_ANONYMOUS_USER_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getAnonymousUserConfiguration: mockAnonymousUserConfig,
        },
    },
};

const mockConfigQueryEmpty = {
    request: {
        query: TENANT_ANONYMOUS_USER_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getAnonymousUserConfiguration: null,
        },
    },
};

const mockConfigQueryError = {
    request: {
        query: TENANT_ANONYMOUS_USER_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    error: new Error('Failed to fetch configuration'),
};

const mockSaveMutationSuccess = {
    request: {
        query: TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION,
        variables: {
            tenantAnonymousUserConfigInput: {
                tenantId: 'test-tenant-id',
                defaultcountrycode: '',
                defaultlanguagecode: '',
                tokenttlseconds: 7200,
            },
        },
    },
    result: {
        data: {
            setTenantAnonymousUserConfig: {
                tenantId: 'test-tenant-id',
                defaultcountrycode: '',
                defaultlanguagecode: '',
                tokenttlseconds: 7200,
            },
        },
    },
};

const mockSaveMutationError = {
    request: {
        query: TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION,
        variables: {
            tenantAnonymousUserConfigInput: {
                tenantId: 'test-tenant-id',
                defaultcountrycode: '',
                defaultlanguagecode: '',
                tokenttlseconds: 7200,
            },
        },
    },
    error: new Error('Failed to save configuration'),
};

const mockRemoveMutationSuccess = {
    request: {
        query: REMOVE_TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            removeTenantAnonymousUserConfig: true,
        },
    },
};

const mockRemoveMutationError = {
    request: {
        query: REMOVE_TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION,
        variables: { tenantId: 'test-tenant-id' },
    },
    error: new Error('Failed to remove configuration'),
};

const renderWithProviders = (
    tenant: Tenant,
    allowAnonymousUsers: boolean,
    mocks: any[],
    readOnly = false
) => {
    const onUpdateStart = jest.fn();
    const onUpdateEnd = jest.fn();

    return {
        ...render(
            <IntlProvider locale="en" messages={{}}>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <AnonymousUserConfiguration
                        tenant={tenant}
                        allowAnonymousUsers={allowAnonymousUsers}
                        onUpdateStart={onUpdateStart}
                        onUpdateEnd={onUpdateEnd}
                        readOnly={readOnly}
                    />
                </MockedProvider>
            </IntlProvider>
        ),
        onUpdateStart,
        onUpdateEnd,
    };
};

describe('AnonymousUserConfiguration - Loading State', () => {
    it('should display loading spinner while fetching data', () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should not display form fields during loading', () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        expect(screen.queryByText('Default Country')).not.toBeInTheDocument();
    });

    it('should not display action handler during loading', () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        expect(screen.queryByTestId('detail-section-action-handler')).not.toBeInTheDocument();
    });
});

describe('AnonymousUserConfiguration - Error State', () => {
    it('should display error message when query fails', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQueryError]);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch configuration')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should not display form fields when query fails', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQueryError]);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch configuration')).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.queryByText('Default Country')).not.toBeInTheDocument();
    });
});

describe('AnonymousUserConfiguration - Conditional Rendering (allowAnonymousUsers=false)', () => {
    it('should display warning message when anonymous users not allowed', async () => {
        renderWithProviders(mockTenant, false, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByText(/To make configuration changes to anonymous users, update the tenant to allow anonymous users/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should not display form fields when anonymous users not allowed', async () => {
        renderWithProviders(mockTenant, false, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByText(/To make configuration changes to anonymous users/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.queryByText('Default Country')).not.toBeInTheDocument();
        expect(screen.queryByText('Default Language')).not.toBeInTheDocument();
    });

    it('should not display action handler when anonymous users not allowed', async () => {
        renderWithProviders(mockTenant, false, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByText(/To make configuration changes to anonymous users/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.queryByTestId('detail-section-action-handler')).not.toBeInTheDocument();
    });
});

describe('AnonymousUserConfiguration - Form Display (allowAnonymousUsers=true)', () => {
    it('should display Default Country label', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByText('Default Country')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should display Default Language label', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByText('Default Language')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should display Token Time-To-Live label', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByText(/Token Time-To-Live/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should display country Autocomplete component', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(document.getElementById('defaultCountry')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should display language Autocomplete component', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(document.getElementById('defaultLanguage')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should display token TTL TextField', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
            expect(ttlField).toBeInTheDocument();
            expect(ttlField.type).toBe('number');
        }, { timeout: 3000 });
    });

    it('should display action handler', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByTestId('detail-section-action-handler')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should populate TTL field with existing value', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
            expect(ttlField).toHaveValue(3600);
        }, { timeout: 3000 });
    });
});

describe('AnonymousUserConfiguration - Token TTL Input', () => {
    it('should update TTL field when user enters a value', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQueryEmpty]);

        await waitFor(() => {
            expect(screen.getByTestId('detail-section-action-handler')).toBeInTheDocument();
        }, { timeout: 3000 });

        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        fireEvent.change(ttlField, { target: { value: '7200' } });

        await waitFor(() => {
            expect(ttlField).toHaveValue(7200);
        });
    });

    it('should mark form as dirty when TTL field is edited', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQueryEmpty]);

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
        }, { timeout: 3000 });

        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        fireEvent.change(ttlField, { target: { value: '7200' } });

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
        });
    });

    it('should handle empty TTL value', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByTestId('detail-section-action-handler')).toBeInTheDocument();
        }, { timeout: 3000 });

        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        fireEvent.change(ttlField, { target: { value: '' } });

        await waitFor(() => {
            expect(ttlField).toHaveValue(null);
        });
    });
});

describe('AnonymousUserConfiguration - Save Mutation', () => {
    it('should call onUpdateStart when Update button is clicked', async () => {
        const { onUpdateStart } = renderWithProviders(mockTenant, true, [
            mockConfigQuerySuccess,
            mockSaveMutationSuccess
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('update-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Make a change to enable the Update button
        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        fireEvent.change(ttlField, { target: { value: '7200' } });

        const updateButton = screen.getByTestId('update-button');
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });

    it('should call onUpdateEnd with true on successful save', async () => {
        const { onUpdateEnd } = renderWithProviders(mockTenant, true, [
            mockConfigQueryEmpty,
            mockSaveMutationSuccess
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('update-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Set values to match the mock mutation
        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        fireEvent.change(ttlField, { target: { value: '7200' } });

        const updateButton = screen.getByTestId('update-button');
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(onUpdateEnd).toHaveBeenCalledWith(true);
        }, { timeout: 5000 });
    });

    it('should mark form as clean after successful save', async () => {
        renderWithProviders(mockTenant, true, [
            mockConfigQueryEmpty,
            mockSaveMutationSuccess
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('update-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        fireEvent.change(ttlField, { target: { value: '7200' } });

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
        });

        const updateButton = screen.getByTestId('update-button');
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
        }, { timeout: 5000 });
    });

    it('should display error message on save failure', async () => {
        renderWithProviders(mockTenant, true, [
            mockConfigQueryEmpty,
            mockSaveMutationError
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('update-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        fireEvent.change(ttlField, { target: { value: '7200' } });

        const updateButton = screen.getByTestId('update-button');
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(screen.getByText(/Failed to save configuration/i)).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('should call onUpdateEnd with false on save failure', async () => {
        const { onUpdateEnd } = renderWithProviders(mockTenant, true, [
            mockConfigQueryEmpty,
            mockSaveMutationError
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('update-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        fireEvent.change(ttlField, { target: { value: '7200' } });

        const updateButton = screen.getByTestId('update-button');
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(onUpdateEnd).toHaveBeenCalledWith(false);
        }, { timeout: 5000 });
    });
});

describe('AnonymousUserConfiguration - Discard Changes', () => {
    it('should reset dirty state when Discard button is clicked', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
        }, { timeout: 3000 });

        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        fireEvent.change(ttlField, { target: { value: '7200' } });

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
        });

        const discardButton = screen.getByTestId('discard-button');
        fireEvent.click(discardButton);

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
        });
    });

    it('should reset TTL field to original value when Discard is clicked', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByTestId('discard-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        const originalValue = ttlField.value;

        fireEvent.change(ttlField, { target: { value: '7200' } });

        const discardButton = screen.getByTestId('discard-button');
        fireEvent.click(discardButton);

        await waitFor(() => {
            expect(ttlField).toHaveValue(parseInt(originalValue));
        });
    });
});

describe('AnonymousUserConfiguration - Delete Configuration Dialog', () => {
    it('should display restore default button when configuration exists', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should not display restore default button when no configuration exists', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQueryEmpty]);

        await waitFor(() => {
            expect(screen.getByTestId('detail-section-action-handler')).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.queryByTestId('restore-default-button')).not.toBeInTheDocument();
    });

    it('should open confirmation dialog when restore default is clicked', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const restoreButton = screen.getByTestId('restore-default-button');
        fireEvent.click(restoreButton);

        await waitFor(() => {
            expect(screen.getByText(/Confirm that you want to restore the system default settings/i)).toBeInTheDocument();
        });
    });

    it('should close dialog when Cancel is clicked', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const restoreButton = screen.getByTestId('restore-default-button');
        fireEvent.click(restoreButton);

        await waitFor(() => {
            expect(screen.getByText(/Confirm that you want to restore/i)).toBeInTheDocument();
        });

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText(/Confirm that you want to restore/i)).not.toBeInTheDocument();
        });
    });
});

describe('AnonymousUserConfiguration - Remove Configuration Mutation', () => {
    it('should call onUpdateStart when Confirm is clicked', async () => {
        const { onUpdateStart } = renderWithProviders(mockTenant, true, [
            mockConfigQuerySuccess,
            mockRemoveMutationSuccess
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const restoreButton = screen.getByTestId('restore-default-button');
        fireEvent.click(restoreButton);

        await waitFor(() => {
            expect(screen.getByText(/Confirm that you want to restore/i)).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(onUpdateStart).toHaveBeenCalled();
        });
    });

    it('should call onUpdateEnd with true on successful removal', async () => {
        const { onUpdateEnd } = renderWithProviders(mockTenant, true, [
            mockConfigQuerySuccess,
            mockRemoveMutationSuccess
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const restoreButton = screen.getByTestId('restore-default-button');
        fireEvent.click(restoreButton);

        await waitFor(() => {
            expect(screen.getByText(/Confirm that you want to restore/i)).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(onUpdateEnd).toHaveBeenCalledWith(true);
        }, { timeout: 5000 });
    });

    it('should reset TTL to 0 after successful removal', async () => {
        renderWithProviders(mockTenant, true, [
            mockConfigQuerySuccess,
            mockRemoveMutationSuccess
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const restoreButton = screen.getByTestId('restore-default-button');
        fireEvent.click(restoreButton);

        await waitFor(() => {
            expect(screen.getByText(/Confirm that you want to restore/i)).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
            expect(ttlField).toHaveValue(null); // Empty when 0
        }, { timeout: 5000 });
    });

    it('should display error message on removal failure', async () => {
        renderWithProviders(mockTenant, true, [
            mockConfigQuerySuccess,
            mockRemoveMutationError
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const restoreButton = screen.getByTestId('restore-default-button');
        fireEvent.click(restoreButton);

        await waitFor(() => {
            expect(screen.getByText(/Confirm that you want to restore/i)).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(screen.getByText(/Failed to remove configuration/i)).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('should call onUpdateEnd with false on removal failure', async () => {
        const { onUpdateEnd } = renderWithProviders(mockTenant, true, [
            mockConfigQuerySuccess,
            mockRemoveMutationError
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const restoreButton = screen.getByTestId('restore-default-button');
        fireEvent.click(restoreButton);

        await waitFor(() => {
            expect(screen.getByText(/Confirm that you want to restore/i)).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(onUpdateEnd).toHaveBeenCalledWith(false);
        }, { timeout: 5000 });
    });
});

describe('AnonymousUserConfiguration - Read-Only Mode', () => {
    it('should disable country autocomplete in read-only mode', async () => {
        const { container } = renderWithProviders(mockTenant, true, [mockConfigQuerySuccess], true);

        await waitFor(() => {
            expect(screen.getByText('Default Country')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Check that the Autocomplete has disabled class
        const autocompleteDiv = container.querySelector('#defaultCountry')?.closest('.MuiAutocomplete-root');
        expect(autocompleteDiv?.querySelector('.Mui-disabled')).toBeInTheDocument();
    });

    it('should disable language autocomplete in read-only mode', async () => {
        const { container } = renderWithProviders(mockTenant, true, [mockConfigQuerySuccess], true);

        await waitFor(() => {
            expect(screen.getByText('Default Language')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Check that the Autocomplete has disabled class
        const autocompleteDiv = container.querySelector('#defaultLanguage')?.closest('.MuiAutocomplete-root');
        expect(autocompleteDiv?.querySelector('.Mui-disabled')).toBeInTheDocument();
    });

    it('should disable TTL field in read-only mode', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess], true);

        await waitFor(() => {
            const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
            expect(ttlField).toBeDisabled();
        }, { timeout: 3000 });
    });

    it('should still display fields in read-only mode', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess], true);

        await waitFor(() => {
            expect(screen.getByText('Default Country')).toBeInTheDocument();
            expect(screen.getByText('Default Language')).toBeInTheDocument();
            expect(screen.getByText(/Token Time-To-Live/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});

describe('AnonymousUserConfiguration - Null Configuration', () => {
    it('should display empty fields when no configuration exists', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQueryEmpty]);

        await waitFor(() => {
            const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
            expect(ttlField).toHaveValue(null);
        }, { timeout: 3000 });
    });

    it('should allow editing when no configuration exists', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQueryEmpty]);

        await waitFor(() => {
            expect(screen.getByTestId('detail-section-action-handler')).toBeInTheDocument();
        }, { timeout: 3000 });

        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        expect(ttlField).not.toBeDisabled();
    });
});

describe('AnonymousUserConfiguration - Layout Structure', () => {
    it('should render Grid2 containers', async () => {
        const { container } = renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByText('Default Country')).toBeInTheDocument();
        }, { timeout: 3000 });

        const grids = container.querySelectorAll('.MuiGrid2-root');
        expect(grids.length).toBeGreaterThan(0);
    });

    it('should render all components when anonymous users allowed', async () => {
        renderWithProviders(mockTenant, true, [mockConfigQuerySuccess]);

        await waitFor(() => {
            expect(screen.getByText('Default Country')).toBeInTheDocument();
            expect(screen.getByText('Default Language')).toBeInTheDocument();
            expect(screen.getByText(/Token Time-To-Live/i)).toBeInTheDocument();
            expect(screen.getByTestId('detail-section-action-handler')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});

describe('AnonymousUserConfiguration - Error Alert', () => {
    it('should display error alert with close functionality on save failure', async () => {
        const { container } = renderWithProviders(mockTenant, true, [
            mockConfigQueryEmpty,
            mockSaveMutationError
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('update-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const ttlField = document.getElementById('tokenTTLSeconds') as HTMLInputElement;
        fireEvent.change(ttlField, { target: { value: '7200' } });

        const updateButton = screen.getByTestId('update-button');
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(screen.getByText(/Failed to save configuration/i)).toBeInTheDocument();
            // Alert component should be present
            const alert = container.querySelector('.MuiAlert-root');
            expect(alert).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should display error alert on removal failure', async () => {
        const { container } = renderWithProviders(mockTenant, true, [
            mockConfigQuerySuccess,
            mockRemoveMutationError
        ]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const restoreButton = screen.getByTestId('restore-default-button');
        fireEvent.click(restoreButton);

        await waitFor(() => {
            expect(screen.getByText(/Confirm that you want to restore/i)).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(screen.getByText(/Failed to remove configuration/i)).toBeInTheDocument();
            const alert = container.querySelector('.MuiAlert-root');
            expect(alert).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
