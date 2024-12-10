import { PreAuthenticationState, AuthorizationCodeData, RefreshData, FederatedOidcAuthorizationRel } from "@/graphql/generated/graphql-types";
import AuthDao from "@/lib/dao/auth-dao";
import { AUTHORIZATION_CODE_DATA_FILE, FEDERATED_OIDC_AUTHORIZATION_REL_FILE, PRE_AUTHENTICATION_STATE_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";
import { writeFileSync } from "node:fs";
import path from "node:path";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedAuthDao extends AuthDao {

    public async savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState> {
        const states: Array<PreAuthenticationState> = JSON.parse(getFileContents(`${dataDir}/${PRE_AUTHENTICATION_STATE_FILE}`, "[]"));
        states.push(preAuthenticationState);
        writeFileSync(`${dataDir}/${PRE_AUTHENTICATION_STATE_FILE}`, JSON.stringify(states), {encoding: "utf-8"});
        return Promise.resolve(preAuthenticationState);
    }

    public async getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null> {
        const states: Array<PreAuthenticationState> = JSON.parse(getFileContents(`${dataDir}/${PRE_AUTHENTICATION_STATE_FILE}`, "[]"));
        const state: PreAuthenticationState | undefined = states.find(
            (state: PreAuthenticationState) => state.token === tk
        );
        return state ? Promise.resolve(state) :  Promise.resolve(null);
    }

    public async deletePreAuthenticationState(tk: String): Promise<void> {
        let states: Array<PreAuthenticationState> = JSON.parse(getFileContents(`${dataDir}/${PRE_AUTHENTICATION_STATE_FILE}`, "[]"));
        states = states.filter(
            (state: PreAuthenticationState) => state.token !== tk
        )
        writeFileSync(`${dataDir}/${PRE_AUTHENTICATION_STATE_FILE}`, JSON.stringify(states), {encoding: "utf-8"});
        return Promise.resolve();
    }

    
    public async saveAuthorizationCodeData(authorizationState: AuthorizationCodeData): Promise<AuthorizationCodeData> {
        const authCodes: Array<AuthorizationCodeData> = JSON.parse(getFileContents(`${dataDir}/${AUTHORIZATION_CODE_DATA_FILE}`, "[]"));
        authCodes.push(authorizationState);
        writeFileSync(`${dataDir}/${AUTHORIZATION_CODE_DATA_FILE}`, JSON.stringify(authCodes), {encoding: "utf-8"});
        return Promise.resolve(authorizationState);
    }
    public async getAuthorizationCodeData(code: string): Promise<AuthorizationCodeData | null> {
        const authCodes: Array<AuthorizationCodeData> = JSON.parse(getFileContents(`${dataDir}/${AUTHORIZATION_CODE_DATA_FILE}`, "[]"));
        const authCode: AuthorizationCodeData | undefined = authCodes.find(
            (a: AuthorizationCodeData) => a.code === code
        );
        return authCode ? Promise.resolve(authCode) : Promise.resolve(null);
    }
    public async deleteAuthorizationCodeData(code: string): Promise<void> {
        let authCodes: Array<AuthorizationCodeData> = JSON.parse(getFileContents(`${dataDir}/${AUTHORIZATION_CODE_DATA_FILE}`, "[]"));
        authCodes = authCodes.filter(
            (a: AuthorizationCodeData) => a.code !== code
        )
        writeFileSync(`${dataDir}/${AUTHORIZATION_CODE_DATA_FILE}`, JSON.stringify(authCodes), {encoding: "utf-8"});
        return Promise.resolve();
    }


    public async saveRefreshData(refreshData: RefreshData): Promise<RefreshData> {
        throw new Error("Method not implemented.");
    }
    public async getRefreshData(refreshToken: string): Promise<RefreshData | null> {
        throw new Error("Method not implemented.");
    }
    public async deleteRefreshData(refreshToken: string): Promise<void> {
        throw new Error("Method not implemented.");
    }


    public async saveFederatedOIDCAuthorizationRel(federatedOIDCAuthorizationRel: FederatedOidcAuthorizationRel): Promise<FederatedOidcAuthorizationRel> {
        const rels: Array<FederatedOidcAuthorizationRel> = JSON.parse(getFileContents(`${dataDir}/${FEDERATED_OIDC_AUTHORIZATION_REL_FILE}`, "[]"));
        rels.push(federatedOIDCAuthorizationRel);
        writeFileSync(`${dataDir}/${FEDERATED_OIDC_AUTHORIZATION_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve(federatedOIDCAuthorizationRel);        
    }

    public async getFederatedOIDCAuthorizationRel(state: string): Promise<FederatedOidcAuthorizationRel | null> {
        const rels: Array<FederatedOidcAuthorizationRel> = JSON.parse(getFileContents(`${dataDir}/${FEDERATED_OIDC_AUTHORIZATION_REL_FILE}`, "[]"));
        const rel: FederatedOidcAuthorizationRel | undefined = rels.find(
            (rel: FederatedOidcAuthorizationRel) => rel.state === state
        )
        return rel ? Promise.resolve(rel) : Promise.resolve(null);
    }

    public async deleteFederatedOIDCAuthorizationRel(state: string): Promise<void> {
        let rels: Array<FederatedOidcAuthorizationRel> = JSON.parse(getFileContents(`${dataDir}/${FEDERATED_OIDC_AUTHORIZATION_REL_FILE}`, "[]"));
        rels = rels.filter(
            (rel: FederatedOidcAuthorizationRel) => rel.state !== state
        )
        writeFileSync(`${dataDir}/${FEDERATED_OIDC_AUTHORIZATION_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve();
    }

}

export default FSBasedAuthDao;