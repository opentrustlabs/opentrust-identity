import { Client, FederatedOidcProvider, FederatedOidcProviderTenantRel, SecretObjectType, SigningKey } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";
import ClientDao from "../dao/client-dao";
import SigningKeysDao from "../dao/signing-keys-dao";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import { authorizeByScopeAndTenant } from "@/utils/authz-utils";
import { CLIENT_SECRET_VIEW_SCOPE, FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE, KEY_SECRET_VIEW_SCOPE } from "@/utils/consts";
import { GraphQLError } from "graphql";
import { ERROR_CODES } from "../models/error";
import JwtServiceUtils from "./jwt-service-utils";
import OIDCServiceUtils from "./oidc-service-utils";

const kms: Kms = DaoFactory.getInstance().getKms();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const jwtServiceUtils: JwtServiceUtils = new JwtServiceUtils();
const oidcServiceUtils: OIDCServiceUtils = new OIDCServiceUtils();

class ViewSecretService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async viewSecret(objectId: string, objectType: SecretObjectType): Promise<string | null> {
        let decrypted: string | null = null;
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
            const signingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(objectId);
            if(signingKey){
                const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, KEY_SECRET_VIEW_SCOPE, signingKey.tenantId);
                if(!isAuthorized){
                    throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
                }
                if(signingKey.password){
                    decrypted = await kms.decrypt(signingKey.password);
                }
            }
        }
        else if(objectType === SecretObjectType.OidcProviderClientSecret){
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

        if(this.oidcContext.portalUserProfile){
            const authToken = await jwtServiceUtils.getAuthTokenForOutboundCalls();
            oidcServiceUtils.fireSecurityEvent("secret_viewed", this.oidcContext, this.oidcContext.portalUserProfile, null, authToken);
        }

        return decrypted;
    }



}

export default ViewSecretService;