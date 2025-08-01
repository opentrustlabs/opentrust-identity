import { AccessRule, AuthorizationGroup, AuthorizationGroupScopeRel, BulkScopeInput, Client, ClientScopeRel, ObjectSearchResultItem, RelSearchResultItem, Scope, ScopeFilterCriteria, SearchResultType, Tenant, TenantAvailableScope, User, UserScopeRel, UserTenantRel } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { GraphQLError } from "graphql/error/GraphQLError";
import ScopeDao from "../dao/scope-dao";
import { randomUUID } from 'crypto'; 
import TenantDao from "../dao/tenant-dao";
import ClientDao from "../dao/client-dao";
import AccessRuleDao from "../dao/access-rule-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import { ROOT_TENANT_EXCLUSIVE_INTERNAL_SCOPE_NAMES, SCOPE_CLIENT_ASSIGN_SCOPE, SCOPE_CLIENT_REMOVE_SCOPE, SCOPE_CREATE_SCOPE, SCOPE_DELETE_SCOPE, SCOPE_GROUP_ASSIGN_SCOPE, SCOPE_GROUP_REMOVE_SCOPE, SCOPE_READ_SCOPE, SCOPE_TENANT_ASSIGN_SCOPE, SCOPE_TENANT_REMOVE_SCOPE, SCOPE_UPDATE_SCOPE, SCOPE_USE_APPLICATION_MANAGEMENT, SCOPE_USE_DISPLAY, SCOPE_USE_IAM_MANAGEMENT, SCOPE_USER_ASSIGN_SCOPE, SCOPE_USER_REMOVE_SCOPE, SCOPE_USES, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { getOpenSearchClient } from "../data-sources/search";
import AuthorizationGroupDao from "../dao/authorization-group-dao";
import IdentityDao from "../dao/identity-dao";
import { authorizeByScopeAndTenant, containsScope, ServiceAuthorizationWrapper } from "@/utils/authz-utils";

const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const accessRuleDao: AccessRuleDao = DaoFactory.getInstance().getAccessRuleDao();
const authorizationGroupDao: AuthorizationGroupDao = DaoFactory.getInstance().getAuthorizationGroupDao();
const identityDao: IdentityDao = DaoFactory.getInstance().getIdentityDao();
const searchClient = getOpenSearchClient();

