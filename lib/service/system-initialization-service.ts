import { AuthenticationState, ErrorDetail, SystemInitializationInput, SystemInitializationReadyResponse, SystemInitializationResponse, Tenant, UserAuthenticationStateResponse } from "@/graphql/generated/graphql-types";
import { DaoFactory } from "../data-sources/dao-factory";
import ClientDao from "../dao/client-dao";
import TenantDao from "../dao/tenant-dao";
import AuthorizationGroupDao from "../dao/authorization-group-dao";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import ScopeDao from "../dao/scope-dao";
import { getOpenSearchClient } from "../data-sources/search";
import ChangeEventDao from "../dao/change-event-dao";
import Kms from "../kms/kms";
import ContactDao from "../dao/contact-dao";
import { readFileSync } from "node:fs";
import { createPrivateKey, createPublicKey, KeyObject, PrivateKeyInput, PublicKeyInput, randomUUID, X509Certificate } from "node:crypto";
import { ERROR_CODES } from "../models/error";
import { logWithDetails } from "../logging/logger";
import BaseSearchService from "./base-search-service";
import JwtServiceUtils from "./jwt-service-utils";
import { PRINCIPAL_TYPE_SYSTEM_INIT_USER, SYSTEM_INITIALIZATION_KEY_ID } from "@/utils/consts";
import { JWTPayload } from "jose";


const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const authorizationGroupDao: AuthorizationGroupDao = DaoFactory.getInstance().getAuthorizationGroupDao();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const searchClient = getOpenSearchClient();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();
const kms: Kms = DaoFactory.getInstance().getKms();
const contactDao: ContactDao = DaoFactory.getInstance().getContactDao();
const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();

const {
    SYSTEM_INIT,
    SYSTEM_INIT_CERTIFICATE_FILE,
    SMTP_ENABLED,
    EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT,
    SECURITY_EVENT_CALLBACK_URI,
    KMS_STRATEGY,
    AUTH_DOMAIN,
    MFA_ISSUER,
    MFA_ORIGIN,
    MFA_ID
} = process.env;

const VALID_KMS_STRATEGIES = ["googlekms", "awskms", "azurekms", "tencentkms", "custom", "filesystem", "none"];

class SystemInitializationService extends BaseSearchService {


    public async systemInitializationReady(): Promise<SystemInitializationReadyResponse> {
        const preReqErrors = await this.hasPreRequisites();
        const warnings = await this.hasWarnings();
        
        const systemInitializationReadyResponse: SystemInitializationReadyResponse = {
            systemInitializationReady: preReqErrors.length === 0,
            systemInitializationReadyErrors: preReqErrors,
            systemInitializationWarnings: warnings
        }
        return systemInitializationReadyResponse;
    }

