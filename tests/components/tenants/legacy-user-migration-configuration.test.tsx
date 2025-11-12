import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import LegacyUserMigrationConfiguration from '@/components/tenants/legacy-user-migration-configuration';
import { LEGACY_USER_MIGRATION_CONFIGURATION_QUERY } from '@/graphql/queries/oidc-queries';
import { LEGACY_USER_MIGRATION_CONFIGURATION_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { IntlProvider } from 'react-intl';

// Mock DetailSectionActionHandler
jest.mock('@/components/layout/detail-section-action-handler', () => {
    return function MockDetailSectionActionHandler({ onUpdateClickedHandler, onDiscardClickedHandler, markDirty, disableSubmit }: any) {
        return (
            <div data-testid="detail-section-action-handler">
                <button
                    data-testid="update-button"
                    onClick={onUpdateClickedHandler}
                    disabled={disableSubmit}
                >
                    Update
                </button>
                <button
                    data-testid="discard-button"
                    onClick={onDiscardClickedHandler}
                >
                    Discard
                </button>
                <span data-testid="mark-dirty">{markDirty ? 'dirty' : 'clean'}</span>
            </div>
        );
    };
});

// Mock configuration data
const mockLegacyUserMigrationConfig = {
    tenantId: 'test-tenant-id',
    authenticationUri: 'https://legacy.example.com/auth',
    userProfileUri: 'https://legacy.example.com/profile',
    usernameCheckUri: 'https://legacy.example.com/check',
};

// GraphQL mock for successful query with configuration
const mockConfigQuerySuccess = {
    request: {
        query: LEGACY_USER_MIGRATION_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getLegacyUserMigrationConfiguration: mockLegacyUserMigrationConfig,
        },
    },
};

// GraphQL mock with null configuration (no config exists yet)
const mockConfigQueryNull = {
    request: {
        query: LEGACY_USER_MIGRATION_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    result: {
        data: {
            getLegacyUserMigrationConfiguration: null,
        },
    },
};

// GraphQL mock for error scenario
const mockConfigQueryError = {
    request: {
        query: LEGACY_USER_MIGRATION_CONFIGURATION_QUERY,
        variables: { tenantId: 'test-tenant-id' },
    },
    error: new Error('Failed to fetch legacy user migration configuration'),
};

// GraphQL mock for save mutation success
const mockSaveMutationSuccess = {
    request: {
        query: LEGACY_USER_MIGRATION_CONFIGURATION_MUTATION,
        variables: {
            tenantLegacyUserMigrationConfigInput: {
                tenantId: 'test-tenant-id',
                authenticationUri: 'https://updated.example.com/auth',
                userProfileUri: 'https://legacy.example.com/profile',
                usernameCheckUri: 'https://legacy.example.com/check',
            },
        },
    },
    result: {
        data: {
            setTenantLegacyUserMigrationConfig: {
                tenantId: 'test-tenant-id',
                authenticationUri: 'https://updated.example.com/auth',
                userProfileUri: 'https://legacy.example.com/profile',
                usernameCheckUri: 'https://legacy.example.com/check',
            },
        },
    },
};

// GraphQL mock for save mutation error
const mockSaveMutationError = {
    request: {
        query: LEGACY_USER_MIGRATION_CONFIGURATION_MUTATION,
        variables: {
            tenantLegacyUserMigrationConfigInput: {
                tenantId: 'test-tenant-id',
                authenticationUri: 'invalid-uri',
                userProfileUri: 'https://legacy.example.com/profile',
                usernameCheckUri: 'https://legacy.example.com/check',
            },
        },
    },
    error: new Error('INVALID_URI_FORMAT'),
};

// Helper function to render component with providers
const renderWithProviders = (
    tenantId: string,
    allowLegacyUserMigration: boolean,
    mocks: any[] = [mockConfigQuerySuccess],
    readOnly: boolean = false,
    onUpdateStart: jest.Mock = jest.fn(),
    onUpdateEnd: jest.Mock = jest.fn()
) => {
    const messages = {
        INVALID_URI_FORMAT: 'Invalid URI format',
    };

    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <IntlProvider locale="en" messages={messages}>
                <LegacyUserMigrationConfiguration
                    tenantId={tenantId}
                    allowLegacyUserMigration={allowLegacyUserMigration}
                    onUpdateStart={onUpdateStart}
                    onUpdateEnd={onUpdateEnd}
                    readOnly={readOnly}
                />
            </IntlProvider>
        </MockedProvider>
    );
};

