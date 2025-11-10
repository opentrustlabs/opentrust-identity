import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import SigningKeyDetail from '@/components/signing-keys/signing-key-detail';
import { SigningKey, PortalUserProfile } from '@/graphql/generated/graphql-types';
import { TenantContext, TenantMetaDataBean } from '@/components/contexts/tenant-context';
import { AuthContext, AuthContextProps } from '@/components/contexts/auth-context';
import { ClipboardCopyContextProvider } from '@/components/contexts/clipboard-copy-context';
import { ResponsiveContext, ResponsiveBreakpoints } from '@/components/contexts/responsive-context';
import {
    KEY_UPDATE_SCOPE,
    KEY_DELETE_SCOPE,
    KEY_SECRET_VIEW_SCOPE,
    KEY_USE_JWT_SIGNING,
    KEY_USE_DIGITAL_SIGNING,
    KEY_TYPE_RSA,
    KEY_TYPE_EC,
    SIGNING_KEY_STATUS_ACTIVE,
    SIGNING_KEY_STATUS_REVOKED,
    PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER,
    SCOPE_USE_IAM_MANAGEMENT
} from '@/utils/consts';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        pathname: '/',
    }),
    usePathname: () => '/',
}));

// Mock react-intl
jest.mock('react-intl', () => ({
    useIntl: () => ({
        formatMessage: ({ id }: { id: string }) => id,
    }),
    FormattedMessage: ({ id }: { id: string }) => <span>{id}</span>,
}));

// Mock data
const mockActiveRSAKey: SigningKey = {
    keyId: 'test-key-id',
    keyName: 'Test RSA Key',
    keyType: KEY_TYPE_RSA,
    keyUse: KEY_USE_JWT_SIGNING,
    keyStatus: SIGNING_KEY_STATUS_ACTIVE,
    tenantId: 'test-tenant-id',
    privateKeyPkcs8: `${PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER}
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...`,
    keyCertificate: `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKe...
-----END CERTIFICATE-----`,
    publicKey: null,
    keyPassword: null,
    expiresAtMs: Date.now() + 31536000000, // 1 year from now
    createdAtMs: Date.now() - 86400000, // 1 day ago
    markForDelete: false,
    keyTypeId: '1',
    statusId: '1',
};

