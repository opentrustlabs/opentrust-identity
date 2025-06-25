"use client";
import { getAccessTokenFromLocalStorage } from '@/utils/client-utils';
import { ApolloClient, InMemoryCache, HttpLink, GraphQLRequest, DefaultContext } from '@apollo/client';
// import { onError } from '@apollo/client/link/error';
import { setContext } from "@apollo/client/link/context";

const authLink = setContext( (operation: GraphQLRequest, prevContext: DefaultContext) => {

        const accessToken: string | null = getAccessTokenFromLocalStorage();        
        if(!accessToken){
            return {
                headers: {
                    ...prevContext.headers,
                    "x-opentrust-oidc-graphql-operation-name": operation.operationName
                }
            }
        }
        else{
            return {
                headers: {
                    ...prevContext.headers,
                    "x-opentrust-oidc-graphql-operation-name": operation.operationName,
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        }
    }
);

const httpLink = new HttpLink({
    uri: "/api/graphql",
    
})

// const errorLink = onError(
//     ({ networkError, operation, forward}) => {
//         const e: ServerError = networkError as ServerError;
//         e.statusCode;
//         operation.operationName
        
//     }
// )

const client = new ApolloClient({

    cache: new InMemoryCache(),
    link: authLink.concat(httpLink)
});

export default client;