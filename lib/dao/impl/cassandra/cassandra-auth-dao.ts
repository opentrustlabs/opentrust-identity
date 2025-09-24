import { PreAuthenticationState, AuthorizationCodeData, RefreshData, AuthorizationDeviceCodeData, FederatedOidcAuthorizationRel, FederatedAuthTest } from "@/graphql/generated/graphql-types";
import AuthDao, { AuthorizationCodeType } from "../../auth-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";


class CassandraAuthDao extends AuthDao {
    
    public async savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("pre_authentication_state");
        const ttlSeconds =  Math.floor( (preAuthenticationState.expiresAtMs - Date.now()) / 1000);
        await mapper.insert(preAuthenticationState, {ttl: ttlSeconds});
        return preAuthenticationState;
    }

    public async getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("pre_authentication_state");
        return mapper.get({token: tk});
    }

    public async deletePreAuthenticationState(tk: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("pre_authentication_state");
        await mapper.remove({token: tk});
        return;
    }

    public async saveAuthorizationCodeData(authorizationCodeData: AuthorizationCodeData): Promise<AuthorizationCodeData> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_code_data");
        const ttlSeconds =  Math.floor( (authorizationCodeData.expiresAtMs - Date.now()) / 1000);
        await mapper.insert(authorizationCodeData, {ttl: ttlSeconds});
        return authorizationCodeData;
    }

    public async getAuthorizationCodeData(code: string): Promise<AuthorizationCodeData | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_code_data");
        return mapper.get({code: code});
    }

    public async deleteAuthorizationCodeData(code: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_code_data");
        await mapper.remove({code:code});
        return;
    }

    public async saveRefreshData(refreshData: RefreshData): Promise<RefreshData> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("refresh_data");
        const ttlSeconds =  Math.floor( (refreshData.expiresAtMs - Date.now()) / 1000);
        await mapper.insert(refreshData, {ttl: ttlSeconds});
        return refreshData;
    }

    public async getRefreshData(refreshToken: string): Promise<RefreshData | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("refresh_data");
        return mapper.get({refreshToken: refreshToken});
    }

    public async deleteRefreshDataByRefreshToken(refreshToken: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("refresh_data");
        await mapper.remove({refreshToken: refreshToken});
        return;
    }

    public async getRefreshDataByUserId(userId: string): Promise<Array<RefreshData>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("refresh_data");
        return mapper.get({userId: userId});
    }

    public async deleteRefreshData(userId: string, tenantId: string, clientId: string): Promise<void> {
        const arrRefreshData: Array<RefreshData> = await this.getRefreshDataByUserId(userId);
        const refreshData = arrRefreshData.find(
            (val: RefreshData) => val.tenantId === tenantId && val.clientId === clientId
        );
        if(refreshData){
            await this.deleteRefreshDataByRefreshToken(refreshData.refreshToken);
        }
        return;        
    }

    public async saveAuthorizationDeviceCodeData(authoriationDeviceCodeData: AuthorizationDeviceCodeData): Promise<AuthorizationDeviceCodeData> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_device_code_data");
        const ttlSeconds =  Math.floor( (authoriationDeviceCodeData.expiresAtMs - Date.now()) / 1000);
        await mapper.insert(authoriationDeviceCodeData, {ttl: ttlSeconds});
        return authoriationDeviceCodeData;
    }

    public async updateAuthorizationDeviceCodeData(authoriationDeviceCodeData: AuthorizationDeviceCodeData): Promise<AuthorizationDeviceCodeData> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_device_code_data");
        const ttlSeconds =  Math.floor( (authoriationDeviceCodeData.expiresAtMs - Date.now()) / 1000);
        await mapper.update(authoriationDeviceCodeData, {ttl: ttlSeconds});
        return authoriationDeviceCodeData;
    }

    public async getAuthorizationDeviceCodeData(code: string, authorizationCodeType: AuthorizationCodeType): Promise<AuthorizationDeviceCodeData | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_device_code_data");
        if(authorizationCodeType === "devicecode"){
            return mapper.get({deviceCode: code});
        }
        else if(authorizationCodeType === "usercode"){
            return mapper.get({userCode: code})
        }
        else{
            return mapper.get({deviceCodeId: code});
        }
    }

    public async deleteAuthorizationDeviceCodeData(deviceCodeId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("authorization_device_code_data");
        await mapper.remove({deviceCodeId: deviceCodeId});
        return;
    }

    public async saveFederatedOIDCAuthorizationRel(federatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel): Promise<FederatedOidcAuthorizationRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_authorization_rel");
        const ttlSeconds =  Math.floor( (federatedOIDCAuthorizationRel.expiresAtMs - Date.now()) / 1000);
        await mapper.insert(federatedOIDCAuthorizationRel, {ttl: ttlSeconds});
        return federatedOIDCAuthorizationRel;
    }

    public async getFederatedOIDCAuthorizationRel(state: string): Promise<FederatedOidcAuthorizationRel | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_authorization_rel");
        return mapper.get({state: state});
    }

    public async deleteFederatedOIDCAuthorizationRel(state: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_oidc_authorization_rel");
        await mapper.remove({state: state});
    }

    public async deleteExpiredData(): Promise<void> {
        // NO OP.
        // All of the data inserted or updated in the DAO class have a TTL associated with them.
    }

    public async saveFederatedAuthTest(federatedAuthTest: FederatedAuthTest): Promise<FederatedAuthTest> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_auth_test");
        const ttlSeconds =  Math.floor( (federatedAuthTest.expiresAtMs - Date.now()) / 1000);
        await mapper.insert(federatedAuthTest, {ttl: ttlSeconds});
        return federatedAuthTest;
    }

    public async getFederatedAuthTestByState(state: string): Promise<FederatedAuthTest | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_auth_test");
        return mapper.get({authState: state});
    }

    public async deleteFederatedAuthTestByState(state: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("federated_auth_test");
        await mapper.remove({authState: state});
        return;
    }

}

export default CassandraAuthDao;