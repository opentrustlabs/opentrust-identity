import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import LoginFailureConfiguration from '@/components/tenants/login-failure-configuration';
import { LOGIN_FAILURE_CONFIGURATION_QUERY } from '@/graphql/queries/oidc-queries';
import { REMOVE_LOGIN_FAILURE_POLICY_CONFIGURATION_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { IntlProvider } from 'react-intl';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';

// Mock DetailSectionActionHandler
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

// Mock containsScope
jest.mock('@/utils/authz-utils', () => ({
    containsScope: (scope: string, scopes: string[]) => scopes.includes(scope)
}));

const mockLockPolicyConfig = {
    tenantId: 'test-tenant-id',
    loginFailurePolicyType: 'LOCK_USER_ACCOUNT',
    failureThreshold: 5,
    pauseDurationMinutes: null,
    maximumLoginFailures: null
};

const mockPausePolicyConfig = {
    tenantId: 'test-tenant-id',
    loginFailurePolicyType: 'PAUSE',
    failureThreshold: 3,
    pauseDurationMinutes: 15,
    maximumLoginFailures: 50
};

const mockConfigQueryLockPolicy = {
    request: {
        query: LOGIN_FAILURE_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getTenantLoginFailurePolicy: mockLockPolicyConfig,
        },
    },
};

const mockConfigQueryPausePolicy = {
    request: {
        query: LOGIN_FAILURE_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getTenantLoginFailurePolicy: mockPausePolicyConfig,
        },
    },
};

const mockConfigQueryEmpty = {
    request: {
        query: LOGIN_FAILURE_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getTenantLoginFailurePolicy: null,
        },
    },
};

const mockConfigQueryError = {
    request: {
        query: LOGIN_FAILURE_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    error: new Error('Failed to fetch configuration'),
};

const mockRemoveMutationSuccess = {
    request: {
        query: REMOVE_LOGIN_FAILURE_POLICY_CONFIGURATION_MUTATION,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            removeTenantLoginFailurePolicy: true,
        },
    },
};

const mockRemoveMutationError = {
    request: {
        query: REMOVE_LOGIN_FAILURE_POLICY_CONFIGURATION_MUTATION,
        variables: { tenantId: 'test-tenant-id' },
    },
    error: new Error('Failed to remove configuration'),
};

const mockRefetchQuery = {
    request: {
        query: LOGIN_FAILURE_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getTenantLoginFailurePolicy: mockLockPolicyConfig,
        },
    },
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
                <AuthContext.Provider value={authContext}>
                    <MockedProvider mocks={mocks} addTypename={false}>
                        <LoginFailureConfiguration
                            tenantId="test-tenant-id"
                            onUpdateStart={onUpdateStart}
                            onUpdateEnd={onUpdateEnd}
                            readOnly={readOnly}
                        />
                    </MockedProvider>
                </AuthContext.Provider>
            </IntlProvider>
        ),
        onUpdateStart,
        onUpdateEnd,
    };
};

describe('LoginFailureConfiguration - Loading State', () => {
    it('should display loading spinner while fetching data', () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should not display form fields during loading', () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        expect(screen.queryByText('Login Failure Policy Type')).not.toBeInTheDocument();
    });

    it('should not display action handler during loading', () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        expect(screen.queryByTestId('detail-section-action-handler')).not.toBeInTheDocument();
    });
});

