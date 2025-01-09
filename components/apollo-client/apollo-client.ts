import { ApolloClient, InMemoryCache, HttpLink, GraphQLRequest, DefaultContext } from '@apollo/client';
import { setContext } from "@apollo/client/link/context";



const authLink = setContext(
    (operation: GraphQLRequest, prevContext: DefaultContext) => {
        return {
            headers: {
                ...prevContext.headers,
                "x-opercerts-oidc-graphql-operation-name": operation.operationName
            }
        }
    }
);

const httpLink = new HttpLink({
    uri: "/api/graphql"
})

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink)
});

export default client;