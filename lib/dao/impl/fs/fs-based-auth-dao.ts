import { PreAuthenticationState, AuthorizationState, RefreshData, ExternalOidcAuthorizationRel } from "@/graphql/generated/graphql-types";
import AuthDao from "@/lib/dao/auth-dao";

class FSBasedAuthDao extends AuthDao {

    savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState> {
        throw new Error("Method not implemented.");
    }
    getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null> {
        throw new Error("Method not implemented.");
    }
    deletePreAuthenticationState(tk: String): Promise<void> {
        throw new Error("Method not implemented.");
    }


    saveAuthorizationState(authorizationState: AuthorizationState): Promise<AuthorizationState> {
        throw new Error("Method not implemented.");
    }
    getAuthorizationState(code: string): Promise<AuthorizationState | null> {
        throw new Error("Method not implemented.");
    }
    deleteAuthorizationState(code: string): Promise<void> {
        throw new Error("Method not implemented.");
    }


    saveRefreshData(refreshData: RefreshData): Promise<RefreshData> {
        throw new Error("Method not implemented.");
    }
    getRefreshData(refreshToken: string): Promise<RefreshData | null> {
        throw new Error("Method not implemented.");
    }
    deleteRefreshData(refreshToken: string): Promise<void> {
        throw new Error("Method not implemented.");
    }


    saveExternalOIDCAuthorizationRel(externalOIDCAuthorizationRel: ExternalOidcAuthorizationRel): Promise<ExternalOidcAuthorizationRel> {
        throw new Error("Method not implemented.");
    }
    getExternalOIDCAuthorizationRel(state: string): Promise<ExternalOidcAuthorizationRel | null> {
        throw new Error("Method not implemented.");
    }
    deleteExternalOIDCAuthorizationRel(state: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default FSBasedAuthDao;