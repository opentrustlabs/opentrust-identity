import { AuthenticationGroup, AuthorizationGroup, Client, DeletionStatus, FederatedOidcProvider, MarkForDelete, MarkForDeleteObjectType, RateLimitServiceGroup, Scope, SigningKey, SystemSettings, Tenant, User } from "@/graphql/generated/graphql-types";
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
import { AUTHENTICATION_GROUP_DELETE_SCOPE, AUTHORIZATION_GROUP_DELETE_SCOPE, CHANGE_EVENT_CLASS_MARK_FOR_DELETE, CHANGE_EVENT_TYPE_CREATE, CLIENT_DELETE_SCOPE, FEDERATED_OIDC_PROVIDER_DELETE_SCOPE, KEY_DELETE_SCOPE, RATE_LIMIT_DELETE_SCOPE, SCOPE_DELETE_SCOPE, SCOPE_USE_IAM_MANAGEMENT, TENANT_DELETE_SCOPE, TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE, TENANT_TYPE_ROOT_TENANT, USER_DELETE_SCOPE } from "@/utils/consts";
import { authorizeByScopeAndTenant, WithAuthorizationByScopeAndTenant } from "@/utils/authz-utils";
import { ERROR_CODES } from "../models/error";
import ChangeEventDao from "../dao/change-event-dao";

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
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();

class MarkForDeleteService {

    oidcContext: OIDCContext;
    
    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async markForDelete(markForDelete: MarkForDelete): Promise<MarkForDelete> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let object: any | null = null;
        let requiredScope: string | null = null;        

