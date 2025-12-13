import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import TenantLookAndFeelConfiguration from '@/components/tenants/tenant-look-and-feel-configuration';
import { TENANT_LOOK_AND_FEEL_QUERY } from '@/graphql/queries/oidc-queries';
import { REMOVE_TENANT_LOOK_AND_FEEL_MUTATION, TENANT_LOOK_AND_FEEL_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { IntlProvider } from 'react-intl';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR, SCOPE_USE_IAM_MANAGEMENT, TENANT_UPDATE_SCOPE } from '@/utils/consts';

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

jest.mock('@/utils/authz-utils', () => ({
    containsScope: (scope: string, scopes: any[]) => {
        if (!scopes) return false;
        return scopes.some((s: any) => s.scopeName === scope);
    }
}));

// Mock HexColorPicker
jest.mock('react-colorful', () => ({
    HexColorPicker: ({ color, onChange }: any) => (
        <div data-testid="hex-color-picker">
            <input
                data-testid="color-picker-input"
                value={color}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}));

// Store original FileReader
const OriginalFileReader = global.FileReader;

// Mock FileReader for file upload tests
class MockFileReader {
    onloadend: ((ev: ProgressEvent<FileReader>) => void) | null = null;
    result: string | ArrayBuffer | null = null;

    readAsText(_file: File) {
        // Simulate async file reading
        setTimeout(() => {
            this.result = '<svg></svg>';
            if (this.onloadend) {
                this.onloadend({ target: this } as unknown as ProgressEvent<FileReader>);
            }
        }, 0);
    }
}

// Setup and teardown for FileReader mock
beforeAll(() => {
    // @ts-ignore
    global.FileReader = MockFileReader as any;
});

afterAll(() => {
    global.FileReader = OriginalFileReader;
});

// Mock messages for react-intl
const messages = {
    'error.default': 'An error occurred',
};

const mockTenantId = 'test-tenant-id';

const mockLookAndFeel = {
    tenantid: mockTenantId,
    adminheaderbackgroundcolor: null,
    adminheadertextcolor: null,
    adminheadertext: null,
    authenticationheaderbackgroundcolor: '#1976d2',
    authenticationheadertextcolor: 'white',
    authenticationheadertext: 'Welcome to My App',
    authenticationlogo: '<svg>logo</svg>',
    authenticationlogouri: 'https://example.com/logo.png',
    authenticationlogomimetype: 'image/svg+xml',
    footerlinks: null
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
                scopeName: TENANT_UPDATE_SCOPE,
                markForDelete: false,
                scopeUse: SCOPE_USE_IAM_MANAGEMENT,
                scopeDescription: ''
            }
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

const mockQuerySuccess = {
    request: {
        query: TENANT_LOOK_AND_FEEL_QUERY,
        variables: {
            tenantId: mockTenantId
        }
    },
    result: {
        data: {
            getTenantLookAndFeel: mockLookAndFeel
        }
    }
};

const mockQueryEmpty = {
    request: {
        query: TENANT_LOOK_AND_FEEL_QUERY,
        variables: {
            tenantId: mockTenantId
        }
    },
    result: {
        data: {
            getTenantLookAndFeel: null
        }
    }
};

const mockQueryError = {
    request: {
        query: TENANT_LOOK_AND_FEEL_QUERY,
        variables: {
            tenantId: mockTenantId
        }
    },
    error: new Error('Query failed')
};

const mockUpdateMutation = {
    request: {
        query: TENANT_LOOK_AND_FEEL_MUTATION,
        variables: {
            tenantLookAndFeelInput: expect.any(Object)
        }
    },
    result: {
        data: {
            updateTenantLookAndFeel: true
        }
    }
};

const mockRemoveMutation = {
    request: {
        query: REMOVE_TENANT_LOOK_AND_FEEL_MUTATION,
        variables: {
            tenantId: mockTenantId
        }
    },
    result: {
        data: {
            removeTenantLookAndFeel: true
        }
    }
};

const renderWithProviders = (
    mocks: any[] = [mockQuerySuccess],
    authContext: AuthContextProps = mockAuthContext,
    readOnly: boolean = false
) => {
    const onUpdateStart = jest.fn();
    const onUpdateEnd = jest.fn();

    return {
        ...render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <IntlProvider messages={messages} locale="en" defaultLocale="en">
                    <AuthContext.Provider value={authContext}>
                        <TenantLookAndFeelConfiguration
                            tenantId={mockTenantId}
                            onUpdateStart={onUpdateStart}
                            onUpdateEnd={onUpdateEnd}
                            readOnly={readOnly}
                        />
                    </AuthContext.Provider>
                </IntlProvider>
            </MockedProvider>
        ),
        onUpdateStart,
        onUpdateEnd
    };
};

