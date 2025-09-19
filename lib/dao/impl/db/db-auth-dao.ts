import { PreAuthenticationState, AuthorizationCodeData, RefreshData, FederatedOidcAuthorizationRel, AuthorizationDeviceCodeData, FederatedAuthTest } from "@/graphql/generated/graphql-types";
import AuthDao, { AuthorizationCodeType } from "../../auth-dao";
import PreAuthenticationStateEntity from "@/lib/entities/pre-authentication-state-entity";
import AuthorizationCodeDataEntity from "@/lib/entities/authorization-code-data-entity";
import RefreshDataEntity from "@/lib/entities/refresh-data-entity";
import FederatedOIDCAuthorizationRelEntity from "@/lib/entities/federated-oidc-authorization-rel-entity";
import { Op } from "@sequelize/core";
import DBDriver from "@/lib/data-sources/sequelize-db";
import AuthorizationDeviceCodeDataEntity from "@/lib/entities/authorization-device-code-data-entity";
import FederatedAuthTestEntity from "@/lib/entities/federated-auth-test-entity";

class DBAuthDao extends AuthDao {

    public async getRefreshDataByUserId(userId: string): Promise<Array<RefreshData>> {        

        const arr: Array<RefreshDataEntity> = await (await DBDriver.getInstance().getRefreshDataEntity()).findAll({
            where: {
                userId: userId
            }
        });        
        return arr.map((e: RefreshDataEntity) => e.dataValues);
    }

    public async deleteRefreshData(userId: string, tenantId: string, clientId: string): Promise<void> {

        await (await DBDriver.getInstance().getRefreshDataEntity()).destroy({
            where: {
                userId: userId,
                clientId: clientId,
                tenantId: tenantId
            }
        });
        return Promise.resolve();
    }

    public async savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState> {

        await (await DBDriver.getInstance().getPreAuthenticationStateEntity()).create(preAuthenticationState);        
        return Promise.resolve(preAuthenticationState);
    }

    public async getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null> {

        const entity: PreAuthenticationStateEntity | null = await (await DBDriver.getInstance().getPreAuthenticationStateEntity()).findOne({
            where: {
                token: tk
            }
        });
        
        return entity ? Promise.resolve(entity.dataValues as PreAuthenticationState) : Promise.resolve(null);
    }

    public async deletePreAuthenticationState(tk: string): Promise<void> {
    
        await (await DBDriver.getInstance().getPreAuthenticationStateEntity()).destroy({
            where: {
                token: tk
            } 
        });
        return Promise.resolve();
    }

    public async saveAuthorizationCodeData(authorizationCodeData: AuthorizationCodeData): Promise<AuthorizationCodeData> {

        await (await DBDriver.getInstance().getAuthorizationCodeDataEntity()).create(authorizationCodeData);
        return Promise.resolve(authorizationCodeData);
    }

    public async getAuthorizationCodeData(code: string): Promise<AuthorizationCodeData | null> {

        const entity: AuthorizationCodeDataEntity | null = await (await DBDriver.getInstance().getAuthorizationCodeDataEntity()).findOne({
            where: {
                code: code
            }
        });
        return entity ? Promise.resolve(entity.dataValues as AuthorizationCodeData) : Promise.resolve(null);
    }

    public async deleteAuthorizationCodeData(code: string): Promise<void> {

        await (await DBDriver.getInstance().getAuthorizationCodeDataEntity()).destroy({
            where: {
                code: code
            }
        });        
        return Promise.resolve();
    }

    public async saveRefreshData(refreshData: RefreshData): Promise<RefreshData> {

        await (await DBDriver.getInstance().getRefreshDataEntity()).create(refreshData);
        return Promise.resolve(refreshData);
    }

    public async getRefreshData(refreshToken: string): Promise<RefreshData | null> {

        const entity: RefreshDataEntity | null = await (await DBDriver.getInstance().getRefreshDataEntity()).findOne({
            where: {
                refreshToken: refreshToken
            }
        });
        return entity ? Promise.resolve(entity.dataValues as RefreshData) : Promise.resolve(null);
    }

    public async deleteRefreshDataByRefreshToken(refreshToken: string): Promise<void> {

        await (await DBDriver.getInstance().getRefreshDataEntity()).destroy({
            where: {
                refreshToken: refreshToken
            }
        });
        return Promise.resolve();
    }

