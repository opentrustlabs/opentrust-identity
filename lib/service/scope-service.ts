import { AccessRule, Client, ClientScopeRel, ObjectSearchResultItem, Scope, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { GraphQLError } from "graphql/error/GraphQLError";
import ScopeDao from "../dao/scope-dao";
import { randomUUID } from 'crypto'; 
import TenantDao from "../dao/tenant-dao";
import ClientDao from "../dao/client-dao";
import AccessRuleDao from "../dao/access-rule-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import { SCOPE_USE_APPLICATION_MANAGEMENT, SCOPE_USE_DISPLAY, SCOPE_USE_IAM_MANAGEMENT, SEARCH_INDEX_OBJECT_SEARCH } from "@/utils/consts";
import { getOpenSearchClient } from "../data-sources/search";

const scopeDao: ScopeDao = DaoFactory.getInstance().getScopeDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const clientDao: ClientDao = DaoFactory.getInstance().getClientDao();
const accessRuleDao: AccessRuleDao = DaoFactory.getInstance().getAccessRuleDao();
const searchClient = getOpenSearchClient();

class ScopeService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    
    public async getScope(tenantId?: string): Promise<Array<Scope>> {
        return scopeDao.getScope(tenantId);        
    }

    public async getScopeById(scopeId: string): Promise<Scope | null> {
        return scopeDao.getScopeById(scopeId);
    }

    public async createScope(scope: Scope): Promise<Scope> {        
        // Only allow scope uses of Application Management to be
        // created. All IAM Management scope values are fixed at
        // initialization of the IAM tool
        if(scope.scopeUse !== SCOPE_USE_APPLICATION_MANAGEMENT){
            throw new GraphQLError("ERROR_INVALID_SCOPE_USAGE_FOR_CREATION")
        }
        if(scope.scopeName === null || scope.scopeName === "" || scope.scopeDescription === null || scope.scopeDescription === ""){
            throw new GraphQLError("ERROR_SCOPE_NAME_AND_DESCRIPTION_MUST_BE_POPULATED")
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
        const s: Scope = await scopeDao.updateScope(existingScope);
        await this.updateSearchIndex(existingScope);
        return Promise.resolve(existingScope);
    }

    public async deleteScope(scopeId: string): Promise<void> {
        // TODO, will need to delete various relationships to tenants and clients
        // return scopeDao.deleteScope(scopeId);
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
        
    
    // public async assignScopeToTenant(tenantId: string, scopeId: string, accessRuleId: string | null): Promise<TenantScopeRel> {
    //     const tenant: Tenant | null = await tenantDao.getTenantById(tenantId);
    //     if(!tenant){
    //         throw new GraphQLError("ERROR_CANNOT_FIND_TENANT_FOR_SCOPE_ASSIGNMENT");
    //     }
    //     const scope: Scope | null = await this.getScopeById(scopeId);
    //     if(!scope){
    //         throw new GraphQLError("ERROR_CANNOT_FIND_SCOPE_TO_ASSIGN_TO_TENANT");
    //     }
    //     if(accessRuleId){
    //         const accessRule: AccessRule | null = await accessRuleDao.getAccessRuleById(accessRuleId);
    //         if(!accessRule){
    //             throw new GraphQLError("ERROR_CANNOT_FIND_ACCESS_RULE_ID")
    //         }
    //     }
    //     return scopeDao.assignScopeToTenant(tenantId, scopeId, accessRuleId);
    // }


    public async removeScopeFromTenant(tenantId: string, scopeId: string): Promise<void> {
        return scopeDao.removeScopeFromTenant(tenantId, scopeId);
    }

    // public async assignScopeToClient(tenantId: string, clientId: string, scopeId: string): Promise<ClientTenantScopeRel> {
    //     const client: Client | null = await clientDao.getClientById(clientId);
    //     if(!client){
    //         throw new GraphQLError("ERROR_CLIENT_NOT_FOUND_FOR_SCOPE_ASSIGNMENT");
    //     }
    //     if(client.tenantId !== tenantId){
    //         throw new GraphQLError("ERROR_CLIENT_DOES_NOT_BELONG_TO_TENANT");
    //     }
    //     const scope: Scope | null = await this.getScopeById(scopeId);
    //     if(!scope){
    //         throw new GraphQLError("ERROR_SCOPE_ID_NOT_FOUND_FOR_CLIENT_ASSIGNMENT");
    //     }
    //     // the scope needs to be assigned to the tenant overall, in order to be assigned to
    //     // the client
    //     const tenantScopes: Array<TenantScopeRel> = await scopeDao.getTenantScopeRel(tenantId);
    //     const rel = tenantScopes.find(
    //         (t: TenantScopeRel) => t.scopeId === scopeId
    //     )
    //     if(!rel){
    //         throw new GraphQLError("ERROR_SCOPE_IS_NOT_ASSIGNED_TO_THE_TENANT_OF_THIS_CLIENT");
    //     }
    //     return scopeDao.assignScopeToClient(tenantId, clientId, scopeId);
        
    // }

    public async removeScopeFromClient(tenantId: string, clientId: string, scopeId: string): Promise<void> {
        return scopeDao.removeScopeFromClient(tenantId, clientId, scopeId);
    }
}

export default ScopeService;