describe('LegacyUserMigrationConfiguration Component', () => {
    describe('Loading State', () => {
        it('should display loading indicator while fetching data', () => {
            renderWithProviders('test-tenant-id', true);

            // CircularProgress should be present (from DataLoading component)
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should not display form fields during loading', () => {
            renderWithProviders('test-tenant-id', true);

            expect(screen.queryByText('Authentication URI')).not.toBeInTheDocument();
        });

        it('should not display action handler during loading', () => {
            renderWithProviders('test-tenant-id', true);

            expect(screen.queryByTestId('detail-section-action-handler')).not.toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should display error message when query fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders('test-tenant-id', true, [mockConfigQueryError]);

            await waitFor(() => {
                expect(screen.getByText(/Failed to fetch legacy user migration configuration/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });

        it('should not display form fields when query fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders('test-tenant-id', true, [mockConfigQueryError]);

            await waitFor(() => {
                expect(screen.queryByText('Authentication URI')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });
    });

    describe('Conditional Rendering - allowLegacyUserMigration=false', () => {
        it('should display warning message when legacy migration not allowed', async () => {
            renderWithProviders('test-tenant-id', false, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText(/To make configuration changes, update the tenant to allow legacy user migration/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display form fields when legacy migration not allowed', async () => {
            renderWithProviders('test-tenant-id', false, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.queryByText('Authentication URI')).not.toBeInTheDocument();
                expect(screen.queryByText('User Profile URI')).not.toBeInTheDocument();
                expect(screen.queryByText('User Name-Check URI')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display action handler when legacy migration not allowed', async () => {
            renderWithProviders('test-tenant-id', false, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.queryByTestId('detail-section-action-handler')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Display - allowLegacyUserMigration=true', () => {
        it('should display Authentication URI label', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display User Profile URI label', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('User Profile URI')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display User Name-Check URI label', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('User Name-Check URI')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should populate Authentication URI field with config value', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                const authField = document.getElementById('authenticationUri') as HTMLInputElement;
                expect(authField).toHaveValue('https://legacy.example.com/auth');
            }, { timeout: 3000 });
        });

        it('should populate User Profile URI field with config value', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                const profileField = document.getElementById('userProfileUri') as HTMLInputElement;
                expect(profileField).toHaveValue('https://legacy.example.com/profile');
            }, { timeout: 3000 });
        });

        it('should populate User Name-Check URI field with config value', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                const checkField = document.getElementById('namecheckUri') as HTMLInputElement;
                expect(checkField).toHaveValue('https://legacy.example.com/check');
            }, { timeout: 3000 });
        });

        it('should display action handler', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('detail-section-action-handler')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not display warning message when legacy migration allowed', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.queryByText(/To make configuration changes, update the tenant to allow legacy user migration/i)).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Input - Editing Fields', () => {
        it('should update Authentication URI when typing', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'https://updated.example.com/auth' } });

            expect(authField).toHaveValue('https://updated.example.com/auth');
        });

        it('should update User Profile URI when typing', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('User Profile URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const profileField = document.getElementById('userProfileUri') as HTMLInputElement;
            fireEvent.change(profileField, { target: { value: 'https://updated.example.com/profile' } });

            expect(profileField).toHaveValue('https://updated.example.com/profile');
        });

        it('should update User Name-Check URI when typing', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('User Name-Check URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const checkField = document.getElementById('namecheckUri') as HTMLInputElement;
            fireEvent.change(checkField, { target: { value: 'https://updated.example.com/check' } });

            expect(checkField).toHaveValue('https://updated.example.com/check');
        });

        it('should mark form as dirty after editing', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'https://updated.example.com/auth' } });

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });

        it('should initially mark form as clean', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            }, { timeout: 3000 });
        });
    });

    describe('Save Mutation', () => {
        it('should call onUpdateStart when Update button is clicked', async () => {
            const mockOnUpdateStart = jest.fn();
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess, mockSaveMutationSuccess], false, mockOnUpdateStart);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'https://updated.example.com/auth' } });

            const updateButton = screen.getByTestId('update-button');
            fireEvent.click(updateButton);

            expect(mockOnUpdateStart).toHaveBeenCalled();
        });

        it('should call onUpdateEnd with true on successful save', async () => {
            const mockOnUpdateEnd = jest.fn();
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess, mockSaveMutationSuccess], false, jest.fn(), mockOnUpdateEnd);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'https://updated.example.com/auth' } });

            const updateButton = screen.getByTestId('update-button');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockOnUpdateEnd).toHaveBeenCalledWith(true);
            }, { timeout: 3000 });
        });

        it('should mark form as clean after successful save', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess, mockSaveMutationSuccess]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'https://updated.example.com/auth' } });

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });

            const updateButton = screen.getByTestId('update-button');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            }, { timeout: 3000 });
        });

        it('should display error message when save fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess, mockSaveMutationError]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'invalid-uri' } });

            const updateButton = screen.getByTestId('update-button');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(screen.getByText('Invalid URI format')).toBeInTheDocument();
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });

        it('should call onUpdateEnd with false when save fails', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const mockOnUpdateEnd = jest.fn();
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess, mockSaveMutationError], false, jest.fn(), mockOnUpdateEnd);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'invalid-uri' } });

            const updateButton = screen.getByTestId('update-button');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockOnUpdateEnd).toHaveBeenCalledWith(false);
            }, { timeout: 3000 });

            consoleSpy.mockRestore();
        });
    });

    describe('Discard Changes', () => {
        it('should reset dirty state when Discard button is clicked', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Wait for initial value to be populated
            await waitFor(() => {
                const authField = document.getElementById('authenticationUri') as HTMLInputElement;
                expect(authField.value).toBe('https://legacy.example.com/auth');
            });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'https://updated.example.com/auth' } });
            expect(authField).toHaveValue('https://updated.example.com/auth');

            // Verify form is marked as dirty
            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });

            const discardButton = screen.getByTestId('discard-button');
            fireEvent.click(discardButton);

            // After discard, form should be marked as clean
            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });
        });

        it('should mark form as clean after discarding changes', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'https://updated.example.com/auth' } });

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });

            const discardButton = screen.getByTestId('discard-button');
            fireEvent.click(discardButton);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });
        });
    });

    describe('Read-Only Mode', () => {
        it('should disable Authentication URI field in read-only mode', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess], true);

            await waitFor(() => {
                const authField = document.getElementById('authenticationUri') as HTMLInputElement;
                expect(authField).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should disable User Profile URI field in read-only mode', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess], true);

            await waitFor(() => {
                const profileField = document.getElementById('userProfileUri') as HTMLInputElement;
                expect(profileField).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should disable User Name-Check URI field in read-only mode', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess], true);

            await waitFor(() => {
                const checkField = document.getElementById('namecheckUri') as HTMLInputElement;
                expect(checkField).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should still display form fields in read-only mode', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess], true);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
                expect(screen.getByText('User Profile URI')).toBeInTheDocument();
                expect(screen.getByText('User Name-Check URI')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Null Configuration', () => {
        it('should display empty fields when configuration is null', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQueryNull]);

            await waitFor(() => {
                const authField = document.getElementById('authenticationUri') as HTMLInputElement;
                const profileField = document.getElementById('userProfileUri') as HTMLInputElement;
                const checkField = document.getElementById('namecheckUri') as HTMLInputElement;

                expect(authField).toHaveValue('');
                expect(profileField).toHaveValue('');
                expect(checkField).toHaveValue('');
            }, { timeout: 3000 });
        });

        it('should still display form labels when configuration is null', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQueryNull]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
                expect(screen.getByText('User Profile URI')).toBeInTheDocument();
                expect(screen.getByText('User Name-Check URI')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should allow editing when configuration is null', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQueryNull]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'https://new.example.com/auth' } });

            expect(authField).toHaveValue('https://new.example.com/auth');
        });
    });

    describe('Layout Structure', () => {
        it('should render Grid2 container for form fields', async () => {
            const { container } = renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const gridElements = container.querySelectorAll('[class*="MuiGrid2"]');
            expect(gridElements.length).toBeGreaterThan(0);
        });

        it('should render TextField components', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                const authField = document.getElementById('authenticationUri');
                const profileField = document.getElementById('userProfileUri');
                const checkField = document.getElementById('namecheckUri');

                expect(authField).toBeInTheDocument();
                expect(profileField).toBeInTheDocument();
                expect(checkField).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Error Message Display', () => {
        it('should not display error message initially', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            expect(screen.queryByText('Invalid URI format')).not.toBeInTheDocument();
        });

        it('should display error message in Grid2 with proper styling', async () => {
            // Suppress console errors for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const { container } = renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess, mockSaveMutationError]);

            await waitFor(() => {
                expect(screen.getByText('Authentication URI')).toBeInTheDocument();
            }, { timeout: 3000 });

            const authField = document.getElementById('authenticationUri') as HTMLInputElement;
            fireEvent.change(authField, { target: { value: 'invalid-uri' } });

            const updateButton = screen.getByTestId('update-button');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(screen.getByText('Invalid URI format')).toBeInTheDocument();
            }, { timeout: 3000 });

            const gridElements = container.querySelectorAll('[class*="MuiGrid2"]');
            expect(gridElements.length).toBeGreaterThan(0);

            consoleSpy.mockRestore();
        });
    });

    describe('Conditional Field Display Based on allowLegacyUserMigration', () => {
        it('should show empty values in fields when allowLegacyUserMigration is false', async () => {
            renderWithProviders('test-tenant-id', false, [mockConfigQuerySuccess]);

            await waitFor(() => {
                // Form fields should not be rendered when allowLegacyUserMigration is false
                expect(screen.queryByText('Authentication URI')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show populated values in fields when allowLegacyUserMigration is true', async () => {
            renderWithProviders('test-tenant-id', true, [mockConfigQuerySuccess]);

            await waitFor(() => {
                const authField = document.getElementById('authenticationUri') as HTMLInputElement;
                expect(authField).toHaveValue('https://legacy.example.com/auth');
            }, { timeout: 3000 });
        });
    });
});
