import { PreAuthenticationState, AuthorizationCodeData, RefreshData, AuthorizationDeviceCodeData, FederatedOidcAuthorizationRel, FederatedAuthTest } from "@/graphql/generated/graphql-types";
import AuthDao, { AuthorizationCodeType } from "../../auth-dao";


class CassandraAuthDao extends AuthDao {
    
    public async savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState> {
        throw new Error("Method not implemented.");
    }

    public async getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null> {
        throw new Error("Method not implemented.");
    }

    public async deletePreAuthenticationState(tk: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async saveAuthorizationCodeData(authorizationCodeData: AuthorizationCodeData): Promise<AuthorizationCodeData> {
        throw new Error("Method not implemented.");
    }

    public async getAuthorizationCodeData(code: string): Promise<AuthorizationCodeData | null> {
        throw new Error("Method not implemented.");
    }

    public async deleteAuthorizationCodeData(code: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async saveRefreshData(refreshData: RefreshData): Promise<RefreshData> {
        throw new Error("Method not implemented.");
    }

    public async getRefreshData(refreshToken: string): Promise<RefreshData | null> {
        throw new Error("Method not implemented.");
    }

    public async deleteRefreshDataByRefreshToken(refreshToken: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getRefreshDataByUserId(userId: string): Promise<Array<RefreshData>> {
        throw new Error("Method not implemented.");
    }

    public async deleteRefreshData(userId: string, tenantId: string, clientId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async saveAuthorizationDeviceCodeData(authoriationDeviceCodeData: AuthorizationDeviceCodeData): Promise<AuthorizationDeviceCodeData> {
        throw new Error("Method not implemented.");
    }

    public async updateAuthorizationDeviceCodeData(authoriationDeviceCodeData: AuthorizationDeviceCodeData): Promise<AuthorizationDeviceCodeData> {
        throw new Error("Method not implemented.");
    }

    public async getAuthorizationDeviceCodeData(code: string, authorizationCodeType: AuthorizationCodeType): Promise<AuthorizationDeviceCodeData | null> {
        throw new Error("Method not implemented.");
    }

    public async deleteAuthorizationDeviceCodeData(deviceCodeId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async saveFederatedOIDCAuthorizationRel(federatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel): Promise<FederatedOidcAuthorizationRel> {
        throw new Error("Method not implemented.");
    }

    public async getFederatedOIDCAuthorizationRel(state: string): Promise<FederatedOidcAuthorizationRel | null> {
        throw new Error("Method not implemented.");
    }

    public async deleteFederatedOIDCAuthorizationRel(state: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteExpiredData(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async saveFederatedAuthTest(federatedAuthTest: FederatedAuthTest): Promise<FederatedAuthTest> {
        throw new Error("Method not implemented.");
    }

    public async getFederatedAuthTestByState(state: string): Promise<FederatedAuthTest | null> {
        throw new Error("Method not implemented.");
    }

    public async deleteFederatedAuthTestByState(state: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default CassandraAuthDao;