    public async saveAuthorizationDeviceCodeData(authoriationDeviceCodeData: AuthorizationDeviceCodeData): Promise<AuthorizationDeviceCodeData>{

        await (await DBDriver.getInstance().getAuthorizationDeviceCodeDataEntity()).create(authoriationDeviceCodeData);
        return authoriationDeviceCodeData;
    }

    public async updateAuthorizationDeviceCodeData(authoriationDeviceCodeData: AuthorizationDeviceCodeData): Promise<AuthorizationDeviceCodeData>{
   
        await (await DBDriver.getInstance().getAuthorizationDeviceCodeDataEntity()).update(authoriationDeviceCodeData, {
            where: {
                deviceCodeId: authoriationDeviceCodeData.deviceCodeId
            }
        });
        return authoriationDeviceCodeData;
    }
    
    public async getAuthorizationDeviceCodeData(code: string, authorizationCodeType: AuthorizationCodeType): Promise<AuthorizationDeviceCodeData | null>{

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const entity: AuthorizationDeviceCodeDataEntity | null = await (await DBDriver.getInstance().getAuthorizationDeviceCodeDataEntity()).findOne({
            where: whereParams
        });
        return entity ? entity.dataValues : null;

    }
    
    public async deleteAuthorizationDeviceCodeData(deviceCodeId: string): Promise<void>{

        await (await DBDriver.getInstance().getAuthorizationDeviceCodeDataEntity()).destroy({
            where: {
                deviceCodeId: deviceCodeId
            }
        })
    }

    
    public async saveFederatedOIDCAuthorizationRel(federatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel): Promise<FederatedOidcAuthorizationRel> {

        await (await DBDriver.getInstance().getFederatedOIDCAuthorizationRelEntity()).create(federatedOIDCAuthorizationRel);
        return Promise.resolve(federatedOIDCAuthorizationRel);
    }
    
    public async getFederatedOIDCAuthorizationRel(state: string): Promise<FederatedOidcAuthorizationRel | null> {

        const entity: FederatedOIDCAuthorizationRelEntity | null = await (await DBDriver.getInstance().getFederatedOIDCAuthorizationRelEntity()).findOne(
            {
                where: {
                    state: state
                }
            }
        );
        return entity ? Promise.resolve(entity.dataValues as FederatedOidcAuthorizationRel) : Promise.resolve(null);
    }

    public async deleteFederatedOIDCAuthorizationRel(state: string): Promise<void> {

        await (await DBDriver.getInstance().getFederatedOIDCAuthorizationRelEntity()).destroy({
            where: {
                state: state
            }
        });
        return Promise.resolve();
    }

    public async saveFederatedAuthTest(federatedAuthTest: FederatedAuthTest): Promise<FederatedAuthTest>{

        await (await DBDriver.getInstance().getFederatedAuthTestEntity()).create(federatedAuthTest);
        return federatedAuthTest;
    }
    
    public async getFederatedAuthTestByState(state: string): Promise<FederatedAuthTest | null>{

        const entity: FederatedAuthTestEntity | null = await (await DBDriver.getInstance().getFederatedAuthTestEntity()).findOne({
            where: {
                authState: state
            }
        });
        return entity !== null ? entity.dataValues : null;
    }

    public async deleteFederatedAuthTestByState(state: string): Promise<void>{

        await (await DBDriver.getInstance().getFederatedAuthTestEntity()).destroy({
            where: {
                authState: state
            }
        });
        return;
    }

    public async deleteExpiredData(): Promise<void>{

        await (await DBDriver.getInstance().getFederatedOIDCAuthorizationRelEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });
        await (await DBDriver.getInstance().getPreAuthenticationStateEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            } 
        });
        await (await DBDriver.getInstance().getAuthorizationCodeDataEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        }); 
        await (await DBDriver.getInstance().getRefreshDataEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });
        await (await DBDriver.getInstance().getAuthorizationDeviceCodeDataEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });
        await (await DBDriver.getInstance().getFederatedAuthTestEntity()).destroy({
            where: {
                expiresAtMs: {
                    [Op.lt]: Date.now()
                }
            }
        });

    }

}

export default DBAuthDao;