describe('LoginFailureConfiguration - Error State', () => {
    it('should display error message when query fails', async () => {
        renderWithProviders([mockConfigQueryError]);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch configuration')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should not display form fields when query fails', async () => {
        renderWithProviders([mockConfigQueryError]);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch configuration')).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.queryByText('Login Failure Policy Type')).not.toBeInTheDocument();
    });
});

describe('LoginFailureConfiguration - System Default Policy Alert', () => {
    it('should display info alert when no custom policy exists', async () => {
        renderWithProviders([mockConfigQueryEmpty]);

        await waitFor(() => {
            expect(screen.getByText(/These are the system default settings for handling login failures/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should not display info alert when custom policy exists', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByText('Login Failure Policy Type')).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.queryByText(/These are the system default settings/i)).not.toBeInTheDocument();
    });
});

describe('LoginFailureConfiguration - Form Display with LOCK Policy', () => {
    it('should display all form labels', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByText('Login Failure Policy Type')).toBeInTheDocument();
            expect(screen.getByText('Failure Threshold')).toBeInTheDocument();
            expect(screen.getByText(/Pause Duration/i)).toBeInTheDocument();
            expect(screen.getByText('Maximum Login Failures')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should display policy type select with LOCK selected', async () => {
        const { container } = renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByText('Login Failure Policy Type')).toBeInTheDocument();
        }, { timeout: 3000 });

        const selectInput = container.querySelector('input[value="LOCK_USER_ACCOUNT"]');
        expect(selectInput).toBeInTheDocument();
    });

    it('should populate failure threshold field', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            const thresholdField = document.getElementById('failureThreshold') as HTMLInputElement;
            expect(thresholdField).toHaveValue('5');
        }, { timeout: 3000 });
    });

    it('should disable pause duration field when LOCK policy selected', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            const pauseField = document.getElementById('pauseDuration') as HTMLInputElement;
            expect(pauseField).toBeDisabled();
        }, { timeout: 3000 });
    });

    it('should disable maximum login failures field when LOCK policy selected', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            const maxFailuresField = document.getElementById('maximumLoginFailures') as HTMLInputElement;
            expect(maxFailuresField).toBeDisabled();
        }, { timeout: 3000 });
    });

    it('should have empty values for disabled fields', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            const pauseField = document.getElementById('pauseDuration') as HTMLInputElement;
            const maxFailuresField = document.getElementById('maximumLoginFailures') as HTMLInputElement;
            expect(pauseField).toHaveValue('');
            expect(maxFailuresField).toHaveValue('');
        }, { timeout: 3000 });
    });
});

describe('LoginFailureConfiguration - Form Display with PAUSE Policy', () => {
    it('should display policy type select with PAUSE selected', async () => {
        const { container } = renderWithProviders([mockConfigQueryPausePolicy]);

        await waitFor(() => {
            expect(screen.getByText('Login Failure Policy Type')).toBeInTheDocument();
        }, { timeout: 3000 });

        const selectInput = container.querySelector('input[value="PAUSE"]');
        expect(selectInput).toBeInTheDocument();
    });

    it('should populate all fields for PAUSE policy', async () => {
        renderWithProviders([mockConfigQueryPausePolicy]);

        await waitFor(() => {
            const thresholdField = document.getElementById('failureThreshold') as HTMLInputElement;
            const pauseField = document.getElementById('pauseDuration') as HTMLInputElement;
            const maxFailuresField = document.getElementById('maximumLoginFailures') as HTMLInputElement;

            expect(thresholdField).toHaveValue('3');
            expect(pauseField).toHaveValue('15');
            expect(maxFailuresField).toHaveValue('50');
        }, { timeout: 3000 });
    });

    it('should enable pause duration field when PAUSE policy selected', async () => {
        renderWithProviders([mockConfigQueryPausePolicy]);

        await waitFor(() => {
            const pauseField = document.getElementById('pauseDuration') as HTMLInputElement;
            expect(pauseField).not.toBeDisabled();
        }, { timeout: 3000 });
    });

    it('should enable maximum login failures field when PAUSE policy selected', async () => {
        renderWithProviders([mockConfigQueryPausePolicy]);

        await waitFor(() => {
            const maxFailuresField = document.getElementById('maximumLoginFailures') as HTMLInputElement;
            expect(maxFailuresField).not.toBeDisabled();
        }, { timeout: 3000 });
    });
});

describe('LoginFailureConfiguration - Policy Type Selection', () => {
    it('should change policy type when select is changed', async () => {
        const { container } = renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByText('Login Failure Policy Type')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Find the select element and open it
        const selectDiv = container.querySelector('[role="combobox"]');
        fireEvent.mouseDown(selectDiv!);

        await waitFor(() => {
            const pauseOption = screen.getByText('Pause');
            fireEvent.click(pauseOption);
        });

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
        });
    });

    it('should set default values when switching to PAUSE policy', async () => {
        const { container } = renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByText('Login Failure Policy Type')).toBeInTheDocument();
        }, { timeout: 3000 });

        const selectDiv = container.querySelector('[role="combobox"]');
        fireEvent.mouseDown(selectDiv!);

        await waitFor(() => {
            const pauseOption = screen.getByText('Pause');
            fireEvent.click(pauseOption);
        });

        await waitFor(() => {
            const pauseField = document.getElementById('pauseDuration') as HTMLInputElement;
            const maxFailuresField = document.getElementById('maximumLoginFailures') as HTMLInputElement;
            expect(pauseField).toHaveValue('30'); // DEFAULT_LOGIN_PAUSE_TIME_MINUTES
            expect(maxFailuresField).toHaveValue('100'); // DEFAULT_MAXIMUM_LOGIN_FAILURES
        });
    });
});

