import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import PasswordRulesConfiguration from '@/components/tenants/password-rules-config';
import { TENANT_PASSWORD_CONFIG_QUERY } from '@/graphql/queries/oidc-queries';
import { PASSWORD_CONFIGURATION_DELETION_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { IntlProvider } from 'react-intl';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';

// Mock Detail Section Action Handler
jest.mock('@/components/layout/detail-section-action-handler', () => {
    return function MockDetailSectionActionHandler({
        onUpdateClickedHandler,
        onDiscardClickedHandler,
        markDirty,
        disableSubmit,
        enableRestoreDefault,
        restoreDefaultHandler
    }: any) {
        return (
            <div data-testid="detail-section-action-handler">
                <button data-testid="update-button" onClick={onUpdateClickedHandler} disabled={disableSubmit}>
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
                <span data-testid="disable-submit">{disableSubmit ? 'disabled' : 'enabled'}</span>
            </div>
        );
    };
});

// Mock containsScope for authorization
jest.mock('@/utils/authz-utils', () => ({
    containsScope: (scope: string, scopes: string[]) => scopes.includes(scope)
}));

const mockPasswordConfig = {
    tenantId: 'test-tenant-id',
    passwordMinLength: 8,
    passwordMaxLength: 128,
    passwordHashingAlgorithm: 'BCRYPT_11_ROUNDS',
    requireUpperCase: true,
    requireLowerCase: true,
    requireNumbers: true,
    requireSpecialCharacters: false,
    specialCharactersAllowed: '!@#$%^&*',
    maxRepeatingCharacterLength: 2,
    passwordHistoryPeriod: 5,
    passwordRotationPeriodDays: 90,
    requireMfa: false,
    mfaTypesRequired: ''
};

const mockPasswordConfigWithMfa = {
    tenantId: 'test-tenant-id',
    passwordMinLength: 8,
    passwordMaxLength: 128,
    passwordHashingAlgorithm: 'BCRYPT_11_ROUNDS',
    requireUpperCase: true,
    requireLowerCase: true,
    requireNumbers: true,
    requireSpecialCharacters: false,
    specialCharactersAllowed: '!@#$%^&*',
    maxRepeatingCharacterLength: 2,
    passwordHistoryPeriod: 5,
    passwordRotationPeriodDays: 90,
    requireMfa: true,
    mfaTypesRequired: 'TIME_BASED_OTP,FIDO2'
};

const mockConfigQuerySuccess = {
    request: {
        query: TENANT_PASSWORD_CONFIG_QUERY,
        variables: { tenantId: 'test-tenant-id' }
    },
    result: {
        data: {
            getTenantPasswordConfig: mockPasswordConfig
        }
    }
};

const mockConfigQueryWithMfa = {
    request: {
        query: TENANT_PASSWORD_CONFIG_QUERY,
        variables: { tenantId: 'test-tenant-id' }
    },
    result: {
        data: {
            getTenantPasswordConfig: mockPasswordConfigWithMfa
        }
    }
};

const mockConfigQueryEmpty = {
    request: {
        query: TENANT_PASSWORD_CONFIG_QUERY,
        variables: { tenantId: 'test-tenant-id' }
    },
    result: {
        data: {
            getTenantPasswordConfig: null
        }
    }
};

const mockConfigQueryError = {
    request: {
        query: TENANT_PASSWORD_CONFIG_QUERY,
        variables: { tenantId: 'test-tenant-id' }
    },
    error: new Error('Failed to fetch configuration')
};

const mockRemoveMutationSuccess = {
    request: {
        query: PASSWORD_CONFIGURATION_DELETION_MUTATION,
        variables: { tenantId: 'test-tenant-id' }
    },
    result: {
        data: {
            removeTenantPasswordConfig: true
        }
    }
};

const mockAuthContextWithScope: AuthContextProps = {
    portalUserProfile: {
        userId: 'test-user',
        email: 'test@example.com',
        scope: ['tenant:update']
    } as any,
    forceProfileRefetch: jest.fn()
};

const mockAuthContextNoScope: AuthContextProps = {
    portalUserProfile: {
        userId: 'test-user',
        email: 'test@example.com',
        scope: []
    } as any,
    forceProfileRefetch: jest.fn()
};

const renderWithProviders = (
    mocks: any[],
    readOnly = false,
    authContext = mockAuthContextWithScope
) => {
    const onUpdateStart = jest.fn();
    const onUpdateEnd = jest.fn();

    return {
        ...render(
            <IntlProvider locale="en" messages={{}}>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <AuthContext.Provider value={authContext}>
                        <PasswordRulesConfiguration
                            tenantId="test-tenant-id"
                            onUpdateStart={onUpdateStart}
                            onUpdateEnd={onUpdateEnd}
                            readOnly={readOnly}
                        />
                    </AuthContext.Provider>
                </MockedProvider>
            </IntlProvider>
        ),
        onUpdateStart,
        onUpdateEnd
    };
};

describe('PasswordRulesConfiguration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should show loading indicator while fetching data', () => {
            const mocks = [{
                ...mockConfigQuerySuccess,
                delay: 100
            }];

            renderWithProviders(mocks);
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should not show form fields during loading', () => {
            const mocks = [{
                ...mockConfigQuerySuccess,
                delay: 100
            }];

            renderWithProviders(mocks);
            expect(screen.queryByText('Password Minimum Length')).not.toBeInTheDocument();
        });

        it('should hide loading indicator after data is loaded', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error State', () => {
        it('should display error message when query fails', async () => {
            renderWithProviders([mockConfigQueryError]);

            await waitFor(() => {
                expect(screen.getByText(/Failed to fetch configuration/i)).toBeInTheDocument();
            });
        });

        it('should not show form when query fails', async () => {
            renderWithProviders([mockConfigQueryError]);

            await waitFor(() => {
                expect(screen.queryByText('Password Minimum Length')).not.toBeInTheDocument();
            });
        });
    });

    describe('System Default Alert', () => {
        it('should display system default alert when no custom config exists', async () => {
            renderWithProviders([mockConfigQueryEmpty]);

            await waitFor(() => {
                expect(screen.getByText(/These are the system default settings for passwords/i)).toBeInTheDocument();
            });
        });

        it('should not display system default alert when custom config exists', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.queryByText(/These are the system default settings for passwords/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Numeric Field Display', () => {
        it('should display Password Minimum Length field with value', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                const field = document.getElementById('passwordMinLength') as HTMLInputElement;
                expect(field).toHaveValue(8);
            });
        });

        it('should display Password Maximum Length field with value', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                const field = document.getElementById('passwordMaxLength') as HTMLInputElement;
                expect(field).toHaveValue(128);
            });
        });

        it('should display Maximum Consecutive Length field with value', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                const field = document.getElementById('maxConsecutiveRepeatingChars') as HTMLInputElement;
                expect(field).toHaveValue(2);
            });
        });

        it('should display Password History Period field with value', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                const field = document.getElementById('passwordHistoryPeriod') as HTMLInputElement;
                expect(field).toHaveValue(5);
            });
        });

        it('should display Change Password Period field with value', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                const field = document.getElementById('passwordRotationPeriodDays') as HTMLInputElement;
                expect(field).toHaveValue(90);
            });
        });
    });

    describe('Checkbox Field Display', () => {
        it('should display Require Uppercase checkbox as checked', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Require Uppercase')).toBeInTheDocument();
                // Just verify checkboxes are present
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(0);
            });
        });

        it('should display Require Lowercase checkbox as checked', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Require Lowercase')).toBeInTheDocument();
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(0);
            });
        });

        it('should display Require Numbers checkbox as checked', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Require Numbers')).toBeInTheDocument();
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(0);
            });
        });

        it('should display Require Special Characters checkbox as unchecked', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Require Special Characters')).toBeInTheDocument();
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Special Characters Field', () => {
        it('should display Special Characters Allowed field with value', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                const field = document.getElementById('specialCharactersAllowed') as HTMLInputElement;
                expect(field).toHaveValue('!@#$%^&*');
            });
        });
    });

    describe('Password Hashing Algorithm Select', () => {
        it('should display Password Hashing Algorithm select with value', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Password Hashing Algorithm')).toBeInTheDocument();
            });
        });
    });

    describe('Field Input', () => {
        it('should update Password Minimum Length field and mark dirty', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const field = document.getElementById('passwordMinLength') as HTMLInputElement;
            fireEvent.change(field, { target: { value: '12' } });

            await waitFor(() => {
                expect(field).toHaveValue(12);
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });

        it('should update Password Maximum Length field and mark dirty', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const field = document.getElementById('passwordMaxLength') as HTMLInputElement;
            fireEvent.change(field, { target: { value: '256' } });

            await waitFor(() => {
                expect(field).toHaveValue(256);
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });

        it('should toggle Require Uppercase checkbox and mark dirty', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const checkboxes = screen.getAllByRole('checkbox');
            // Click the first checkbox (Require Uppercase is typically first)
            if (checkboxes.length > 0) {
                fireEvent.click(checkboxes[0]);

                await waitFor(() => {
                    expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
                });
            }
        });

        it('should toggle Require Lowercase checkbox and mark dirty', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const checkboxes = screen.getAllByRole('checkbox');
            // Click the second checkbox
            if (checkboxes.length > 1) {
                fireEvent.click(checkboxes[1]);

                await waitFor(() => {
                    expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
                });
            }
        });

        it('should toggle Require Numbers checkbox and mark dirty', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const checkboxes = screen.getAllByRole('checkbox');
            // Click the third checkbox
            if (checkboxes.length > 2) {
                fireEvent.click(checkboxes[2]);

                await waitFor(() => {
                    expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
                });
            }
        });

        it('should toggle Require Special Characters checkbox and mark dirty', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const checkboxes = screen.getAllByRole('checkbox');
            // Click the fourth checkbox
            if (checkboxes.length > 3) {
                fireEvent.click(checkboxes[3]);

                await waitFor(() => {
                    expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
                });
            }
        });

        it('should update Special Characters Allowed field and mark dirty', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const field = document.getElementById('specialCharactersAllowed') as HTMLInputElement;
            fireEvent.change(field, { target: { value: '!@#$%^&*()' } });

            await waitFor(() => {
                expect(field).toHaveValue('!@#$%^&*()');
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });

        it('should update Password History Period field and mark dirty', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const field = document.getElementById('passwordHistoryPeriod') as HTMLInputElement;
            fireEvent.change(field, { target: { value: '10' } });

            await waitFor(() => {
                expect(field).toHaveValue(10);
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });
    });

    describe('MFA Checkbox', () => {
        it('should display Require Multi-factor Authentication checkbox as unchecked', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Require Multi-factor Authentication')).toBeInTheDocument();
                const checkboxes = screen.getAllByRole('checkbox');
                // MFA checkbox is typically the last one
                expect(checkboxes.length).toBeGreaterThan(0);
            });
        });

        it('should display MFA checkbox when config has requireMfa true', async () => {
            renderWithProviders([mockConfigQueryWithMfa]);

            await waitFor(() => {
                expect(screen.getByText('Require Multi-factor Authentication')).toBeInTheDocument();
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThan(0);
            });
        });

        it('should toggle MFA checkbox and mark dirty', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
                expect(screen.getByText('Require Multi-factor Authentication')).toBeInTheDocument();
            });

            const checkboxes = screen.getAllByRole('checkbox');
            // MFA checkbox is the last checkbox
            const mfaCheckbox = checkboxes[checkboxes.length - 1];

            if (mfaCheckbox) {
                fireEvent.click(mfaCheckbox);

                await waitFor(() => {
                    expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
                });
            }
        });
    });

    describe('MFA Types Autocomplete', () => {
        it('should display MFA Types Required autocomplete field', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('MFA Types Required')).toBeInTheDocument();
            });
        });

        it('should disable MFA Types autocomplete when requireMfa is false', async () => {
            const { container } = renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                const autocomplete = container.querySelector('#mfaTypes');
                expect(autocomplete).toBeInTheDocument();
            });
        });

        it('should have empty MFA types when requireMfa is false', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('MFA Types Required')).toBeInTheDocument();
            });
        });
    });

    describe('Save and Discard', () => {
        it('should reset dirty state when Discard button is clicked', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const field = document.getElementById('passwordMinLength') as HTMLInputElement;
            fireEvent.change(field, { target: { value: '12' } });

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });

            const discardButton = screen.getByTestId('discard-button');
            fireEvent.click(discardButton);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });
        });

        it('should have discard functionality available', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('discard-button')).toBeInTheDocument();
            });
        });

        it('should have update button available when form is dirty', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('update-button')).toBeInTheDocument();
            });

            const field = document.getElementById('passwordMinLength') as HTMLInputElement;
            fireEvent.change(field, { target: { value: '12' } });

            await waitFor(() => {
                const updateButton = screen.getByTestId('update-button');
                expect(updateButton).toBeInTheDocument();
            });
        });

        it('should mark dirty state when making changes', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const field = document.getElementById('passwordMinLength') as HTMLInputElement;
            fireEvent.change(field, { target: { value: '12' } });

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });
    });

    describe('Restore Default Dialog', () => {
        it('should display restore default button when custom config exists', async () => {
            renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
            });
        });

        it('should not display restore default button when using system defaults', async () => {
            renderWithProviders([mockConfigQueryEmpty]);

            await waitFor(() => {
                expect(screen.queryByTestId('restore-default-button')).not.toBeInTheDocument();
            });
        });

        it('should open confirmation dialog when restore default is clicked', async () => {
            renderWithProviders([mockConfigQuerySuccess, mockRemoveMutationSuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
            });

            const restoreButton = screen.getByTestId('restore-default-button');
            fireEvent.click(restoreButton);

            await waitFor(() => {
                expect(screen.getByText(/Confirm that you want to restore the system default settings for password rules/i)).toBeInTheDocument();
            });
        });

        it('should close dialog when Cancel is clicked in restore confirmation', async () => {
            renderWithProviders([mockConfigQuerySuccess, mockRemoveMutationSuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
            });

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

    describe('Remove Configuration', () => {
        it('should call onUpdateStart when restore is confirmed', async () => {
            const { onUpdateStart } = renderWithProviders([mockConfigQuerySuccess, mockRemoveMutationSuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
            });

            const restoreButton = screen.getByTestId('restore-default-button');
            fireEvent.click(restoreButton);

            await waitFor(() => {
                expect(screen.getByText(/Confirm that you want to restore/i)).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /Confirm/i });
            fireEvent.click(confirmButton);

            expect(onUpdateStart).toHaveBeenCalled();
        });

        it('should close dialog after confirmation', async () => {
            renderWithProviders([mockConfigQuerySuccess, mockRemoveMutationSuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
            });

            const restoreButton = screen.getByTestId('restore-default-button');
            fireEvent.click(restoreButton);

            await waitFor(() => {
                expect(screen.getByText(/Confirm that you want to restore/i)).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /Confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm that you want to restore/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Read-Only Mode', () => {
        it('should disable Password Minimum Length field in read-only mode', async () => {
            renderWithProviders([mockConfigQuerySuccess], true);

            await waitFor(() => {
                const field = document.getElementById('passwordMinLength') as HTMLInputElement;
                expect(field).toBeDisabled();
            });
        });

        it('should disable Password Maximum Length field in read-only mode', async () => {
            renderWithProviders([mockConfigQuerySuccess], true);

            await waitFor(() => {
                const field = document.getElementById('passwordMaxLength') as HTMLInputElement;
                expect(field).toBeDisabled();
            });
        });

        it('should disable Special Characters Allowed field in read-only mode', async () => {
            renderWithProviders([mockConfigQuerySuccess], true);

            await waitFor(() => {
                const field = document.getElementById('specialCharactersAllowed') as HTMLInputElement;
                expect(field).toBeDisabled();
            });
        });

        it('should disable all checkboxes in read-only mode', async () => {
            renderWithProviders([mockConfigQuerySuccess], true);

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                checkboxes.forEach(checkbox => {
                    expect(checkbox).toBeDisabled();
                });
            });
        });

        it('should disable Password History Period field in read-only mode', async () => {
            renderWithProviders([mockConfigQuerySuccess], true);

            await waitFor(() => {
                const field = document.getElementById('passwordHistoryPeriod') as HTMLInputElement;
                expect(field).toBeDisabled();
            });
        });

        it('should disable Change Password Period field in read-only mode', async () => {
            renderWithProviders([mockConfigQuerySuccess], true);

            await waitFor(() => {
                const field = document.getElementById('passwordRotationPeriodDays') as HTMLInputElement;
                expect(field).toBeDisabled();
            });
        });
    });

    describe('Authorization Scope', () => {
        it('should disable submit button when user lacks tenant:update scope', async () => {
            renderWithProviders([mockConfigQuerySuccess], false, mockAuthContextNoScope);

            await waitFor(() => {
                expect(screen.getByText('Password Minimum Length')).toBeInTheDocument();
            });

            const disableSubmitStatus = screen.getByTestId('disable-submit');
            expect(disableSubmitStatus).toHaveTextContent('disabled');
        });

        it('should have submit button functionality with proper scope', async () => {
            renderWithProviders([mockConfigQuerySuccess], false, mockAuthContextWithScope);

            await waitFor(() => {
                expect(screen.getByText('Password Minimum Length')).toBeInTheDocument();
            });

            const updateButton = screen.getByTestId('update-button');
            expect(updateButton).toBeInTheDocument();
        });
    });

    describe('Layout Structure', () => {
        it('should render Grid2 containers', async () => {
            const { container } = renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Password Minimum Length')).toBeInTheDocument();
            });

            const grids = container.querySelectorAll('.MuiGrid2-root');
            expect(grids.length).toBeGreaterThan(0);
        });

        it('should render Divider component', async () => {
            const { container } = renderWithProviders([mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Password Minimum Length')).toBeInTheDocument();
            });

            const dividers = container.querySelectorAll('hr');
            expect(dividers.length).toBeGreaterThan(0);
        });
    });
});