class ScopeService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    
    public async getScope(tenantId: string, filterBy: ScopeFilterCriteria): Promise<Array<Scope>> {

        if(!this.oidcContext.portalUserProfile || !this.oidcContext.portalUserProfile.managementAccessTenantId){
            throw new GraphQLError("ERROR_INVALID_PROFILE");
        }
        const b: boolean = containsScope([TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], this.oidcContext.portalUserProfile.scope);
        if(!b){
            throw new GraphQLError("ERROR_NO_PERMISSIONS_TO_VIEW_SCOPE");
        }
        if(this.oidcContext.portalUserProfile.managementAccessTenantId !== this.oidcContext.rootTenant.tenantId){
            if(this.oidcContext.portalUserProfile.managementAccessTenantId !== tenantId){
                throw new GraphQLError("ERROR_NO_PERMISSION_TO_VIEW_TENANT_SCOPE");
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
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }        
        return scopeDao.getScopeById(scopeId);
    }

    public async createScope(scope: Scope): Promise<Scope> {

        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, SCOPE_CREATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }

        // Only allow scope uses of Application Management to be
        // created. All IAM Management scope values are fixed at
        // initialization of the IAM tool
        // if(scope.scopeUse !== SCOPE_USE_APPLICATION_MANAGEMENT){
        //     throw new GraphQLError("ERROR_INVALID_SCOPE_USAGE_FOR_CREATION")
        // }
        if(!SCOPE_USES.includes(scope.scopeUse)){
            throw new GraphQLError("ERROR_INVALID_SCOPE_USAGE_FOR_CREATION");
        }
        if(scope.scopeName === null || scope.scopeName === "" || scope.scopeDescription === null || scope.scopeDescription === ""){
            throw new GraphQLError("ERROR_SCOPE_NAME_AND_DESCRIPTION_MUST_BE_POPULATED");
        }
        // Scope name values must be globally unique
        const scopeByName: Scope | null = await scopeDao.getScopeByScopeName(scope.scopeName);
        if(scopeByName){
            throw new GraphQLError("ERROR_SCOPE_EXISTS_WITH_SUPPLIED_NAME");
        }
        scope.scopeId = randomUUID().toString();
        const s: Scope = await scopeDao.createScope(scope);
        await this.updateSearchIndex(scope);

        return Promise.resolve(scope);
    }

    public async updateScope(scope: Scope): Promise<Scope> {
        
        const {isAuthorized, errorMessage} = authorizeByScopeAndTenant(this.oidcContext, SCOPE_UPDATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorMessage || "ERROR");
        }

        const existingScope = await this.getScopeById(scope.scopeId) 
        if(!existingScope){
            throw new GraphQLError("ERROR_SCOPE_NOT_FOUND");
        }
        if(existingScope.scopeUse === SCOPE_USE_IAM_MANAGEMENT){
            throw new GraphQLError("ERROR_IAM_MANAGEMENT_SCOPE_IS_READ_ONLY");
        }
        // Check to make sure that the updated name does NOT already exist
        // on a different scope record if the user is changing the name
        if(scope.scopeName !== existingScope.scopeName){
            const scopeByName: Scope | null = await scopeDao.getScopeByScopeName(scope.scopeName);
            if(scopeByName){
                throw new GraphQLError("ERROR_SCOPE_EXISTS_WITH_SUPPLIED_NAME");
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

        return Promise.resolve(existingScope);
    }


    public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId: string | null): Promise<TenantAvailableScope> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_TENANT_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_CANNOT_FIND_TENANT_FOR_SCOPE_ASSIGNMENT");
        }
        const {isValid, errorMessage, scope} = await this.validateScopeTenantInput(tenant, scopeId, accessRuleId);
        if(!isValid){
            throw new GraphQLError(errorMessage);
        }
        const tenantAvailableScope: TenantAvailableScope = await scopeDao.assignScopeToTenant(tenant.tenantId, scopeId, accessRuleId || undefined);
        if(scope){
            await this.indexTenantScopeRel(tenant, scope);
        }
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
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_CANNOT_FIND_TENANT_FOR_SCOPE_ASSIGNMENT");
        }
        const arrayTenantAvailableScope: Array<TenantAvailableScope> = [];
        const arrayScope: Array<Scope> = [];
        let allValidScopes: boolean = true;
        let message: string = "";

        for(let i = 0; i < bulkScopeInput.length; i++) {
            const {isValid, errorMessage, scope} = await this.validateScopeTenantInput(tenant, bulkScopeInput[i].scopeId, bulkScopeInput[i].accessRuleId || null);
            if(!isValid){
                allValidScopes = false;
                message = errorMessage;
                break;
            }
            else if(scope){
                arrayScope.push(scope);
            }
        }
        if(!allValidScopes){
            throw new GraphQLError(message);
        }
        for(let i = 0; i < bulkScopeInput.length; i++){
            const rel = await scopeDao.assignScopeToTenant(tenant.tenantId, bulkScopeInput[i].scopeId, bulkScopeInput[i].accessRuleId || undefined);
            await this.indexTenantScopeRel(tenant, arrayScope[i]);
            arrayTenantAvailableScope.push(rel);
        }
        return arrayTenantAvailableScope;
    }


    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_TENANT_REMOVE_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        // TODO
        // Enhance the tenant_available_scope to include a markfordelete field (boolean).
        // There might be 1000s of relationships that need to be deleted and we do not
        // want to lock any tables. That means that the deletion should proceed outside
        // real-time methods.
        const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
        }
        const scope: Scope | null = await scopeDao.getScopeById(scopeId);
        if(!scope){
            throw new GraphQLError("ERROR_SCOPE_DOES_NOT_EXIST");
        }

        if(tenant.tenantType === TENANT_TYPE_ROOT_TENANT && scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT){
            throw new GraphQLError("ERROR_CANNOT_REMOVE_IAM_MANAGEMENT_SCOPE_FROM_ROOT_TENANT")
        }

        await scopeDao.removeScopeFromTenant(tenantId, scopeId);
        await this.removeTenantScopeRelFromIndex(tenantId, scopeId);

        return Promise.resolve();
    }

    public async getClientScopes(clientId: string): Promise<Array<Scope>> {
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            throw new GraphQLError("ERROR_CLIENT_DOES_NOT_EXIST");
        }

        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], client.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
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
            throw new GraphQLError("ERROR_AUTHORIZATION_GROUP_DOES_NOT_EXIST");
        }

        const authResult = authorizeByScopeAndTenant(this.oidcContext, [TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], authzGroup.tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
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
            throw new GraphQLError(authResult.errorMessage || "ERROR");
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
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        // Check, in order
        // 1.   Does the scope exist
        // 2.   Is the scope assigned to the tenant in the first place
        // 3.   Does the client exist
        // 4.   Is the client assigned to the tenant
        const scope: Scope | null = await this.getScopeById(scopeId);
        if(!scope){
            throw new GraphQLError("ERROR_SCOPE_ID_NOT_FOUND_FOR_CLIENT_ASSIGNMENT");
        }
        // the scope needs to be assigned to the tenant overall, in order to be assigned to
        // the client
        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId, scopeId);
        const rel = tenantScopes.find(
            (t: TenantAvailableScope) => t.scopeId === scopeId
        )
        if(!rel){
            throw new GraphQLError("ERROR_SCOPE_IS_NOT_ASSIGNED_TO_THE_TENANT_OF_THIS_CLIENT");
        }
        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            throw new GraphQLError("ERROR_CLIENT_NOT_FOUND_FOR_SCOPE_ASSIGNMENT");
        }
        if(client.tenantId !== tenantId){
            throw new GraphQLError("ERROR_CLIENT_DOES_NOT_BELONG_TO_TENANT");
        }

        return scopeDao.assignScopeToClient(tenantId, clientId, scopeId);        
    }

    public async bulkAssignScopeToClient(tenantId: string, clientId: string, bulkScopeInput: Array<BulkScopeInput>): Promise<Array<ClientScopeRel>> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_CLIENT_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const client: Client | null = await clientDao.getClientById(clientId);
        if(!client){
            throw new GraphQLError("ERROR_CLIENT_NOT_FOUND_FOR_SCOPE_ASSIGNMENT");
        }
        if(client.tenantId !== tenantId){
            throw new GraphQLError("ERROR_CLIENT_DOES_NOT_BELONG_TO_TENANT");
        }
        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId, undefined);
        let allValidScopes: boolean = true;
        let message: string = "";
        // Do all of the scope values belong to the tenant?
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const scopeId: string = bulkScopeInput[i].scopeId;
            const rel = tenantScopes.find(
                (t: TenantAvailableScope) => t.scopeId === scopeId
            );
            if(!rel){
                allValidScopes = false;
                message = "ERROR_ONE_OR_MORE_SCOPE_VALUES_IS_NOT_ASSIGNED_TO_THE_TENANT_OF_THIS_AUTHORIZATION_GROUP"
            }
        }
        if(!allValidScopes){
            throw new GraphQLError(message);
        }
        const arr: Array<ClientScopeRel> = [];
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const rel = await scopeDao.assignScopeToClient(tenantId, clientId, bulkScopeInput[i].scopeId);
            arr.push(rel);
        }
        return arr;
    }


    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_CLIENT_REMOVE_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        return scopeDao.removeScopeFromClient(tenantId, clientId, scopeId);
    }

    public async assignScopeToAuthorizationGroup(groupId: string, scopeId: string, tenantId: string): Promise<AuthorizationGroupScopeRel> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_GROUP_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        // Check, in order
        // 1.   Does the scope exist
        // 2.   Is the scope assigned to the tenant in the first place
        // 3.   Does the authn group exist
        // 4.   Is the authn group assigned to the tenant
        const scope: Scope | null = await this.getScopeById(scopeId);
        if(!scope){
            throw new GraphQLError("ERROR_SCOPE_ID_NOT_FOUND_FOR_AUTHORIZATION_GROUP_ASSIGNMENT");
        }
        // the scope needs to be assigned to the tenant overall, in order to be assigned to
        // the authorization group
        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId, scopeId);
        const rel = tenantScopes.find(
            (t: TenantAvailableScope) => t.scopeId === scopeId
        )
        if(!rel){
            throw new GraphQLError("ERROR_SCOPE_IS_NOT_ASSIGNED_TO_THE_TENANT_OF_THIS_AUTHORIZATION_GROUP");
        }
        const authnGroup: AuthorizationGroup | null = await authorizationGroupDao.getAuthorizationGroupById(groupId);
        if(!authnGroup){
            throw new GraphQLError("ERROR_AUTHORIZATION_GROUP_NOT_FOUND_FOR_SCOPE_ASSIGNMENT");
        }
        if(authnGroup.tenantId !== tenantId){
            throw new GraphQLError("ERROR_AUTHORIZATION_GROUP_DOES_NOT_BELONG_TO_TENANT");
        }
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
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const authnGroup: AuthorizationGroup | null = await authorizationGroupDao.getAuthorizationGroupById(groupId);
        if(!authnGroup || authnGroup.markForDelete === true){
            throw new GraphQLError("ERROR_AUTHORIZATION_GROUP_NOT_FOUND_FOR_SCOPE_ASSIGNMENT");
        }
        if(authnGroup.tenantId !== tenantId){
            throw new GraphQLError("ERROR_AUTHORIZATION_GROUP_DOES_NOT_BELONG_TO_TENANT");
        }
        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId);
        let allValidScopes: boolean = true;
        let message: string = "";
        // Do all of the scope values belong to the tenant?
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const scopeId: string = bulkScopeInput[i].scopeId;
            const rel = tenantScopes.find(
                (t: TenantAvailableScope) => t.scopeId === scopeId
            );
            if(!rel){
                allValidScopes = false;
                message = "ERROR_ONE_OR_MORE_SCOPE_VALUES_IS_NOT_ASSIGNED_TO_THE_TENANT_OF_THIS_AUTHORIZATION_GROUP"
            }
        }
        if(!allValidScopes){
            throw new GraphQLError(message);
        }

        const arr: Array<AuthorizationGroupScopeRel> = [];
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const rel = await scopeDao.assignScopeToAuthorizationGroup(tenantId, groupId, bulkScopeInput[i].scopeId);
            arr.push(rel);
        }
        return arr;
    }


    public async removeScopeFromAuthorizationGroup(groupId: string, scopeId: string, tenantId: string): Promise<void> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_GROUP_REMOVE_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return scopeDao.removeScopeFromAuthorizationGroup(tenantId, groupId, scopeId);
    }

    public async assignScopeToUser(userId: string, tenantId: string, scopeId: string): Promise<UserScopeRel> {

        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_USER_ASSIGN_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        // Check, in order
        // 1.   Does the scope exist
        // 2.   Is the scope assigned to the tenant in the first place
        // 3.   Does the user exist
        // 4.   Is the user assigned to the tenant
        const scope: Scope | null = await this.getScopeById(scopeId);
        if(!scope){
            throw new GraphQLError("ERROR_SCOPE_ID_NOT_FOUND_FOR_CLIENT_ASSIGNMENT");
        }
        // the scope needs to be assigned to the tenant overall, in order to be assigned to
        // the client
        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId, scopeId);
        const rel = tenantScopes.find(
            (t: TenantAvailableScope) => t.scopeId === scopeId
        )
        if(!rel){
            throw new GraphQLError("ERROR_SCOPE_IS_NOT_ASSIGNED_TO_THE_TENANT_OF_THIS_CLIENT");
        }

        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user || user.markForDelete === true){
            throw new GraphQLError("ERROR_USER_NOT_FOUND_FOR_SCOPE_ASSIGNMENT");
        }
        const userTenantRel: UserTenantRel | null = await identityDao.getUserTenantRel(tenantId, userId);
        if(!userTenantRel){
            throw new GraphQLError("ERROR_USER_DOES_NOT_BELONG_TO_TENANT_FOR_SCOPE_ASSIGNMENT");
        }
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
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }

        const user: User | null = await identityDao.getUserBy("id", userId);
        if(!user || user.markForDelete === true){
            throw new GraphQLError("ERROR_USER_NOT_FOUND_FOR_SCOPE_ASSIGNMENT");
        }
        const userTenantRel: UserTenantRel | null = await identityDao.getUserTenantRel(tenantId, userId);
        if(!userTenantRel){
            throw new GraphQLError("ERROR_USER_DOES_NOT_BELONG_TO_TENANT_FOR_SCOPE_ASSIGNMENT");
        }

        const tenantScopes: Array<TenantAvailableScope> = await scopeDao.getTenantAvailableScope(tenantId, undefined);
        let allValidScopes: boolean = true;
        let message: string = "";
        // Do all of the scope values belong to the tenant?
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const scopeId: string = bulkScopeInput[i].scopeId;
            const rel = tenantScopes.find(
                (t: TenantAvailableScope) => t.scopeId === scopeId
            );
            if(!rel){
                allValidScopes = false;
                message = "ERROR_ONE_OR_MORE_SCOPE_VALUES_IS_NOT_ASSIGNED_TO_THE_TENANT_OF_THIS_AUTHORIZATION_GROUP"
            }
        }
        if(!allValidScopes){
            throw new GraphQLError(message);
        }

        const arr: Array<UserScopeRel> = [];
        for(let i = 0; i < bulkScopeInput.length; i++) {
            const rel = await scopeDao.assignScopeToUser(tenantId, userId, bulkScopeInput[i].scopeId);
            arr.push(rel);
        }
        return arr;
    }

    public async removeScopeFromUser(userId: string, tenantId: string, scopeId: string): Promise<void> {
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_USER_REMOVE_SCOPE, tenantId);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
        return scopeDao.removeScopeFromUser(tenantId, userId, scopeId);
    }

    public async deleteScope(scopeId: string): Promise<void> {
        // TODO, will need to delete various relationships to tenants and clients
        // return scopeDao.deleteScope(scopeId);
        const authResult = authorizeByScopeAndTenant(this.oidcContext, SCOPE_DELETE_SCOPE, null);
        if(!authResult.isAuthorized){
            throw new GraphQLError(authResult.errorMessage || "ERROR");
        }
    }

    protected async validateScopeTenantInput(tenant: Tenant, scopeId: string, accessRuleId: string | null): Promise<{isValid: boolean, errorMessage: string, scope: Scope | null}> {
        const scope: Scope | null = await this.getScopeById(scopeId);        
        if(!scope){
            return {isValid: false, errorMessage: "ERROR_CANNOT_FIND_SCOPE_TO_ASSIGN_TO_TENANT", scope}
        }
        if(accessRuleId){
            const accessRule: AccessRule | null = await accessRuleDao.getAccessRuleById(accessRuleId);
            if(!accessRule){
                return {isValid: false, errorMessage: "ERROR_CANNOT_FIND_ACCESS_RULE_ID", scope: null};
            }
        }
        // Check to make sure that we are not assigning a forbidden IAM scope to a
        // non root tenant
        if(tenant.tenantType !== TENANT_TYPE_ROOT_TENANT && scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT){
            const rootOnlyScopeName: string | undefined = ROOT_TENANT_EXCLUSIVE_INTERNAL_SCOPE_NAMES.find(
                (s: string) => s === scope.scopeName
            )
            if(rootOnlyScopeName){
                return {isValid: false, errorMessage: "ERROR_CANNOT_ASSIGN_ROOT_TENANT_SCOPE_TO_NON_ROOT_TENANT", scope: null};
            }
        }
        return {isValid: true, errorMessage: "", scope};
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
        catch(err){
            // TODO
            // Log any errors
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

    protected async bulkRemoveScopeFromRelIndex(scopeId: string): Promise<void>{
        // TODO
        throw new GraphQLError("ERROR_METHOD_NOT_IMPLEMENTED");
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