describe('TenantLookAndFeelConfiguration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should display loading spinner while fetching data', () => {
            renderWithProviders([mockQuerySuccess]);
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should hide loading spinner after data is loaded', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error State', () => {
        it('should display error component when query fails', async () => {
            renderWithProviders([mockQueryError]);
            await waitFor(() => {
                expect(screen.getByText(/Query failed/i)).toBeInTheDocument();
            });
        });

        it('should not display form fields when query fails', async () => {
            renderWithProviders([mockQueryError]);
            await waitFor(() => {
                expect(screen.queryByText('Background Color')).not.toBeInTheDocument();
            });
        });
    });

    describe('System Default Scenario', () => {
        it('should not show restore default button when using system defaults', async () => {
            renderWithProviders([mockQueryEmpty]);
            await waitFor(() => {
                expect(screen.queryByTestId('restore-default-button')).not.toBeInTheDocument();
            });
        });

        it('should show restore default button when custom config exists', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
            });
        });
    });

    describe('Field Display', () => {
        it('should display Background Color field with value', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Background Color')).toBeInTheDocument();
                const input = screen.getByDisplayValue('#1976d2');
                expect(input).toBeInTheDocument();
            });
        });

        it('should display Text Color field with value', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Text Color')).toBeInTheDocument();
                const input = screen.getByDisplayValue('white');
                expect(input).toBeInTheDocument();
            });
        });

        it('should display Header Text field with value', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Header Text')).toBeInTheDocument();
                const input = screen.getByDisplayValue('Welcome to My App');
                expect(input).toBeInTheDocument();
            });
        });

        it('should display default colors when using system defaults', async () => {
            renderWithProviders([mockQueryEmpty]);
            await waitFor(() => {
                const bgInput = screen.getByDisplayValue(DEFAULT_BACKGROUND_COLOR);
                const textInput = screen.getByDisplayValue(DEFAULT_TEXT_COLOR);
                expect(bgInput).toBeInTheDocument();
                expect(textInput).toBeInTheDocument();
            });
        });
    });

    describe('Field Input', () => {
        it('should update background color field and mark dirty', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const input = screen.getByDisplayValue('#1976d2');
            fireEvent.change(input, { target: { value: '#ff0000' } });

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });

        it('should update text color field and mark dirty', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const input = screen.getByDisplayValue('white');
            fireEvent.change(input, { target: { value: 'black' } });

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });

        it('should update header text field and mark dirty', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const input = screen.getByDisplayValue('Welcome to My App');
            fireEvent.change(input, { target: { value: 'New Header' } });

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });
    });

    describe('Color Picker Dialogs', () => {
        it('should open background color picker dialog when icon is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Background Color')).toBeInTheDocument();
            });

            const colorizeIcons = screen.getAllByTestId('ColorizeIcon');
            fireEvent.click(colorizeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Select background color')).toBeInTheDocument();
            });
        });

        it('should display HexColorPicker in background color dialog', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Background Color')).toBeInTheDocument();
            });

            const colorizeIcons = screen.getAllByTestId('ColorizeIcon');
            fireEvent.click(colorizeIcons[0]);

            await waitFor(() => {
                expect(screen.getByTestId('hex-color-picker')).toBeInTheDocument();
            });
        });

        it('should close background color dialog when Cancel is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Background Color')).toBeInTheDocument();
            });

            const colorizeIcons = screen.getAllByTestId('ColorizeIcon');
            fireEvent.click(colorizeIcons[0]);

            await waitFor(() => {
                expect(screen.getByText('Select background color')).toBeInTheDocument();
            });

            const cancelButton = screen.getAllByRole('button', { name: /cancel/i })[0];
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText('Select background color')).not.toBeInTheDocument();
            });
        });

        it('should update color and mark dirty when Select is clicked in background dialog', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Background Color')).toBeInTheDocument();
            });

            const colorizeIcons = screen.getAllByTestId('ColorizeIcon');
            fireEvent.click(colorizeIcons[0]);

            await waitFor(() => {
                expect(screen.getByTestId('color-picker-input')).toBeInTheDocument();
            });

            const colorInput = screen.getByTestId('color-picker-input');
            fireEvent.change(colorInput, { target: { value: '#00ff00' } });

            const selectButton = screen.getAllByRole('button', { name: /select/i })[0];
            fireEvent.click(selectButton);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });

        it('should open text color picker dialog when icon is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Text Color')).toBeInTheDocument();
            });

            const colorizeIcons = screen.getAllByTestId('ColorizeIcon');
            fireEvent.click(colorizeIcons[1]);

            await waitFor(() => {
                expect(screen.getByText('Select text color')).toBeInTheDocument();
            });
        });

        it('should display HexColorPicker in text color dialog', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Text Color')).toBeInTheDocument();
            });

            const colorizeIcons = screen.getAllByTestId('ColorizeIcon');
            fireEvent.click(colorizeIcons[1]);

            await waitFor(() => {
                expect(screen.getByTestId('hex-color-picker')).toBeInTheDocument();
            });
        });

        it('should close text color dialog when Cancel is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Text Color')).toBeInTheDocument();
            });

            const colorizeIcons = screen.getAllByTestId('ColorizeIcon');
            fireEvent.click(colorizeIcons[1]);

            await waitFor(() => {
                expect(screen.getByText('Select text color')).toBeInTheDocument();
            });

            const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButtons[cancelButtons.length - 1]);

            await waitFor(() => {
                expect(screen.queryByText('Select text color')).not.toBeInTheDocument();
            });
        });

        it('should update color and mark dirty when Select is clicked in text color dialog', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Text Color')).toBeInTheDocument();
            });

            const colorizeIcons = screen.getAllByTestId('ColorizeIcon');
            fireEvent.click(colorizeIcons[1]);

            await waitFor(() => {
                expect(screen.getByTestId('color-picker-input')).toBeInTheDocument();
            });

            const colorInput = screen.getByTestId('color-picker-input');
            fireEvent.change(colorInput, { target: { value: '#ff0000' } });

            const selectButtons = screen.getAllByRole('button', { name: /select/i });
            fireEvent.click(selectButtons[selectButtons.length - 1]);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });
    });

    describe('Logo Upload', () => {
        it('should display file input for logo upload', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const fileInput = document.querySelector('#logoFile');
                expect(fileInput).toBeInTheDocument();
            });
        });

        it('should have correct accept attribute for SVG files', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                const fileInput = document.querySelector('#logoFile') as HTMLInputElement;
                expect(fileInput).toHaveAttribute('accept', 'image/svg+xml, .svg');
            });
        });

        it('should handle file upload and mark dirty', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const fileInput = document.querySelector('#logoFile') as HTMLInputElement;
            const file = new File(['<svg></svg>'], 'logo.svg', { type: 'image/svg+xml' });

            Object.defineProperty(fileInput, 'files', {
                value: [file],
                writable: false
            });

            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            }, { timeout: 5000 });
        });

        it('should display delete icon for logo', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('DeleteForeverOutlinedIcon')).toBeInTheDocument();
            });
        });
    });

    describe('Logo URI', () => {
        it('should display Logo URI field', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Logo URI')).toBeInTheDocument();
            });
        });

        it('should update logo URI field and mark dirty', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const inputs = screen.getAllByRole('textbox');
            const logoUriInput = inputs.find(input =>
                (input as HTMLInputElement).value === 'https://example.com/logo.png'
            );

            if (logoUriInput) {
                fireEvent.change(logoUriInput, { target: { value: 'https://newurl.com/logo.png' } });

                await waitFor(() => {
                    expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
                });
            }
        });
    });

    describe('Logo Deletion', () => {
        it('should clear logo when delete icon is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('DeleteForeverOutlinedIcon')).toBeInTheDocument();
            });

            const deleteIcon = screen.getByTestId('DeleteForeverOutlinedIcon');
            fireEvent.click(deleteIcon);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });

        it('should mark form dirty when logo is deleted', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const deleteIcon = screen.getByTestId('DeleteForeverOutlinedIcon');
            fireEvent.click(deleteIcon);

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });
    });

    describe('Preview Display', () => {
        it('should display Preview section', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Preview')).toBeInTheDocument();
            });
        });

        it('should display header text in preview', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Welcome to My App')).toBeInTheDocument();
            });
        });

        it('should update preview when header text changes', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByText('Welcome to My App')).toBeInTheDocument();
            });

            const input = screen.getByDisplayValue('Welcome to My App');
            fireEvent.change(input, { target: { value: 'New Header Text' } });

            await waitFor(() => {
                expect(screen.getByText('New Header Text')).toBeInTheDocument();
            });
        });
    });

    describe('Save and Discard', () => {
        it('should reset dirty state when Discard button is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const input = screen.getByDisplayValue('Welcome to My App');
            fireEvent.change(input, { target: { value: 'Modified' } });

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
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('discard-button')).toBeInTheDocument();
            });
        });

        it('should have update button available', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('update-button')).toBeInTheDocument();
            });
        });

        it('should mark dirty state when making changes', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('clean');
            });

            const input = screen.getByDisplayValue('#1976d2');
            fireEvent.change(input, { target: { value: '#000000' } });

            await waitFor(() => {
                expect(screen.getByTestId('mark-dirty')).toHaveTextContent('dirty');
            });
        });
    });

    describe('Restore Default Dialog', () => {
        it('should open confirmation dialog when restore default is clicked', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
            });

            const restoreButton = screen.getByTestId('restore-default-button');
            fireEvent.click(restoreButton);

            await waitFor(() => {
                expect(screen.getByText(/Confirm that you want to restore system defaults/i)).toBeInTheDocument();
            });
        });

        it('should close dialog when Cancel is clicked in restore confirmation', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
            });

            const restoreButton = screen.getByTestId('restore-default-button');
            fireEvent.click(restoreButton);

            await waitFor(() => {
                expect(screen.getByText(/Confirm that you want to restore system defaults/i)).toBeInTheDocument();
            });

            const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButtons[cancelButtons.length - 1]);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm that you want to restore system defaults/i)).not.toBeInTheDocument();
            });
        });

        it('should call onUpdateStart when restore is confirmed', async () => {
            const { onUpdateStart } = renderWithProviders([mockQuerySuccess, mockRemoveMutation]);
            await waitFor(() => {
                expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
            });

            const restoreButton = screen.getByTestId('restore-default-button');
            fireEvent.click(restoreButton);

            await waitFor(() => {
                expect(screen.getByText(/Confirm that you want to restore system defaults/i)).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(onUpdateStart).toHaveBeenCalled();
            });
        });

        it('should close dialog after confirmation', async () => {
            renderWithProviders([mockQuerySuccess, mockRemoveMutation]);
            await waitFor(() => {
                expect(screen.getByTestId('restore-default-button')).toBeInTheDocument();
            });

            const restoreButton = screen.getByTestId('restore-default-button');
            fireEvent.click(restoreButton);

            await waitFor(() => {
                expect(screen.getByText(/Confirm that you want to restore system defaults/i)).toBeInTheDocument();
            });

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.queryByText(/Confirm that you want to restore system defaults/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Read-Only Mode', () => {
        it('should disable Background Color field in read-only mode', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, true);
            await waitFor(() => {
                const input = screen.getByDisplayValue('#1976d2') as HTMLInputElement;
                expect(input.disabled).toBe(true);
            });
        });

        it('should disable Text Color field in read-only mode', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, true);
            await waitFor(() => {
                const input = screen.getByDisplayValue('white') as HTMLInputElement;
                expect(input.disabled).toBe(true);
            });
        });

        it('should disable Header Text field in read-only mode', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, true);
            await waitFor(() => {
                const input = screen.getByDisplayValue('Welcome to My App') as HTMLInputElement;
                expect(input.disabled).toBe(true);
            });
        });

        it('should hide color picker icons in read-only mode', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, true);
            await waitFor(() => {
                expect(screen.queryByTestId('ColorizeIcon')).not.toBeInTheDocument();
            });
        });

        it('should hide logo upload section in read-only mode', async () => {
            renderWithProviders([mockQuerySuccess], mockAuthContext, true);
            await waitFor(() => {
                expect(screen.queryByText(/logo \(svg/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Authorization Scope', () => {
        it('should disable submit button when user lacks tenant:update scope', async () => {
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

            renderWithProviders([mockQuerySuccess], restrictedAuthContext);
            await waitFor(() => {
                expect(screen.getByTestId('disable-submit')).toHaveTextContent('disabled');
            });
        });

        it('should enable submit button when user has tenant:update scope', async () => {
            renderWithProviders([mockQuerySuccess]);
            await waitFor(() => {
                expect(screen.getByTestId('disable-submit')).toHaveTextContent('enabled');
            });
        });
    });
});
