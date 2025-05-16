import { AuthenticationGroup, AuthorizationGroup, Client, DeletionStatus, FederatedOidcProvider, MarkForDelete, MarkForDeleteObjectType, RateLimitServiceGroup, Scope, SigningKey, Tenant, User } from "@/graphql/generated/graphql-types";
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
import { SCOPE_USE_IAM_MANAGEMENT } from "@/utils/consts";

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

        if(markForDelete.objectType === MarkForDeleteObjectType.Client){
            object = await clientDao.getClientById(markForDelete.objectId);
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.Tenant){
            object = await tenantDao.getTenantById(markForDelete.objectId);
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.User){
            object = await identityDao.getUserBy("id", markForDelete.objectId);
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.FederatedOidcProvider){
            object = await oidcProviderDao.getFederatedOidcProviderById(markForDelete.objectId);
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.Scope){
            object = await scopeDao.getScopeById(markForDelete.objectId);
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.RateLimitServiceGroup){
            object = await rateLimitDao.getRateLimitServiceGroupById(markForDelete.objectId);
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.AuthenticationGroup){
            object = await authnGroupDao.getAuthenticationGroupById(markForDelete.objectId);
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.AuthorizationGroup){
            object = await authzGroupDao.getAuthorizationGroupById(markForDelete.objectId);
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.SigningKey){
            object = await signingKeysDao.getSigningKeyById(markForDelete.objectId);
        }
        if(object === null){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_OBJECT_FOR_DELETION");
        }

        // Now update the individual records with the mark for delete flag before 
        // submitting the mark for delete record.
        if(markForDelete.objectType === MarkForDeleteObjectType.Tenant){
            const t: Tenant = object as Tenant;
            t.markForDelete = true;
            t.enabled = false;
            await tenantDao.updateTenant(t);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.Client){
            const c: Client = object as Client;
            c.markForDelete = true;
            c.enabled = false;
            await clientDao.updateClient(c);
        }        
        if(markForDelete.objectType === MarkForDeleteObjectType.User){
            const u: User = object as User;
            u.markForDelete = true;
            u.enabled = false;
            await identityDao.updateUser(u);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.AuthorizationGroup){
            const a: AuthorizationGroup = object as AuthorizationGroup;
            a.markForDelete = true;
            await authzGroupDao.updateAuthorizationGroup(a);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.AuthenticationGroup){
            const a: AuthenticationGroup = object as AuthenticationGroup;
            a.markForDelete = true;
            await authnGroupDao.updateAuthenticationGroup(a);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.Scope){
            const s: Scope = object as Scope;
            // We cannot delete a scope value that is used for IAM management,
            // only those scope values defined for application management.
            if(s.scopeUse === SCOPE_USE_IAM_MANAGEMENT){
                throw new GraphQLError("ERROR_UNABLE_TO_DELETE_IAM_MANAGEMENT_SCOPE");
            }        
            s.markForDelete = true;
            await scopeDao.updateScope(s);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.FederatedOidcProvider){
            const f: FederatedOidcProvider = object as FederatedOidcProvider;
            f.markForDelete = true;
            await oidcProviderDao.updateFederatedOidcProvider(f);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.RateLimitServiceGroup){
            const r: RateLimitServiceGroup = object as RateLimitServiceGroup;
            r.markForDelete = true;
            await rateLimitDao.updateRateLimitServiceGroup(r);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.SigningKey){
            const k: SigningKey = object as SigningKey;
            k.markForDelete = true;
            await signingKeysDao.updateSigningKey(k);
        }
        
        markForDelete.markForDeleteId = randomUUID().toString();
        markForDelete.submittedDate = Date.now();

        // markForDelete.submittedBy = this.oidcContext.oidcPrincipal.sub
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