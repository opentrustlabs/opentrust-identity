import { Client, FederatedOidcProvider, FederatedOidcProviderTenantRel, SecretObjectType, SigningKey } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { DaoFactory } from "../data-sources/dao-factory";
import Kms from "../kms/kms";
import ClientDao from "../dao/client-dao";
import SigningKeysDao from "../dao/signing-keys-dao";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import { authorizeRead } from "@/utils/authz-utils";
import { CLIENT_SECRET_VIEW_SCOPE, FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE, KEY_SECRET_VIEW_SCOPE } from "@/utils/consts";
import { GraphQLError } from "graphql";


const kms: Kms = DaoFactory.getInstance().getKms();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();

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
                const {isAuthorized, errorMessage} = authorizeRead(this.oidcContext, CLIENT_SECRET_VIEW_SCOPE, client.tenantId);
                if(!isAuthorized){
                    throw new GraphQLError(errorMessage || "ERROR");
                }
                decrypted = await kms.decrypt(client.clientSecret);
            }
            
        }
        else if(objectType === SecretObjectType.PrivateKey){
            const signingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(objectId);
            if(signingKey){
                const {isAuthorized, errorMessage} = authorizeRead(this.oidcContext, KEY_SECRET_VIEW_SCOPE, signingKey.tenantId);
                if(!isAuthorized){
                    throw new GraphQLError(errorMessage || "ERROR");
                }
                decrypted = await kms.decrypt(signingKey.privateKeyPkcs8);                
            }
        }
        else if(objectType === SecretObjectType.PrivateKeyPassword){
            const signingKey: SigningKey | null = await signingKeysDao.getSigningKeyById(objectId);
            if(signingKey){
                const {isAuthorized, errorMessage} = authorizeRead(this.oidcContext, KEY_SECRET_VIEW_SCOPE, signingKey.tenantId);
                if(!isAuthorized){
                    throw new GraphQLError(errorMessage || "ERROR");
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
                        throw new GraphQLError("ERROR_NO_PROVIDER_ASSIGNED_TO_TENANT");
                    }
                    const {isAuthorized, errorMessage} = authorizeRead(this.oidcContext, FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE, rel.tenantId);
                    if(!isAuthorized){
                        throw new GraphQLError(errorMessage || "ERROR");
                    }
                }
                else{
                    const {isAuthorized, errorMessage} = authorizeRead(this.oidcContext, FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE, null);
                    if(!isAuthorized){
                        throw new GraphQLError(errorMessage || "ERROR");
                    }
                }
                if(provider.federatedOIDCProviderClientSecret){
                    decrypted = await kms.decrypt(provider.federatedOIDCProviderClientSecret);
                }
            }
        }
        return decrypted;
    }



}

export default ViewSecretService;