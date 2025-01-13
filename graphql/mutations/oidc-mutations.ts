import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql(`
    mutation login($password: String!, $username: String!) {
        login(password: $password, username: $username) {
            errorActionHandler {
                errorCode
                errorMessage
            }
            secondFactorType
            status
            successConfig {
                code
                redirectUri
                responseMode
                state
            }
        }
    }        
`);