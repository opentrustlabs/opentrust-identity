import { AuthorizationGroup, Client, FederatedOidcProvider, ObjectSearchResultItem, ObjectSearchResults, RelSearchInput, RelSearchResults, Scope, SearchInput, SearchResultType, SigningKey, Tenant, User } from "@/graphql/generated/graphql-types";


abstract class SearchDao {

    /**
     * Performs a search against the object search index with the given search input parameters
     * and a (possibly empty) array of search results types to omit, in cases where certain users
     * may not have read access to certain types of objects
     * 
     * @param searchInput 
     * @param searchResultsTypesToOmit 
     */
    abstract objectSearch(searchInput: SearchInput, searchResultsTypesToOmit: Array<SearchResultType>): Promise<ObjectSearchResults>;
    
    /**
     * Performs a search against the rel search index with the given search input parameters and 
     * a (possibly empty) array of serach results types to omit, in cases where certain users
     * may not have read access to certain types of objects.
     * 
     * @param relSearchInput 
     * @param searchResultsTypesToOmit 
     */
    abstract relSearch(relSearchInput: RelSearchInput, searchResultsTypesToOmit: Array<SearchResultType>): Promise<RelSearchResults>;
    
    /**
     * This retrieves an arbitrary array of object search results which matching the incoming array 
     * of IDs. There is no guarantee of order OR of the presence of a record given an ID.
     * 
     * @param ids 
     */
    abstract getObjectSearchByIds(ids: Array<string>): Promise<Array<ObjectSearchResultItem>>;
    
    /**
     * This method adds the user to the object search index (and that is it) and 
     * assigns the tenant as the owning tenant. This needs to be invoked only when
     * a user is first created. The owning tenant id is just the first ID assigned
     * to the user and has little to no effect otherwise. 
     * 
     * The user-tenant rel index is the key relationship index. That method can
     * be called indpendently every time a user is added to a tenant, either directly
     * by an administrator or when the user logs into a tenant to which they have not
     * been previously authenticated.
     * 
     * @param tenant 
     * @param user 
     */
    abstract updateObjectSearchIndex(tenant: Tenant, user: User): Promise<void>;

    /**
     * This method does the following
     * 
     * 1.   Adds the user-tenant to the rel search index
     * 
     * (and that is all it does)
     * 
     * @param tenantId 
     * @param user 
     */
    abstract updateUserTenantRelSearchIndex(tenantId: string, user: User): Promise<void>;

    /**
     * This method does the following:
     * 
     * 1.   Checkes for the user based on the user id.
     * 2.   If the user exists then it will update the object search index for the user
     *      and it will perform an updateByQueryBody on the rel search index
     * 
     * Client functions should not wait on this to complete since it may take a 
     * long time.
     * 
     * @param user 
     */
    abstract updateSearchIndexUserDocuments(user: User): Promise<void>;

    /**
     * This method just adds the tenant to the object index, with the root tenant as
     * the owning tenant. The root tenant owns itself.
     * @param tenant 
     * @param rootTenant 
     */
    abstract indexTenant(tenant: Tenant, rootTenant: Tenant): Promise<void>;

    /**
     * This will add the client to the object search index, with the tenant as the owning tenant
     * id.
     * 
     * Then it will add the client-tenant to the rel search index
     * @param client 
     */
    abstract indexClient(client: Client): Promise<void>;

    /**
     * This will index the authorization group with the tenant id (a property
     * in the group object) as the owning tenant id.
     * 
     * Then it will add the authz-group-tenant to the rel search index
     * 
     * @param group 
     */
    abstract indexAuthorizationGroup(group: AuthorizationGroup): Promise<void>;

    /**
     * This will add the federated OIDC provider to the object search index, and that
     * is all. There is no owning tenant for this type of object.
     * @param federatedOIDCProvider 
     */
    abstract indexFederatedOIDCProvider(federatedOIDCProvider: FederatedOidcProvider): Promise<void>;

    /**
     * This does the following:
     * 
     * 1.   Adds the signing key to the object search index
     * 2.   Adds the tenant-key to rel search index
     * 
     * @param key 
     */
    abstract indexSigningKey(key: SigningKey): Promise<void>;

    /**
     * This does the following
     * 1.   Adds the user to the object search index with the owning tenant id
     * 2.   Adds the user-tenant rel to the rel search index with the tenant as the parent
     * 3.   If the authzGroup is provided, then adds the user-authz to the rel search index 
     *      with the authzGroup as the parent
     * @param user 
     * @param owningTenantId 
     * @param authzGroup 
     */
    abstract indexUser(user: User, owningTenantId: string, authzGroup: AuthorizationGroup | null): Promise<void>;

    /**
     * This does the following:
     * 
     * 1.   Adds the scope to the object search index
     * 2.   Adds the tenant-scope to the rel search index with the tenant as the parent
     * 
     * @param scope 
     * @param tenantId 
     */
    abstract indexScope(scope: Scope, tenantId: string): Promise<void>;

    /**
     * This performs a deleteByQuery of the rel search index, using a boolean query,
     * where the owning tenant id MUST match the incoming tenantId, and the child id
     * MUST match the incoming userId.
     * 
     * This query may take a long time to execute, so calling functions should not wait
     * on it to complete
     * 
     * @param tenantId 
     * @param userId 
     */
    abstract removerUserFromTenant(tenantId: string, userId: string): Promise<void>;

}

export default SearchDao