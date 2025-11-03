import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ApolloProvider } from '@apollo/client';
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';

/**
 * Creates a mocked Apollo Client for testing
 */
export function createMockApolloClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}

/**
 * Wrapper component that provides Apollo MockedProvider for testing
 *
 * @param mocks - Array of mocked GraphQL operations
 * @param addTypename - Whether to add __typename to the queries (default: false)
 * @param children - React children to render
 */
export function ApolloMockWrapper({
  mocks = [],
  addTypename = false,
  children,
}: {
  mocks?: MockedResponse[];
  addTypename?: boolean;
  children: React.ReactNode;
}) {
  return (
    <MockedProvider mocks={mocks} addTypename={addTypename}>
      {children}
    </MockedProvider>
  );
}

/**
 * Wrapper component that provides a real Apollo Client for testing
 * Useful when you need more control over the client configuration
 */
export function ApolloClientWrapper({
  client,
  children,
}: {
  client?: ApolloClient<NormalizedCacheObject>;
  children: React.ReactNode;
}) {
  const apolloClient = client || createMockApolloClient();

  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}

/**
 * Helper to create a successful GraphQL mock response
 */
export function createSuccessMock<T = any>(
  query: any,
  data: T,
  variables?: any
): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    result: {
      data,
    },
  };
}

/**
 * Helper to create an error GraphQL mock response
 */
export function createErrorMock(
  query: any,
  error: Error,
  variables?: any
): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    error,
  };
}

/**
 * Helper to create a GraphQL error response (different from network error)
 */
export function createGraphQLErrorMock(
  query: any,
  message: string,
  variables?: any
): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    result: {
      errors: [
        {
          message,
          extensions: {
            code: 'GRAPHQL_ERROR',
          },
        },
      ],
    },
  };
}

/**
 * Waits for Apollo operations to complete
 * Useful when testing components that make GraphQL queries
 */
export async function waitForApollo(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
