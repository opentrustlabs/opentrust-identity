import { PreAuthenticationState, AuthorizationCodeData, RefreshData, FederatedOidcAuthorizationRel } from "@/graphql/generated/graphql-types";
import AuthDao from "../../auth-dao";
import PreAuthenticationStateEntity from "@/lib/entities/pre-authentication-state-entity";
import AuthorizationCodeDataEntity from "@/lib/entities/authorization-code-data-entity";
import RefreshDataEntity from "@/lib/entities/refresh-data-entity";
import FederatedOIDCAuthorizationRelEntity from "@/lib/entities/federated-oidc-authorization-rel-entity";
import { Sequelize } from "sequelize";
import DBDriver from "@/lib/data-sources/sequelize-db";

class DBAuthDao extends AuthDao {

    public async savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.preauthenticationState.create(preAuthenticationState);        
        return Promise.resolve(preAuthenticationState);
    }

    public async getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: PreAuthenticationStateEntity | null = await sequelize.models.preauthenticationState.findOne({
            where: {
                token: tk
            }
        });
        
        return entity ? Promise.resolve(entity.dataValues as PreAuthenticationState) : Promise.resolve(null);
    }

    public async deletePreAuthenticationState(tk: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.preauthenticationState.destroy({
            where: {
                token: tk
            } 
        });
        return Promise.resolve();
    }

    public async saveAuthorizationCodeData(authorizationCodeData: AuthorizationCodeData): Promise<AuthorizationCodeData> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authorizationCodeData.create(authorizationCodeData);
        return Promise.resolve(authorizationCodeData);
    }

    public async getAuthorizationCodeData(code: string): Promise<AuthorizationCodeData | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: AuthorizationCodeDataEntity | null = await sequelize.models.authorizationCodeData.findOne({
            where: {
                code: code
            }
        });
        return entity ? Promise.resolve(entity as any as AuthorizationCodeData) : Promise.resolve(null);
    }

    public async deleteAuthorizationCodeData(code: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authorizationCodeData.destroy({
            where: {
                code: code
            }
        });        
        return Promise.resolve();
    }

    public async saveRefreshData(refreshData: RefreshData): Promise<RefreshData> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.refreshData.create(refreshData);
        return Promise.resolve(refreshData);
    }

    public async getRefreshData(refreshToken: string): Promise<RefreshData | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: RefreshDataEntity | null = await sequelize.models.refreshData.findOne({
            where: {
                refreshToken: refreshToken
            }
        });
        return entity ? Promise.resolve(entity.dataValues as RefreshData) : Promise.resolve(null);
    }

    public async deleteRefreshData(refreshToken: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.refreshData.destroy({
            where: {
                refreshToken: refreshToken
            }
        });
        return Promise.resolve();
    }

    
    public async saveFederatedOIDCAuthorizationRel(federatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel): Promise<FederatedOidcAuthorizationRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.federatedOidcAuthorizationRel.create(federatedOIDCAuthorizationRel);
        return Promise.resolve(federatedOIDCAuthorizationRel);
    }
    
    public async getFederatedOIDCAuthorizationRel(state: string): Promise<FederatedOidcAuthorizationRel | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: FederatedOIDCAuthorizationRelEntity | null = await sequelize.models.federatedOidcAuthorizationRel.findOne(
            {
                where: {
                    state: state
                }
            }
        );
        return entity ? Promise.resolve(entity as any as FederatedOidcAuthorizationRel) : Promise.resolve(null);
    }

    public async deleteFederatedOIDCAuthorizationRel(state: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.federatedOidcAuthorizationRel.destroy({
            where: {
                state: state
            }
        });
        return Promise.resolve();
    }

}

export default DBAuthDao;