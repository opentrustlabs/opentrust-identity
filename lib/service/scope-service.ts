import { AccessRule, AuthorizationGroup, AuthorizationGroupScopeRel, BulkScopeInput, Client, ClientScopeRel, ErrorDetail, ObjectSearchResultItem, RelSearchResultItem, Scope, ScopeFilterCriteria, SearchResultType, Tenant, TenantAvailableScope, User, UserScopeRel, UserTenantRel } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { GraphQLError } from "graphql/error/GraphQLError";
import ScopeDao from "../dao/scope-dao";
import { randomUUID } from 'crypto'; 
import TenantDao from "../dao/tenant-dao";
import ClientDao from "../dao/client-dao";
import AccessRuleDao from "../dao/access-rule-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import { CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_TENANT_SCOPE_REL, CHANGE_EVENT_CLASS_CLIENT_TENANT_SCOPE_REL, CHANGE_EVENT_CLASS_SCOPE, CHANGE_EVENT_CLASS_TENANT_SCOPE_REL, CHANGE_EVENT_CLASS_USER_TENANT_SCOPE_REL, CHANGE_EVENT_TYPE_CREATE, CHANGE_EVENT_TYPE_CREATE_REL, CHANGE_EVENT_TYPE_REMOVE_REL, CHANGE_EVENT_TYPE_UPDATE, CLIENT_TYPE_IDENTITY, ROOT_TENANT_EXCLUSIVE_INTERNAL_SCOPE_NAMES, SCOPE_CLIENT_ASSIGN_SCOPE, SCOPE_CLIENT_REMOVE_SCOPE, SCOPE_CREATE_SCOPE, SCOPE_DELETE_SCOPE, SCOPE_GROUP_ASSIGN_SCOPE, SCOPE_GROUP_REMOVE_SCOPE, SCOPE_READ_SCOPE, SCOPE_TENANT_ASSIGN_SCOPE, SCOPE_TENANT_REMOVE_SCOPE, SCOPE_UPDATE_SCOPE, SCOPE_USE_APPLICATION_MANAGEMENT, SCOPE_USE_DISPLAY, SCOPE_USE_IAM_MANAGEMENT, SCOPE_USER_ASSIGN_SCOPE, SCOPE_USER_REMOVE_SCOPE, SCOPE_USES, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { getOpenSearchClient } from "../data-sources/search";
import AuthorizationGroupDao from "../dao/authorization-group-dao";
import IdentityDao from "../dao/identity-dao";
import { authorizeByScopeAndTenant, containsScope } from "@/utils/authz-utils";
import { ERROR_CODES } from "../models/error";
import { logWithDetails } from "../logging/logger";
import ChangeEventDao from "../dao/change-event-dao";

const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const accessRuleDao: AccessRuleDao = DaoFactory.getInstance().getAccessRuleDao();
const authorizationGroupDao: AuthorizationGroupDao = DaoFactory.getInstance().getAuthorizationGroupDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const searchClient = getOpenSearchClient();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();
 
