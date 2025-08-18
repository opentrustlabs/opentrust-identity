import { PreAuthenticationState, AuthorizationCodeData, RefreshData, FederatedOidcAuthorizationRel, AuthorizationDeviceCodeData } from "@/graphql/generated/graphql-types";
import AuthDao, { AuthorizationCodeType } from "../../auth-dao";
import PreAuthenticationStateEntity from "@/lib/entities/pre-authentication-state-entity";
import AuthorizationCodeDataEntity from "@/lib/entities/authorization-code-data-entity";
import RefreshDataEntity from "@/lib/entities/refresh-data-entity";
import FederatedOIDCAuthorizationRelEntity from "@/lib/entities/federated-oidc-authorization-rel-entity";
import { Op, Sequelize } from "sequelize";
import DBDriver from "@/lib/data-sources/sequelize-db";
import AuthorizationDeviceCodeDataEntity from "@/lib/entities/authorization-device-code-data-entity";

class DBAuthDao extends AuthDao {

    public async getRefreshDataByUserId(userId: string): Promise<Array<RefreshData>> {        
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<RefreshDataEntity> = await sequelize.models.refreshData.findAll({
            where: {
                userId: userId
            }
        });        
        return arr.map((e: RefreshDataEntity) => e.dataValues);
    }

    public async deleteRefreshData(userId: string, tenantId: string, clientId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.refreshData.destroy({
            where: {
                userId: userId,
                clientId: clientId,
                tenantId: tenantId
            }
        });
        return Promise.resolve();
    }

    public async savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.preAuthenticationState.create(preAuthenticationState);        
        return Promise.resolve(preAuthenticationState);
    }

    public async getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: PreAuthenticationStateEntity | null = await sequelize.models.preAuthenticationState.findOne({
            where: {
                token: tk
            }
        });
        
        return entity ? Promise.resolve(entity.dataValues as PreAuthenticationState) : Promise.resolve(null);
    }

    public async deletePreAuthenticationState(tk: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.preAuthenticationState.destroy({
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
        return entity ? Promise.resolve(entity.dataValues as AuthorizationCodeData) : Promise.resolve(null);
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

    public async deleteRefreshDataByRefreshToken(refreshToken: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.refreshData.destroy({
            where: {
                refreshToken: refreshToken
            }
        });
        return Promise.resolve();
    }

    public async saveAuthorizationDeviceCodeData(authoriationDeviceCodeData: AuthorizationDeviceCodeData): Promise<AuthorizationDeviceCodeData>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authorizationDeviceCodeData.create(authoriationDeviceCodeData);
        return authoriationDeviceCodeData;
    }

    public async updateAuthorizationDeviceCodeData(authoriationDeviceCodeData: AuthorizationDeviceCodeData): Promise<AuthorizationDeviceCodeData>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authorizationDeviceCodeData.update(authoriationDeviceCodeData, {
            where: {
                deviceCodeId: authoriationDeviceCodeData.deviceCodeId
            }
        });
        return authoriationDeviceCodeData;
    }
    
    public async getAuthorizationDeviceCodeData(code: string, authorizationCodeType: AuthorizationCodeType): Promise<AuthorizationDeviceCodeData | null>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        // @typescript-eslint/no-explicit-any
        const whereParams: any = {};

        if(authorizationCodeType === "devicecode"){
            whereParams.deviceCode = code;
        }
        else if(authorizationCodeType === "usercode"){
            whereParams.userCode = code;
        }
        else{
            whereParams.deviceCodeId = code;
        }
        const entity: AuthorizationDeviceCodeDataEntity | null = await sequelize.models.authorizationDeviceCodeData.findOne({
            where: whereParams
        });
        return entity ? entity.dataValues : null;

    }
    
    public async deleteAuthorizationDeviceCodeData(deviceCodeId: string): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.authorizationDeviceCodeData.destroy({
            where: {
                deviceCodeId: deviceCodeId
            }
        })
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
        return entity ? Promise.resolve(entity.dataValues as FederatedOidcAuthorizationRel) : Promise.resolve(null);
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

    public async deleteExpiredData(): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.federatedOidcAuthorizationRel.destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });
        await sequelize.models.preAuthenticationState.destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            } 
        });
        await sequelize.models.authorizationCodeData.destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        }); 
        await sequelize.models.refreshData.destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });
        await sequelize.models.authorizationDeviceCodeData.destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        })

    }

}

export default DBAuthDao;