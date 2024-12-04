import { AuthorizationState, ExternalOidcAuthorizationRel, PreAuthenticationState, RefreshData } from "@/graphql/generated/graphql-types";

abstract class AuthDao {

    abstract savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState>;

    abstract getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null>;

    abstract deletePreAuthenticationState(tk: String): Promise<void>;
    
    abstract saveAuthorizationState(authorizationState: AuthorizationState): Promise<AuthorizationState>;

    abstract getAuthorizationState(code: string): Promise<AuthorizationState | null>;

    abstract deleteAuthorizationState(code: string): Promise<void>;

    abstract saveRefreshData(refreshData: RefreshData): Promise<RefreshData>;
    
    abstract getRefreshData(refreshToken: string): Promise<RefreshData | null>;

    abstract deleteRefreshData(refreshToken: string): Promise<void>;

    abstract saveExternalOIDCAuthorizationRel(externalOIDCAuthorizationRel: ExternalOidcAuthorizationRel): Promise<ExternalOidcAuthorizationRel>;

    abstract getExternalOIDCAuthorizationRel(state: string): Promise<ExternalOidcAuthorizationRel | null>;

    abstract deleteExternalOIDCAuthorizationRel(state: string): Promise<void>;

}

export default AuthDao;