import { PreAuthenticationState, AuthorizationCodeData, RefreshData, FederatedOidcAuthorizationRel } from "@/graphql/generated/graphql-types";
import AuthDao from "../../auth-dao";
import connection  from "@/lib/data-sources/db";
import PreAuthenticationStateEntity from "@/lib/entities/pre-authentication-state-entity";
import AuthorizationCodeDataEntity from "@/lib/entities/authorization-code-data-entity";
import RefreshDataEntity from "@/lib/entities/refresh-data-entity";
import FederatedOIDCAuthorizationRelEntity from "@/lib/entities/federated-oidc-authorization-rel-entity";

class DBAuthDao extends AuthDao {

    public async savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState> {
        const em = connection.em.fork();
        const entity: PreAuthenticationStateEntity = new PreAuthenticationStateEntity(preAuthenticationState);
        await em.persistAndFlush(entity);
        return Promise.resolve(preAuthenticationState);
    }

    public async getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null> {
        const em = connection.em.fork();
        const entity: PreAuthenticationStateEntity | null = await em.findOne(
            PreAuthenticationStateEntity,
            {
                token: tk
            }
        );
        return Promise.resolve(entity);
    }

    public async deletePreAuthenticationState(tk: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(PreAuthenticationStateEntity, {
            token: tk
        });
        return Promise.resolve();
    }

    public async saveAuthorizationCodeData(authorizationCodeData: AuthorizationCodeData): Promise<AuthorizationCodeData> {
        const em = connection.em.fork();
        const entity: AuthorizationCodeDataEntity = new AuthorizationCodeDataEntity(authorizationCodeData);
        await em.persistAndFlush(entity);
        return Promise.resolve(authorizationCodeData);
    }

    public async getAuthorizationCodeData(code: string): Promise<AuthorizationCodeData | null> {
        const em = connection.em.fork();
        const entity: AuthorizationCodeDataEntity | null = await em.findOne(
            AuthorizationCodeDataEntity,
            {
                code: code
            }
        );
        return Promise.resolve(entity);
    }

    public async deleteAuthorizationCodeData(code: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(AuthorizationCodeDataEntity, {
            code: code
        });
        return Promise.resolve();
    }

    public async saveRefreshData(refreshData: RefreshData): Promise<RefreshData> {
        const em = connection.em.fork();
        const entity: RefreshDataEntity = new RefreshDataEntity(refreshData);
        await em.persistAndFlush(entity);
        return Promise.resolve(refreshData);
    }

    public async getRefreshData(refreshToken: string): Promise<RefreshData | null> {
        const em = connection.em.fork();
        const entity: RefreshDataEntity | null = await em.findOne(
            RefreshDataEntity,
            {
                refreshToken: refreshToken
            }
        );
        return Promise.resolve(entity);
    }

    public async deleteRefreshData(refreshToken: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(RefreshDataEntity, {
            refreshToken: refreshToken
        });
        return Promise.resolve();
    }

    public async saveFederatedOIDCAuthorizationRel(federatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel): Promise<FederatedOidcAuthorizationRel> {
        const em = connection.em.fork();
        const entity: FederatedOIDCAuthorizationRelEntity = new FederatedOIDCAuthorizationRelEntity(federatedOIDCAuthorizationRel);
        await em.persistAndFlush(entity);
        return Promise.resolve(federatedOIDCAuthorizationRel);
    }
    
    public async getFederatedOIDCAuthorizationRel(state: string): Promise<FederatedOidcAuthorizationRel | null> {
        const em = connection.em.fork();
        const entity: FederatedOIDCAuthorizationRelEntity | null = await em.findOne(
            FederatedOIDCAuthorizationRelEntity, {
                state: state
            }
        );
        return Promise.resolve(entity);
    }

    public async deleteFederatedOIDCAuthorizationRel(state: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(FederatedOIDCAuthorizationRelEntity, {
            state: state
        });
        return Promise.resolve();
    }

}

export default DBAuthDao;