    public async systemInitializationAuthentication(privateKey: string, password: string | null): Promise<UserAuthenticationStateResponse> {

        const response: UserAuthenticationStateResponse = {
            userAuthenticationState: {
                authenticationSessionToken: "",
                authenticationState: AuthenticationState.Error,
                authenticationStateOrder: 0,
                authenticationStateStatus: "",
                deviceCodeId: undefined,
                expiresAtMs: 0,
                preAuthToken: undefined,
                returnToUri: undefined,
                tenantId: "",
                userId: ""
            },
            accessToken: "",
            authenticationError: ERROR_CODES.EC00003,
            tokenExpiresAtMs: 0
        };

        const privateKeyInput: PrivateKeyInput = {
            key: privateKey,
            encoding: "utf-8",
            format: "pem",
            passphrase: password !== null ? password : undefined
        };                    
        const privateKeyObject: KeyObject = createPrivateKey(privateKeyInput);

        const cert = readFileSync(SYSTEM_INIT_CERTIFICATE_FILE || "");

        const publicKeyInput: PublicKeyInput = {
            key: cert,
            encoding: "utf-8",
            format: "pem"
        };
        
        const publicKeyObject = createPublicKey(publicKeyInput);
        const principal: JWTPayload = {
            sub: randomUUID().toString(),
            iss: `${AUTH_DOMAIN}/api/`,
            aud: `${AUTH_DOMAIN}/api/`,
            iat: Date.now() / 1000,
            exp: (Date.now() / 1000) + (2 * 60 * 60),
            at_hash: "",
            name: "",
            given_name: "",
            family_name: "",
            middle_name: "",
            nickname: "",
            preferred_username: "",
            profile: "",
            phone_number: "",
            address: "",
            email: "",
            country_code: "",
            language_code: "en",
            jti: randomUUID().toString(),
            tenant_id: "",
            tenant_name: "",
            client_id: "",
            client_name: "",
            client_type: "",
            principal_type: PRINCIPAL_TYPE_SYSTEM_INIT_USER            
        }

        
        try{
            const jwt: string = await jwtServiceUtils.signJwtWithKey(principal, privateKeyObject, SYSTEM_INITIALIZATION_KEY_ID);
            const p = await jwtServiceUtils.validateJwtWithCertificate(jwt, publicKeyObject);
            if(!p.payload){
                return response;    
            }
            else{
                response.userAuthenticationState.authenticationState = AuthenticationState.Completed;
                response.accessToken = jwt;
                response.tokenExpiresAtMs = Date.now() + (2 * 60 * 60 * 1000);
                return response;
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(err: any){
            logWithDetails("error", `Error creating or validating the JWT for system initialization: ${err.message}`, {});
            return response;
        }

    }

    public async initializeSystem(systemInitializationInput: SystemInitializationInput): Promise<SystemInitializationResponse> {
        const response: SystemInitializationResponse = {

        };
        return response;
    }


    protected async hasWarnings(): Promise<Array<ErrorDetail>> {
        const arr: Array<ErrorDetail> = [];
        if(!SMTP_ENABLED || SMTP_ENABLED !== "true"){
            arr.push(ERROR_CODES.EC00002);
        }
        if(SMTP_ENABLED === "true" && (!EMAIL_SERVER_HOST || !EMAIL_SERVER_PORT)){
            arr.push(ERROR_CODES.EC00002);
        }
        if(!SECURITY_EVENT_CALLBACK_URI){
            arr.push(ERROR_CODES.EC00002);
        }

        return arr;
    }

    protected async hasPreRequisites(): Promise<Array<ErrorDetail>> {

        const arr: Array<ErrorDetail> = [];

        if (!SYSTEM_INIT || SYSTEM_INIT !== "true") {
            arr.push(ERROR_CODES.EC00001);
        }
        if (!SYSTEM_INIT_CERTIFICATE_FILE) {
            arr.push(ERROR_CODES.EC00001);
        }
        const x509Cert: X509Certificate | null = this.getInitializationCertificate();
        if(x509Cert === null){
            arr.push(ERROR_CODES.EC00001);
        }

        try{
            const tenant: Tenant | null = await tenantDao.getRootTenant();
            if(tenant !== null){
                arr.push(ERROR_CODES.EC00001);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(err: any){
            logWithDetails("error", `Error reading tenant information for initialization: ${err.message}`, {});
            arr.push(ERROR_CODES.EC00001);
        }

        try {
            const objectSearchResults = await this._objectSearch(
                {
                    page: 1,
                    perPage: 10
                },
                []
            );
            if(!objectSearchResults){
                arr.push(ERROR_CODES.EC00001);
            }
            const relSearch = await this._relSearch(
                {
                    page: 1,
                    perPage: 10
                },
                []
            );
            if(!relSearch){
                arr.push(ERROR_CODES.EC00001);
            }
        }
        catch(err: any){
            logWithDetails("error", `Error querying search index for initialization: ${err.message}`, {});
            arr.push(ERROR_CODES.EC00001);
        }
        if(!KMS_STRATEGY || !VALID_KMS_STRATEGIES.includes(KMS_STRATEGY)){
            arr.push(ERROR_CODES.EC00001);
        }
        if(!AUTH_DOMAIN){
            arr.push(ERROR_CODES.EC00001);
        }
        if(!MFA_ISSUER || !MFA_ORIGIN || !MFA_ID){
            arr.push(ERROR_CODES.EC00001);
        }

        return arr;
    }

    public getInitializationCertificate(): X509Certificate | null {
        try {
            const cert = readFileSync(SYSTEM_INIT_CERTIFICATE_FILE || "");
            const x509Cert: X509Certificate = new X509Certificate(cert);
            const d: Date = new Date(x509Cert.validTo);
            if (d.getTime() < Date.now()) {
                return null;
            }
            return x509Cert;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (err: any) {
            logWithDetails("error", `Error reading or parsing certificate file for initialization: ${err.message}`, {});
            return null;
        }
    }
}


export default SystemInitializationService;
