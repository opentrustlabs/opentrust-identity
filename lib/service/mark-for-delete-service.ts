import { Client, DeletionStatus, MarkForDelete, MarkForDeleteObjectType } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { DaoFactory } from "../data-sources/dao-factory";
import TenantDao from "../dao/tenant-dao";
import MarkForDeleteDao from "../dao/mark-for-delete-dao";
import ClientDao from "../dao/client-dao";
import IdentityDao from "../dao/identity-dao";
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";
import ScopeDao from "../dao/scope-dao";
import RateLimitDao from "../dao/rate-limit-dao";
import AuthenticationGroupDao from "../dao/authentication-group-dao";
import AuthorizationGroupDao from "../dao/authorization-group-dao";
import SigningKeysDao from "../dao/signing-keys-dao";
import { GraphQLError } from "graphql/error";
import { randomUUID } from 'crypto'; 



const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const markForDeleteDao: MarkForDeleteDao = DaoFactory.getInstance().getMarkForDeleteDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const oidcProviderDao: FederatedOIDCProviderDao = DaoFactory.getInstance().getFederatedOIDCProvicerDao();
const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const rateLimitDao: RateLimitDao = DaoFactory.getInstance().getRateLimitDao();
const authnGroupDao: AuthenticationGroupDao = DaoFactory.getInstance().getAuthenticationGroupDao();
const authzGroupDao: AuthorizationGroupDao = DaoFactory.getInstance().getAuthorizationGroupDao();
const signingKeysDao: SigningKeysDao = DaoFactory.getInstance().getSigningKeysDao();

class MarkForDeleteService {

    oidcContext: OIDCContext;
    
    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async markForDelete(markForDelete: MarkForDelete): Promise<MarkForDelete> {
        let object: any | null = null;

        if(markForDelete.markForDeleteObjectType === MarkForDeleteObjectType.Client){
            object = await clientDao.getClientById(markForDelete.objectId);
        }
        else if(markForDelete.markForDeleteObjectType === MarkForDeleteObjectType.Tenant){
            object = await tenantDao.getTenantById(markForDelete.objectId);
        }
        else if(markForDelete.markForDeleteObjectType === MarkForDeleteObjectType.User){
            object = await identityDao.getUserBy("id", markForDelete.objectId);
        }
        else if(markForDelete.markForDeleteObjectType === MarkForDeleteObjectType.FederatedOidcProvider){
            object = await oidcProviderDao.getFederatedOidcProviderById(markForDelete.objectId);
        }
        else if(markForDelete.markForDeleteObjectType === MarkForDeleteObjectType.Scope){
            object = await scopeDao.getScopeById(markForDelete.objectId);
        }
        else if(markForDelete.markForDeleteObjectType === MarkForDeleteObjectType.RateLimitServiceGroup){
            object = await rateLimitDao.getRateLimitServiceGroupById(markForDelete.objectId);
        }
        else if(markForDelete.markForDeleteObjectType === MarkForDeleteObjectType.AuthenticationGroup){
            object = await authnGroupDao.getAuthenticationGroupById(markForDelete.objectId);
        }
        else if(markForDelete.markForDeleteObjectType === MarkForDeleteObjectType.AuthorizationGroup){
            object = await authzGroupDao.getAuthorizationGroupById(markForDelete.objectId);
        }
        else if(markForDelete.markForDeleteObjectType === MarkForDeleteObjectType.SigningKey){
            object = await signingKeysDao.getSigningKeyById(markForDelete.objectId);
        }
        if(object === null){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_OBJECT_FOR_DELETION");
        }

        // Now update the individual records with the mark for delete flag before 
        // submitting the mark for delete record.
        if(markForDelete.markForDeleteObjectType === MarkForDeleteObjectType.Client){
            const c: Client = object as Client;
            c.markForDelete = true;
            await clientDao.updateClient(c);
        }

        markForDelete.markForDeleteId = randomUUID().toString();
        markForDelete.submittedDate = Date.now();
        markForDelete.submittedBy = "anonymous";
        
        
        
        await markForDeleteDao.markForDelete(markForDelete);



        return Promise.resolve(markForDelete);
    }

    public async getMarkForDeleteById(markForDeleteId: string): Promise<MarkForDelete | null> {
        return markForDeleteDao.getMarkForDeleteById(markForDeleteId);
    }

    public async getDeletionStatus(markForDeleteId: string): Promise<Array<DeletionStatus>> {
        return markForDeleteDao.getDeletionStatus(markForDeleteId);
    }

}

export default MarkForDeleteService