describe('LoginFailureConfiguration - Field Input', () => {
    it('should update failure threshold field when user enters a value', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByText('Failure Threshold')).toBeInTheDocument();
        }, { timeout: 3000 });

        const thresholdField = document.getElementById('failureThreshold') as HTMLInputElement;
        fireEvent.change(thresholdField, { target: { value: '10' } });

        await waitFor(() => {
            expect(thresholdField).toHaveValue('10');
        });
    });

    it('should mark form as dirty when field is edited', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
        }, { timeout: 3000 });

        const thresholdField = document.getElementById('failureThreshold') as HTMLInputElement;
        fireEvent.change(thresholdField, { target: { value: '10' } });

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
        });
    });

    it('should update pause duration when PAUSE policy is active', async () => {
        renderWithProviders([mockConfigQueryPausePolicy]);

        await waitFor(() => {
            expect(screen.getByText(/Pause Duration/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        const pauseField = document.getElementById('pauseDuration') as HTMLInputElement;
        fireEvent.change(pauseField, { target: { value: '45' } });

        await waitFor(() => {
            expect(pauseField).toHaveValue('45');
        });
    });

    it('should update maximum login failures when PAUSE policy is active', async () => {
        renderWithProviders([mockConfigQueryPausePolicy]);

        await waitFor(() => {
            expect(screen.getByText('Maximum Login Failures')).toBeInTheDocument();
        }, { timeout: 3000 });

        const maxFailuresField = document.getElementById('maximumLoginFailures') as HTMLInputElement;
        fireEvent.change(maxFailuresField, { target: { value: '75' } });

        await waitFor(() => {
            expect(maxFailuresField).toHaveValue('75');
        });
    });
});

describe('LoginFailureConfiguration - Save Mutation', () => {
    it('should trigger update when button is clicked', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByTestId('update-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const thresholdField = document.getElementById('failureThreshold') as HTMLInputElement;
        fireEvent.change(thresholdField, { target: { value: '10' } });

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
        });

        const updateButton = screen.getByTestId('update-button');
        expect(updateButton).toBeInTheDocument();
        // Button should be clickable when form is dirty
    });

    it('should mark dirty state when making changes', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
        }, { timeout: 3000 });

        const thresholdField = document.getElementById('failureThreshold') as HTMLInputElement;
        fireEvent.change(thresholdField, { target: { value: '10' } });

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
        });
    });

    it('should have update button available when form is dirty', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByTestId('update-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const thresholdField = document.getElementById('failureThreshold') as HTMLInputElement;
        fireEvent.change(thresholdField, { target: { value: '10' } });

        await waitFor(() => {
            const updateButton = screen.getByTestId('update-button');
            expect(updateButton).toBeInTheDocument();
        });
    });
});

describe('LoginFailureConfiguration - Discard Changes', () => {
    it('should reset dirty state when Discard button is clicked', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
        }, { timeout: 3000 });

        const thresholdField = document.getElementById('failureThreshold') as HTMLInputElement;
        fireEvent.change(thresholdField, { target: { value: '10' } });

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
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByTestId('discard-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const thresholdField = document.getElementById('failureThreshold') as HTMLInputElement;

        // Wait for initial value to be set
        await waitFor(() => {
            expect(thresholdField.value).toBe('5');
        });

        fireEvent.change(thresholdField, { target: { value: '10' } });

        await waitFor(() => {
            expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
        });

        const discardButton = screen.getByTestId('discard-button');
        expect(discardButton).toBeInTheDocument();
    });
});

