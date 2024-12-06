import { PreAuthenticationState, AuthorizationState, RefreshData, ExternalOidcAuthorizationRel } from "@/graphql/generated/graphql-types";
import AuthDao from "@/lib/dao/auth-dao";
import { AUTHORIZATION_STATE_FILE, EXTERNAL_OIDC_AUTHORIZATION_REL_FILE, PRE_AUTHENTICATION_STATE_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";
import { writeFileSync } from "node:fs";
import path from "node:path";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedAuthDao extends AuthDao {

    savePreAuthenticationState(preAuthenticationState: PreAuthenticationState): Promise<PreAuthenticationState> {
        const states: Array<PreAuthenticationState> = JSON.parse(getFileContents(`${dataDir}/${PRE_AUTHENTICATION_STATE_FILE}`, "[]"));
        states.push(preAuthenticationState);
        writeFileSync(`${dataDir}/${PRE_AUTHENTICATION_STATE_FILE}`, JSON.stringify(states), {encoding: "utf-8"});
        return Promise.resolve(preAuthenticationState);
    }

    getPreAuthenticationState(tk: string): Promise<PreAuthenticationState | null> {
        const states: Array<PreAuthenticationState> = JSON.parse(getFileContents(`${dataDir}/${PRE_AUTHENTICATION_STATE_FILE}`, "[]"));
        const state: PreAuthenticationState | undefined = states.find(
            (state: PreAuthenticationState) => state.token === tk
        );
        return state ? Promise.resolve(state) :  Promise.resolve(null);
    }

    deletePreAuthenticationState(tk: String): Promise<void> {
        let states: Array<PreAuthenticationState> = JSON.parse(getFileContents(`${dataDir}/${PRE_AUTHENTICATION_STATE_FILE}`, "[]"));
        states = states.filter(
            (state: PreAuthenticationState) => state.token !== tk
        )
        writeFileSync(`${dataDir}/${PRE_AUTHENTICATION_STATE_FILE}`, JSON.stringify(states), {encoding: "utf-8"});
        return Promise.resolve();
    }

    
    saveAuthorizationState(authorizationState: AuthorizationState): Promise<AuthorizationState> {
        const authCodes: Array<AuthorizationState> = JSON.parse(getFileContents(`${dataDir}/${AUTHORIZATION_STATE_FILE}`, "[]"));
        authCodes.push(authorizationState);
        writeFileSync(`${dataDir}/${AUTHORIZATION_STATE_FILE}`, JSON.stringify(authCodes), {encoding: "utf-8"});
        return Promise.resolve(authorizationState);
    }
    getAuthorizationState(code: string): Promise<AuthorizationState | null> {
        const authCodes: Array<AuthorizationState> = JSON.parse(getFileContents(`${dataDir}/${AUTHORIZATION_STATE_FILE}`, "[]"));
        const authCode: AuthorizationState | undefined = authCodes.find(
            (a: AuthorizationState) => a.code === code
        );
        return authCode ? Promise.resolve(authCode) : Promise.resolve(null);
    }
    deleteAuthorizationState(code: string): Promise<void> {
        let authCodes: Array<AuthorizationState> = JSON.parse(getFileContents(`${dataDir}/${AUTHORIZATION_STATE_FILE}`, "[]"));
        authCodes = authCodes.filter(
            (a: AuthorizationState) => a.code !== code
        )
        writeFileSync(`${dataDir}/${AUTHORIZATION_STATE_FILE}`, JSON.stringify(authCodes), {encoding: "utf-8"});
        return Promise.resolve();
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
        const rels: Array<ExternalOidcAuthorizationRel> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_AUTHORIZATION_REL_FILE}`, "[]"));
        rels.push(externalOIDCAuthorizationRel);
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_AUTHORIZATION_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve(externalOIDCAuthorizationRel);        
    }

    getExternalOIDCAuthorizationRel(state: string): Promise<ExternalOidcAuthorizationRel | null> {
        const rels: Array<ExternalOidcAuthorizationRel> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_AUTHORIZATION_REL_FILE}`, "[]"));
        const rel: ExternalOidcAuthorizationRel | undefined = rels.find(
            (rel: ExternalOidcAuthorizationRel) => rel.state === state
        )
        return rel ? Promise.resolve(rel) : Promise.resolve(null);
    }

    deleteExternalOIDCAuthorizationRel(state: string): Promise<void> {
        let rels: Array<ExternalOidcAuthorizationRel> = JSON.parse(getFileContents(`${dataDir}/${EXTERNAL_OIDC_AUTHORIZATION_REL_FILE}`, "[]"));
        rels = rels.filter(
            (rel: ExternalOidcAuthorizationRel) => rel.state !== state
        )
        writeFileSync(`${dataDir}/${EXTERNAL_OIDC_AUTHORIZATION_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve();
    }

}

export default FSBasedAuthDao;