class ScopeService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    
    public async getScope(tenantId: string, filterBy: ScopeFilterCriteria): Promise<Array<Scope>> {

        if(!this.oidcContext.portalUserProfile || !this.oidcContext.portalUserProfile.managementAccessTenantId){
            throw new GraphQLError(ERROR_CODES.EC00065.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00065}});
        }
        const b: boolean = containsScope([TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], this.oidcContext.portalUserProfile.scope);
        if(!b){
            throw new GraphQLError(ERROR_CODES.EC00066.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00066}});
        }
        if(this.oidcContext.portalUserProfile.managementAccessTenantId !== this.oidcContext.rootTenant.tenantId){
            if(this.oidcContext.portalUserProfile.managementAccessTenantId !== tenantId){
                throw new GraphQLError(ERROR_CODES.EC00067.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00067}});
            }
        }

        
        let isRootTenant: boolean = tenantId === this.oidcContext.rootTenant.tenantId;        
                
        if(isRootTenant && !filterBy){
            const arr: Array<Scope> = await scopeDao.getScope();
            return arr;
        }
        if(isRootTenant && filterBy === ScopeFilterCriteria.Existing){
            const arr: Array<Scope> = await scopeDao.getScope(tenantId);
            return arr;
        }
        if(isRootTenant && filterBy === ScopeFilterCriteria.Available){
            const arr: Array<Scope> = await scopeDao.getScope();
            return arr;
        }
        if(!isRootTenant && !filterBy){
            const arr: Array<Scope> = await scopeDao.getScope(tenantId);
            return arr;
        }
        if(!isRootTenant && filterBy === ScopeFilterCriteria.Existing){
            const arr: Array<Scope> = await scopeDao.getScope(tenantId);
            return arr;
        }
        if(!isRootTenant && filterBy === ScopeFilterCriteria.Available){
            const arr: Array<Scope> = await scopeDao.getScope();
            // Now remove all of the scope values that non-root tenants
            // do not have access to.
            return arr.filter(
                (scope: Scope) => {
                    const s: string | undefined = ROOT_TENANT_EXCLUSIVE_INTERNAL_SCOPE_NAMES.find(
                        (s1: string) => {
                            return s1 === scope.scopeName;
                        }
                    )
                    return s === undefined;
                }
            )
        }
        return [];
    }

    public async getScopeById(scopeId: string): Promise<Scope | null> {
        // Only members of the root tenant are allowed to view scope details
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], null);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }        
        return scopeDao.getScopeById(scopeId);
    }

    public async createScope(scope: Scope): Promise<Scope> {

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, SCOPE_CREATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        // Only allow scope uses of Application Management to be
        // created. All IAM Management scope values are fixed at
        // initialization of the IAM tool
        // if(scope.scopeUse !== SCOPE_USE_APPLICATION_MANAGEMENT){
        //     throw new GraphQLError("ERROR_INVALID_SCOPE_USAGE_FOR_CREATION")
        // }
        if(!SCOPE_USES.includes(scope.scopeUse)){
            throw new GraphQLError(ERROR_CODES.EC00068.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00068}});
        }
        if(scope.scopeName === null || scope.scopeName === "" || scope.scopeDescription === null || scope.scopeDescription === ""){
            throw new GraphQLError(ERROR_CODES.EC00069.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00069}});
        }
        // Scope name values must be globally unique
        const scopeByName: Scope | null = await scopeDao.getScopeByScopeName(scope.scopeName);
        if(scopeByName){
            throw new GraphQLError(ERROR_CODES.EC00070.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00070}});
        }
        scope.scopeId = randomUUID().toString();
        const s: Scope = await scopeDao.createScope(scope);
        await this.updateSearchIndex(scope);

        changeEventDao.addChangeEvent({
            objectId: scope.scopeId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_SCOPE,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...scope})
        });

        return Promise.resolve(scope);
    }

    public async updateScope(scope: Scope): Promise<Scope> {
        
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, SCOPE_UPDATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        const existingScope = await this.getScopeById(scope.scopeId) 
        if(!existingScope){
            throw new GraphQLError(ERROR_CODES.EC00071.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00071}});
        }
        if(existingScope.scopeUse === SCOPE_USE_IAM_MANAGEMENT){
            throw new GraphQLError(ERROR_CODES.EC00072.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00072}});
        }
        // Check to make sure that the updated name does NOT already exist
        // on a different scope record if the user is changing the name
        if(scope.scopeName !== existingScope.scopeName){
            const scopeByName: Scope | null = await scopeDao.getScopeByScopeName(scope.scopeName);
            if(scopeByName){
                throw new GraphQLError(ERROR_CODES.EC00070.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00070}});
            }
        }

        // Only allow the name and description to be updated, since the
        // scope use value is read-only
        existingScope.scopeDescription = scope.scopeDescription;
        existingScope.scopeName = scope.scopeName;
        await scopeDao.updateScope(existingScope);
        await this.updateSearchIndex(existingScope);
        
        // Do not wait on the bulk update. Fire and forget...
        this.bulkUpdateScopeRelIndex(existingScope);

        changeEventDao.addChangeEvent({
            objectId: scope.scopeId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_SCOPE,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_UPDATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...scope})
        });

        return Promise.resolve(existingScope);
    }


    public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId: string | null): Promise<TenantAvailableScope> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_TENANT_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00073.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00073}});
        }
        const {isValid, errorDetail, scope} = await this.validateScopeTenantInput(tenant, scopeId, accessRuleId);
        if(!isValid){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        const tenantAvailableScope: TenantAvailableScope = await scopeDao.assignScopeToTenant(tenant.tenantId, scopeId, accessRuleId || undefined);
        if(scope){
            await this.indexTenantScopeRel(tenant, scope);
        }

        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, scopeId})
        });

        return tenantAvailableScope
        
    }

    /**
     * All or nothing assignment. All group, tenant, and scope relationships must be valid
     * in order for the bulk assignment to succeed.
     * 
     * @param tenantId 
     * @param bulkScopeInput 
     * @returns 
     */    
    public async bulkAssignScopeToTenant(tenantId: string, bulkScopeInput: Array<BulkScopeInput>): Promise<Array<TenantAvailableScope>> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_TENANT_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00073.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00073}});
        }
        const arrayTenantAvailableScope: Array<TenantAvailableScope> = [];
        const arrayScope: Array<Scope> = [];
        let allValidScopes: boolean = true;
        let error: ErrorDetail = ERROR_CODES.NULL_ERROR;

        for(let i = 0; i < bulkScopeInput.length; i++) {
            const {isValid, errorDetail, scope} = await this.validateScopeTenantInput(tenant, bulkScopeInput[i].scopeId, bulkScopeInput[i].accessRuleId || null);
            if(!isValid){
                allValidScopes = false;
                error = errorDetail;
                break;
            }
            else if(scope){
                arrayScope.push(scope);
            }
        }
        if(!allValidScopes){
            throw new GraphQLError(error.errorCode, {extensions: {errorDetail: error}});
        }
        for(let i = 0; i < bulkScopeInput.length; i++){
            const rel = await scopeDao.assignScopeToTenant(tenant.tenantId, bulkScopeInput[i].scopeId, bulkScopeInput[i].accessRuleId || undefined);
            await this.indexTenantScopeRel(tenant, arrayScope[i]);
            arrayTenantAvailableScope.push(rel);
        }
        const scopeIds = arrayScope.map((s: Scope) => s.scopeId);
        
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, scopeIds})
        });

        return arrayTenantAvailableScope;
    }


    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_TENANT_REMOVE_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        // FUTURE ENHANCEMENT
        // Enhance the tenant_available_scope to include a markfordelete field (boolean).
        // There might be 1000s of relationships that need to be deleted and we do not
        // want to lock any tables. That means that the deletion should proceed outside
        // real-time methods.
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }
        const scope: Scope | null = await scopeDao.getScopeById(scopeId);
        if(!scope){
            throw new GraphQLError(ERROR_CODES.EC00071.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00071}});
        }

        if(tenant.tenantType === TENANT_TYPE_ROOT_TENANT && scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT){
            throw new GraphQLError(ERROR_CODES.EC00074.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00074}});
        }

        await scopeDao.removeScopeFromTenant(tenantId, scopeId);
        await this.removeTenantScopeRelFromIndex(tenantId, scopeId);

        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, scopeId})
        });

        return Promise.resolve();
    }

    public async getClientScopes(clientId: string): Promise<Array<Scope>> {
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            throw new GraphQLError(ERROR_CODES.EC00011.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00011}});
        }

        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], client.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const arr: Array<ClientScopeRel> = await scopeDao.getClientScopeRels(clientId);
        if(arr.length > 0){
            const ids = arr.map((rel: ClientScopeRel) => rel.scopeId);
            const scopes: Array<Scope> = await scopeDao.getScope(undefined, ids);
            return scopes;

        }
        else return [];
    }

    public async getAuthorizationGroupScopes(groupId: string): Promise<Array<Scope>> {
        const authzGroup: AuthorizationGroup | null = await authorizationGroupDao.getAuthorizationGroupById(groupId);
        if(!authzGroup){
            throw new GraphQLError(ERROR_CODES.EC00028.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00028}});
        }

        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], authzGroup.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const arr: Array<AuthorizationGroupScopeRel> = await scopeDao.getAuthorizationGroupScopeRels(groupId);
        if(arr.length > 0){
            const ids = arr.map((rel: AuthorizationGroupScopeRel) => rel.scopeId);
            const scopes: Array<Scope> = await scopeDao.getScope(undefined, ids);
            return scopes;

        }
        else return [];
    }

    public async getUserScopes(userId: string, tenantId: string): Promise<Array<Scope>> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], tenantId);
        if(!authResult.isAuthorized){
            
        }

        const arr: Array<UserScopeRel> = await scopeDao.getUserScopeRels(userId, tenantId);
        if(arr.length > 0){
            const ids = arr.map((rel: UserScopeRel) => rel.scopeId);
            const scopes: Array<Scope> = await scopeDao.getScope(undefined, ids);
            return scopes;

        }
        else return [];
    }

    public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientScopeRel> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_CLIENT_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        // Check, in order
        // 1.   Does the scope exist
        // 2.   Is the scope assigned to the tenant in the first place
        // 3.   Does the client exist
        // 4.   Is the client assigned to the tenant
        const scope: Scope | null = await this.getScopeById(scopeId);
        if(!scope){
            throw new GraphQLError(ERROR_CODES.EC00071.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00071}});
        }
        // the scope needs to be assigned to the tenant overall, in order to be assigned to
        // the client
        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId, scopeId);
        const rel = tenantScopes.find(
            (t: TenantAvailableScope) => t.scopeId === scopeId
        )
        if(!rel){
            throw new GraphQLError(ERROR_CODES.EC00075.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00075}});
        }
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            throw new GraphQLError(ERROR_CODES.EC00011.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00011}});
        }
        if(client.tenantId !== tenantId){
            throw new GraphQLError(ERROR_CODES.EC00076.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00076}});
        }
        // Cannot assign scope values to a client which is used for retrieval of
        // identity information. We can only assign scope directly to clients
        // which have delegated permissions(explicity user delegated or devices)
        // or to a service-type client itself 
        if(client.clientType === CLIENT_TYPE_IDENTITY){
            throw new GraphQLError(ERROR_CODES.EC00077.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00077}});
        }

        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, clientId, scopeId})
        });

        return scopeDao.assignScopeToClient(tenantId, clientId, scopeId);        
    }

    public async bulkAssignScopeToClient(tenantId: string, clientId: string, bulkScopeInput: Array<BulkScopeInput>): Promise<Array<ClientScopeRel>> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_CLIENT_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            throw new GraphQLError(ERROR_CODES.EC00011.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00011}});
        }
        if(client.tenantId !== tenantId){
            throw new GraphQLError(ERROR_CODES.EC00076.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00076}});
        }
        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId, undefined);
        let allValidScopes: boolean = true;
        let error: ErrorDetail = ERROR_CODES.NULL_ERROR
        // Do all of the scope values belong to the tenant?
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const scopeId: string = bulkScopeInput[i].scopeId;
            const rel = tenantScopes.find(
                (t: TenantAvailableScope) => t.scopeId === scopeId
            );
            if(!rel){
                allValidScopes = false;
                error = ERROR_CODES.EC00077;
            }
        }
        if(!allValidScopes){
            throw new GraphQLError(error.errorCode, {extensions: {errorDetail: error}});
        }
        const arr: Array<ClientScopeRel> = [];
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const rel = await scopeDao.assignScopeToClient(tenantId, clientId, bulkScopeInput[i].scopeId);
            arr.push(rel);
        }
        const scopeIds = arr.map((v: ClientScopeRel) => v.scopeId);
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, clientId, scopeIds})
        });

        return arr;
    }


    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_CLIENT_REMOVE_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_CLIENT_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, clientId, scopeId})
        });

        return scopeDao.removeScopeFromClient(tenantId, clientId, scopeId);
    }

    public async assignScopeToAuthorizationGroup(groupId: string, scopeId: string, tenantId: string): Promise<AuthorizationGroupScopeRel> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_GROUP_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        // Check, in order
        // 1.   Does the scope exist
        // 2.   Is the scope assigned to the tenant in the first place
        // 3.   Does the authn group exist
        // 4.   Is the authn group assigned to the tenant
        const scope: Scope | null = await this.getScopeById(scopeId);
        if(!scope){
            throw new GraphQLError(ERROR_CODES.EC00071.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00071}});
        }
        // the scope needs to be assigned to the tenant overall, in order to be assigned to
        // the authorization group
        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId, scopeId);
        const rel = tenantScopes.find(
            (t: TenantAvailableScope) => t.scopeId === scopeId
        )
        if(!rel){
            throw new GraphQLError(ERROR_CODES.EC00079.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00079}});
        }
        const authnGroup: AuthorizationGroup | null = await authorizationGroupDao.getAuthorizationGroupById(groupId);
        if(!authnGroup){
            throw new GraphQLError(ERROR_CODES.EC00028.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00028}});
        }
        if(authnGroup.tenantId !== tenantId){
            throw new GraphQLError(ERROR_CODES.EC00080.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00080}});
        }
        
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, groupId, scopeId})
        });

        return scopeDao.assignScopeToAuthorizationGroup(tenantId, groupId, scopeId);

    }

    /**
     * All or nothing assignment. All group, tenant, and scope relationships must be valid
     * in order for the bulk assignment to succeed.
     * 
     * @param groupId 
     * @param tenantId 
     * @param bulkScopeInput 
     * @returns 
     */
    public async bulkAssignScopeToAuthorizationGroup(groupId: string, tenantId: string, bulkScopeInput: Array<BulkScopeInput>): Promise<Array<AuthorizationGroupScopeRel>>{
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_GROUP_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const authzGroup: AuthorizationGroup | null = await authorizationGroupDao.getAuthorizationGroupById(groupId);
        if(!authzGroup || authzGroup.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00028.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00028}});
        }
        if(authzGroup.tenantId !== tenantId){
            throw new GraphQLError(ERROR_CODES.EC00080.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00080}});
        }
        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId);
        let allValidScopes: boolean = true;
        let error: ErrorDetail = ERROR_CODES.NULL_ERROR
        // Do all of the scope values belong to the tenant?
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const scopeId: string = bulkScopeInput[i].scopeId;
            const rel = tenantScopes.find(
                (t: TenantAvailableScope) => t.scopeId === scopeId
            );
            if(!rel){
                allValidScopes = false;
                error = ERROR_CODES.EC00078
            }
        }
        if(!allValidScopes){
            throw new GraphQLError(error.errorCode, {extensions: {errorDetail: error}});
        }

        const arr: Array<AuthorizationGroupScopeRel> = [];
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const rel = await scopeDao.assignScopeToAuthorizationGroup(tenantId, groupId, bulkScopeInput[i].scopeId);
            arr.push(rel);
        }

        const scopeIds = arr.map((v: AuthorizationGroupScopeRel) => v.scopeId);
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, groupId, scopeIds})
        });
        return arr;
    }


    public async removeScopeFromAuthorizationGroup(groupId: string, scopeId: string, tenantId: string): Promise<void> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_GROUP_REMOVE_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_AUTHORIZATION_GROUP_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, groupId, scopeId})
        });

        return scopeDao.removeScopeFromAuthorizationGroup(tenantId, groupId, scopeId);
    }

    public async assignScopeToUser(userId: string, tenantId: string, scopeId: string): Promise<UserScopeRel> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_USER_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        // Check, in order
        // 1.   Does the scope exist
        // 2.   Is the scope assigned to the tenant in the first place
        // 3.   Does the user exist
        // 4.   Is the user assigned to the tenant
        const scope: Scope | null = await this.getScopeById(scopeId);
        if(!scope){
            throw new GraphQLError(ERROR_CODES.EC00071.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00071}});
        }
        // the scope needs to be assigned to the tenant overall, in order to be assigned to
        // the client
        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId, scopeId);
        const rel = tenantScopes.find(
            (t: TenantAvailableScope) => t.scopeId === scopeId
        )
        if(!rel){
            throw new GraphQLError(ERROR_CODES.EC00075.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00074}});
        }

        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user || user.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00013.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00013}});
        }
        const userTenantRel: UserTenantRel | null = await identityDao.getUserTenantRel(tenantId, userId);
        if(!userTenantRel){
            throw new GraphQLError(ERROR_CODES.EC00081.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00081}});
        }

        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_USER_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, userId, scopeId})
        });

        return scopeDao.assignScopeToUser(tenantId, userId, scopeId);
    }

    /**
     * All or nothing bulk assignment. All scope, tenant, and user relationships must be valid
     * for the bulk assignment to succeed.
     * 
     * @param userId 
     * @param tenantId 
     * @param bulkScopeInput 
     */
    public async bulkAssignScopeToUser(userId: string, tenantId: string, bulkScopeInput: Array<BulkScopeInput>): Promise<Array<UserScopeRel>>{
        
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_USER_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }

        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user || user.markForDelete === true){
            throw new GraphQLError(ERROR_CODES.EC00013.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00013}});
        }
        const userTenantRel: UserTenantRel | null = await identityDao.getUserTenantRel(tenantId, userId);
        if(!userTenantRel){
            throw new GraphQLError(ERROR_CODES.EC00081.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00081}});
        }

        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId, undefined);
        let allValidScopes: boolean = true;
        let error: ErrorDetail = ERROR_CODES.NULL_ERROR;
        // Do all of the scope values belong to the tenant?
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const scopeId: string = bulkScopeInput[i].scopeId;
            const rel = tenantScopes.find(
                (t: TenantAvailableScope) => t.scopeId === scopeId
            );
            if(!rel){
                allValidScopes = false;
                error = ERROR_CODES.EC00082;
            }
        }
        if(!allValidScopes){
            throw new GraphQLError(error.errorCode, {extensions: {errorDetail: error}});
        }

        const arr: Array<UserScopeRel> = [];
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const rel = await scopeDao.assignScopeToUser(tenantId, userId, bulkScopeInput[i].scopeId);
            arr.push(rel);
        }
        const scopeIds = arr.map((v) => v.scopeId);
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_USER_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, userId, scopeIds})
        });

        return arr;
    }

    public async removeScopeFromUser(userId: string, tenantId: string, scopeId: string): Promise<void> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_USER_REMOVE_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorDetail.errorCode, {extensions: {errorDetail: authResult.errorDetail}});
        }
        changeEventDao.addChangeEvent({
            objectId: tenantId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_USER_TENANT_SCOPE_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, userId, scopeId})
        });
        return scopeDao.removeScopeFromUser(tenantId, userId, scopeId);
    }
    

    protected async validateScopeTenantInput(tenant: Tenant, scopeId: string, accessRuleId: string | null): Promise<{isValid: boolean, errorDetail: ErrorDetail, scope: Scope | null}> {
        const scope: Scope | null = await this.getScopeById(scopeId);        
        if(!scope){
            return {isValid: false, errorDetail: ERROR_CODES.EC00071, scope}
        }
        if(accessRuleId){
            const accessRule: AccessRule | null = await accessRuleDao.getAccessRuleById(accessRuleId);
            if(!accessRule){
                return {isValid: false, errorDetail: ERROR_CODES.EC00083, scope: null};
            }
        }
        // Check to make sure that we are not assigning a forbidden IAM scope to a
        // non root tenant
        if(tenant.tenantType !== TENANT_TYPE_ROOT_TENANT && scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT){
            const rootOnlyScopeName: string | undefined = ROOT_TENANT_EXCLUSIVE_INTERNAL_SCOPE_NAMES.find(
                (s: string) => s === scope.scopeName
            )
            if(rootOnlyScopeName){
                return {isValid: false, errorDetail: ERROR_CODES.EC00084, scope: null};
            }
        }
        return {isValid: true, errorDetail: ERROR_CODES.NULL_ERROR, scope};
    }

    protected async updateSearchIndex(scope: Scope): Promise<void> {
        const document: ObjectSearchResultItem = {
            name: scope.scopeName,
            description: scope.scopeDescription,
            objectid: scope.scopeId,
            objecttype: SearchResultType.AccessControl,
            owningtenantid: "",
            email: "",
            enabled: true,
            owningclientid: "",
            subtype: SCOPE_USE_DISPLAY.get(scope.scopeUse),
            subtypekey: scope.scopeUse
        }
        await searchClient.index({
            id: scope.scopeId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });
    }
        
    protected async removeTenantScopeRelFromIndex(tenantId: string, scopeId: string): Promise<void>{        
        try{
            await searchClient.delete({
                id: `${tenantId}::${scopeId}`,
                index: SEARCH_INDEX_REL_SEARCH,
            });         
        }       
        catch(err: any){
            logWithDetails("error", `Error removing scope from tenant. ${err.message}`, {...err, tenantId, scopeId});
        }
    }

    protected async bulkUpdateScopeRelIndex(scope: Scope): Promise<void>{
        searchClient.updateByQuery({
            index: SEARCH_INDEX_REL_SEARCH,
            body: {
                query: {
                    term: {
                        childid: scope.scopeId
                    }
                },
                script: {
                    source: "ctx._source.childname = params.childname; ctx._source.childdescription = params.childdescription",
                    lang: "painless",
                    params: {
                        childname: scope.scopeName,
                        childdescription: scope.scopeDescription
                    }
                }
            },
            conflicts: "proceed",
            requests_per_second: 25
        });
    }

    
    protected async indexTenantScopeRel(tenant: Tenant, scope: Scope): Promise<void>{
        const document: RelSearchResultItem = {
            childid: scope.scopeId,
            childname: scope.scopeName,
            childtype: SearchResultType.AccessControl,
            owningtenantid: tenant.tenantId,
            parentid: tenant.tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: scope.scopeDescription
        }; 
        await searchClient.index({
            id: `${tenant.tenantId}::${scope.scopeId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: document
        });
    }

}

export default ScopeService;