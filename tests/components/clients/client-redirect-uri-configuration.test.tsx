import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import ClientRedirectUriConfiguration from '@/components/clients/client-redirect-uri-configuration';
import { REDIRECT_URIS_QUERY } from '@/graphql/queries/oidc-queries';
import { ADD_REDIRECT_URI_MUTATION, REMOVE_REDIRECT_URI_MUTATION } from '@/graphql/mutations/oidc-mutations';
import { IntlProvider } from 'react-intl';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockedLink({ children, href }: any) {
        return <a href={href}>{children}</a>;
    };
});

const mockClientId = 'client-123';

const mockRedirectUris = [
    'https://example.com/callback',
    'https://app.example.com/auth/callback',
    'http://localhost:3000/callback'
];

const renderWithProviders = (
    component: React.ReactElement,
    mocks: any[] = []
) => {
    return render(
        <IntlProvider locale="en" messages={{}}>
            <MockedProvider mocks={mocks} addTypename={false}>
                {component}
            </MockedProvider>
        </IntlProvider>
    );
};

describe('ClientRedirectUriConfiguration - Loading State', () => {
    it('should show loading indicator while fetching redirect URIs', () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                },
                delay: 100
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
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
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
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

describe('ClientRedirectUriConfiguration - Error State', () => {
    it('should display error message when query fails', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                error: new Error('Failed to fetch redirect URIs')
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch redirect URIs')).toBeInTheDocument();
        });
    });

    it('should display error component when query fails', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                error: new Error('Network error')
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });
});

describe('ClientRedirectUriConfiguration - OIDC Disabled State', () => {
    it('should display message when OIDC is disabled', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: []
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={false}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Enable OIDC to add redirect URIs')).toBeInTheDocument();
        });
    });

    it('should not show add button when OIDC is disabled', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: []
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={false}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.queryByText('Add Redirect URI')).not.toBeInTheDocument();
        });
    });
});

describe('ClientRedirectUriConfiguration - Empty URI List', () => {
    it('should display "No redirect URIs" when list is empty and OIDC is enabled', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: []
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('No redirect URIs')).toBeInTheDocument();
        });
    });

    it('should show add button when list is empty and OIDC is enabled', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: []
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Redirect URI')).toBeInTheDocument();
        });
    });
});

describe('ClientRedirectUriConfiguration - URI List Display', () => {
    it('should display all redirect URIs', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            mockRedirectUris.forEach(uri => {
                expect(screen.getByText(uri)).toBeInTheDocument();
            });
        });
    });

    it('should display remove icons for each URI when not read-only', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
            expect(removeIcons).toHaveLength(mockRedirectUris.length);
        });
    });

    it('should not display "No redirect URIs" when URIs exist', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.queryByText('No redirect URIs')).not.toBeInTheDocument();
        });
    });
});

describe('ClientRedirectUriConfiguration - Add URI Dialog', () => {
    it('should open add URI dialog when Add button is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Redirect URI')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add a redirect URI')).toBeInTheDocument();
        });
    });

    it('should have Submit button disabled initially in add dialog', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Redirect URI')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).toBeDisabled();
        });
    });

    it('should enable Submit button when valid URI is entered', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Redirect URI')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add a redirect URI')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'https://newapp.example.com/callback' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).not.toBeDisabled();
        });
    });

    it('should keep Submit button disabled for invalid URI (too short)', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Redirect URI')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add a redirect URI')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'http:' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).toBeDisabled();
        });
    });

    it('should keep Submit button disabled for invalid URI (http non-localhost)', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Redirect URI')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add a redirect URI')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'http://example.com/callback' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).toBeDisabled();
        });
    });

    it('should call addRedirectUriMutation when Submit is clicked with valid URI', async () => {
        const mockAddMutation = {
            request: {
                query: ADD_REDIRECT_URI_MUTATION,
                variables: {
                    clientId: mockClientId,
                    uri: 'https://newapp.example.com/callback'
                }
            },
            result: {
                data: {
                    addRedirectURI: true
                }
            }
        };

        const mockRefetchQuery = {
            request: {
                query: REDIRECT_URIS_QUERY,
                variables: { clientId: mockClientId }
            },
            result: {
                data: {
                    getRedirectURIs: [...mockRedirectUris, 'https://newapp.example.com/callback']
                }
            }
        };

        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            },
            mockAddMutation,
            mockRefetchQuery
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Redirect URI')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add a redirect URI')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'https://newapp.example.com/callback' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockUpdateStart).toHaveBeenCalled();
            expect(mockUpdateEnd).toHaveBeenCalledWith(true);
        });
    });

    it('should close add dialog when Cancel is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Redirect URI')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add a redirect URI')).toBeInTheDocument();
        });

        const cancelButtons = screen.getAllByText('Cancel');
        fireEvent.click(cancelButtons[0]);

        await waitFor(() => {
            expect(screen.queryByText('Add a redirect URI')).not.toBeInTheDocument();
        });
    });
});

