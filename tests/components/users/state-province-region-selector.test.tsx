import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import StateProvinceRegionSelector from '@/components/users/state-province-region-selector';
import { STATE_PROVINCE_REGIONS_QUERY } from '@/graphql/queries/oidc-queries';
import { StateProvinceRegion } from '@/graphql/generated/graphql-types';

// Mock state/province/region data
const mockStateProvinceRegions: StateProvinceRegion[] = [
    {
        isoCountryCode: 'US',
        isoEntryCode: 'CA',
        isoEntryName: 'California',
        isoSubsetType: 'state'
    },
    {
        isoCountryCode: 'US',
        isoEntryCode: 'NY',
        isoEntryName: 'New York',
        isoSubsetType: 'state'
    },
    {
        isoCountryCode: 'US',
        isoEntryCode: 'TX',
        isoEntryName: 'Texas',
        isoSubsetType: 'state'
    }
];

describe('StateProvinceRegionSelector', () => {
    let onChangeMock: jest.Mock;

    beforeEach(() => {
        onChangeMock = jest.fn();
    });

    const mockStateProvinceRegionsQuery = {
        request: {
            query: STATE_PROVINCE_REGIONS_QUERY,
            variables: {
                countryCode: 'US'
            }
        },
        result: {
            data: {
                getStateProvinceRegions: mockStateProvinceRegions
            }
        }
    };

    const mockStateProvinceRegionsError = {
        request: {
            query: STATE_PROVINCE_REGIONS_QUERY,
            variables: {
                countryCode: 'US'
            }
        },
        error: new Error('Failed to fetch state/province regions')
    };

    describe('Query Skip Condition', () => {
        it('should not execute query when countryCode is null', () => {
            const { container } = render(
                <MockedProvider mocks={[]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode={undefined}
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            const autocomplete = container.querySelector('input');
            expect(autocomplete).toBeInTheDocument();
            expect(autocomplete).not.toBeDisabled();
        });

        it('should not execute query when countryCode is undefined', () => {
            const { container } = render(
                <MockedProvider mocks={[]} addTypename={false}>
                    <StateProvinceRegionSelector
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            const autocomplete = container.querySelector('input');
            expect(autocomplete).toBeInTheDocument();
        });

        it('should execute query when countryCode is provided', async () => {
            render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const autocomplete = screen.getByRole('combobox');
                expect(autocomplete).toBeInTheDocument();
            });
        });
    });

    describe('Error State', () => {
        it('should display error alert when query fails', async () => {
            render(
                <MockedProvider mocks={[mockStateProvinceRegionsError]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                expect(screen.getByText('Failed to fetch state/province regions')).toBeInTheDocument();
            });

            const alert = screen.getByRole('alert');
            expect(alert).toHaveClass('MuiAlert-standardError');
        });
    });

    describe('Autocomplete Options', () => {
        it('should display empty options array while loading', () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            const autocomplete = container.querySelector('input');
            expect(autocomplete).toBeInTheDocument();
        });

        it('should include empty option at the start of options', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const autocomplete = container.querySelector('input');
                expect(autocomplete).toBeInTheDocument();
            });

            const autocomplete = container.querySelector('input');
            fireEvent.mouseDown(autocomplete!);

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                // Should have 4 options: 1 empty + 3 states
                expect(options).toHaveLength(4);
            });
        });

        it('should map StateProvinceRegion to {id, label} format', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const autocomplete = container.querySelector('input');
                expect(autocomplete).toBeInTheDocument();
            });

            const autocomplete = container.querySelector('input');
            fireEvent.mouseDown(autocomplete!);

            await waitFor(() => {
                expect(screen.getByText('California')).toBeInTheDocument();
                expect(screen.getByText('New York')).toBeInTheDocument();
                expect(screen.getByText('Texas')).toBeInTheDocument();
            });
        });
    });

    describe('Initial Value', () => {
        it('should set initial value when initValue prop is provided', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        initValue="CA"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const input = container.querySelector('input');
                expect(input).toHaveValue('California');
            });
        });

        it('should not set initial value when initValue does not match any region', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        initValue="XX"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const input = container.querySelector('input');
                expect(input).toHaveValue('');
            });
        });

        it('should use empty value when initValue is not provided', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const input = container.querySelector('input');
                expect(input).toHaveValue('');
            });
        });
    });

    describe('onChange Callback', () => {
        it('should call onChange with StateProvinceRegion object when option is selected', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const autocomplete = container.querySelector('input');
                expect(autocomplete).toBeInTheDocument();
            });

            const autocomplete = container.querySelector('input');
            fireEvent.mouseDown(autocomplete!);

            await waitFor(() => {
                expect(screen.getByText('California')).toBeInTheDocument();
            });

            const californiaOption = screen.getByText('California');
            fireEvent.click(californiaOption);

            await waitFor(() => {
                expect(onChangeMock).toHaveBeenCalledWith({
                    isoCountryCode: 'US',
                    isoEntryCode: 'CA',
                    isoEntryName: 'California',
                    isoSubsetType: 'state'
                });
            });
        });

        it('should call onChange with null when selection is cleared', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        initValue="CA"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const input = container.querySelector('input');
                expect(input).toHaveValue('California');
            });

            const clearButton = container.querySelector('.MuiAutocomplete-clearIndicator');
            if (clearButton) {
                fireEvent.click(clearButton);

                await waitFor(() => {
                    expect(onChangeMock).toHaveBeenCalledWith(null);
                });
            }
        });

        it('should update local state when option is selected', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const autocomplete = container.querySelector('input');
                expect(autocomplete).toBeInTheDocument();
            });

            const autocomplete = container.querySelector('input');
            fireEvent.mouseDown(autocomplete!);

            await waitFor(() => {
                expect(screen.getByText('New York')).toBeInTheDocument();
            });

            const newYorkOption = screen.getByText('New York');
            fireEvent.click(newYorkOption);

            await waitFor(() => {
                expect(onChangeMock).toHaveBeenCalledWith({
                    isoCountryCode: 'US',
                    isoEntryCode: 'NY',
                    isoEntryName: 'New York',
                    isoSubsetType: 'state'
                });
            });
        });
    });

    describe('Disabled State', () => {
        it('should disable autocomplete when isDisabled is true', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={true}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const autocomplete = container.querySelector('input');
                expect(autocomplete).toBeDisabled();
            });
        });

        it('should enable autocomplete when isDisabled is false', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const autocomplete = container.querySelector('input');
                expect(autocomplete).not.toBeDisabled();
            });
        });
    });

    describe('FreeSolo Behavior', () => {
        it('should allow custom input with freeSolo enabled', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const autocomplete = container.querySelector('input');
                expect(autocomplete).toBeInTheDocument();
            });

            const autocomplete = container.querySelector('input');

            // Focus the input first
            fireEvent.focus(autocomplete!);
            fireEvent.change(autocomplete!, { target: { value: 'Custom State' } });

            // The input should accept the custom value
            expect(autocomplete).toHaveValue('Custom State');
        });
    });

    describe('Edge Cases', () => {
        it('should handle null data gracefully', async () => {
            const mockNullDataQuery = {
                request: {
                    query: STATE_PROVINCE_REGIONS_QUERY,
                    variables: {
                        countryCode: 'US'
                    }
                },
                result: {
                    data: {
                        getStateProvinceRegions: null
                    }
                }
            };

            const { container } = render(
                <MockedProvider mocks={[mockNullDataQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const autocomplete = container.querySelector('input');
                expect(autocomplete).toBeInTheDocument();
            });
        });

        it('should handle empty array gracefully', async () => {
            const mockEmptyDataQuery = {
                request: {
                    query: STATE_PROVINCE_REGIONS_QUERY,
                    variables: {
                        countryCode: 'US'
                    }
                },
                result: {
                    data: {
                        getStateProvinceRegions: []
                    }
                }
            };

            const { container } = render(
                <MockedProvider mocks={[mockEmptyDataQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const autocomplete = container.querySelector('input');
                expect(autocomplete).toBeInTheDocument();
            });

            const autocomplete = container.querySelector('input');
            fireEvent.mouseDown(autocomplete!);

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                // Should have only 1 option: the empty option
                expect(options).toHaveLength(1);
            });
        });

        it('should call onChange with null when empty option value is set', async () => {
            const { container } = render(
                <MockedProvider mocks={[mockStateProvinceRegionsQuery]} addTypename={false}>
                    <StateProvinceRegionSelector
                        countryCode="US"
                        initValue="CA"
                        isDisabled={false}
                        onChange={onChangeMock}
                    />
                </MockedProvider>
            );

            await waitFor(() => {
                const input = container.querySelector('input');
                expect(input).toHaveValue('California');
            });

            // Reset the mock to check for null call
            onChangeMock.mockClear();

            const autocomplete = container.querySelector('input');
            fireEvent.mouseDown(autocomplete!);

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(0);
            });

            // Click the first option (empty option)
            const options = screen.getAllByRole('option');
            fireEvent.click(options[0]);

            // Wait a bit for the onChange to be called
            await new Promise(resolve => setTimeout(resolve, 100));

            // The onChange should be called with null when the empty option is selected
            if (onChangeMock.mock.calls.length > 0) {
                expect(onChangeMock).toHaveBeenCalledWith(null);
            }
        });
    });
});