        if(markForDelete.objectType === MarkForDeleteObjectType.Client){
            object = await clientDao.getClientById(markForDelete.objectId);
            requiredScope = CLIENT_DELETE_SCOPE;
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.Tenant){
            object = await tenantDao.getTenantById(markForDelete.objectId);
            requiredScope = TENANT_DELETE_SCOPE;
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.User){
            object = await identityDao.getUserBy("id", markForDelete.objectId);
            requiredScope = USER_DELETE_SCOPE;
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.FederatedOidcProvider){
            object = await oidcProviderDao.getFederatedOidcProviderById(markForDelete.objectId);
            requiredScope = FEDERATED_OIDC_PROVIDER_DELETE_SCOPE;
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.Scope){
            object = await scopeDao.getScopeById(markForDelete.objectId);
            requiredScope = SCOPE_DELETE_SCOPE;
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.RateLimitServiceGroup){
            object = await rateLimitDao.getRateLimitServiceGroupById(markForDelete.objectId);
            requiredScope = RATE_LIMIT_DELETE_SCOPE;
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.AuthenticationGroup){
            object = await authnGroupDao.getAuthenticationGroupById(markForDelete.objectId);
            requiredScope = AUTHENTICATION_GROUP_DELETE_SCOPE;
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.AuthorizationGroup){
            object = await authzGroupDao.getAuthorizationGroupById(markForDelete.objectId);
            requiredScope = AUTHORIZATION_GROUP_DELETE_SCOPE;
        }
        else if(markForDelete.objectType === MarkForDeleteObjectType.SigningKey){
            object = await signingKeysDao.getSigningKeyById(markForDelete.objectId);
            requiredScope = KEY_DELETE_SCOPE;
        }
        if(object === null){
            throw new GraphQLError(ERROR_CODES.EC00036.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00036}});
        }
        if(requiredScope === null){
            throw new GraphQLError(ERROR_CODES.EC00037.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00037}});
        }

        // Now update the individual records with the mark for delete flag before 
        // submitting the mark for delete record.
        if(markForDelete.objectType === MarkForDeleteObjectType.Tenant){
            const t: Tenant = object as Tenant;
            if(t.tenantType === TENANT_TYPE_ROOT_TENANT){
                throw new GraphQLError(ERROR_CODES.EC00038.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00038}});
            }
            
            const u = WithAuthorizationByScopeAndTenant({
                async performOperation() {
                    t.markForDelete = true;
                    t.enabled = false;                    
                    await tenantDao.updateTenant(t);
                },
            });
            await u(this.oidcContext, requiredScope, null);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.Client){
            const c: Client = object as Client;
            const systemSettings: SystemSettings = await tenantDao.getSystemSettings();

            // We cannot delete a client that is used for outbound communication as a representative
            // of the root tenant.
            if(c.clientId === systemSettings.rootClientId){
                throw new GraphQLError(ERROR_CODES.EC00039.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00039}});
            }
            
            const u = WithAuthorizationByScopeAndTenant({
                async performOperation() {
                    c.markForDelete = true;
                    c.enabled = false;                   
                    await clientDao.updateClient(c);
                },
            });
            await u(this.oidcContext, requiredScope, c.tenantId);            
        }        
        if(markForDelete.objectType === MarkForDeleteObjectType.User){
            const user: User = object as User;

            const u = WithAuthorizationByScopeAndTenant({
                async performOperation() {
                    user.markForDelete = true;
                    user.enabled = false;                  
                    await identityDao.updateUser(user);
                },
            });
            await u(this.oidcContext, requiredScope, null);            
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.AuthorizationGroup){
            const a: AuthorizationGroup = object as AuthorizationGroup; 

            const u = WithAuthorizationByScopeAndTenant({
                async performOperation() {
                    a.markForDelete = true;
                    await authzGroupDao.updateAuthorizationGroup(a);
                },
            });
            await u(this.oidcContext, requiredScope, a.tenantId);            
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.AuthenticationGroup){
            const a: AuthenticationGroup = object as AuthenticationGroup;

            const u = WithAuthorizationByScopeAndTenant({
                async performOperation() {
                    a.markForDelete = true;
                    await authnGroupDao.updateAuthenticationGroup(a);
                },
            });
            await u(this.oidcContext, requiredScope, a.tenantId);            
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.Scope){
            const s: Scope = object as Scope;
            // We cannot delete a scope value that is used for IAM management,
            // only those scope values defined for application management.
            if(s.scopeUse === SCOPE_USE_IAM_MANAGEMENT){
                throw new GraphQLError(ERROR_CODES.EC00040.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00040}});
            }
            const u = WithAuthorizationByScopeAndTenant({
                async performOperation() {
                    s.markForDelete = true;
                    await scopeDao.updateScope(s);
                },
            });
            await u(this.oidcContext, requiredScope, null);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.FederatedOidcProvider){
            const f: FederatedOidcProvider = object as FederatedOidcProvider;

            const u = WithAuthorizationByScopeAndTenant({
                async performOperation() {
                    f.markForDelete = true;
                    await oidcProviderDao.updateFederatedOidcProvider(f);
                },
            });
            await u(this.oidcContext, requiredScope, null);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.RateLimitServiceGroup){
            const r: RateLimitServiceGroup = object as RateLimitServiceGroup;
            
            const u = WithAuthorizationByScopeAndTenant({
                async performOperation() {
                    r.markForDelete = true;
                    await rateLimitDao.updateRateLimitServiceGroup(r);
                },
            });
            await u(this.oidcContext, requiredScope, null);
        }
        if(markForDelete.objectType === MarkForDeleteObjectType.SigningKey){
            const k: SigningKey = object as SigningKey;
            const u = WithAuthorizationByScopeAndTenant({
                async performOperation() {
                    k.markForDelete = true;
                    await signingKeysDao.updateSigningKey(k);
                },
            });
            await u(this.oidcContext, requiredScope, k.tenantId);
        }
        

        markForDelete.markForDeleteId = randomUUID().toString();
        markForDelete.submittedDate = Date.now();

        let submittedBy: string = this.oidcContext.portalUserProfile?.firstName || "";
        if(this.oidcContext.portalUserProfile?.lastName){
            submittedBy = submittedBy + " " + this.oidcContext.portalUserProfile.lastName;
        }
        if(this.oidcContext.portalUserProfile?.userId){
            submittedBy = submittedBy + " - " + this.oidcContext.portalUserProfile.userId;
        }
        markForDelete.submittedBy = submittedBy;
        await markForDeleteDao.markForDelete(markForDelete);

        changeEventDao.addChangeEvent({
            objectId: markForDelete.markForDeleteId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_MARK_FOR_DELETE,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...markForDelete})
        });

        return Promise.resolve(markForDelete);
    }

    public async getMarkForDeleteById(markForDeleteId: string): Promise<MarkForDelete | null> {
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        return markForDeleteDao.getMarkForDeleteById(markForDeleteId);
    }

    public async getDeletionStatus(markForDeleteId: string): Promise<Array<DeletionStatus>> {
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        return markForDeleteDao.getDeletionStatus(markForDeleteId);
    }    

}

export default MarkForDeleteService