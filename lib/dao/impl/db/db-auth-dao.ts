import { PreAuthenticationState, AuthorizationCodeData, RefreshData, FederatedOidcAuthorizationRel, AuthorizationDeviceCodeData, FederatedAuthTest } from "@/graphql/generated/graphql-types";
import AuthDao, { AuthorizationCodeType } from "../../auth-dao";
import RDBDriver from "@/lib/data-sources/rdb";
import { LessThan } from "typeorm";

class DBAuthDao extends AuthDao {

    public async getRefreshDataByUserId(userId: string): Promise<Array<RefreshData>> {
        
        const refreshDataRepo = await RDBDriver.getInstance().getRefreshDataRepository();
        const arr = await refreshDataRepo.find({
            where: {
                userId: userId
            }
        })

        return arr;
    }

    public async deleteRefreshData(userId: string, tenantId: string, clientId: string): Promise<void> {
        const refreshDataRepo = await RDBDriver.getInstance().getRefreshDataRepository();
        await refreshDataRepo.delete({
            userId: userId,
            clientId: clientId,
            tenantId: tenantId
        });
        
        return Promise.resolve();
    }

    public async savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState> {
        const preAuthRepo = await RDBDriver.getInstance().getPreAuthenticationStateRepository();
        await preAuthRepo.insert(preAuthenticationState);        
        return Promise.resolve(preAuthenticationState);
    }

    public async getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null> {
        const preAuthRepo = await RDBDriver.getInstance().getPreAuthenticationStateRepository();
        const result = await preAuthRepo.findOne({
            where: {
                token: tk
            }
        });
        return result;        
    }

    public async deletePreAuthenticationState(tk: string): Promise<void> {
        const preAuthRepo = await RDBDriver.getInstance().getPreAuthenticationStateRepository();
        await preAuthRepo.delete({
            token: tk
        });    
        
        return Promise.resolve();
    }

    public async saveAuthorizationCodeData(authorizationCodeData: AuthorizationCodeData): Promise<AuthorizationCodeData> {
        const authCodeDataRepo = await RDBDriver.getInstance().getAuthorizationCodeDataRepository();
        await authCodeDataRepo.insert(authorizationCodeData)        
        return Promise.resolve(authorizationCodeData);
    }

    public async getAuthorizationCodeData(code: string): Promise<AuthorizationCodeData | null> {
        const authCodeDataRepo = await RDBDriver.getInstance().getAuthorizationCodeDataRepository();
        const result = await authCodeDataRepo.findOne({
            where: {
                code: code
            }
        })
        return result;        
    }

    public async deleteAuthorizationCodeData(code: string): Promise<void> {
        const authCodeDataRepo = await RDBDriver.getInstance().getAuthorizationCodeDataRepository();
        await authCodeDataRepo.delete({
            code: code
        });        
        return Promise.resolve();
    }

    public async saveRefreshData(refreshData: RefreshData): Promise<RefreshData> {
        const refreshDataRepo = await RDBDriver.getInstance().getRefreshDataRepository();
        await refreshDataRepo.insert(refreshData);
        return Promise.resolve(refreshData);
    }

    public async getRefreshData(refreshToken: string): Promise<RefreshData | null> {
        const refreshDataRepo = await RDBDriver.getInstance().getRefreshDataRepository();
        const result = await refreshDataRepo.findOne({
            where: {
                refreshToken: refreshToken
            }
        });
        return result;        
    }

    public async deleteRefreshDataByRefreshToken(refreshToken: string): Promise<void> {

        const refreshDataRepo = await RDBDriver.getInstance().getRefreshDataRepository();
        await refreshDataRepo.delete({
            refreshToken: refreshToken
        });        
        return Promise.resolve();
    }

    public async saveAuthorizationDeviceCodeData(authoriationDeviceCodeData: AuthorizationDeviceCodeData): Promise<AuthorizationDeviceCodeData>{
        const authDeviceCodeRepo = await RDBDriver.getInstance().getAuthorizationDeviceCodeDataRepository();
        await authDeviceCodeRepo.insert(authoriationDeviceCodeData);
        return authoriationDeviceCodeData;
    }