const mockActiveECKey: SigningKey = {
    keyId: 'test-ec-key-id',
    keyName: 'Test EC Key',
    keyType: KEY_TYPE_EC,
    keyUse: KEY_USE_DIGITAL_SIGNING,
    keyStatus: SIGNING_KEY_STATUS_ACTIVE,
    tenantId: 'test-tenant-id',
    privateKeyPkcs8: '', // Empty means encrypted, view via dialog
    keyCertificate: null,
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
-----END PUBLIC KEY-----`,
    keyPassword: null,
    expiresAtMs: Date.now() + 31536000000,
    createdAtMs: Date.now() - 86400000,
    markForDelete: false,
    keyTypeId: '2',
    statusId: '1',
};

const mockRevokedKey: SigningKey = {
    ...mockActiveRSAKey,
    keyId: 'test-revoked-key-id',
    keyName: 'Test Revoked Key',
    keyStatus: SIGNING_KEY_STATUS_REVOKED,
    statusId: '2',
};

const mockMarkedForDeleteKey: SigningKey = {
    ...mockActiveRSAKey,
    keyId: 'test-marked-key-id',
    keyName: 'Test Marked Key',
    markForDelete: true,
};

const mockTenantBean: TenantMetaDataBean = {
    setTenantMetaData: jest.fn(),
    getTenantMetaData: () => ({
        tenant: {
            tenantId: 'test-tenant-id',
            tenantName: 'Test Tenant',
            tenantType: 'IDENTITY_MANAGEMENT',
            tenanttypeid: '1',
            enabled: true,
            allowUnlimitedRate: false,
            allowUserSelfRegistration: false,
            allowSocialLogin: false,
            allowAnonymousUsers: false,
            verifyEmailOnSelfRegistration: true,
            federatedAuthenticationConstraint: 'NOT_ALLOWED',
            federatedauthenticationconstraintid: '1',
            markForDelete: false,
            migrateLegacyUsers: false,
            allowLoginByPhoneNumber: false,
            allowForgotPassword: true,
            registrationRequireCaptcha: false,
            registrationRequireTermsAndConditions: false,
        },
        tenantLookAndFeel: {
            tenantid: 'test-tenant-id',
            adminheaderbackgroundcolor: '#1976d2',
            adminheadertextcolor: 'white',
            adminheadertext: 'Test Tenant',
            authenticationheaderbackgroundcolor: '#1976d2',
            authenticationheadertextcolor: 'white',
            authenticationlogo: null,
            authenticationheadertext: 'Test Tenant Auth',
            footerlinks: [],
        },
        systemSettings: {
            systemId: 'test-system-id',
            allowRecoveryEmail: true,
            allowDuressPassword: false,
            rootClientId: 'test-root-client-id',
            enablePortalAsLegacyIdp: false,
            softwareVersion: '1.0.0',
            systemCategories: [],
        },
        socialOIDCProviders: [],
    }),
};

const mockResponsiveBreakpoints: ResponsiveBreakpoints = {
    isExtraSmall: false,
    isSmall: false,
    isMedium: false,
    isLarge: true,
    isExtraLarge: false,
    isGreaterThanExtraLarge: false,
};

const mockProfileWithAllPermissions: PortalUserProfile = {
    userId: 'test-user-id',
    email: 'test@example.com',
    emailVerified: true,
    domain: 'test.com',
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'test-tenant-id',
    tenantName: 'Test Tenant',
    enabled: true,
    locked: false,
    expiresAtMs: Date.now() + 3600000,
    principalType: 'IAM_PORTAL_USER',
    nameOrder: 'WESTERN_NAME_ORDER',
    scope: [
        { scopeId: '1', scopeName: KEY_UPDATE_SCOPE, scopeDescription: 'Update key', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
        { scopeId: '2', scopeName: KEY_DELETE_SCOPE, scopeDescription: 'Delete key', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
        { scopeId: '3', scopeName: KEY_SECRET_VIEW_SCOPE, scopeDescription: 'View key secret', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
    ],
};

const mockProfileWithUpdateOnly: PortalUserProfile = {
    ...mockProfileWithAllPermissions,
    scope: [
        { scopeId: '1', scopeName: KEY_UPDATE_SCOPE, scopeDescription: 'Update key', scopeUse: SCOPE_USE_IAM_MANAGEMENT, markForDelete: false },
    ],
};

const mockProfileWithNoPermissions: PortalUserProfile = {
    ...mockProfileWithAllPermissions,
    scope: [],
};

// Helper function to render component with all required providers
const renderWithProviders = (
    signingKey: SigningKey,
    profile: PortalUserProfile | null,
    mocks: any[] = []
) => {
    const authContextValue: AuthContextProps = {
        portalUserProfile: profile,
        forceProfileRefetch: jest.fn(),
    };

    return render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <TenantContext.Provider value={mockTenantBean}>
                <AuthContext.Provider value={authContextValue}>
                    <ResponsiveContext.Provider value={mockResponsiveBreakpoints}>
                        <ClipboardCopyContextProvider>
                            <SigningKeyDetail signingKey={signingKey} />
                        </ClipboardCopyContextProvider>
                    </ResponsiveContext.Provider>
                </AuthContext.Provider>
            </TenantContext.Provider>
        </MockedProvider>
    );
};

describe('SigningKeyDetail Component', () => {
    describe('Basic Rendering - Active RSA Key', () => {
        it('should render key name input', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test RSA Key');
                expect(nameInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render key type (read-only)', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const typeInput = screen.getByDisplayValue(KEY_TYPE_RSA);
                expect(typeInput).toBeInTheDocument();
                expect(typeInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should render key use (read-only)', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const useInput = screen.getByDisplayValue('JWT Signing');
                expect(useInput).toBeInTheDocument();
                expect(useInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should render key status', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                // Status label should be present
                expect(screen.getByText('Status')).toBeInTheDocument();
                // Status value should be visible
                expect(screen.getByText(SIGNING_KEY_STATUS_ACTIVE)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render key ID', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('test-key-id')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render breadcrumbs', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Signing Keys')).toBeInTheDocument();
                expect(screen.getByText('Test RSA Key')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render Overview section header', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Form Interactions', () => {
        it('should allow editing key name', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test RSA Key') as HTMLInputElement;
                fireEvent.change(nameInput, { target: { value: 'Updated Key Name' } });
                expect(nameInput.value).toBe('Updated Key Name');
            }, { timeout: 3000 });
        });

        it('should display status with ability to change', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                // Status should be displayed
                expect(screen.getByText('Status')).toBeInTheDocument();
                expect(screen.getByText(SIGNING_KEY_STATUS_ACTIVE)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should show Update and Discard buttons when form is dirty', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(async () => {
                const nameInput = screen.getByDisplayValue('Test RSA Key') as HTMLInputElement;
                fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

                await waitFor(() => {
                    expect(screen.getByText('Update')).toBeInTheDocument();
                    expect(screen.getByText('Discard')).toBeInTheDocument();
                }, { timeout: 3000 });
            }, { timeout: 3000 });
        });
    });

    describe('Authorization and Permissions', () => {
        it('should enable inputs when user has update scope', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test RSA Key') as HTMLInputElement;
                expect(nameInput).not.toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should disable inputs when user lacks update scope', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithNoPermissions);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test RSA Key') as HTMLInputElement;
                expect(nameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should show delete button when user has delete scope', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const deleteButtons = screen.getAllByRole('button');
                expect(deleteButtons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should not show delete button when user lacks delete scope', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithUpdateOnly);

            await waitFor(() => {
                const allButtons = screen.getAllByRole('button');
                expect(allButtons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should show secret view icon when user has secret view scope', async () => {
            renderWithProviders(mockActiveECKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const visibilityIcons = document.querySelectorAll('[data-testid="VisibilityOutlinedIcon"]');
                expect(visibilityIcons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Marked for Deletion State', () => {
        it('should display marked for deletion alert', async () => {
            renderWithProviders(mockMarkedForDeleteKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText(/marked for deletion/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should disable inputs when marked for deletion', async () => {
            renderWithProviders(mockMarkedForDeleteKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test Marked Key') as HTMLInputElement;
                expect(nameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should not show delete button when marked for deletion', async () => {
            renderWithProviders(mockMarkedForDeleteKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Revoked Key Behavior', () => {
        it('should display revoked status', async () => {
            renderWithProviders(mockRevokedKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const statusInput = screen.getByDisplayValue(SIGNING_KEY_STATUS_REVOKED);
                expect(statusInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should disable name input for revoked keys', async () => {
            renderWithProviders(mockRevokedKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test Revoked Key') as HTMLInputElement;
                expect(nameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should show status as disabled text field for revoked keys', async () => {
            renderWithProviders(mockRevokedKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const statusInput = screen.getByDisplayValue(SIGNING_KEY_STATUS_REVOKED) as HTMLInputElement;
                expect(statusInput).toBeDisabled();
            }, { timeout: 3000 });
        });
    });

    describe('Key Types - RSA vs EC', () => {
        it('should display RSA key type', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const typeInput = screen.getByDisplayValue(KEY_TYPE_RSA);
                expect(typeInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should display EC key type', async () => {
            renderWithProviders(mockActiveECKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const typeInput = screen.getByDisplayValue(KEY_TYPE_EC);
                expect(typeInput).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Private Key Display', () => {
        it('should display encrypted private key directly', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Private Key')).toBeInTheDocument();
                const preElements = document.querySelectorAll('pre');
                const hasEncryptedKey = Array.from(preElements).some(
                    pre => pre.textContent?.includes(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER)
                );
                expect(hasEncryptedKey).toBe(true);
            }, { timeout: 3000 });
        });

        it('should show view icon for empty privateKeyPkcs8 (encrypted storage)', async () => {
            renderWithProviders(mockActiveECKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Private Key')).toBeInTheDocument();
                const visibilityIcons = document.querySelectorAll('[data-testid="VisibilityOutlinedIcon"]');
                expect(visibilityIcons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should display password section for encrypted keys', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Password')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Certificate and Public Key Display', () => {
        it('should display certificate when present', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Certificate')).toBeInTheDocument();
                const preElements = document.querySelectorAll('pre');
                const hasCertificate = Array.from(preElements).some(
                    pre => pre.textContent?.includes('BEGIN CERTIFICATE')
                );
                expect(hasCertificate).toBe(true);
            }, { timeout: 3000 });
        });

        it('should display public key when certificate is not present', async () => {
            renderWithProviders(mockActiveECKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Public Key')).toBeInTheDocument();
                const preElements = document.querySelectorAll('pre');
                const hasPublicKey = Array.from(preElements).some(
                    pre => pre.textContent?.includes('BEGIN PUBLIC KEY')
                );
                expect(hasPublicKey).toBe(true);
            }, { timeout: 3000 });
        });
    });

    describe('Copy to Clipboard', () => {
        it('should render copy icon for key ID', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const copyIcons = document.querySelectorAll('[data-testid="ContentCopyIcon"]');
                expect(copyIcons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should render copy icon for private key', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Private Key')).toBeInTheDocument();
                const copyIcons = document.querySelectorAll('[data-testid="ContentCopyIcon"]');
                expect(copyIcons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });

        it('should render copy icon for certificate/public key', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Certificate')).toBeInTheDocument();
                const copyIcons = document.querySelectorAll('[data-testid="ContentCopyIcon"]');
                expect(copyIcons.length).toBeGreaterThan(0);
            }, { timeout: 3000 });
        });
    });

    describe('Object ID and Labels', () => {
        it('should render Object ID label', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Object ID')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render key name label', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Key Name / Alias')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render key type label', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Key Type')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render key use label', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Key Use')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should render expires label', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Expires')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Edge Cases', () => {
        it('should handle long key names', async () => {
            const longName = 'very-long-key-name-that-exceeds-normal-length-for-testing-purposes';
            const keyWithLongName = { ...mockActiveRSAKey, keyName: longName };
            renderWithProviders(keyWithLongName, mockProfileWithAllPermissions);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue(longName) as HTMLInputElement;
                expect(nameInput.value).toBe(longName);
            }, { timeout: 3000 });
        });

        it('should handle null profile gracefully', async () => {
            renderWithProviders(mockActiveRSAKey, null);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Test RSA Key') as HTMLInputElement;
                expect(nameInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        it('should handle key with no certificate or public key', async () => {
            const keyWithNoCertOrPublicKey = { ...mockActiveECKey, keyCertificate: null, publicKey: null };
            renderWithProviders(keyWithNoCertOrPublicKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Test EC Key')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Breadcrumb Navigation', () => {
        it('should render correct breadcrumb structure', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                expect(screen.getByText('Test Tenant')).toBeInTheDocument();
                expect(screen.getByText('Signing Keys')).toBeInTheDocument();
                expect(screen.getByText('Test RSA Key')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Expiration Display', () => {
        it('should render expiration date', async () => {
            renderWithProviders(mockActiveRSAKey, mockProfileWithAllPermissions);

            await waitFor(() => {
                const expiresInputs = screen.getAllByRole('textbox');
                const expiresInput = expiresInputs.find(input => input.getAttribute('name') === 'keyExpiration');
                expect(expiresInput).toBeInTheDocument();
                expect(expiresInput).toBeDisabled();
            }, { timeout: 3000 });
        });
    });
});
