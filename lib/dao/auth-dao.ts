import { AuthorizationCodeData, FederatedOidcAuthorizationRel, PreAuthenticationState, RefreshData } from "@/graphql/generated/graphql-types";

abstract class AuthDao {

    abstract savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState>;

    abstract getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null>;

    abstract deletePreAuthenticationState(tk: String): Promise<void>;
    
    abstract saveAuthorizationCodeData(authorizationCodeData: AuthorizationCodeData): Promise<AuthorizationCodeData>;

    abstract getAuthorizationCodeData(code: string): Promise<AuthorizationCodeData | null>;

    abstract deleteAuthorizationCodeData(code: string): Promise<void>;

    abstract saveRefreshData(refreshData: RefreshData): Promise<RefreshData>;
    
    abstract getRefreshData(refreshToken: string): Promise<RefreshData | null>;

    abstract deleteRefreshData(refreshToken: string): Promise<void>;

    abstract saveFederatedOIDCAuthorizationRel(federatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel): Promise<FederatedOidcAuthorizationRel>;

    abstract getFederatedOIDCAuthorizationRel(state: string): Promise<FederatedOidcAuthorizationRel | null>;

    abstract deleteFederatedOIDCAuthorizationRel(state: string): Promise<void>;

}

export default AuthDao;