    public async updateAuthorizationDeviceCodeData(authoriationDeviceCodeData: AuthorizationDeviceCodeData): Promise<AuthorizationDeviceCodeData>{
        const authDeviceCodeRepo = await RDBDriver.getInstance().getAuthorizationDeviceCodeDataRepository();
        await authDeviceCodeRepo.update(
            {
                deviceCodeId: authoriationDeviceCodeData.deviceCodeId
            },
            authoriationDeviceCodeData
        );        
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
        const authDeviceCodeRepo = await RDBDriver.getInstance().getAuthorizationDeviceCodeDataRepository();
        const result = await authDeviceCodeRepo.findOne({
            where: whereParams
        });
        return result;

    }
    
    public async deleteAuthorizationDeviceCodeData(deviceCodeId: string): Promise<void>{
        const authDeviceCodeRepo = await RDBDriver.getInstance().getAuthorizationDeviceCodeDataRepository();
        await authDeviceCodeRepo.delete({
            deviceCodeId: deviceCodeId
        });

    }

    
    public async saveFederatedOIDCAuthorizationRel(federatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel): Promise<FederatedOidcAuthorizationRel> {

        const federatedAuthRelRepo = await RDBDriver.getInstance().getFederatedOIDCAuthorizationRelRepository();
        await federatedAuthRelRepo.insert(federatedOIDCAuthorizationRel);
        return Promise.resolve(federatedOIDCAuthorizationRel);
    }
    
    public async getFederatedOIDCAuthorizationRel(state: string): Promise<FederatedOidcAuthorizationRel | null> {
        const federatedAuthRelRepo = await RDBDriver.getInstance().getFederatedOIDCAuthorizationRelRepository();
        const result = await federatedAuthRelRepo.findOne({
            where: {
                state: state
            }
        });
        return result;
    }

    public async deleteFederatedOIDCAuthorizationRel(state: string): Promise<void> {

        const federatedAuthRelRepo = await RDBDriver.getInstance().getFederatedOIDCAuthorizationRelRepository();
        await federatedAuthRelRepo.delete({
            state: state
        });
        return Promise.resolve();
    }

    public async saveFederatedAuthTest(federatedAuthTest: FederatedAuthTest): Promise<FederatedAuthTest>{

        const federatedAuthTestRepo = await RDBDriver.getInstance().getFederatedAuthTestRepository();
        await federatedAuthTestRepo.insert(federatedAuthTest);        
        return federatedAuthTest;
    }
    
    public async getFederatedAuthTestByState(state: string): Promise<FederatedAuthTest | null>{
        const federatedAuthTestRepo = await RDBDriver.getInstance().getFederatedAuthTestRepository();
        const result = await federatedAuthTestRepo.findOne({
            where: {
                authState: state
            }
        });
        return result;
    }

    public async deleteFederatedAuthTestByState(state: string): Promise<void>{
        
        const federatedAuthTestRepo = await RDBDriver.getInstance().getFederatedAuthTestRepository();
        await federatedAuthTestRepo.delete({
            authState: state
        });
        return;
    }

    public async deleteExpiredData(): Promise<void>{

        const oidcAuthRelRepo = await RDBDriver.getInstance().getFederatedOIDCAuthorizationRelRepository();
        await oidcAuthRelRepo.delete({
            expiresAtMs: LessThan(Date.now())
        });

        const preauthStateRepo = await RDBDriver.getInstance().getPreAuthenticationStateRepository();
        await preauthStateRepo.delete({
            expiresAtMs: LessThan(Date.now())
        });
        
        const authCodeDataRepo = await RDBDriver.getInstance().getAuthorizationCodeDataRepository();
        await authCodeDataRepo.delete({
            expiresAtMs: LessThan(Date.now())
        });
        
        const refreshDataRepo = await RDBDriver.getInstance().getRefreshDataRepository();
        await refreshDataRepo.delete({
            expiresAtMs: LessThan(Date.now())
        });
        
        const authDeviceCodeRepo = await RDBDriver.getInstance().getAuthorizationDeviceCodeDataRepository();
        await authDeviceCodeRepo.delete({
            expiresAtMs: LessThan(Date.now())
        });
        
        const federatedAuthTestRepo = await RDBDriver.getInstance().getFederatedAuthTestRepository();
        await federatedAuthTestRepo.delete({
            expiresAtMs: LessThan(Date.now())
        });

    }

}

export default DBAuthDao;