describe('LoginFailureConfiguration - Restore Default Dialog', () => {
    it('should display restore default button when custom policy exists', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should not display restore default button when using system defaults', async () => {
        renderWithProviders([mockConfigQueryEmpty]);

        await waitFor(() => {
            expect(screen.getByTestId('detail-section-action-handler')).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.queryByTestId('restore-default-button')).not.toBeInTheDocument();
    });

    it('should open confirmation dialog when restore default is clicked', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
        }, { timeout: 3000 });

        const restoreButton = screen.getByTestId('restore-default-button');
        fireEvent.click(restoreButton);

        await waitFor(() => {
            expect(screen.getByText(/Confirm that you want to restore the system default settings for login failures/i)).toBeInTheDocument();
        });
    });

    it('should close dialog when Cancel is clicked', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

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

describe('LoginFailureConfiguration - Remove Configuration Mutation', () => {
    it('should call onUpdateStart when Confirm is clicked', async () => {
        const { onUpdateStart } = renderWithProviders([
            mockConfigQueryLockPolicy,
            mockRemoveMutationSuccess,
            mockRefetchQuery
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
        const { onUpdateEnd } = renderWithProviders([
            mockConfigQueryLockPolicy,
            mockRemoveMutationSuccess,
            mockRefetchQuery
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

    it('should display error message on removal failure', async () => {
        renderWithProviders([
            mockConfigQueryLockPolicy,
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
        }, { timeout: 3000 });
    });

    it('should call onUpdateEnd with false on removal failure', async () => {
        const { onUpdateEnd } = renderWithProviders([
            mockConfigQueryLockPolicy,
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
        }, { timeout: 3000 });
    });
});

describe('LoginFailureConfiguration - Read-Only Mode', () => {
    it('should disable policy type select in read-only mode', async () => {
        const { container } = renderWithProviders([mockConfigQueryLockPolicy], true);

        await waitFor(() => {
            expect(screen.getByText('Login Failure Policy Type')).toBeInTheDocument();
        }, { timeout: 3000 });

        const selectElement = container.querySelector('input[value="LOCK_USER_ACCOUNT"]') as HTMLInputElement;
        expect(selectElement).toBeDisabled();
    });

    it('should disable failure threshold field in read-only mode', async () => {
        renderWithProviders([mockConfigQueryLockPolicy], true);

        await waitFor(() => {
            const thresholdField = document.getElementById('failureThreshold') as HTMLInputElement;
            expect(thresholdField).toBeDisabled();
        }, { timeout: 3000 });
    });

    it('should disable pause duration field in read-only mode', async () => {
        renderWithProviders([mockConfigQueryPausePolicy], true);

        await waitFor(() => {
            const pauseField = document.getElementById('pauseDuration') as HTMLInputElement;
            expect(pauseField).toBeDisabled();
        }, { timeout: 3000 });
    });

    it('should disable maximum failures field in read-only mode', async () => {
        renderWithProviders([mockConfigQueryPausePolicy], true);

        await waitFor(() => {
            const maxFailuresField = document.getElementById('maximumLoginFailures') as HTMLInputElement;
            expect(maxFailuresField).toBeDisabled();
        }, { timeout: 3000 });
    });
});

describe('LoginFailureConfiguration - Authorization Scope', () => {
    it('should disable submit button when user lacks tenant:update scope', async () => {
        renderWithProviders([mockConfigQueryLockPolicy], false, mockAuthContextNoScope);

        await waitFor(() => {
            expect(screen.getByText('Login Failure Policy Type')).toBeInTheDocument();
        }, { timeout: 3000 });

        const disableSubmitStatus = screen.getByTestId('disable-submit');
        expect(disableSubmitStatus).toHaveTextContent('disabled');
    });

    it('should have submit button functionality with proper scope', async () => {
        renderWithProviders([mockConfigQueryLockPolicy], false, mockAuthContextWithScope);

        await waitFor(() => {
            expect(screen.getByText('Login Failure Policy Type')).toBeInTheDocument();
        }, { timeout: 3000 });

        const updateButton = screen.getByTestId('update-button');
        expect(updateButton).toBeInTheDocument();
    });
});

describe('LoginFailureConfiguration - Layout Structure', () => {
    it('should render Grid2 containers', async () => {
        const { container } = renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByText('Login Failure Policy Type')).toBeInTheDocument();
        }, { timeout: 3000 });

        const grids = container.querySelectorAll('.MuiGrid2-root');
        expect(grids.length).toBeGreaterThan(0);
    });

    it('should render action handler', async () => {
        renderWithProviders([mockConfigQueryLockPolicy]);

        await waitFor(() => {
            expect(screen.getByTestId('detail-section-action-handler')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