describe('ClientRedirectUriConfiguration - Remove URI Dialog', () => {
    it('should open remove confirmation dialog when remove icon is clicked', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockRedirectUris[0])).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of redirect URI:')).toBeInTheDocument();
            const allMatches = screen.getAllByText(mockRedirectUris[0]);
            expect(allMatches.length).toBeGreaterThan(0);
        });
    });

    it('should call removeRedirectUriMutation when Confirm is clicked', async () => {
        const mockRemoveMutation = {
            request: {
                query: REMOVE_REDIRECT_URI_MUTATION,
                variables: {
                    clientId: mockClientId,
                    uri: mockRedirectUris[0]
                }
            },
            result: {
                data: {
                    removeRedirectURI: true
                }
            }
        };

        const mockRefetchQuery = {
            request: {
                query: REDIRECT_URIS_QUERY,
                variables: { clientId: mockClientId }
            },
            result: {
                data: {
                    getRedirectURIs: mockRedirectUris.slice(1)
                }
            }
        };

        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            },
            mockRemoveMutation,
            mockRefetchQuery
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockRedirectUris[0])).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of redirect URI:')).toBeInTheDocument();
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
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockRedirectUris[0])).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of redirect URI:')).toBeInTheDocument();
        });

        const cancelButtons = screen.getAllByText('Cancel');
        fireEvent.click(cancelButtons[0]);

        await waitFor(() => {
            expect(screen.queryByText('Confirm removal of redirect URI:')).not.toBeInTheDocument();
        });
    });

    it('should display the correct URI in remove confirmation dialog', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockRedirectUris[1])).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[1]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of redirect URI:')).toBeInTheDocument();
            const dialog = screen.getByText('Confirm removal of redirect URI:').closest('div');
            expect(dialog).toHaveTextContent(mockRedirectUris[1]);
        });
    });

    it('should not call mutation if dialog is closed without confirming', async () => {
        const mockRemoveMutation = {
            request: {
                query: REMOVE_REDIRECT_URI_MUTATION,
                variables: {
                    clientId: mockClientId,
                    uri: mockRedirectUris[0]
                }
            },
            result: {
                data: {
                    removeRedirectURI: true
                }
            }
        };

        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            },
            mockRemoveMutation
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockRedirectUris[0])).toBeInTheDocument();
        });

        const removeIcons = screen.getAllByTestId('RemoveCircleOutlineIcon');
        fireEvent.click(removeIcons[0]);

        await waitFor(() => {
            expect(screen.getByText('Confirm removal of redirect URI:')).toBeInTheDocument();
        });

        const cancelButtons = screen.getAllByText('Cancel');
        fireEvent.click(cancelButtons[0]);

        await waitFor(() => {
            expect(mockUpdateStart).not.toHaveBeenCalled();
            expect(mockUpdateEnd).not.toHaveBeenCalled();
        });
    });
});

describe('ClientRedirectUriConfiguration - Read-Only Mode', () => {
    it('should not display add button in read-only mode', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={true}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockRedirectUris[0])).toBeInTheDocument();
        });

        expect(screen.queryByText('Add Redirect URI')).not.toBeInTheDocument();
    });

    it('should not display remove icons in read-only mode', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={true}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText(mockRedirectUris[0])).toBeInTheDocument();
        });

        expect(screen.queryByTestId('RemoveCircleOutlineIcon')).not.toBeInTheDocument();
    });

    it('should display URIs in read-only mode', async () => {
        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            }
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={true}
            />,
            mocks
        );

        await waitFor(() => {
            mockRedirectUris.forEach(uri => {
                expect(screen.getByText(uri)).toBeInTheDocument();
            });
        });
    });
});

describe('ClientRedirectUriConfiguration - Error Handling', () => {
    it('should display error alert when add mutation fails', async () => {
        const mockAddMutation = {
            request: {
                query: ADD_REDIRECT_URI_MUTATION,
                variables: {
                    clientId: mockClientId,
                    uri: 'https://newapp.example.com/callback'
                }
            },
            error: new Error('FAILED_TO_ADD_REDIRECT_URI')
        };

        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            },
            mockAddMutation
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Redirect URI')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add a redirect URI')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'https://newapp.example.com/callback' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockUpdateEnd).toHaveBeenCalledWith(false);
            expect(screen.getByText('FAILED_TO_ADD_REDIRECT_URI')).toBeInTheDocument();
        });
    });

    it('should dismiss error alert when close button is clicked', async () => {
        const mockAddMutation = {
            request: {
                query: ADD_REDIRECT_URI_MUTATION,
                variables: {
                    clientId: mockClientId,
                    uri: 'https://newapp.example.com/callback'
                }
            },
            error: new Error('FAILED_TO_ADD_REDIRECT_URI')
        };

        const mocks = [
            {
                request: {
                    query: REDIRECT_URIS_QUERY,
                    variables: { clientId: mockClientId }
                },
                result: {
                    data: {
                        getRedirectURIs: mockRedirectUris
                    }
                }
            },
            mockAddMutation
        ];

        const mockUpdateStart = jest.fn();
        const mockUpdateEnd = jest.fn();

        renderWithProviders(
            <ClientRedirectUriConfiguration
                clientId={mockClientId}
                oidcEnabled={true}
                onUpdateStart={mockUpdateStart}
                onUpdateEnd={mockUpdateEnd}
                readOnly={false}
            />,
            mocks
        );

        await waitFor(() => {
            expect(screen.getByText('Add Redirect URI')).toBeInTheDocument();
        });

        const addButton = screen.getByTestId('AddBoxIcon');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Add a redirect URI')).toBeInTheDocument();
        });

        const textField = screen.getByRole('textbox');
        fireEvent.change(textField, { target: { value: 'https://newapp.example.com/callback' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('FAILED_TO_ADD_REDIRECT_URI')).toBeInTheDocument();
        });

        const closeButton = screen.getByTestId('CloseIcon').parentElement as HTMLElement;
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('FAILED_TO_ADD_REDIRECT_URI')).not.toBeInTheDocument();
        });
    });
});
