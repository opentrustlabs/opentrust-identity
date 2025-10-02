import { CaptchaConfig, Client, FederatedOidcProvider, FederatedOidcProviderTenantRel, SecretObjectType, SigningKey } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";
import ClientDao from "../dao/client-dao";
import SigningKeysDao from "../dao/signing-keys-dao";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import { authorizeByScopeAndTenant } from "@/utils/authz-utils";
import { CAPTCHA_CONFIG_SCOPE, CLIENT_SECRET_VIEW_SCOPE, FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE, KEY_SECRET_VIEW_SCOPE } from "@/utils/consts";
import { GraphQLError } from "graphql";
import { ERROR_CODES } from "../models/error";
import JwtServiceUtils from "./jwt-service-utils";
import OIDCServiceUtils from "./oidc-service-utils";
import TenantDao from "../dao/tenant-dao";
import { SecurityEventType } from "../models/security-event";

const kms: Kms = DaoFactory.getInstance().getKms();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();

class ViewSecretService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async viewSecret(objectId: string, objectType: SecretObjectType): Promise<string | null> {
        let decrypted: string | null = null;
        let eventType: SecurityEventType = "client_secret_viewed";
        if(objectType === SecretObjectType.ClientSecret){            
            const client: Client | null = await clientDao.getClientById(objectId);
            if(client){
                const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, CLIENT_SECRET_VIEW_SCOPE, client.tenantId);
                if(!isAuthorized){
                    throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
                }
                decrypted = await kms.decrypt(client.clientSecret);
            }
            
        }
        else if(objectType === SecretObjectType.PrivateKey){
            eventType = "private_key_viewed";
            const signingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(objectId);
            if(signingKey){
                const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, KEY_SECRET_VIEW_SCOPE, signingKey.tenantId);
                if(!isAuthorized){
                    throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
                }
                decrypted = await kms.decrypt(signingKey.privateKeyPkcs8);                
            }
        }
        else if(objectType === SecretObjectType.PrivateKeyPassword){
            eventType = "private_key_password_viewed"
            const signingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(objectId);
            if(signingKey){
                const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, KEY_SECRET_VIEW_SCOPE, signingKey.tenantId);
                if(!isAuthorized){
                    throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
                }
                if(signingKey.keyPassword){
                    decrypted = await kms.decrypt(signingKey.keyPassword);
                }
            }
        }
        else if(objectType === SecretObjectType.OidcProviderClientSecret){
            eventType = "federated_idp_secret_viewed";
            const provider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderById(objectId);
            if(provider){
                if(this.oidcContext.portalUserProfile?.managementAccessTenantId !== this.oidcContext.rootTenant.tenantId){
                    const rels = await federatedOIDCProviderDao.getFederatedOidcProviderTenantRels(undefined, provider.federatedOIDCProviderId);
                    const rel = rels.find(
                        (r: FederatedOidcProviderTenantRel) => r.tenantId === this.oidcContext.portalUserProfile?.managementAccessTenantId
                    );
                    if(!rel){
                        throw new GraphQLError(ERROR_CODES.EC00049.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00049}});
                    }
                    const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE, rel.tenantId);
                    if(!isAuthorized){
                        throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
                    }
                }
                else{
                    const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE, null);
                    if(!isAuthorized){
                        throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
                    }
                }
                if(provider.federatedOIDCProviderClientSecret){
                    decrypted = await kms.decrypt(provider.federatedOIDCProviderClientSecret);
                }
            }
        }
        else if(objectType === SecretObjectType.CaptchaApiKey){
            eventType = "recaptcha_api_key_viewed";
            const captchaConfig: CaptchaConfig | null = await tenantDao.getCaptchaConfig();
            if(captchaConfig && captchaConfig.apiKey){
                const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, CAPTCHA_CONFIG_SCOPE, null);
                if(!isAuthorized){
                    throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
                }
                decrypted = await kms.decrypt(captchaConfig.apiKey);
            }
        }

        const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
        oidcServiceUtils.fireSecurityEvent(eventType, this.oidcContext, this.oidcContext.portalUserProfile, null, authToken);

        return decrypted;
    }

}

export default ViewSecretService;